"use strict";


// EmulatorJS Plugin for HFS
// Allows opening ROMs in JavaScript emulators directly in the browser

exports.description = "Plugin that integrates EmulatorJS to emulate classic console games directly in the browser"
exports.version = 1.1;
exports.apiRequired = 12.9;


// IGDB API Configuration
let igdbToken = null
let tokenExpiry = null

exports.init = function (api) {

    const fs = require('fs');
    const https = require('https');
    const http = require('http');
    const path = require('path');

    const configuredBase = api.getConfig('storageBasePath') || api.storageDir;
    const publicDir = path.join(__dirname, 'public')
    const coversDir = path.join(configuredBase, 'covers')
    const gameInfoDir = path.join(configuredBase, 'gameinfo')
    const usersRoot = path.join(configuredBase, "users");
    const iconsDir = path.join(publicDir, 'console-icons')



    ensureDir(fs, path, configuredBase);
    ensureDir(fs, path, gameInfoDir);
    ensureDir(fs, path, usersRoot);
    ensureDir(fs, path, coversDir);
    ensureDir(fs, path, iconsDir);

    // Checks existence of public assets
    if (!fs.existsSync(path.join(publicDir, 'emulator.js')) || !fs.existsSync(path.join(publicDir, 'emulator.css'))) {
        api.setError('EmulatorJS plugin: missing public files (emulator.js or emulator.css). Check the public/ folder.')
    }

    // Utility: safe base64 decode
    function fromBase64(b64) {
        return Buffer.from(b64, "base64");
    }

    // Utility: ensure directory exists recursively
    function ensureDir(fs, path, dir) {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    }

    // Utility: normalize a game name into a filesystem-friendly base
    function gameBase(api, game) {
        const base = game.replace(/\\/g, "/").split("/").pop();
        return api.normalizeFilename(base.replace(/[^a-zA-Z0-9._-]/g, "_"));
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

    function getUsername(ctx) {
        return api.getCurrentUsername(ctx) || "";
    }

    function userRoot(username) {
        return path.join(usersRoot, username);
    }

    function userDirs(username) {
        const root = userRoot(username);
        const savesDir = path.join(root, "saves"); // .state files
        const screenshotsDir = path.join(root, "screenshots"); // .png previews
        const sramDir = path.join(root, "sram"); // .sram files
        ensureDir(fs, path, savesDir);
        ensureDir(fs, path, screenshotsDir);
        ensureDir(fs, path, sramDir);
        return { root, savesDir, screenshotsDir, sramDir };
    }

    function listSaveStatesFor(username, game) {
        const { savesDir, screenshotsDir } = userDirs(username);
        const base = path.parse(gameBase(api, game)).name;
        const glob = api.require("glob");
        const files = glob.sync(path.join(savesDir, `${base}_*.state`));
        return files.map(f => {
            const m = f.match(/_(\d+)\.state$/);
            const slot = m ? parseInt(m[1]) : undefined;
            const ts = fs.existsSync(f) ? fs.statSync(f).mtimeMs : 0;
            const screenshot = path.join(screenshotsDir, `${base}_${slot}.png`);
            return {
                slot,
                timestamp: ts,
                hasScreenshot: fs.existsSync(screenshot)
            };
        }).sort((a, b) => (b?.timestamp || 0) - (a?.timestamp || 0));
    }

    function stateFilePath(username, game, slot) {
        const { savesDir } = userDirs(username);
        const base = path.parse(gameBase(api, game)).name;
        return path.join(savesDir, `${base}_${slot}.state`);
    }

    function screenshotFilePath(username, game, slot) {
        const { screenshotsDir } = userDirs(username);
        const base = path.parse(gameBase(api, game)).name;
        return path.join(screenshotsDir, `${base}_${slot}.png`);
    }

    function sramFilePath(username, game) {
        const { sramDir } = userDirs(username);
        const base = path.parse(gameBase(api, game)).name;
        return path.join(sramDir, `${base}.sram`);
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

        // === Save States and SRAM Management ===

        /// List save states and SRAM info for a game
        async list({ game }, ctx) {
            const username = getUsername(ctx);
            if (!username) ctx.throw(401, "Not authenticated");
            const saves = listSaveStatesFor(username, game);
            const sramPath = sramFilePath(username, game);
            return {
                saveStates: saves,
                sramExists: fs.existsSync(sramPath),
                sramBytes: fs.existsSync(sramPath) ? fs.statSync(sramPath).size : 0
            };
        },

        /// Save a state
        async saveState({ game, slot, stateBase64, screenshotBase64 }, ctx) {
            const username = getUsername(ctx);
            if (!username) ctx.throw(401, "Not authenticated");
            const maxSlots = api.getConfig("max_save_slots") ?? 10;
            const n = Number(slot);
            if (!Number.isInteger(n) || n < 1 || n > maxSlots)
                ctx.throw(400, "Invalid slot");
            const stateBuf = fromBase64(stateBase64 || "");
            if (!stateBuf?.length) ctx.throw(400, "Empty state");
            const statePath = stateFilePath(username, game, n);
            const shotPath = screenshotFilePath(username, game, n);
            fs.writeFileSync(statePath, stateBuf);
            if (screenshotBase64) {
                const png = fromBase64(screenshotBase64);
                if (png?.length) fs.writeFileSync(shotPath, png);
            }
            api.log('[EmulatorJS] saveState', { user: username, game, slot: n, bytes: stateBuf.length });
            return { ok: true };
        },

        /// Delete a state
        async deleteState({ game, slot }, ctx) {
            const username = getUsername(ctx);
            if (!username) ctx.throw(401, "Not authenticated");
            const n = Number(slot);
            const statePath = stateFilePath(username, game, n);
            const shotPath = screenshotFilePath(username, game, n);
            const existed = fs.existsSync(statePath) || fs.existsSync(shotPath);
            if (fs.existsSync(statePath)) fs.unlinkSync(statePath);
            if (fs.existsSync(shotPath)) fs.unlinkSync(shotPath);
            return { ok: true, existed };
        },

        /// Load a state
        async loadState({ game, slot }, ctx) {
            const username = getUsername(ctx);
            if (!username) ctx.throw(401, "Not authenticated");
            const n = Number(slot);
            const statePath = stateFilePath(username, game, n);
            const shotPath = screenshotFilePath(username, game, n);
            if (!fs.existsSync(statePath)) {
                return { success: false, error: 'State not found', status: 404 };
            }
            try {
                const data = fs.readFileSync(statePath);
                const result = {
                    success: true,
                    stateBase64: data.toString('base64')
                };
                if (fs.existsSync(shotPath)) {
                    result.screenshotBase64 = fs.readFileSync(shotPath).toString('base64');
                }
                api.log('[EmulatorJS] loadState', { user: username, game, slot: n, bytes: data.length });
                return result;
            } catch (err) {
                api.log('[EmulatorJS] loadState error: ' + err.message);
                return { success: false, error: err.message, status: 500 };
            }
        },

        /// Save SRAM
        async saveSram({ game, dataBase64 }, ctx) {
            const username = getUsername(ctx);
            if (!username) ctx.throw(401, "Not authenticated");
            const buf = fromBase64(dataBase64 || "");
            if (!buf?.length) ctx.throw(400, "Empty SRAM");
            const f = sramFilePath(username, game);
            fs.writeFileSync(f, buf);
            api.log('[EmulatorJS] saveSram', { user: username, game, bytes: buf.length });
            return { ok: true };
        },

        /// Get SRAM
        async getSram({ game }, ctx) {
            const username = getUsername(ctx);
            if (!username) ctx.throw(401, "Not authenticated");
            const f = sramFilePath(username, game);
            if (!fs.existsSync(f)) return { success: false, error: 'No SRAM', status: 404 };
            try {
                const data = fs.readFileSync(f);
                return { success: true, dataBase64: data.toString('base64'), bytes: data.length };
            } catch (err) {
                api.log('[EmulatorJS] getSram error: ' + err.message);
                return { success: false, error: err.message, status: 500 };
            }
        },


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


        async getCover({ rom }) {
            try {
                if (!rom) {
                    return { success: false, error: 'Missing rom parameter', status: 400 }
                }

                api.log(`[getCover] Looking for cover for ROM: ${rom}`)

                // Check in plugin covers directory with different extensions
                const coverPathJpg = path.join(coversDir, rom + '.jpg')
                const coverPathPng = path.join(coversDir, rom + '.png')
                const coverPathJpeg = path.join(coversDir, rom + '.jpeg')

                if (fs.existsSync(coverPathPng)) {
                    api.log(`[getCover] Found cover in plugin covers: ${coverPathPng}`)
                    const imageData = fs.readFileSync(coverPathPng)
                    return {
                        success: true,
                        data: imageData.toString('base64'),
                        mimeType: 'image/png'
                    }
                }

                if (fs.existsSync(coverPathJpg)) {
                    api.log(`[getCover] Found cover in plugin covers: ${coverPathJpg}`)
                    const imageData = fs.readFileSync(coverPathJpg)
                    return {
                        success: true,
                        data: imageData.toString('base64'),
                        mimeType: 'image/jpeg'
                    }
                }



                if (fs.existsSync(coverPathJpeg)) {
                    api.log(`[getCover] Found cover in plugin covers: ${coverPathJpeg}`)
                    const imageData = fs.readFileSync(coverPathJpeg)
                    return {
                        success: true,
                        data: imageData.toString('base64'),
                        mimeType: 'image/jpeg'
                    }
                }

                api.log(`[getCover] Cover not found for ROM: ${rom}`)
                return { success: false, error: 'Cover not found', status: 404 }
            } catch (err) {
                api.log(`[getCover] Error: ${err.message}`)
                return { success: false, error: err.message, status: 500 }
            }
        },

        async setFolderIcon({ folderPath, iconName }) {
            try {
                if (!folderPath || !iconName) {
                    return { success: false, error: 'Missing folderPath or iconName parameter' }
                }

                api.log(`[setFolderIcon] Setting icon "${iconName}" for folder: ${folderPath}`)

                // Normalize folder path (remove leading/trailing slashes)
                const normalizedPath = folderPath.replace(/^\/+|\/+$/g, '')

                // Save icon mapping
                const mappingFile = path.join(configuredBase, 'icon-mappings.json')
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

        async getFolderIcon({ folderPath }) {
            try {
                if (!folderPath) {
                    return { success: false, error: 'Missing folderPath parameter' }
                }

                api.log(`[getFolderIcon] Getting icon for folder: ${folderPath}`)

                // Normalize folder path
                const normalizedPath = folderPath.replace(/^\/+|\/+$/g, '')

                const mappingFile = path.join(configuredBase, 'icon-mappings.json')

                if (!fs.existsSync(mappingFile)) {
                    return { success: false, error: 'No icon mapping found' }
                }

                const data = fs.readFileSync(mappingFile, 'utf8')
                const mappings = JSON.parse(data)

                if (mappings[normalizedPath]) {
                    api.log(`[getFolderIcon] Found icon: ${mappings[normalizedPath]}`)
                    return {
                        success: true,
                        iconName: mappings[normalizedPath],
                        dataUrl: `data:image/png;base64,${fs.readFileSync(path.join(iconsDir, mappings[normalizedPath])).toString('base64')}`
                    }
                }

                return { success: false, error: 'No icon for this folder' }
            } catch (err) {
                api.log(`[getFolderIcon] Error: ${err.message}`)
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
                const normalizedPath = folderPath.replace(/^\/+|\/+$/g, '')

                const mappingFile = path.join(configuredBase, 'icon-mappings.json')

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
        frontend_js: 'emulator.js',
        frontend_css: 'emulator.css',

        // Plugin configuration
        config: {

            storageBasePath: {
                type: "real_path",
                folders: true,
                label: "Storage Base Path",
                helperText: "Folder where the plugin will save SRAM, save states, covers, and gameinfo.",
                frontend: false,
                defaultValue: configuredBase,
                defaultPath: configuredBase
            },
            emulatorsJsVersion: {
                type: 'select',
                defaultValue: 'stable',
                label: 'EmulatorJS Version',
                options: {
                    'Stable': 'stable',
                    'Latest': 'latest',
                    'Nightly': 'nightly',
                }
            },
            showFileMenu: {
                type: 'boolean',
                defaultValue: true,
                label: 'Show button in file menu'
            },

            max_save_slots: {
                type: "number",
                label: "Max save-state slots per game",
                min: 1,
                max: 100,
                defaultValue: 10,
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
