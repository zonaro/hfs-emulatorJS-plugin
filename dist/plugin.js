// EmulatorJS Plugin for HFS
// Allows opening ROMs in JavaScript emulators directly in the browser

exports.description = "Plugin that integrates EmulatorJS to emulate classic console games directly in the browser"
exports.version = 2
exports.apiRequired = 8.23

const fs = require('fs')
const path = require('path')
const https = require('https')
const http = require('http')

exports.init = function (api) {

    const publicDir = path.join(__dirname, 'public')
    const coversDir = path.join(__dirname, 'covers')
    const gameInfoDir = path.join(__dirname, 'gameinfo')
    const folderIconsDir = path.join(__dirname, 'folder-icons')

    // Ensure directories exist
    if (!fs.existsSync(coversDir)) {
        fs.mkdirSync(coversDir, { recursive: true })
    }
    if (!fs.existsSync(gameInfoDir)) {
        fs.mkdirSync(gameInfoDir, { recursive: true })
    }
    if (!fs.existsSync(folderIconsDir)) {
        fs.mkdirSync(folderIconsDir, { recursive: true })
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

    // Checks existence of public assets
    if (!fs.existsSync(path.join(publicDir, 'emulator.js')) || !fs.existsSync(path.join(publicDir, 'emulator.css'))) {
        api.setError('EmulatorJS plugin: missing public files (emulator.js or emulator.css). Check the public/ folder.')
    }

    // IGDB API Configuration
    let igdbToken = null
    let tokenExpiry = null

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
        return new Promise((resolve, reject) => {
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

    // Custom REST API to search and set covers
    const customRest = {
        async searchCovers({ romName }) {
            try {
                // Check if romName is actually a direct URL to an image
                if (romName && (romName.startsWith('http://') || romName.startsWith('https://'))) {
                    api.log(`[searchCovers] Detected direct URL: ${romName}`)

                    // Validate that the URL points to an image
                    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp']
                    const hasImageExtension = imageExtensions.some(ext => {
                        const urlLower = romName.toLowerCase()
                        return urlLower.includes(ext)
                    })

                    if (hasImageExtension) {
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
                    } else {
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
                }

                // If not a URL, proceed with normal IGDB search
                const results = await searchGameCovers(romName)
                return { success: true, results }
            } catch (err) {
                api.log(`Error searching covers: ${err.message}`)
                return { success: false, error: err.message }
            }
        },

        async searchGameInfo({ gameName }) {
            try {
                const results = await searchGameInfo(gameName)
                return { success: true, results }
            } catch (err) {
                api.log(`Error searching game info: ${err.message}`)
                return { success: false, error: err.message }
            }
        },

        async saveGameInfo({ romName, gameInfo }) {
            try {
                const saved = saveGameInfoToCache(romName, gameInfo)
                return { success: saved }
            } catch (err) {
                api.log(`Error saving game info: ${err.message}`)
                return { success: false, error: err.message }
            }
        },

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

        async setCover({ romName, gameId, coverUrl, romPath }) {
            try {
                // Check if coverUrl is a valid URL
                let finalCoverUrl = coverUrl

                // If coverUrl looks like a direct URL (starts with http:// or https://), validate it's an image
                if (coverUrl && (coverUrl.startsWith('http://') || coverUrl.startsWith('https://'))) {
                    api.log(`[setCover] Detected direct URL: ${coverUrl}`)

                    // Validate that the URL points to an image by checking the extension or content-type
                    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp']
                    const hasImageExtension = imageExtensions.some(ext => {
                        const urlLower = coverUrl.toLowerCase()
                        return urlLower.includes(ext)
                    })

                    if (hasImageExtension) {
                        api.log(`[setCover] Valid image URL detected, will download directly`)
                        finalCoverUrl = coverUrl
                    } else {
                        // Try to verify if it's an image by making a HEAD request
                        try {
                            const contentType = await checkUrlContentType(coverUrl)
                            if (contentType && contentType.startsWith('image/')) {
                                api.log(`[setCover] URL content-type is image: ${contentType}`)
                                finalCoverUrl = coverUrl
                            } else {
                                return { success: false, error: `URL does not point to a valid image. Content-Type: ${contentType}` }
                            }
                        } catch (err) {
                            api.log(`[setCover] Could not verify URL content-type: ${err.message}`)
                            // Proceed anyway if we can't check
                            finalCoverUrl = coverUrl
                        }
                    }
                }

                // Use the full ROM name including extension
                // Determine image extension from coverUrl
                const coverExt = finalCoverUrl.includes('.png') ? '.png' : '.jpg'
                const coverPath = path.join(coversDir, romName + coverExt)

                // Ensure covers directory exists
                if (!fs.existsSync(coversDir)) {
                    fs.mkdirSync(coversDir, { recursive: true })
                }

                api.log(`[setCover] Saving cover for ROM: ${romName}`)
                api.log(`[setCover] Target path: ${coverPath}`)

                await downloadImage(finalCoverUrl, coverPath)

                return { success: true, message: 'Cover saved successfully', coverPath }
            } catch (err) {
                api.log(`Error saving cover: ${err.message}`)
                return { success: false, error: err.message }
            }
        },

        async getCover({ rom, romPath }) {
            try {
                if (!rom) {
                    return { success: false, error: 'Missing rom parameter', status: 400 }
                }

                api.log(`[getCover] Looking for cover for ROM: ${rom}`)

                // Check in plugin covers directory with different extensions
                const coverPathJpg = path.join(coversDir, rom + '.jpg')
                const coverPathPng = path.join(coversDir, rom + '.png')
                const coverPathJpeg = path.join(coversDir, rom + '.jpeg')

                if (fs.existsSync(coverPathJpg)) {
                    api.log(`[getCover] Found cover in plugin covers: ${coverPathJpg}`)
                    const imageData = fs.readFileSync(coverPathJpg)
                    return {
                        success: true,
                        data: imageData.toString('base64'),
                        mimeType: 'image/jpeg'
                    }
                }

                if (fs.existsSync(coverPathPng)) {
                    api.log(`[getCover] Found cover in plugin covers: ${coverPathPng}`)
                    const imageData = fs.readFileSync(coverPathPng)
                    return {
                        success: true,
                        data: imageData.toString('base64'),
                        mimeType: 'image/png'
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
                const mappingFile = path.join(folderIconsDir, 'icon-mappings.json')
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

                const mappingFile = path.join(folderIconsDir, 'icon-mappings.json')

                if (!fs.existsSync(mappingFile)) {
                    return { success: false, error: 'No icon mapping found' }
                }

                const data = fs.readFileSync(mappingFile, 'utf8')
                const mappings = JSON.parse(data)

                if (mappings[normalizedPath]) {
                    api.log(`[getFolderIcon] Found icon: ${mappings[normalizedPath]}`)
                    return { success: true, iconName: mappings[normalizedPath] }
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

                const iconsDir = path.join(publicDir, 'console-icons')

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
                        displayName: filename.replace('.png', '').replace(/^(Nintendo|Sony|Sega|Atari|FBNeo) - /, ''),
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

        async getFolderIconImage({ iconName }) {
            try {
                if (!iconName) {
                    return { success: false, error: 'Missing iconName parameter' }
                }

                api.log(`[getFolderIconImage] Getting icon image: ${iconName}`)

                const iconsDir = path.join(publicDir, 'console-icons')
                const iconPath = path.join(iconsDir, iconName)

                // Validate path to prevent directory traversal
                if (!iconPath.startsWith(iconsDir)) {
                    return { success: false, error: 'Invalid icon name' }
                }

                if (!fs.existsSync(iconPath)) {
                    api.log(`[getFolderIconImage] Icon not found: ${iconPath}`)
                    return { success: false, error: 'Icon not found' }
                }

                const buffer = fs.readFileSync(iconPath)
                const imageData = buffer.toString('base64')

                api.log(`[getFolderIconImage] Returning icon image`)
                return {
                    success: true,
                    dataUrl: `data:image/png;base64,${imageData}`
                }
            } catch (err) {
                api.log(`[getFolderIconImage] Error: ${err.message}`)
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

                const mappingFile = path.join(folderIconsDir, 'icon-mappings.json')

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
            enabled: {
                type: 'boolean',
                defaultValue: true,
                label: 'Enable EmulatorJS',
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
            }
        },

        customRest
    }
}
