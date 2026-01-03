// EmulatorJS Plugin para HFS
// Permite abrir ROMs em emuladores JavaScript diretamente no navegador

exports.description = "Plugin que integra EmulatorJS para emular jogos de consoles retro diretamente no navegador"
exports.version = 1
exports.apiRequired = 8.23

exports.init = function (api) {

    // Mapeamento de extensões de arquivo para sistemas EmulatorJS
    const SYSTEM_MAP = {
        // Nintendo
        'nes': 'nes', 'fds': 'nes', // NES/Famicom
        'snes': 'snes', 'smc': 'snes', // SNES
        'gb': 'gb', 'gbc': 'gbc', // Game Boy
        'gba': 'gba', // Game Boy Advance
        'n64': 'n64', 'z64': 'n64', // Nintendo 64
        'nds': 'ds', // Nintendo DS
        'vb': 'vb', // Virtual Boy

        // Sega
        'gen': 'megadrive', 'md': 'megadrive', 'smd': 'megadrive', // Mega Drive
        'gg': 'gamegear', // Game Gear
        'sms': 'mastersystem', // Master System
        'sat': 'saturn', // Saturn
        '32x': 'sega32x', // 32X
        'iso': 'saturn', 'bin': 'saturn', // CD based

        // Atari
        'a26': 'atarivcs', // 2600
        'a52': 'atari5200', // 5200
        'a78': 'atari7800', // 7800
        'lnx': 'lynx', // Lynx
        'j64': 'jaguar', // Jaguar

        // PlayStation
        'cue': 'psx', 'cimg': 'psx', // PlayStation
        'pbp': 'psp', // PSP

        // Arcade
        'zip': 'arcade', // MAME/FBA

        // Outros
        'prg': 'c64', 'd64': 'c64', // Commodore 64
        'adf': 'amiga', // Commodore Amiga
        'tap': 'vic20', // Commodore VIC-20
        'col': 'colecovision', // ColecoVision
    }


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
            useEmbeddedUI: {
                type: 'boolean',
                defaultValue: true,
                label: 'Usar UI incorporada (sem nova aba)',
                helperText: 'Se desativado, abre o emulador em uma nova aba'
            },
            showFileMenu: {
                type: 'boolean',
                defaultValue: true,
                label: 'Mostrar botão no menu de arquivo'
            }
        },

        // Middleware de fallback para servir assets caso o servidor não encontre
        middleware: ctx => {
            try {
                const reqPath = ctx.path || ctx.originalPath || (ctx.request && ctx.request.path) || ''
                if (!reqPath) return

                if (reqPath.endsWith('/emulator.js') || reqPath.endsWith('/emulator.css')) {
                    const file = reqPath.endsWith('/emulator.js') ? 'emulator.js' : 'emulator.css'
                    const filePath = path.join(publicDir, file)
                    if (fs.existsSync(filePath)) {
                        ctx.type = file.endsWith('.js') ? 'application/javascript' : 'text/css'
                        ctx.body = fs.createReadStream(filePath)
                        // se ctx.stop está disponível, pare a cadeia de middlewares
                        if (typeof ctx.stop === 'function') ctx.stop()
                    }
                }
            } catch (err) {
                api.log('error', '[emulatorjs-plugin] middleware error', err)
            }
        }
    }
}
