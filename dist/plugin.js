"use strict";




// EmulatorJS Plugin for HFS
// Allows opening ROMs in JavaScript emulators directly in the browser

exports.description = "Plugin that integrates EmulatorJS to emulate classic console games directly in the browser"
exports.version = 1.6;
exports.apiRequired = 12.9;


// IGDB API Configuration
let igdbToken = null
let tokenExpiry = null

exports.init = function (api) {

    const fs = require('fs');
    const https = require('https');
    const http = require('http');
    const path = require('path');

    const publicDir = path.join(__dirname, 'public')

    // Configured storage directory
    const configuredBase = api.storageDir;
    // cover directory
    const coversDir = path.join(configuredBase, 'covers')
    // game info cache directory
    const gameInfoDir = path.join(configuredBase, 'gameinfo')

    const savesDir = path.join(configuredBase, 'saves')

    // icons directory (in public, so frontend can access too)
    const iconsDir = path.join(publicDir, 'icons', (api.getConfig('iconTheme') || 'monochrome'))
    const systemMapPath = path.join(publicDir, 'system_map.js');
    const mappingFile = path.join(configuredBase, 'icon-mappings.json')
    const igdbTokenFile = path.join(configuredBase, 'igdb-token.json')

    //current logged user




    // get system_map.js and include it

    if (!fs.existsSync(systemMapPath)) {
        api.setError('EmulatorJS plugin: system_map.js not found in public directory.');
        return;
    }

    // Limpar cache do módulo para garantir que carrega a versão mais recente
    delete require.cache[require.resolve(systemMapPath)];

    api.log('Loading system_map.js from: ' + systemMapPath);
    const systemMapModule = require(systemMapPath);
    api.log('Module loaded. Keys: ' + Object.keys(systemMapModule).join(', '));

    const { SYSTEM_MAP, compatibleExtensions, detectBestIcon, detectIcon, tryDetectPlatform, possiblePlatforms, cleanFilename } = systemMapModule;

    api.log('compatibleExtensions type: ' + typeof compatibleExtensions);
    api.log('compatibleExtensions is Array: ' + Array.isArray(compatibleExtensions));
    if (Array.isArray(compatibleExtensions)) {
        api.log('compatibleExtensions length: ' + compatibleExtensions.length);
    }


    ensureDir(fs, configuredBase);
    ensureDir(fs, gameInfoDir);
    ensureDir(fs, coversDir);
    ensureDir(fs, iconsDir);

    // Checks existence of public assets
    if (!fs.existsSync(path.join(publicDir, 'emulator.js')) || !fs.existsSync(path.join(publicDir, 'emulator.css'))) {
        api.setError('EmulatorJS plugin: missing public files (emulator.js or emulator.css). Check the public/ folder.')
    }

    const CONFIG_KEYS = [
        'customIcons', 'iconFolder', 'iconThumbSuffix', 'iconPreviewSuffix',
        'artworkOnDemand',
        'ejsDataSource', 'ejsDataCustomUrl', 'ejsLocalDir', 'ejsLocalReady', 'systemMap',
        'thegamesdbApiKey',
        'emulatorsJsVersion', 'iconTheme', 'igdbClientId', 'igdbClientSecret',
    ];

    function defaultSystemMap() {
        return SYSTEM_MAP.map(entry => ({
            system: entry.system || '',
            name: entry.name || '',
            extensions: Array.isArray(entry.extensions) ? entry.extensions.join(',') : String(entry.extensions || ''),
            core: Array.isArray(entry.core) ? entry.core.join(',') : String(entry.core || ''),
            bios: '',
            aliases: '',
            artworkRepo: '',
            gamepadLayout: '',
        }));
    }

    // HFS renders array configs field-by-field; unknown row keys crash it.
    function canonicalSystemMap(rows) {
        if (!Array.isArray(rows)) return [];
        return rows
            .filter(row => row && typeof row === 'object')
            .map(row => ({
                system: String(row.system || '').trim(),
                name: String(row.name || '').trim(),
                extensions: Array.isArray(row.extensions) ? row.extensions.join(',') : String(row.extensions || ''),
                core: Array.isArray(row.core) ? row.core.join(',') : String(row.core || ''),
                bios: String(row.bios || ''),
                aliases: Array.isArray(row.aliases) ? row.aliases.join(',') : String(row.aliases || ''),
                artworkRepo: String(row.artworkRepo || ''),
                gamepadLayout: Array.isArray(row.gamepadLayout) ? JSON.stringify(row.gamepadLayout) : String(row.gamepadLayout || ''),
            }))
            .filter(row => row.system);
    }

    function isDefaultSystemMap(rows) {
        try {
            return JSON.stringify(canonicalSystemMap(rows)) === JSON.stringify(canonicalSystemMap(defaultSystemMap()));
        } catch (err) {
            return false;
        }
    }

    function isLocalEjsReady() {
        try {
            const dir = api.getConfig('ejsLocalDir');
            if (!dir) return false;
            return fs.statSync(dir).isDirectory() && fs.existsSync(path.join(dir, 'loader.js'));
        } catch (err) {
            return false;
        }
    }

    // Utility: fix game name for consistent caching
    function fixGameName(romName) {
        if (!romName) return romName;
        let name = String(romName);
        try {
            name = decodeURIComponent(name);
        } catch (err) {
            // malformed encoding: keep the original value
        }
        name = name.replace(/\0/g, '');
        name = name.toLowerCase();
        name = name.replace(/^\/+|\/+$/g, '');
        if (name.includes('..')) return '';
        name = name.slice(0, 200);
        if (!/^[\p{L}\p{N}\p{M}\/ ._\-()\[\]{}'&+,!#$%@~`^;=]*$/u.test(name)) return '';
        return name;
    }

    // Utility: ensure directory exists recursively
    function ensureDir(fs, dir) {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    }

    // Security: loopback address check (mirrors HFS isLocalHost)
    function isLoopback(ip) {
        return ip === '::1' || /^(?:::ffff:)?127\.0\.0\.1$/i.test(ip || '');
    }

    // Security: admin access = logged admin account, or localhost_admin when not behind a proxy
    function isAdminRequest(ctx) {
        if (!ctx) return false;
        const account = ctx.state && ctx.state.account;
        if (account && account.admin) return true;
        if (ctx.state && ctx.state.whenProxyDetected) return false;
        if (api.getHfsConfig('localhost_admin') === false) return false;
        if (!isLoopback(ctx.ip)) return false;
        return /^(?:|localhost|127\.0\.0\.1|\[::1])(?::\d+)?$/i.test(ctx.get('Host') || '');
    }

    // Function to get game info from cache
    function getGameInfoFromCache(romName) {
        try {
            const cacheFile = path.join(gameInfoDir, romName + '.json')
            if (fs.existsSync(cacheFile)) {
                const data = fs.readFileSync(cacheFile, 'utf8')
                return JSON.parse(data)
            }
        } catch (err) {
            api.log(`[GameInfo] Error reading cache for ${romName}: ${err.message}`)
        }
        return null
    }

    // Function to save game info to cache
    function saveGameInfoToCache(romName, gameInfo) {
        try {
            const cacheFile = path.join(gameInfoDir, romName + '.json')
            fs.writeFileSync(cacheFile, JSON.stringify(gameInfo, null, 2), 'utf8')
            api.log(`[GameInfo] Saved cache for ${romName}`)
            return true
        } catch (err) {
            api.log(`[GameInfo] Error saving cache for ${romName}: ${err.message}`)
            return false
        }
    }
    const IGDB_TOKEN_REFRESH_MARGIN = 5 * 60 * 1000

    // Function to load a persisted IGDB token (with proactive refresh margin)
    function loadIGDBTokenFromDisk() {
        try {
            if (!fs.existsSync(igdbTokenFile)) return false
            const data = JSON.parse(fs.readFileSync(igdbTokenFile, 'utf8'))
            if (data && data.access_token && data.expiry && Date.now() < data.expiry - IGDB_TOKEN_REFRESH_MARGIN) {
                igdbToken = data.access_token
                tokenExpiry = data.expiry
                return true
            }
        } catch (err) {
            api.log('[IGDB] Error reading stored token: ' + err.message)
        }
        return false
    }

    // Function to persist the IGDB token; on failure we keep the in-memory fallback
    function saveIGDBTokenToDisk() {
        try {
            fs.writeFileSync(igdbTokenFile, JSON.stringify({ access_token: igdbToken, expiry: tokenExpiry }, null, 2), 'utf8')
        } catch (err) {
            api.log('[IGDB] Error storing token to disk: ' + err.message)
        }
    }

    // Function to get IGDB authentication token
    async function getIGDBToken() {
        if (igdbToken && tokenExpiry && Date.now() < tokenExpiry - IGDB_TOKEN_REFRESH_MARGIN) {
            return igdbToken
        }
        if (loadIGDBTokenFromDisk()) {
            return igdbToken
        }

        const IGDB_CLIENT_ID = api.getConfig('igdbClientId')
        const IGDB_CLIENT_SECRET = api.getConfig('igdbClientSecret')

        if (!IGDB_CLIENT_ID || !IGDB_CLIENT_SECRET) {
            throw new Error('IGDB Client ID and Secret are not configured. Please set them in the admin panel.')
        }

        return new Promise((resolve, reject) => {
            const url = `https://id.twitch.tv/oauth2/token?client_id=${IGDB_CLIENT_ID}&client_secret=${IGDB_CLIENT_SECRET}&grant_type=client_credentials`

            const options = {
                method: 'POST',
                headers: {
                    'Content-Length': 0
                }
            }

            const req = https.request(url, options, (res) => {
                let data = ''

                res.on('data', chunk => data += chunk)
                res.on('end', () => {
                    try {
                        if (res.statusCode !== 200) {
                            api.log('IGDB Token Error - Status: ' + res.statusCode + ', Response: ' + data)
                            reject(new Error(`IGDB token request failed with status ${res.statusCode}: ${data}`))
                            return
                        }

                        const json = JSON.parse(data)
                        if (!json.access_token) {
                            reject(new Error('No access_token in IGDB response: ' + JSON.stringify(json)))
                            return
                        }

                        igdbToken = json.access_token
                        tokenExpiry = Date.now() + ((json.expires_in || 3600) * 1000)
                        saveIGDBTokenToDisk()
                        api.log('IGDB token obtained successfully, expires in: ' + json.expires_in + 's')
                        resolve(igdbToken)
                    } catch (err) {
                        reject(new Error('Failed to parse IGDB token response: ' + err.message))
                    }
                })
            })

            req.on('error', reject)
            req.end()
        })
    }

    // Function to search game covers only (simpler query for cover search)
    async function searchGameCovers(gameName) {
        const token = await getIGDBToken()
        const IGDB_CLIENT_ID = api.getConfig('igdbClientId')

        api.log(`[IGDB] Preparing to search covers for game: "${gameName}"`)

        return new Promise((resolve, reject) => {
            const postData = `search "${gameName}"; fields name,cover.image_id; limit 20;`
            api.log(`[IGDB] Searching covers for: "${gameName}"`)

            const options = {
                hostname: 'api.igdb.com',
                port: 443,
                path: '/v4/games',
                method: 'POST',
                headers: {
                    'Client-ID': IGDB_CLIENT_ID,
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'text/plain',
                    'Content-Length': Buffer.byteLength(postData)
                }
            }

            const req = https.request(options, (res) => {
                let data = ''
                res.on('data', chunk => data += chunk)
                res.on('end', () => {
                    try {
                        api.log(`[IGDB] Response status: ${res.statusCode}`)

                        if (res.statusCode !== 200) {
                            api.log(`[IGDB] Error response: ${data}`)
                            reject(new Error(`IGDB API error ${res.statusCode}: ${data}`))
                            return
                        }

                        const json = JSON.parse(data)
                        const results = json.filter(g => g.cover).map(g => ({
                            id: g.id,
                            name: g.name,
                            coverId: g.cover.image_id,
                            coverUrl: `https://images.igdb.com/igdb/image/upload/t_cover_big/${g.cover.image_id}.jpg`
                        }))

                        resolve(results)
                    } catch (err) {
                        api.log(`[IGDB] Parse error: ${err.message}`)
                        reject(new Error('Failed to parse game results: ' + err.message))
                    }
                })
            })

            req.on('error', (err) => {
                api.log(`[IGDB] Request error: ${err.message}`)
                reject(err)
            })
            req.write(postData)
            req.end()
        })
    }

    // Function to search games with complete information
    async function searchGameInfo(gameName) {
        const token = await getIGDBToken()
        const IGDB_CLIENT_ID = api.getConfig('igdbClientId')

        api.log(`[IGDB] Preparing to search game info for: "${gameName}"`)

        return new Promise((resolve, reject) => {
            // Request comprehensive game information
            const postData = `search "${gameName}"; fields name,cover.image_id,rating,aggregated_rating,summary,release_dates.human,genres.name,platforms.name,first_release_date,game_modes.name,themes.name,involved_companies.company.name,involved_companies.developer,involved_companies.publisher,game_engines.name,language_supports.language.name,player_perspectives.name,keywords.name,alternative_names.name,age_ratings.rating,videos.name,videos.video_id,storyline,total_rating,total_rating_count; limit 20;`
            api.log(`[IGDB] Searching for: "${gameName}"`)
            api.log(`[IGDB] Query: ${postData}`)

            const options = {
                hostname: 'api.igdb.com',
                port: 443,
                path: '/v4/games',
                method: 'POST',
                headers: {
                    'Client-ID': IGDB_CLIENT_ID,
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'text/plain',
                    'Content-Length': Buffer.byteLength(postData)
                }
            }

            const req = https.request(options, (res) => {
                let data = ''
                res.on('data', chunk => data += chunk)
                res.on('end', () => {
                    try {
                        api.log(`[IGDB] Response status: ${res.statusCode}`)
                        api.log(`[IGDB] Response data length: ${data.length}`)

                        if (res.statusCode !== 200) {
                            api.log(`[IGDB] Error response: ${data}`)
                            reject(new Error(`IGDB API error ${res.statusCode}: ${data}`))
                            return
                        }

                        const json = JSON.parse(data)
                        api.log(`[IGDB] Parsed ${json.length} results`)

                        const results = json.filter(g => g.cover).map(g => ({
                            id: g.id,
                            name: g.name,
                            rating: g.rating,
                            aggregatedRating: g.aggregated_rating,
                            summary: g.summary,
                            releaseDates: g.release_dates ? g.release_dates.map(rd => rd.human).filter(Boolean) : [],
                            genres: g.genres ? g.genres.map(gen => gen.name).join(', ') : 'N/A',
                            platforms: g.platforms ? g.platforms.map(p => p.name).join(', ') : 'N/A',
                            firstReleaseDate: g.first_release_date,
                            gameModes: g.game_modes ? g.game_modes.map(gm => gm.name).join(', ') : 'N/A',
                            themes: g.themes ? g.themes.map(t => t.name).join(', ') : 'N/A',
                            developers: g.involved_companies ? g.involved_companies.filter(ic => ic.developer).map(ic => ic.company.name).join(', ') : 'N/A',
                            publishers: g.involved_companies ? g.involved_companies.filter(ic => ic.publisher).map(ic => ic.company.name).join(', ') : 'N/A',
                            gameEngines: g.game_engines ? g.game_engines.map(ge => ge.name).join(', ') : 'N/A',
                            languages: g.language_supports ? g.language_supports.map(ls => ls.language.name).join(', ') : 'N/A',
                            playerPerspectives: g.player_perspectives ? g.player_perspectives.map(pp => pp.name).join(', ') : 'N/A',
                            keywords: g.keywords ? g.keywords.map(k => k.name).join(', ') : 'N/A',
                            ageRatings: g.age_ratings ? g.age_ratings.map(ar => ar.rating || 'N/A').join(', ') : 'N/A',
                            alternativeNames: g.alternative_names ? g.alternative_names.map(an => an.name).join(', ') : 'N/A',
                            storyline: g.storyline || null,
                            totalRating: g.total_rating || null,
                            totalRatingCount: g.total_rating_count || null,
                            videos: g.videos ? g.videos : [],
                            coverId: g.cover.image_id,
                            coverUrl: `https://images.igdb.com/igdb/image/upload/t_cover_big/${g.cover.image_id}.jpg`
                        }))

                        api.log(`[IGDB] Filtered to ${results.length} results with covers`)
                        resolve(results)
                    } catch (err) {
                        api.log(`[IGDB] Parse error: ${err.message}`)
                        reject(new Error('Failed to parse game results: ' + err.message))
                    }
                })
            })

            req.on('error', (err) => {
                api.log(`[IGDB] Request error: ${err.message}`)
                reject(err)
            })
            req.write(postData)
            req.end()
        })
    }

    // Function to download image
    async function downloadImage(url, destPath) {
        // check if URL is a data URI 
        return new Promise((resolve, reject) => {

            if (url.startsWith('data:image/')) {
                // Data URI
                const matches = url.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/)
                if (!matches || matches.length !== 3) {
                    return reject(new Error('Invalid data URI format'))
                } else {
                    const data = matches[2]
                    const buffer = Buffer.from(data, 'base64')
                    fs.writeFile(destPath, buffer, (err) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve()
                        }
                    })
                }
            } else {

                const proto = url.startsWith('https') ? https : http
                const file = fs.createWriteStream(destPath)

                proto.get(url, (res) => {
                    res.pipe(file)
                    file.on('finish', () => {
                        file.close()
                        resolve()
                    })
                }).on('error', (err) => {
                    fs.unlink(destPath, () => { })
                    reject(err)
                })
            }
        })


    }

    // Check URL content-type to verify if it's an image
    async function checkUrlContentType(url) {
        return new Promise((resolve, reject) => {
            const proto = url.startsWith('https') ? https : http

            const options = {
                method: 'HEAD',
                timeout: 5000
            }

            proto.request(url, options, (res) => {
                const contentType = res.headers['content-type']
                resolve(contentType)
            }).on('error', (err) => {
                reject(err)
            }).end()
        })
    }

    const ARTWORK_USER_AGENT = 'hfs-emulatorJS-plugin/1.5 (+https://github.com/rejetto/hfs)'
    const HTTP_TIMEOUT_MS = 15000
    const HTTP_MAX_REDIRECTS = 5
    const HTTP_MAX_BYTES = 10 * 1024 * 1024

    const ARTWORK_REPO_MAP = {
        '3ds': 'Nintendo_-_Nintendo_3DS',
        nes: 'Nintendo_-_Nintendo_Entertainment_System',
        snes: 'Nintendo_-_Super_Nintendo_Entertainment_System',
        n64: 'Nintendo_-_Nintendo_64',
        gb: 'Nintendo_-_Game_Boy',
        gba: 'Nintendo_-_Game_Boy_Advance',
        nds: 'Nintendo_-_Nintendo_DS',
        vb: 'Nintendo_-_Virtual_Boy',
        segaMD: 'Sega_-_Mega_Drive_-_Genesis',
        segaMS: 'Sega_-_Master_System_-_Mark_III',
        segaGG: 'Sega_-_Game_Gear',
        segaCD: 'Sega_-_Mega-CD_-_Sega_CD',
        sega32x: 'Sega_-_32X',
        segaSaturn: 'Sega_-_Saturn',
        sg1000: 'Sega_-_SG-1000',
        pico: 'Sega_-_PICO',
        psx: 'Sony_-_PlayStation',
        psp: 'Sony_-_PlayStation_Portable',
        atari2600: 'Atari_-_2600',
        atari5200: 'Atari_-_5200',
        atari7800: 'Atari_-_7800',
        lynx: 'Atari_-_Lynx',
        jaguar: 'Atari_-_Jaguar',
        fbneo: 'FBNeo_-_Arcade_Games',
        arcade: 'FBNeo_-_Arcade_Games',
        neogeo: 'FBNeo_-_Arcade_Games',
        mame: 'MAME',
        c64: 'Commodore_-_64',
        amiga: 'Commodore_-_Amiga',
        coleco: 'Coleco_-_ColecoVision',
        pce: 'NEC_-_PC_Engine_-_TurboGrafx_16',
        ngp: 'SNK_-_Neo_Geo_Pocket',
        ws: 'Bandai_-_WonderSwan',
        '3do': 'The_3DO_Company_-_3DO',
        dos: 'DOS',
        cpc: 'Amstrad_-_CPC',
        zxspectrum: 'Sinclair_-_ZX_Spectrum',
        pcfx: 'NEC_-_PC-FX',
        cdi: 'Philips_-_CD-i',
        doom: 'DOOM',
    }

    function httpsRequest(url, headers, redirects) {
        if (redirects === undefined) redirects = 0
        return new Promise((resolve, reject) => {
            const proto = String(url).startsWith('http://') ? http : https
            const req = proto.get(url, {
                headers: Object.assign({ 'User-Agent': ARTWORK_USER_AGENT }, headers || {}),
                timeout: HTTP_TIMEOUT_MS,
            }, (res) => {
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    res.resume()
                    if (redirects >= HTTP_MAX_REDIRECTS) {
                        reject(new Error('Too many redirects'))
                        return
                    }
                    let next = res.headers.location
                    try { next = new URL(next, url).toString() } catch (err) { }
                    resolve(httpsRequest(next, headers, redirects + 1))
                    return
                }
                const chunks = []
                let size = 0
                let done = false
                res.on('data', (chunk) => {
                    if (done) return
                    size += chunk.length
                    if (size > HTTP_MAX_BYTES) {
                        done = true
                        res.destroy()
                        reject(new Error('Response too large'))
                        return
                    }
                    chunks.push(chunk)
                })
                res.on('end', () => {
                    if (done) return
                    done = true
                    resolve({ status: res.statusCode, headers: res.headers, buffer: Buffer.concat(chunks) })
                })
                res.on('error', (err) => {
                    if (!done) {
                        done = true
                        reject(err)
                    }
                })
            })
            req.on('timeout', () => req.destroy(new Error('Request timed out')))
            req.on('error', reject)
        })
    }

    // Error messages intentionally omit the URL so credentials are never logged.
    async function httpsGetJson(url) {
        const res = await httpsRequest(url)
        if (res.status !== 200) throw new Error('HTTP ' + res.status)
        try {
            return JSON.parse(res.buffer.toString('utf8'))
        } catch (err) {
            throw new Error('Invalid JSON response')
        }
    }

    async function httpsGetText(url) {
        const res = await httpsRequest(url)
        if (res.status !== 200) throw new Error('HTTP ' + res.status)
        return res.buffer.toString('utf8')
    }

    const TGDB_API = 'https://api.thegamesdb.net/v1'
    const TGDB_MISS_TTL = 6 * 60 * 60 * 1000
    const tgdbMissCache = new Map()

    function tgdbIsMiss(key) {
        const at = tgdbMissCache.get(key)
        if (at === undefined) return false
        if (Date.now() - at > TGDB_MISS_TTL) {
            tgdbMissCache.delete(key)
            return false
        }
        return true
    }

    function tgdbMarkMiss(key) {
        tgdbMissCache.set(key, Date.now())
        while (tgdbMissCache.size > 500) tgdbMissCache.delete(tgdbMissCache.keys().next().value)
    }

    async function fetchTheGamesDB(gameName) {
        const apiKey = api.getConfig('thegamesdbApiKey')
        if (!apiKey) return null
        const cacheKey = String(gameName || '').toLowerCase().trim()
        if (!cacheKey || tgdbIsMiss(cacheKey)) return null

        const searchUrl = TGDB_API + '/Games/ByGameName?apikey=' + encodeURIComponent(apiKey)
            + '&name=' + encodeURIComponent(gameName)
            + '&fields=players,publishers,genres,overview,last_updated,rating,followers,slug'

        let game = null
        try {
            const data = await httpsGetJson(searchUrl)
            const games = data && data.data && Array.isArray(data.data.games) ? data.data.games : []
            game = games.length ? games[0] : null
        } catch (err) {
            api.log('[Artwork] TheGamesDB search unavailable: ' + err.message)
            return null
        }

        if (!game || !game.id) {
            tgdbMarkMiss(cacheKey)
            return null
        }

        const imagesUrl = TGDB_API + '/Games/Images?apikey=' + encodeURIComponent(apiKey)
            + '&games_id=' + encodeURIComponent(game.id) + '&filter[boxart]=front'

        try {
            const data = await httpsGetJson(imagesUrl)
            const payload = data && data.data ? data.data : {}
            const images = Array.isArray(payload.images) ? payload.images : []
            const base = (payload.base_url && (payload.base_url.original || payload.base_url.large)) || 'https://cdn.thegamesdb.net/images/original/'
            const box = images.find(img => img && img.type === 'boxart' && (!img.side || img.side === 'front'))
                || images.find(img => img && img.type === 'boxart')
            if (!box || !box.filename) {
                tgdbMarkMiss(cacheKey)
                return null
            }
            return { url: base + box.filename, source: 'thegamesdb' }
        } catch (err) {
            api.log('[Artwork] TheGamesDB images unavailable: ' + err.message)
            return null
        }
    }

    const THUMBNAIL_SERVER = 'https://thumbnails.libretro.com'
    const GITHUB_API = 'https://api.github.com'
    const GITHUB_RAW = 'https://raw.githubusercontent.com'
    const MIN_ART_SCORE = 0.45
    const LIST_CACHE_TTL = 6 * 60 * 60 * 1000
    const LIST_CACHE_MAX = 200
    const serverListCache = new Map()
    const githubListCache = new Map()

    function listCacheGet(cache, key) {
        const entry = cache.get(key)
        if (!entry) return undefined
        if (Date.now() - entry.at > LIST_CACHE_TTL) {
            cache.delete(key)
            return undefined
        }
        cache.delete(key)
        cache.set(key, entry)
        return entry.value
    }

    function listCacheSet(cache, key, value) {
        cache.set(key, { at: Date.now(), value })
        while (cache.size > LIST_CACHE_MAX) cache.delete(cache.keys().next().value)
    }

    function normalizeArtName(name) {
        return String(name)
            .replace(/\.[a-z0-9]+$/i, '')
            .replace(/\[[^\]]*\]/g, ' ')
            .replace(/\([^)]*\)/g, ' ')
            .replace(/[_\-.]+/g, ' ')
            .replace(/[^a-z0-9 ]/gi, ' ')
            .toLowerCase()
            .replace(/\s+/g, ' ')
            .trim()
    }

    function artBigrams(str) {
        const s = String(str).replace(/\s+/g, '')
        const set = new Set()
        for (let i = 0; i < s.length - 1; i++) set.add(s.slice(i, i + 2))
        return set
    }

    function artSimilarity(a, b) {
        const A = artBigrams(a)
        const B = artBigrams(b)
        if (!A.size || !B.size) return 0
        let overlap = 0
        for (const g of A) if (B.has(g)) overlap++
        return (2 * overlap) / (A.size + B.size)
    }

    const REGION_TAGS = ['usa', 'world', 'europe', 'japan', 'uk', 'germany', 'france', 'spain', 'italy', 'australia', 'canada', 'asia', 'korea', 'brazil', 'netherlands']

    function extractRegion(name) {
        const tags = [...String(name).matchAll(/\(([^)]*)\)/g)].map(m => m[1].toLowerCase())
        for (const tag of tags) for (const region of REGION_TAGS) if (tag.includes(region)) return region
        return null
    }

    function findBestArtMatch(romBaseName, candidateFiles) {
        const target = normalizeArtName(romBaseName)
        const wantRegion = extractRegion(romBaseName)
        let best = null
        let bestScore = 0
        let bestRegionMatch = false
        for (const filePath of candidateFiles) {
            const fileName = path.basename(filePath)
            const score = artSimilarity(target, normalizeArtName(fileName))
            if (score < bestScore) continue
            const regionMatch = wantRegion ? extractRegion(fileName) === wantRegion : false
            if (score > bestScore || (score === bestScore && regionMatch && !bestRegionMatch)) {
                bestScore = score
                best = filePath
                bestRegionMatch = regionMatch
            }
        }
        return { path: best, score: bestScore }
    }

    function serverFolderName(repo) {
        return String(repo).replace(/_/g, ' ').trim()
    }

    function serverArtDirUrl(serverFolder, subdir) {
        return THUMBNAIL_SERVER + '/' + encodeURIComponent(serverFolder) + '/' + subdir + '/'
    }

    function serverArtFileUrl(serverFolder, subdir, fileName) {
        return THUMBNAIL_SERVER + '/' + encodeURIComponent(serverFolder) + '/' + subdir + '/' + encodeURIComponent(fileName)
    }

    function parseDirectoryListing(html) {
        const names = []
        const seen = new Set()
        const re = /href\s*=\s*["']([^"']+\.(?:png|jpe?g))["']/gi
        let m
        while ((m = re.exec(html))) {
            let href = m[1].split('?')[0].split('#')[0]
            try { href = decodeURIComponent(href) } catch (err) { }
            const base = href.split('/').pop()
            if (base && base !== '..' && !seen.has(base)) {
                seen.add(base)
                names.push(base)
            }
        }
        return names
    }

    function getServerFileList(serverFolder, subdir) {
        const key = serverFolder + '/' + subdir
        let cached = listCacheGet(serverListCache, key)
        if (cached === undefined) {
            cached = (async () => {
                const html = await httpsGetText(serverArtDirUrl(serverFolder, subdir))
                return parseDirectoryListing(html)
            })().catch(() => [])
            listCacheSet(serverListCache, key, cached)
        }
        return cached
    }

    function getGitHubFileList(repo) {
        let cached = listCacheGet(githubListCache, repo)
        if (cached === undefined) {
            cached = (async () => {
                const data = await httpsGetJson(GITHUB_API + '/repos/libretro-thumbnails/' + repo + '/git/trees/master?recursive=1')
                if (!data.tree) throw new Error('Unexpected tree response')
                return data.tree.filter(t => t.type === 'blob' && /\.(png|jpg|jpeg)$/i.test(t.path)).map(t => t.path)
            })().catch(() => [])
            listCacheSet(githubListCache, repo, cached)
        }
        return cached
    }

    async function findLibretroArtwork(systemId, romBase) {
        const repo = ARTWORK_REPO_MAP[systemId]
        if (!repo) return null
        const serverFolder = serverFolderName(repo)

        try {
            const files = await getServerFileList(serverFolder, 'Named_Boxarts')
            if (files && files.length) {
                const match = findBestArtMatch(romBase, files)
                if (match.path && match.score >= MIN_ART_SCORE) {
                    return { url: serverArtFileUrl(serverFolder, 'Named_Boxarts', match.path), source: 'libretro' }
                }
            }
        } catch (err) { }

        try {
            const files = await getGitHubFileList(repo)
            if (files && files.length) {
                const boxarts = files.filter(f => f.startsWith('Named_Boxarts/'))
                const match = findBestArtMatch(romBase, boxarts)
                if (match.path && match.score >= MIN_ART_SCORE) {
                    const encoded = match.path.split('/').map(encodeURIComponent).join('/')
                    return { url: GITHUB_RAW + '/libretro-thumbnails/' + repo + '/master/' + encoded, source: 'libretro' }
                }
            }
        } catch (err) { }

        return null
    }

    const artworkCache = new Map()
    const artworkPending = new Map()
    const ARTWORK_CACHE_MAX = 300
    const ARTWORK_MISS_TTL = 6 * 60 * 60 * 1000

    function artworkCacheGet(key) {
        const entry = artworkCache.get(key)
        if (!entry) return undefined
        if (entry.value === null && Date.now() - entry.at > ARTWORK_MISS_TTL) {
            artworkCache.delete(key)
            return undefined
        }
        artworkCache.delete(key)
        artworkCache.set(key, entry)
        return entry.value
    }

    function artworkCacheSet(key, value) {
        artworkCache.set(key, { at: Date.now(), value })
        while (artworkCache.size > ARTWORK_CACHE_MAX) artworkCache.delete(artworkCache.keys().next().value)
    }

    function detectSystemId(fileName, folderPath) {
        const ext = path.extname(String(fileName || '')).slice(1).toLowerCase()
        let byExt = []
        if (ext) byExt = SYSTEM_MAP.filter(s => s.extensions.includes(ext))
        if (byExt.length === 1) return byExt[0].system
        const detected = tryDetectPlatform((String(folderPath || '') + ' ' + String(fileName || '')).trim())
        if (detected && detected.system) return detected.system
        if (byExt.length) return byExt[0].system
        return null
    }

    async function resolveCover(gameName, systemId) {
        if (!gameName) return null
        const romBase = path.basename(String(gameName), path.extname(String(gameName)))
        const cacheKey = String(systemId || '?') + '|' + romBase.toLowerCase()
        const cached = artworkCacheGet(cacheKey)
        if (cached !== undefined) return cached
        const running = artworkPending.get(cacheKey)
        if (running) return running

        const work = (async () => {
            const searchName = cleanFilename(String(gameName)) || romBase

            // Level 1: IGDB, only when credentials are configured
            if (api.getConfig('igdbClientId') && api.getConfig('igdbClientSecret')) {
                try {
                    const results = await searchGameCovers(searchName)
                    if (Array.isArray(results) && results.length && results[0].coverUrl) {
                        return { url: results[0].coverUrl, source: 'igdb' }
                    }
                } catch (err) {
                    api.log('[Artwork] IGDB fallback skipped: ' + err.message)
                }
            }

            // Levels 2-3 are disabled by the artworkOnDemand toggle
            if (api.getConfig('artworkOnDemand') !== false) {
                // Level 2: TheGamesDB, only when an API key is configured
                try {
                    const tgdb = await fetchTheGamesDB(searchName)
                    if (tgdb) return tgdb
                } catch (err) {
                    api.log('[Artwork] TheGamesDB fallback skipped: ' + err.message)
                }

                // Level 3: libretro-thumbnails on demand
                if (systemId) {
                    try {
                        const libretro = await findLibretroArtwork(systemId, romBase)
                        if (libretro) return libretro
                    } catch (err) {
                        api.log('[Artwork] libretro fallback skipped: ' + err.message)
                    }
                }
            }

            return null
        })().then((result) => {
            artworkCacheSet(cacheKey, result)
            return result
        }).finally(() => {
            artworkPending.delete(cacheKey)
        })

        artworkPending.set(cacheKey, work)
        return work
    }

    // Custom REST API
    const customRest = {
        /// Search for game covers
        async searchCovers({ romName }) {
            try {
                api.log(`[searchCovers] Proceeding with IGDB search for: "${romName}"`)

                romName = romName || ''
                romName = romName.trim()
                // check for data URI or image extension
                if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].some(ext => romName.toLowerCase().endsWith(ext)) || (romName.toLowerCase().startsWith('data:image/') && romName.length > 11)) {
                    // Return the URL as a direct result
                    return {
                        success: true,
                        results: [{
                            id: 'direct-url',
                            name: 'Direct URL Image',
                            coverUrl: romName,
                            isDirect: true
                        }]
                    }
                }

                else {
                    // Try to verify if it's an image by checking content-type
                    try {
                        const contentType = await checkUrlContentType(romName)
                        if (contentType && contentType.startsWith('image/')) {
                            api.log(`[searchCovers] URL content-type is image: ${contentType}`)
                            return {
                                success: true,
                                results: [{
                                    id: 'direct-url',
                                    name: 'Direct URL Image',
                                    coverUrl: romName,
                                    isDirect: true
                                }]
                            }
                        }
                    } catch (err) {
                        api.log(`[searchCovers] Could not verify URL: ${err.message}`)
                    }
                }

                // If not a URL, proceed with normal IGDB search
                api.log(`[searchCovers] Searching IGDB for covers matching: "${romName}"`)
                const results = await searchGameCovers(romName)
                return { success: true, results }
            } catch (err) {
                api.log(`Error searching covers: ${err.message}`)
                return { success: false, error: err.message }
            }
        },
        /// Search for complete game info
        async searchGameInfo({ gameName }) {
            try {
                const results = await searchGameInfo(gameName)
                return { success: true, results }
            } catch (err) {
                api.log(`Error searching game info: ${err.message}`)
                return { success: false, error: err.message }
            }
        },

        /// Save game info to cache
        async saveGameInfo({ romName, gameInfo }) {
            try {
                const saved = saveGameInfoToCache(romName, gameInfo)
                return { success: saved }
            } catch (err) {
                api.log(`Error saving game info: ${err.message}`)
                return { success: false, error: err.message }
            }
        },

        /// Get game info from cache
        async getGameInfo({ romName }) {
            try {
                const gameInfo = getGameInfoFromCache(romName)
                if (gameInfo) {
                    return { success: true, gameInfo }
                }
                return { success: false, error: 'Game info not found in cache' }
            } catch (err) {
                api.log(`Error getting game info: ${err.message}`)
                return { success: false, error: err.message }
            }
        },

        /// Set cover image for a ROM
        async setCover({ romName, coverUrl }, ctx) {
            try {
                if (!isAdminRequest(ctx)) return { success: false, error: 'Admin access required' };
                // Check if coverUrl is a valid URL
                let finalCoverUrl = coverUrl
                let hasExtension = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp']
                    .some(ext => coverUrl.toLowerCase().endsWith(ext))
                let isDataUri = coverUrl.toLowerCase().startsWith('data:image/') && coverUrl.length > 11
                if (hasExtension || isDataUri) {
                    api.log(`[setCover] Valid image URL detected, will download directly`)
                    finalCoverUrl = coverUrl
                } else {
                    const contentType = await checkUrlContentType(coverUrl)
                    if (contentType && contentType.startsWith('image/')) {
                        api.log(`[setCover] URL content-type is image: ${contentType}`)
                        finalCoverUrl = coverUrl
                    } else {
                        return { success: false, error: `URL does not point to a valid image. Content-Type: ${contentType}` }
                    }
                }
                romName = fixGameName(romName);
                // Determine image extension from coverUrl
                const coverPath = path.join(coversDir, romName + '.png')

                // Ensure covers directory exists
                ensureDir(fs, coversDir);

                api.log(`[setCover] Saving cover for ROM: ${romName}`)
                api.log(`[setCover] Target path: ${coverPath}`)

                await downloadImage(finalCoverUrl, coverPath)

                return { success: true, message: 'Cover saved successfully', coverPath }

            } catch (err) {
                api.log(`Error processing cover URL: ${err.message}`)
                return { success: false, error: err.message }
            }

        },
        /// Remove cover image for a ROM
        async removeCover({ romName }, ctx) {
            try {
                if (!isAdminRequest(ctx)) return { success: false, error: 'Admin access required' };
                api.log(`[removeCover] Removing cover for ROM: ${romName}`)

                // Check for cover files with different extensions
                const coverExtensions = ['.jpg', '.jpeg', '.png']
                let coverRemoved = false
                romName = fixGameName(romName);

                for (const ext of coverExtensions) {
                    const coverPath = path.join(coversDir, romName + ext)
                    if (fs.existsSync(coverPath)) {
                        api.log(`[removeCover] Found cover at: ${coverPath}`)
                        fs.unlinkSync(coverPath)
                        api.log(`[removeCover] Cover removed successfully`)
                        coverRemoved = true
                    }
                }

                if (coverRemoved) {
                    return { success: true, message: 'Cover removed successfully' }
                } else {
                    return { success: false, error: 'No cover found to remove' }
                }
            } catch (err) {
                api.log(`Error removing cover: ${err.message}`)
                return { success: false, error: err.message }
            }
        },



        async setFolderIcon({ folderPath, iconName }, ctx) {
            try {
                if (!isAdminRequest(ctx)) return { success: false, error: 'Admin access required' };
                if (!folderPath || !iconName) {
                    return { success: false, error: 'Missing folderPath or iconName parameter' }
                }

                api.log(`[setFolderIcon] Setting icon "${iconName}" for folder: ${folderPath}`)

                // Normalize folder path (remove leading/trailing slashes)
                const normalizedPath = fixGameName(folderPath.replace(/^\/+|\/+$/g, ''))

                // Save icon mapping

                let mappings = {}

                if (fs.existsSync(mappingFile)) {
                    try {
                        const data = fs.readFileSync(mappingFile, 'utf8')
                        mappings = JSON.parse(data)
                    } catch (err) {
                        api.log(`[setFolderIcon] Error reading mappings: ${err.message}`)
                    }
                }

                mappings[normalizedPath] = iconName
                fs.writeFileSync(mappingFile, JSON.stringify(mappings, null, 2), 'utf8')

                api.log(`[setFolderIcon] Icon mapping saved successfully`)

                return { success: true, message: 'Folder icon set successfully' }
            } catch (err) {
                api.log(`[setFolderIcon] Error: ${err.message}`)
                return { success: false, error: err.message }
            }
        },





        async removeFolderIcon({ folderPath }, ctx) {
            try {
                if (!isAdminRequest(ctx)) return { success: false, error: 'Admin access required' };
                if (!folderPath) {
                    return { success: false, error: 'Missing folderPath parameter' }
                }

                api.log(`[removeFolderIcon] Removing icon for folder: ${folderPath}`)

                // Normalize folder path
                const normalizedPath = fixGameName(folderPath.replace(/^\/+|\/+$/g, ''))




                if (!fs.existsSync(mappingFile)) {
                    return { success: false, error: 'No icon mapping found' }
                }

                let mappings = {}
                try {
                    const data = fs.readFileSync(mappingFile, 'utf8')
                    mappings = JSON.parse(data)
                } catch (err) {
                    api.log(`[removeFolderIcon] Error reading mappings: ${err.message}`)
                    return { success: false, error: 'Error reading icon mappings' }
                }

                if (!mappings[normalizedPath]) {
                    return { success: false, error: 'No icon set for this folder' }
                }

                // Remove the icon mapping
                delete mappings[normalizedPath]
                fs.writeFileSync(mappingFile, JSON.stringify(mappings, null, 2), 'utf8')

                api.log(`[removeFolderIcon] Icon removed successfully for folder: ${folderPath}`)
                return { success: true, message: 'Folder icon removed successfully' }
            } catch (err) {
                api.log(`[removeFolderIcon] Error: ${err.message}`)
                return { success: false, error: err.message }
            }
        },

        emulatorjsGetConfig(params, ctx) {
            if (!isAdminRequest(ctx)) { ctx.status = 403; return { error: 'Admin access required' } }
            const cfg = { ...(api.getConfig() || {}) }
            cfg.ejsLocalReady = isLocalEjsReady()
            return cfg
        },

        emulatorjsSetConfig(params, ctx) {
            if (!isAdminRequest(ctx)) { ctx.status = 403; return { error: 'Admin access required' } }
            const incoming = params && params.config
            if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) {
                ctx.status = 400
                return { error: 'Invalid config payload' }
            }
            for (const key of CONFIG_KEYS) {
                if (!(key in incoming)) continue
                let value = incoming[key]
                if (key === 'systemMap') {
                    const canonical = canonicalSystemMap(value)
                    value = isDefaultSystemMap(canonical) ? [] : canonical
                }
                api.setConfig(key, value)
            }
            api.setConfig('ejsLocalReady', isLocalEjsReady())
            const cfg = { ...(api.getConfig() || {}) }
            cfg.ejsLocalReady = isLocalEjsReady()
            return { ok: true, saved: true, config: cfg }
        },

        emulatorjsDefaultSystemMap(params, ctx) {
            if (!isAdminRequest(ctx)) { ctx.status = 403; return { error: 'Admin access required' } }
            return { systemMap: defaultSystemMap() }
        },

    }

    // Helper functions for save/load state endpoints
    async function handleSaveState(ctx) {
        try {
            if (!isAdminRequest(ctx)) {
                ctx.status = 403;
                ctx.body = 'Admin access required';
                return;
            }
            api.log(`[handleSaveState] Starting save state`);
            const body = await getBody(ctx);
            api.log(`[handleSaveState] Body received: ${typeof body}, keys: ${Object.keys(body)}`);
            const { state, screenshot } = body;
            api.log(`[handleSaveState] state length: ${state ? state.length : 'undefined'}, screenshot length: ${screenshot ? screenshot.length : 'undefined'}`);


            const gameName = fixGameName(ctx.query.gameName || '');
            api.log(`[handleSaveState] gameName: ${gameName}`);
            if (!gameName) {
                ctx.status = 400;
                ctx.body = 'Missing gameName';
                return;
            }

            const userId = api.getCurrentUsername(ctx);
            api.log(`[handleSaveState] userId: ${userId}`);
            if (!userId || userId.length === 0) {
                ctx.status = 400;
                ctx.body = 'Missing user identification';
                return;
            }
            const gameDir = path.join(savesDir, userId, gameName);
            api.log(`[handleSaveState] gameDir: ${gameDir}`);
            ensureDir(fs, gameDir);
            const stateFile = path.join(gameDir, 'save.state');
            api.log(`[handleSaveState] Writing state to: ${stateFile}`);
            fs.writeFileSync(stateFile, Buffer.from(state, 'base64'));
            if (screenshot) {
                const screenshotFile = path.join(gameDir, 'save.png');
                api.log(`[handleSaveState] Writing screenshot to: ${screenshotFile}`);
                fs.writeFileSync(screenshotFile, Buffer.from(screenshot, 'base64'));
            }
            api.log(`[handleSaveState] Save state successful`);
            ctx.status = 200;
            ctx.body = 'OK';
        } catch (err) {
            api.log(`Error saving state: ${err.message}`);
            api.log(`Error stack: ${err.stack}`);
            ctx.status = err.statusCode || 500;
            ctx.body = 'Error';
        }
    }

    async function handleLoadState(ctx) {
        try {


            const gameName = fixGameName(ctx.query.gameName || '');
            if (!gameName) {
                ctx.status = 400;
                ctx.body = 'Missing gameName';
                return;
            }
            const userId = api.getCurrentUsername(ctx);
            if (!userId || userId.length === 0) {
                ctx.status = 400;
                ctx.body = 'Missing user identification';
                return;
            }

            const gameDir = path.join(savesDir, userId, gameName);
            const stateFile = path.join(gameDir, 'save.state');
            if (fs.existsSync(stateFile)) {
                if (ctx.method === 'HEAD') {
                    ctx.status = 200;
                    return;
                }
                const data = fs.readFileSync(stateFile);
                ctx.status = 200;
                ctx.type = 'application/octet-stream';
                ctx.body = data;
            } else {
                ctx.status = 404;
                ctx.body = 'Save State Not found';
            }
        } catch (err) {
            api.log(`Error loading state: ${err.message}`);
            ctx.status = 500;
            ctx.body = 'Error';
        }
    }

    async function handleSaveGame(ctx) {
        try {
            if (!isAdminRequest(ctx)) {
                ctx.status = 403;
                ctx.body = 'Admin access required';
                return;
            }
            const body = await getBody(ctx);
            const { file } = body;
            const gameName = fixGameName(ctx.query.gameName || '');
            if (!gameName) {
                ctx.status = 400;
                ctx.body = 'Missing gameName';
                return;
            }
            const userId = api.getCurrentUsername(ctx);
            if (!userId || userId.length === 0) {
                ctx.status = 400;
                ctx.body = 'Missing user identification';
                return;
            }
            const gameDir = path.join(savesDir, userId, gameName);
            ensureDir(fs, gameDir);
            const saveFile = path.join(gameDir, 'save.srm');
            fs.writeFileSync(saveFile, Buffer.from(file, 'base64'));
            ctx.status = 200;
            ctx.body = 'OK';
        } catch (err) {
            api.log(`Error saving game: ${err.message}`);
            ctx.status = err.statusCode || 500;
            ctx.body = 'Error';
        }
    }

    async function handleLoadGame(ctx) {
        try {
            const gameName = fixGameName(ctx.query.gameName || '');
            if (!gameName) {
                ctx.status = 400;
                ctx.body = 'Missing gameName';
                return;
            }
            const userId = api.getCurrentUsername(ctx);
            if (!userId || userId.length === 0) {
                ctx.status = 400;
                ctx.body = 'Missing user identification';
                return;
            }
            const gameDir = path.join(savesDir, userId, gameName);
            const saveFile = path.join(gameDir, 'save.srm');
            if (fs.existsSync(saveFile)) {
                const data = fs.readFileSync(saveFile);
                ctx.status = 200;
                ctx.type = 'application/octet-stream';
                ctx.body = data;
            } else {
                ctx.status = 404;
                ctx.body = 'SRAM Not found';
            }
        } catch (err) {
            api.log(`Error loading game: ${err.message}`);
            ctx.status = 500;
            ctx.body = 'Error';
        }
    }

    function handleSettingsPage(ctx) {
        if (!isAdminRequest(ctx)) {
            ctx.status = 403;
            ctx.type = 'text/plain; charset=utf-8';
            ctx.body = 'Administrator access required';
            return;
        }
        const file = path.join(publicDir, 'settings.html');
        if (!fs.existsSync(file)) {
            ctx.status = 500;
            ctx.type = 'text/plain; charset=utf-8';
            ctx.body = 'settings.html is missing from the plugin folder';
            return;
        }
        ctx.status = 200;
        ctx.type = 'text/html; charset=utf-8';
        ctx.set('Cache-Control', 'no-store');
        if (ctx.method === 'HEAD') return;
        ctx.body = fs.readFileSync(file);
    }

    const EJS_MIME = {
        html: 'text/html; charset=utf-8', htm: 'text/html; charset=utf-8',
        js: 'text/javascript; charset=utf-8', mjs: 'text/javascript; charset=utf-8',
        json: 'application/json; charset=utf-8', map: 'application/json; charset=utf-8',
        css: 'text/css; charset=utf-8', txt: 'text/plain; charset=utf-8',
        wasm: 'application/wasm', data: 'application/octet-stream', mem: 'application/octet-stream',
        bin: 'application/octet-stream',
        png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', svg: 'image/svg+xml', ico: 'image/x-icon',
        wav: 'audio/wav', mp3: 'audio/mpeg', ogg: 'audio/ogg',
    };
    const EJS_DATA_PREFIX = '/~/retro-emulator/data/';

    function serveEjsData(ctx) {
        const dir = api.getConfig('ejsLocalDir');
        if (!dir) { ctx.status = 404; ctx.body = 'Local EmulatorJS folder is not configured'; return; }
        if (!isLocalEjsReady()) { ctx.status = 404; ctx.body = 'Local EmulatorJS folder is not a valid EmulatorJS install'; return; }

        let base;
        try { base = fs.realpathSync(path.resolve(String(dir).trim())); }
        catch (err) { ctx.status = 404; ctx.body = 'Local EmulatorJS folder not found'; return; }

        let rel = ctx.path.slice(EJS_DATA_PREFIX.length);
        try { rel = decodeURIComponent(rel); } catch (err) { }
        rel = rel.replace(/\\/g, '/').replace(/^\/+/, '');

        if (rel.split('/').some(seg => seg.startsWith('.'))) { ctx.status = 403; ctx.body = 'Forbidden'; return; }

        let target = path.resolve(base, rel);
        if (target !== base && !target.startsWith(base + path.sep)) { ctx.status = 403; ctx.body = 'Forbidden'; return; }

        let real;
        try { real = fs.realpathSync(target); }
        catch (err) { ctx.status = 404; ctx.body = 'Not found'; return; }
        if (real !== base && !real.startsWith(base + path.sep)) { ctx.status = 403; ctx.body = 'Forbidden'; return; }
        target = real;

        let stat;
        try { stat = fs.statSync(target); }
        catch (err) { ctx.status = 404; ctx.body = 'Not found'; return; }

        if (stat.isDirectory()) {
            const index = path.join(target, 'index.html');
            if (fs.existsSync(index)) { target = index; stat = fs.statSync(index); }
            else { ctx.status = 404; ctx.body = 'Not found'; return; }
        }

        const ext = path.extname(target).slice(1).toLowerCase();
        ctx.status = 200;
        ctx.type = EJS_MIME[ext] || 'application/octet-stream';
        ctx.set('Cache-Control', 'public, max-age=3600');
        ctx.length = stat.size;
        if (ctx.method === 'HEAD') return;
        try { ctx.body = fs.readFileSync(target); }
        catch (err) { ctx.status = 500; ctx.body = 'Failed to read file'; }
    }

    // Helper to get request body, with a ~1MB limit
    function getBody(ctx) {
        const MAX_BODY_LENGTH = 1024 * 1024;
        return new Promise((resolve, reject) => {
            let body = '';
            let size = 0;
            ctx.req.on('data', chunk => {
                size += chunk.length;
                if (size > MAX_BODY_LENGTH) {
                    const err = new Error('Request body too large');
                    err.statusCode = 413;
                    ctx.req.destroy();
                    reject(err);
                    return;
                }
                body += chunk;
            });
            ctx.req.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    resolve({});
                }
            });
            ctx.req.on('error', reject);
        });
    }

    return {
        // Frontend files (paths relative to the plugin's public folder)
        frontend_js: ['system_map.js', 'emulator.js'],
        frontend_css: 'emulator.css',
        async middleware(ctx) {

            // CORS: echo the request Origin (fallback to Host) so credentials and COOP/COEP stay consistent
            const origin = ctx.get('Origin') || ctx.host;
            const allowedGets = ['game_cover'];
            const typeGet = ctx.query.get;
            const isCoverRequest = allowedGets.includes(typeGet);
            const isEmulatorPath = ctx.path.startsWith('/~/emulatorjs/');

            if (isEmulatorPath || isCoverRequest) {
                ctx.set('Access-Control-Allow-Origin', origin);
                const vary = ctx.get('Vary') || '';
                if (!/\bOrigin\b/i.test(vary)) {
                    ctx.set('Vary', vary ? vary + ', Origin' : 'Origin');
                }
                ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
                ctx.set('Access-Control-Allow-Methods', 'GET, POST, HEAD, OPTIONS');
                if (ctx.method === 'OPTIONS') {
                    ctx.status = 200;
                    ctx.body = '';
                    return;
                }
            }

            if (!isCoverRequest) {
                // Para outras requisições (incluindo o emulador), definir COEP/COOP
                ctx.set('Cross-Origin-Opener-Policy', 'same-origin');
                ctx.set('Cross-Origin-Embedder-Policy', 'credentialless');
            }

            // Handle save/load state endpoints
            if (ctx.path === '/~/emulatorjs/saveState' && ctx.method === 'POST') {
                return handleSaveState(ctx);
            }
            if (ctx.path === '/~/emulatorjs/loadState' && (ctx.method === 'GET' || ctx.method === 'HEAD')) {
                return handleLoadState(ctx);
            }


            if (ctx.path === '/~/emulatorjs/saveGame' && ctx.method === 'POST') {
                return handleSaveGame(ctx);
            }
            if (ctx.path === '/~/emulatorjs/loadGame' && ctx.method === 'GET') {
                return handleLoadGame(ctx);
            }

            if ((ctx.path === '/~/retro-emulator/settings' || ctx.path === '/~/retro-emulator/settings.html')
                && (ctx.method === 'GET' || ctx.method === 'HEAD')) {
                return handleSettingsPage(ctx);
            }

            if (ctx.path.startsWith('/~/retro-emulator/data/')
                && (ctx.method === 'GET' || ctx.method === 'HEAD')) {
                return serveEjsData(ctx);
            }

            if (!allowedGets.includes(typeGet)) return;


            ctx.state.considerAsGui = true
            ctx.state.download_counter_ignore = true

            function error(code, body) {
                ctx.status = code
                ctx.type = 'text'
                ctx.body = body
            }

            api.log("======== NEW REQUEST ========")
            let filePath = ctx.path;

            let isFile = null;
            let extension = null;
            let folderPath = null;
            let fileName = null
            let iconPath = null;
            let mappings = null;
            let mappedIcon = null;

            // check if ctx.path is a file or folder
            if (filePath == null || filePath.length == 0) {
                filePath = null;
                fileName = null;
                extension = null;
                isFile = null
                api.log('No fileName provided in request path.');
            } else {
                // Apply fixGameName first to normalize the path
                filePath = fixGameName(filePath);

                // Then extract extension from normalized path
                extension = path.extname(filePath).toLowerCase().slice(1).trim();
                isFile = extension.length > 0;
                fileName = path.basename(filePath);

                if (isFile) {
                    folderPath = path.dirname(filePath);
                } else {
                    folderPath = filePath;
                }

                folderPath = fixGameName(folderPath);
                fileName = fixGameName(fileName);

                api.log(`Request path: ${filePath}, isFile: ${isFile}`);
                api.log(`Derived folderPath: ${folderPath}`);
                api.log(`Derived fileName: ${fileName}`);
                api.log(`Derived extension: ${extension}`);

            }


            if (isFile == null) {
                api.log('Unable to determine if path is file or folder: ' + filePath);
                return error(400, 'Bad Request: Unable to determine if path is file or folder');
            }



            api.log(`Requested ${typeGet} for entry: ${filePath}`)

            try {
                // LÓGICA:
                // - Se for ARQUIVO (isFile=true): sempre busca COVER
                // - Se for PASTA (isFile=false) OU não houver cover: busca ÍCONE

                api.log(`isFile: ${isFile}, extension: ${extension}`)
                api.log(`compatibleExtensions available: ${compatibleExtensions ? 'yes' : 'no'}`)

                // 1. Se for arquivo, tentar buscar COVER primeiro
                if (isFile && typeGet === 'game_cover') {
                    api.log(`Searching for cover (is file)`)
                    const coverExtensions = ['.png', '.jpg', '.jpeg']
                    for (const ext of coverExtensions) {
                        const coverPath = path.join(coversDir, fileName + ext)
                        if (fs.existsSync(coverPath)) {
                            api.log(`Found cover: ${coverPath}`)
                            iconPath = coverPath;
                            ctx.set('Is-Icon', false);
                            ctx.set('Is-Cover', true);
                            ctx.set('Is-Mapped-Icon', false);
                            break;
                        }
                    }
                    if (!iconPath) {
                        api.log(`No local cover found for file: ${fileName}, trying on-demand artwork`)
                        try {
                            const systemId = detectSystemId(fileName, folderPath)
                            const artwork = await resolveCover(fileName, systemId)
                            if (artwork && artwork.url) {
                                api.log(`Serving remote cover (${artwork.source}) for ${fileName}`)
                                ctx.status = 302
                                ctx.set('Location', artwork.url)
                                ctx.set('Cache-Control', 'private, max-age=86400')
                                ctx.length = 0
                                ctx.body = null
                                return
                            }
                        } catch (err) {
                            api.log(`resolveCover failed: ${err.message}`)
                        }
                        api.log(`No cover found for file: ${fileName}`)
                    }
                }

                // 2. Se não houver cover OU for pasta, buscar ÍCONE
                if (!iconPath) {
                    api.log(`Searching for icon (no cover found or is folder)`)

                    // 2.1 Tentar mapeamentos personalizados
                    if (fs.existsSync(mappingFile)) {
                        api.log(`Loading icon mappings from file: ${mappingFile}`)
                        try {
                            const data = fs.readFileSync(mappingFile, 'utf8')
                            mappings = JSON.parse(data)

                            if (mappings && Object.keys(mappings).length > 0) {
                                const keysArray = Object.keys(mappings);
                                api.log(`Loaded ${keysArray.length} icon mappings from file.`)

                                keysArray.forEach((sm, index) => {
                                    const folderMapped = fixGameName(sm.replace(/^\/+|\/+$/g, ''));
                                    api.log(`Mapping ${index}: Folder "${folderMapped}" => Icon "${mappings[sm]}"`)

                                    if (folderPath.includes(sm) || folderPath.includes(folderMapped)) {
                                        api.log(`Folder path "${folderPath}" matches mapping folder "${folderMapped}"`)
                                        if (!mappedIcon || folderMapped.length > (mappedIcon.folder || '').length) {
                                            mappedIcon = { icon: mappings[sm], folder: folderMapped };

                                        }
                                    }
                                });

                                if (mappedIcon) {
                                    api.log(`Found mapping for folder "${folderPath}": ${mappedIcon.icon}`)
                                    const mappedIconPath = path.join(iconsDir, mappedIcon.icon);

                                    // try to see if an equivalent -content icon exists
                                    const mappedIconContentPath = path.join(iconsDir, mappedIcon.icon.replace(/(\.[^.]*)$/, '-content$1'));

                                    // map content only if is a file (not a folder)
                                    if (isFile && fs.existsSync(mappedIconContentPath)) {
                                        api.log(`Mapped content icon exists: ${mappedIconContentPath}`)
                                        iconPath = mappedIconContentPath;
                                        ctx.set('Is-Icon', true);
                                        ctx.set('Is-Cover', false);
                                        ctx.set('Is-Mapped-Icon', true);

                                    } else if (fs.existsSync(mappedIconPath)) {
                                        api.log(`Mapped icon exists: ${mappedIconPath}`)
                                        iconPath = mappedIconPath;
                                        ctx.set('Is-Icon', true);
                                        ctx.set('Is-Cover', false);
                                        ctx.set('Is-Mapped-Icon', true);

                                    } else {
                                        api.log(`Mapped icon does not exist on disk: ${mappedIconPath}`)
                                    }
                                } else {
                                    api.log(`No mapping found for folder: "${folderPath}"`)
                                }
                            }
                        } catch (err) {
                            api.log(`Error loading icon mappings: ${err.message}`)
                        }
                    }

                    // 2.2 Auto-detecção usando system_map.js
                    if (!iconPath) {

                        api.log(`No mapped icon found. Using detectBestIcon() for: ${isFile ? fileName : folderPath}`)

                        const searchText = isFile ? fileName : folderPath;
                        const detectedIcon = detectBestIcon(searchText, api.getConfig('iconTheme') || 'monochrome');

                        if (detectedIcon && detectedIcon.name) {
                            api.log(`detectBestIcon() returned: ${detectedIcon.name}`);
                            const detectedIconPath = path.join(iconsDir, detectedIcon.name);

                            if (fs.existsSync(detectedIconPath)) {
                                api.log(`Using detected icon: ${detectedIconPath}`);
                                iconPath = detectedIconPath;
                                ctx.set('Is-Icon', true);
                                ctx.set('Is-Cover', false);
                                ctx.set('Is-Mapped-Icon', false);

                            } else {
                                api.log(`Detected icon not found on disk: ${detectedIconPath}`);
                            }
                        } else {
                            api.log(`detectBestIcon() returned no results for: ${searchText}`);
                        }
                    }
                }


                ctx.set('fileName', fileName);
                ctx.set('folderPath', folderPath);



                api.log(`Final result: ${iconPath ? 'Found - ' + iconPath : 'Not found'}`);

                if (iconPath && fs.existsSync(iconPath)) {
                    ctx.set('icon', iconPath);
                    api.log(`Serving image from path: ${iconPath}`);

                    // Detectar tipo de imagem baseado na extensão
                    const ext = path.extname(iconPath).toLowerCase();
                    if (ext === '.jpg' || ext === '.jpeg') {
                        ctx.type = 'image/jpeg';
                    } else if (ext === '.png') {
                        ctx.type = 'image/png';
                    } else {
                        ctx.type = 'image/png'; // fallback
                    }

                    ctx.body = fs.createReadStream(iconPath);
                    api.log(`Image sent successfully`);
                    return;
                }

                api.log(`No ${typeGet} found for entry: ${filePath}`);
                error(404, `${typeGet} not found`);

            } catch (err) {
                api.log(`ERROR in middleware: ${err.message}`);
                api.log(`Stack trace: ${err.stack}`);
                error(500, `Internal error: ${err.message}`);
            }
        },

        // Plugin configuration
        config: {
            settingsLink: {
                type: 'show_html',
                html: '<div style="display:flex;flex-direction:column;gap:.7em">'
                    + '<div>Icon theme, EmulatorJS source, the console/system map and API credentials are managed on the plugin&rsquo;s own settings page.</div>'
                    + '<div><a href="../retro-emulator/settings" target="_blank" rel="noopener"'
                    + ' style="display:inline-block;padding:.55em 1.1em;border-radius:5px;background:#1976d2;color:#fff;text-decoration:none;font-weight:600">'
                    + 'Open EmulatorJS settings &rarr;</a></div>'
                    + '</div>',
            },

            emulatorsJsVersion: {
                type: 'select',
                defaultValue: 'stable',
                label: 'EmulatorJS Version',
                options: {
                    'Stable': 'stable',
                    'Latest': 'latest',
                    'Nightly': 'nightly',
                },
                frontend: true
            },

            iconTheme: {
                type: 'select',
                defaultValue: 'systematic',
                label: 'Icon Theme',
                helperText: 'Choose the visual style for console/system icons',
                options: {
                    'Automatic': 'automatic',
                    'Monochrome': 'monochrome',
                    'Daite': 'daite',                   
                    'FlatUX': 'flatux', 
                    'Systematic': 'systematic'
                },
                frontend: true
            },



            igdbClientId: {
                type: 'string',
                label: 'IGDB Client ID',
                helperText: 'Get from https://dev.twitch.tv/console/apps (Twitch application credentials)'
            },
            igdbClientSecret: {
                type: 'string',
                label: 'IGDB Client Secret',
                helperText: 'Get from https://dev.twitch.tv/console/apps (keep this secret!)',
                inputProps: { type: 'password' }
            },

            customIcons: {
                type: 'boolean',
                defaultValue: true,
                label: 'Custom ROM icons',
                showIf: '() => false',
            },
            iconFolder: {
                type: 'string',
                defaultValue: 'images',
                label: 'Icon subfolder name',
                showIf: '() => false',
            },
            iconThumbSuffix: {
                type: 'string',
                defaultValue: '-thumb',
                label: 'Thumbnail filename suffix',
                showIf: '() => false',
            },
            iconPreviewSuffix: {
                type: 'string',
                defaultValue: '-image',
                label: 'Preview filename suffix',
                showIf: '() => false',
            },
            artworkOnDemand: {
                type: 'boolean',
                defaultValue: true,
                label: 'Fetch artwork on demand',
                showIf: '() => false',
            },
            ejsDataSource: {
                type: 'select',
                defaultValue: '',
                label: 'EmulatorJS data source',
                options: {
                    'Follow EmulatorJS Version': '',
                    'Stable': 'stable',
                    'Latest': 'latest',
                    'Nightly': 'nightly',
                    'Local folder': 'local',
                    'Custom URL': 'custom',
                },
                frontend: true,
                showIf: '() => false',
            },
            ejsDataCustomUrl: {
                type: 'string',
                defaultValue: '',
                label: 'Custom EmulatorJS data URL',
                frontend: true,
                showIf: '() => false',
            },
            ejsLocalDir: {
                type: 'string',
                defaultValue: '',
                label: 'Local EmulatorJS folder',
                showIf: '() => false',
            },
            ejsLocalReady: {
                type: 'boolean',
                defaultValue: false,
                label: 'Local EmulatorJS folder ready',
                frontend: true,
                showIf: '() => false',
            },
            thegamesdbApiKey: {
                type: 'string',
                defaultValue: '',
                label: 'TheGamesDB API Key',
                inputProps: { type: 'password' },
                showIf: '() => false',
            },
            systemMap: {
                type: 'array',
                label: 'Console / system map',
                defaultValue: [],
                fields: {
                    system: { label: 'System ID', required: true },
                    name: { label: 'Display name', required: true },
                    extensions: { label: 'File extensions' },
                    core: { label: 'EmulatorJS core(s)' },
                    bios: { label: 'BIOS file name' },
                    aliases: { label: 'Folder names' },
                    artworkRepo: { label: 'Artwork repo' },
                    gamepadLayout: { label: 'Gamepad layout (JSON)', multiline: true },
                },
                frontend: true,
                showIf: '() => false',
            },
        },

        customRest
    }
}
