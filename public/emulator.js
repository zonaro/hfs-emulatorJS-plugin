'use strict'; {
    // Plugin de EmulatorJS para HFS
    console.log('[EmulatorJS] frontend script loaded')

    // Mapeamento de extensões para sistemas
    const SYSTEM_MAP = {
        // Nintendo
        'nes': { system: 'nes', name: 'NES/Famicom' },
        'fds': { system: 'nes', name: 'NES/Famicom' },
        'snes': { system: 'snes', name: 'SNES' },
        'smc': { system: 'snes', name: 'SNES' },
        'gb': { system: 'gb', name: 'Game Boy' },
        'gbc': { system: 'gbc', name: 'Game Boy Color' },
        'gba': { system: 'gba', name: 'Game Boy Advance' },
        'n64': { system: 'n64', name: 'Nintendo 64' },
        'z64': { system: 'n64', name: 'Nintendo 64' },
        'nds': { system: 'ds', name: 'Nintendo DS' },
        'vb': { system: 'vb', name: 'Virtual Boy' },

        // Sega
        'gen': { system: 'megadrive', name: 'Mega Drive' },
        'md': { system: 'megadrive', name: 'Mega Drive' },
        'smd': { system: 'megadrive', name: 'Mega Drive' },
        'gg': { system: 'gamegear', name: 'Game Gear' },
        'sms': { system: 'mastersystem', name: 'Master System' },
        'sat': { system: 'saturn', name: 'Saturn' },
        '32x': { system: 'sega32x', name: 'Sega 32X' },

        // Atari
        'a26': { system: 'atarivcs', name: 'Atari 2600' },
        'a52': { system: 'atari5200', name: 'Atari 5200' },
        'a78': { system: 'atari7800', name: 'Atari 7800' },
        'lnx': { system: 'lynx', name: 'Atari Lynx' },
        'j64': { system: 'jaguar', name: 'Atari Jaguar' },

        // PlayStation
        'cue': { system: 'psx', name: 'PlayStation' },
        'cimg': { system: 'psx', name: 'PlayStation' },
        'pbp': { system: 'psp', name: 'PlayStation Portable' },

        // Arcade
        'zip': { system: 'arcade', name: 'Arcade/MAME' },

        // Commodore
        'prg': { system: 'c64', name: 'Commodore 64' },
        'd64': { system: 'c64', name: 'Commodore 64' },
        'adf': { system: 'amiga', name: 'Commodore Amiga' },
        'tap': { system: 'vic20', name: 'Commodore VIC-20' },

        // Outros
        'col': { system: 'colecovision', name: 'ColecoVision' },
        'a8': { system: 'atari2600', name: 'Atari 2600' },
    }

    const config = HFS.getPluginConfig()
    const emuVersion = config.emulatorsJsVersion || 'stable'
    const cdnUrl = `https://cdn.emulatorjs.org/${emuVersion}/`
    // Valores obtidos no topo: não chame HFS.getPluginConfig()/getPluginPublic() dentro de callbacks
    const pluginPublic = HFS.getPluginPublic()
    const defaultEmuVersion = emuVersion

    // Função para obter o sistema baseado na extensão
    function getSystemFromFile(filename) {
        const ext = filename.split('.').pop().toLowerCase()
        return SYSTEM_MAP[ext]
    }

    // Cria URL da página do emulador que reside no plugin public (evita problemas de CORS)
    function createEmulatorPageUrl(gameUrl, system) {
        const version = defaultEmuVersion || 'stable'
        const base = pluginPublic || '' // termina com '/'

        // Garantir que gameUrl seja absoluta (com protocolo e domínio)
        let absoluteGameUrl = gameUrl
        if (!gameUrl.startsWith('http://') && !gameUrl.startsWith('https://')) {
            // Criar URL absoluta usando o origin atual
            absoluteGameUrl = window.location.origin + gameUrl
        }

        // Adicionar ?dl no final para forçar download direto no HFS
        if (!absoluteGameUrl.includes('?dl')) {
            absoluteGameUrl += '?dl'
        }

        const url = base + 'emulator_page.html?game=' + encodeURIComponent(absoluteGameUrl) + '&core=' + encodeURIComponent(system) + '&version=' + encodeURIComponent(version)
        console.log('[EmulatorJS] URL criada:', url)
        console.log('[EmulatorJS] - gameUrl original:', gameUrl)
        console.log('[EmulatorJS] - gameUrl absoluta:', absoluteGameUrl)
        console.log('[EmulatorJS] - system:', system)
        console.log('[EmulatorJS] - base:', base)
        return url
    }

    // Função para abrir jogo no emulador em nova aba
    function openGameInEmulator(entry, gameUrl) {
        const systemInfo = getSystemFromFile(entry.name)

        if (!systemInfo) {
            HFS.toast(`Formato de arquivo não suportado: ${entry.ext}`, 'error')
            return false
        }

        // Sempre abre em nova aba
        console.log('[EmulatorJS] Abrindo emulador em nova aba')
        const emulatorUrl = createEmulatorPageUrl(gameUrl, systemInfo.system)
        console.log('[EmulatorJS] URL:', emulatorUrl)
        window.open(emulatorUrl, '_blank')
        HFS.toast(`Abrindo ${systemInfo.name}...`, 'success')

        return true
    }

    // Hook para adicionar botão 'Jogar' no menu de arquivo
    if (config.showFileMenu !== false) {
        HFS.onEvent('fileMenu', ({ entry, menu }) => {
            // Usa config carregada no topo
            if (config.enabled === false) return

            try {
                const filename = (entry && (entry.name || ''))
                // Prefer entry.ext quando disponível
                const ext = (entry && entry.ext) ? entry.ext.toLowerCase() : (filename.includes('.') ? filename.split('.').pop().toLowerCase() : '')
                const systemInfo = getSystemFromFile(ext || filename)

                // Debug: registra quando fileMenu é chamado
                console.log('[EmulatorJS] fileMenu called for', filename, 'ext=', ext, 'detected=', !!systemInfo)

                if (!systemInfo || entry.isFolder) return

                // Checa se já existe item 'jogar' para evitar duplicação
                if (menu.some(i => i && i.id === 'jogar')) return

                // Adiciona opção 'Jogar' ao topo do menu para ROMs suportadas
                const item = {
                    id: 'jogar',
                    label: 'Jogar',
                    subLabel: systemInfo.name,
                    icon: 'play',
                    onClick: () => {
                        console.log('[EmulatorJS] Botão Jogar clicado!')
                        console.log('[EmulatorJS] - entry.uri:', entry.uri)
                        console.log('[EmulatorJS] - entry:', entry)
                        openGameInEmulator(entry, entry.uri)
                        return true
                    }
                }

                // Inserir no topo para ficar visível
                menu.unshift(item)
            } catch (err) {
                console.error('[EmulatorJS] erro no fileMenu handler', err)
            }
        })
    }

    console.log('[EmulatorJS] Plugin carregado com sucesso')
}
