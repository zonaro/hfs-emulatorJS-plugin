"use strict";




// EmulatorJS Plugin for HFS
// Allows opening ROMs in JavaScript emulators directly in the browser

exports.description = "Plugin that integrates EmulatorJS to emulate classic console games directly in the browser"
exports.version = 1.3;
exports.apiRequired = 12.9;


// IGDB API Configuration
let igdbToken = null
let tokenExpiry = null

// an cache for system detection results {expires,icon}
let systemDetectorCache = {};

exports.init = function (api) {

    const fs = require('fs');
    const https = require('https');
    const http = require('http');
    const path = require('path');

    const publicDir = path.join(__dirname, 'public')
    const iconsDir = path.join(publicDir, 'console-icons')

    const configuredBase = api.storageDir;
    const coversDir = path.join(configuredBase, 'covers')
    const gameInfoDir = path.join(configuredBase, 'gameinfo')
    const systemMapPath = path.join(publicDir, 'system_map.js');
    const mappingFile = path.join(configuredBase, 'icon-mappings.json')




    function fetchText(url, timeoutMs = 5000, headers = {}, allowInsecure = true) {
        return new Promise((resolve, reject) => {
            try {
                const urlObj = new URL(url)
                const client = urlObj.protocol === 'https:' ? https : http

                const options = {
                    protocol: urlObj.protocol,
                    hostname: urlObj.hostname,
                    port: urlObj.port,
                    path: urlObj.pathname + urlObj.search,
                    headers
                }

                // allow self-signed certs for local/self requests when needed
                if (allowInsecure && urlObj.protocol === 'https:') {
                    options.rejectUnauthorized = false
                }

                const req = client.get(options, (res) => {
                    let data = ''
                    res.on('data', chunk => data += chunk)
                    res.on('end', () => {
                        const ok = res.statusCode && res.statusCode >= 200 && res.statusCode < 300
                        if (ok) {
                            resolve(data)
                        } else {
                            reject(new Error(`status ${res.statusCode}`))
                        }
                    })
                })

                req.setTimeout(timeoutMs, () => {
                    req.destroy(new Error('timeout'))
                })

                req.on('error', reject)
            } catch (err) {
                reject(err)
            }
        })
    }

    // get system_map.js and include it

    if (fs.existsSync(systemMapPath)) {
        api.log('Loaded: system_map.js');
    } else {
        api.setError('EmulatorJS plugin: system_map.js not found in public directory.');
    }

    const { SYSTEM_MAP, compatibleExtensions } = require(systemMapPath);


    ensureDir(fs, path, configuredBase);
    ensureDir(fs, path, gameInfoDir);
    ensureDir(fs, path, coversDir);


    // Checks existence of public assets
    if (!fs.existsSync(path.join(publicDir, 'emulator.js')) || !fs.existsSync(path.join(publicDir, 'emulator.css'))) {
        api.setError('EmulatorJS plugin: missing public files (emulator.js or emulator.css). Check the public/ folder.')
    }

    // Utility: fix game name for consistent caching
    function fixGameName(romName) {
        if (romName) {
            romName = decodeURIComponent(romName);
            romName = romName.toLowerCase();
            romName = romName.replace(/^\/+|\/+$/g, '')
        }
        return romName;
    }

    // Utility: ensure directory exists recursively
    function ensureDir(fs, path, dir) {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
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
    // Function to get IGDB authentication token
    async function getIGDBToken() {
        if (igdbToken && tokenExpiry && Date.now() < tokenExpiry) {
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
        async setCover({ romName, coverUrl }) {
            try {
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
                ensureDir(fs, path, coversDir);

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
        async removeCover({ romName }) {
            try {
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



        async setFolderIcon({ folderPath, iconName }) {
            try {
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



        async getAvailableIcons() {
            try {
                api.log(`[getAvailableIcons] Listing available console icons`)

                if (!fs.existsSync(iconsDir)) {
                    return { success: false, error: 'Icons directory not found' }
                }

                const files = fs.readdirSync(iconsDir)
                const iconFiles = files.filter(f => f.endsWith('.png'))

                const icons = iconFiles.map(filename => {
                    const iconPath = path.join(iconsDir, filename)
                    let imageData = null

                    try {
                        const buffer = fs.readFileSync(iconPath)
                        imageData = buffer.toString('base64')
                    } catch (err) {
                        api.log(`[getAvailableIcons] Error reading icon file ${filename}: ${err.message}`)
                    }

                    return {
                        filename,
                        // Remove o prefixo curto (ex: 'NES - ') e então remove o fabricante (ex: 'Nintendo - ')
                        displayName: filename.replace('.png', '').replace(/_/g, ' ').replace(/^[^-]+ - /, '').replace(/^(Nintendo|Sony|Sega|Atari|FBNeo|Microsoft|SNK|Bandai|Commodore|NEC|Panasonic) - /, ''),
                        dataUrl: imageData ? `data:image/png;base64,${imageData}` : null
                    }
                })

                api.log(`[getAvailableIcons] Found ${icons.length} icons`)
                return { success: true, icons }
            } catch (err) {
                api.log(`[getAvailableIcons] Error: ${err.message}`)
                return { success: false, error: err.message }
            }
        },


        async removeFolderIcon({ folderPath }) {
            try {
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
        }
    }

    return {
        // Frontend files (paths relative to the plugin's public folder)
        frontend_js: ['system_map.js', 'emulator.js'],
        frontend_css: 'emulator.css',
        middleware(ctx) {

            const allowedGets = ['game_cover', 'game_icon']
            const typeGet = ctx.query.get;
            if (!allowedGets.includes(typeGet)) return ctx.

                ctx.state.considerAsGui = true
            ctx.state.download_counter_ignore = true
            function error(code, body) {
                ctx.status = code
                ctx.type = 'text'
                ctx.body = body
            }
            return async () => {

                api.log("======== NEW REQUEST ========")
                let filePath = ctx.path;

                let isFile = null;
                let extension = null;
                let folderPath = null;
                let fileName = null
                let iconPath = null;
                let mappings = null
                let systemEntries = null;
                let mappedIcon = null;

                // check if ctx.path is a file or folder
                if (filePath == null || filePath.length == 0) {
                    filePath = null;
                    fileName = null;
                    extension = null;
                    isFile = null
                    api.log('No fileName provided in request path.');
                } else {
                    extension = path.extname(filePath).toLowerCase().slice(1).trim();
                    isFile = extension.length > 0;
                    fileName = path.basename(filePath);
                    if (isFile) {
                        folderPath = path.dirname(filePath);
                    } else {
                        folderPath = filePath;
                    }

                    filePath = fixGameName(filePath);
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


                let isCover = typeGet === 'game_cover'

                api.log(`Requested ${typeGet} for entry: ${filePath}`)

                if (isCover && extension && compatibleExtensions.includes(extension)) {

                    api.log(`Checking for custom cover for file: ${fileName}`)

                    const coverPathPng = path.join(coversDir, fileName + '.png')
                    const coverPathPng2 = filePath + '.png';

                    const coverPathJpg = path.join(coversDir, fileName + '.jpg')
                    const coverPathJpg2 = filePath + '.jpg';

                    const coverPathJpeg = path.join(coversDir, fileName + '.jpeg')
                    const coverPathJpeg2 = filePath + '.jpeg';

                    [coverPathPng2, coverPathJpg2, coverPathJpeg2, coverPathPng, coverPathJpg, coverPathJpeg].forEach(p => {
                        if (fs.existsSync(p)) {
                            api.log(`Serving cover from path: ${p}`)
                            iconPath = p
                            return;
                        }
                    });

                    if (!iconPath) {
                        api.log(`No custom cover found for file: ${filePath}`)
                    }

                }

                if (!iconPath) {
                    if (fs.existsSync(mappingFile)) {
                        api.log(`Loading icon mappings from file: ${mappingFile}`)
                        const data = fs.readFileSync(mappingFile, 'utf8')
                        mappings = JSON.parse(data)
                        api.log(mappings)
                        if (mappings) {
                            let keysArray = Object.keys(mappings);
                            api.log(`Loaded ${keysArray.length} icon mappings from file.`)

                            keysArray.forEach((sm, index) => {
                                let folderMapped = fixGameName(sm.replace(/^\/+|\/+$/g, ''));
                                api.log(`Mapping ${index}: Folder "${folderMapped}" => Icon "${mappings[sm]}"`)
                                if (folderPath.includes(sm) || folderPath.includes(folderMapped)) {
                                    api.log(`Folder path "${folderPath}" includes mapping folder "${folderMapped}"`)
                                    if (mappedIcon == null || mappedIcon.length == 0 || mappedIcon.length < folderMapped.length) {
                                        mappedIcon = mappings[sm];
                                    }

                                }
                            });

                            if (mappedIcon) {
                                api.log(`Found mapping for folder "${folderPath}": ${mappedIcon}`)
                                mappedIcon = path.join(iconsDir, mappedIcon);
                                if (fs.existsSync(mappedIcon)) {
                                    api.log(`Found mapped icon "${mappedIcon}" for folder: ${folderPath}`)
                                    iconPath = mappedIcon;
                                } else {
                                    api.log(`Mapped icon "${mappedIcon}" does not exist on disk.`)
                                    mappedIcon = null;
                                }
                            } else {
                                api.log(`No mapping found for folder: "${folderPath}"`)
                            }
                        } else {
                            api.log(`No valid mappings found in file.`)

                        }
                    }
                }

                if (!iconPath) {
                    api.log(`No mapped icon found for folder: ${folderPath}. Proceeding to auto-detect system.`)
                    const detectedSystems = new Set();
                    // get folder files and check possible systems
                    if (extension) {
                        api.log(`Checking extension for system detection: .${extension}`);
                        systemEntries = SYSTEM_MAP[extension];
                        if (systemEntries && systemEntries.length > 0) {
                            for (const sys of systemEntries) {
                                detectedSystems.add(sys.system);
                                api.log(`Detected system "${sys.system}" from extension: .${extension}`);
                            }
                        } else {
                            api.log(`No system entries found for extension: .${extension}`);
                        }
                    }

                    if (detectedSystems.size === 0) {

                        if (systemDetectorCache[folderPath]) {
                            if (!systemDetectorCache[folderPath].expires || systemDetectorCache[folderPath].expires < Date.now()) {
                                api.log(`Cache expired for folder: ${folderPath}`);
                                delete systemDetectorCache[folderPath];
                            }
                        }

                        if (systemDetectorCache[folderPath] && systemDetectorCache[folderPath].systemEntries) {
                            api.log(`Using cached system detection for folder: ${folderPath}`);
                            systemDetectorCache[folderPath].systemEntries.forEach(sys => detectedSystems.add(sys));
                        } else {
                            // use an request to get folder files, is folderpath + ?get=list  
                            api.log(`Scanning folder for system detection: ${folderPath}`);

                            const protocol = ctx.protocol || 'http';
                            const host = ctx.host || 'localhost';
                            const urlList = `${protocol}://${host}/${encodeURI(folderPath)}/?get=list&folders=0`;
                            api.log(`Fetching folder listing from URL: ${urlList}`);

                            const headers = {};
                            if (ctx.headers && ctx.headers.cookie) headers['Cookie'] = ctx.headers.cookie;
                            if (ctx.headers && ctx.headers.authorization) headers['Authorization'] = ctx.headers.authorization;

                            try {
                                const text = await fetchText(urlList, 5000, headers);
                                const fileList = text.split('\n').map(f => f.trim()).filter(f => f.length > 0);
                                api.log(`Received ${fileList.length} entries from folder listing.`);
                                const expiresInMinutes = Date.now() + ((parseInt(api.getConfig('cacheIcons')) || 720) * 60 * 1000)
                                if (fileList.length === 0) {
                                    api.log(`Folder listing is empty, skipping system detection for folder: ${folderPath}`);
                                    systemDetectorCache[folderPath] = { expires: expiresInMinutes, systemEntries: [] };
                                    api.log(`Cache will expire at: ${new Date(systemDetectorCache[folderPath].expires).toLocaleString()}`);

                                } else {
                                    fileList.forEach(fileEntry => {
                                        const fileExt = path.extname(fileEntry).toLowerCase().slice(1).trim();
                                        const systemEntries = SYSTEM_MAP[fileExt];
                                        if (systemEntries && systemEntries.length > 0) {
                                            systemDetectorCache[folderPath] = systemDetectorCache[folderPath] || {}
                                            systemDetectorCache[folderPath].systemEntries = systemDetectorCache[folderPath].systemEntries || [];
                                            systemDetectorCache[folderPath].expires =
                                                systemEntries.forEach(sys => {
                                                    detectedSystems.add(sys.system);
                                                    api.log(`Detected system "${sys.system}" from file: ${fileEntry}`);
                                                    systemDetectorCache[folderPath].systemEntries.push(sys.system);
                                                    systemDetectorCache[folderPath].expires = expiresInMinutes;
                                                    api.log(`Caching detected system "${sys.system}" for folder: ${folderPath}`);
                                                    api.log(`Cache will expire at: ${new Date(systemDetectorCache[folderPath].expires).toLocaleString()}`);
                                                });
                                        }
                                    });
                                }
                            } catch (err) {
                                api.log(`Folder listing fetch failed: ${err.message}`);
                            }
                        }

                    }

                    // if only one system detected, use its icon
                    if (detectedSystems.size === 1) {
                        Object.values(SYSTEM_MAP)
                            .forEach(systemEntries => {
                                systemEntries.forEach(systemEntry => {
                                    if (detectedSystems.has(systemEntry.system)) {
                                        api.log(`Single system "${systemEntry.system}" detected for folder. Using its icon.`);
                                        iconPath = path.join(iconsDir, systemEntry.icon);
                                    }
                                });
                            });
                    } else if (detectedSystems.size > 0) {
                        /// return xbox icon as default
                        api.log(`Multiple systems detected for folder. Using default Xbox icon.`);
                        iconPath = path.join(iconsDir, 'XBOX_-_Microsoft_-_Xbox.png');
                        ctx.set('Multiple-Systems', "true");


                    }
                }

                ctx.set('fileName', fileName);
                ctx.set('folderPath', folderPath);

                if (iconPath) {
                    ctx.set('icon', iconPath);
                    if (fs.existsSync(iconPath)) {
                        api.log(`Serving image from path: ${iconPath}`);
                        ctx.type = 'image/png'
                        ctx.body = fs.createReadStream(iconPath);
                        return;
                    } else {
                        api.log(`No icon found: ${iconPath}`);
                    }
                } else {
                    api.log(`Undefined icon`);
                }
                return error(404, `${typeGet} not found`);
            }
        },

        // Plugin configuration
        config: {
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
            cacheIcons: {
                type: 'number',
                defaultValue: 720,
                label: 'Cache Icons Duration (Minutes)',
                helperText: 'Duration to cache system detection icons in minutes. Set to 0 to disable caching. Default is 720 minutes (12 hours). This prevents repeated folder scans for icon detection.',
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
        },

        customRest
    }
}
