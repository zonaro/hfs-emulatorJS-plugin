// EmulatorJS Plugin para HFS
// Permite abrir ROMs em emuladores JavaScript diretamente no navegador

exports.description = "Plugin que integra EmulatorJS para emular jogos de consoles retro diretamente no navegador"
exports.version = 1
exports.apiRequired = 8.23

exports.init = function (api) {

    const fs = require('fs')
    const path = require('path')
    const publicDir = path.join(__dirname, 'public')

    // Verifica existência dos assets públicos
    if (!fs.existsSync(path.join(publicDir, 'emulator.js')) || !fs.existsSync(path.join(publicDir, 'emulator.css'))) {
        api.setError('EmulatorJS plugin: faltando arquivos públicos (emulator.js ou emulator.css). Verifique a pasta public/.')
    }

    return {
        // Frontend files (paths relativos à pasta public do plugin)
        frontend_js: 'emulator.js',
        frontend_css: 'emulator.css',

        // Configurações do plugin
        config: {
            enabled: {
                type: 'boolean',
                defaultValue: true,
                label: 'Ativar EmulatorJS',
            },
            emulatorsJsVersion: {
                type: 'select',
                defaultValue: 'stable',
                label: 'Versão do EmulatorJS',
                options: {
                    'Estável': 'stable',
                    'Última': 'latest',
                    'Nightly': 'nightly',
                }
            },
            showFileMenu: {
                type: 'boolean',
                defaultValue: true,
                label: 'Mostrar botão no menu de arquivo'
            }
        }
    }
}
