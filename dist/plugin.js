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

    // Ensure covers directory exists
    if (!fs.existsSync(coversDir)) {
        fs.mkdirSync(coversDir, { recursive: true })
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

    // Function to search games on IGDB API
    async function searchGameCovers(gameName) {
        const token = await getIGDBToken()
        const IGDB_CLIENT_ID = api.getConfig('igdbClientId')

        return new Promise((resolve, reject) => {
            // Use search endpoint directly on games - no where filter needed
            const postData = `search "${gameName}"; fields name,cover.image_id; limit 20;`
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

    // Custom REST API to search and set covers
    const customRest = {
        async searchCovers({ romName }) {
            try {
                const results = await searchGameCovers(romName)
                return { success: true, results }
            } catch (err) {
                api.log(`Error searching covers: ${err.message}`)
                return { success: false, error: err.message }
            }
        },

        async setCover({ romName, gameId, coverUrl, romPath }) {
            try {
                // Use the full ROM name including extension
                // Determine image extension from coverUrl
                const coverExt = coverUrl.includes('.png') ? '.png' : '.jpg'
                const coverPath = path.join(coversDir, romName + coverExt)

                // Ensure covers directory exists
                if (!fs.existsSync(coversDir)) {
                    fs.mkdirSync(coversDir, { recursive: true })
                }

                api.log(`[setCover] Saving cover for ROM: ${romName}`)
                api.log(`[setCover] Target path: ${coverPath}`)

                await downloadImage(coverUrl, coverPath)

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
