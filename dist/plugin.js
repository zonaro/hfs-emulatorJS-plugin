// EmulatorJS Plugin for HFS
// Allows opening ROMs in JavaScript emulators directly in the browser

exports.description = "Plugin that integrates EmulatorJS to emulate classic console games directly in the browser"
exports.version = 1
exports.apiRequired = 8.23

exports.init = function (api) {

    const fs = require('fs')
    const path = require('path')
    const publicDir = path.join(__dirname, 'public')

    // Checks existence of public assets
    if (!fs.existsSync(path.join(publicDir, 'emulator.js')) || !fs.existsSync(path.join(publicDir, 'emulator.css'))) {
        api.setError('EmulatorJS plugin: missing public files (emulator.js or emulator.css). Check the public/ folder.')
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
            }
        }
    }
}
