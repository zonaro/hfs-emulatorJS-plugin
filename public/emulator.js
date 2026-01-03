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

    // Função para obter o sistema baseado na extensão
    function getSystemFromFile(filename) {
        const ext = filename.split('.').pop().toLowerCase()
        return SYSTEM_MAP[ext]
    }

    // Cria URL da página do emulador
    function createEmulatorPageUrl(gameUrl, system) {
        // Escapa as aspas na URL para a tag de script
        const escapedGameUrl = gameUrl.replace(/'/g, "\\'")
        const escapedCdnUrl = cdnUrl.replace(/'/g, "\\'")

        // Gera HTML inline para o emulador
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EmulatorJS - Game</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      background: #1a1a1a; 
      color: #fff; 
      font-family: Arial, sans-serif;
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }
    #header {
      padding: 10px 20px;
      background: #111;
      border-bottom: 1px solid #333;
      display: flex;
      align-items: center;
      gap: 10px;
      z-index: 1000;
    }
    #header h1 {
      flex: 1;
      font-size: 16px;
    }
    #header button {
      padding: 5px 15px;
      background: #d32f2f;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    #header button:hover {
      background: #b71c1c;
    }
    #game {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    canvas { max-width: 100%; max-height: 100%; }
  </style>
</head>
<body>
  <div id="header">
    <h1>Emulador - ${system}</h1>
    <button onclick="window.close()">Fechar</button>
  </div>
  <div id="game"></div>
  
  <script>
    window.EJS_player = '#game';
    window.EJS_gameUrl = '${escapedGameUrl}';
    window.EJS_core = '${system}';
    window.EJS_pathtodata = '${escapedCdnUrl}data/';
    window.EJS_defaultCoreSettings = {
      'bios': true,
      'biosLang': 'en'
    };
  </script>
  <script src="${escapedCdnUrl}data/loader.js"><\/script>
</body>
</html>
    `

        return 'data:text/html;base64,' + btoa(unescape(encodeURIComponent(htmlContent)))
    }

    // Função para abrir jogo no emulador (modal ou aba)
    function openGameInEmulator(entry, gameUrl) {
        const systemInfo = getSystemFromFile(entry.name)

        if (!systemInfo) {
            HFS.toast(`Formato de arquivo não suportado: ${entry.ext}`, 'error')
            return false
        }

        if (config.useEmbeddedUI !== false) {
            // Abre modal integrado
            openEmbeddedEmulator(entry, gameUrl, systemInfo)
        } else {
            // Abre em nova aba
            const emulatorUrl = createEmulatorPageUrl(gameUrl, systemInfo.system)
            window.open(emulatorUrl, '_blank')
        }

        return true
    }

    // Modal integrado do emulador
    function openEmbeddedEmulator(entry, gameUrl, systemInfo) {
        try {
            const iframeUrl = createEmulatorPageUrl(gameUrl, systemInfo.system)

            HFS.dialogLib.newDialog({
                title: `${systemInfo.name} - ${entry.name}`,
                className: 'emulatorjs-dialog',
                onClose() { },
                content: () => {
                    const div = document.createElement('div')
                    div.className = 'emulatorjs-embed'
                    div.style.width = '100%'
                    div.style.height = '100%'
                    div.style.display = 'flex'
                    div.style.flexDirection = 'column'

                    const iframe = document.createElement('iframe')
                    iframe.style.width = '100%'
                    iframe.style.height = '100%'
                    iframe.style.border = 'none'
                    iframe.style.flex = '1'
                    iframe.src = iframeUrl

                    div.appendChild(iframe)
                    return div
                }
            })
        } catch (error) {
            console.error('[EmulatorJS] Erro ao abrir modal:', error)
            // Fallback: abre em nova aba
            const emulatorUrl = createEmulatorPageUrl(gameUrl, systemInfo.system)
            window.open(emulatorUrl, '_blank')
        }
    }

    // Hook para adicionar botão 'Jogar' no menu de arquivo
    if (HFS.getPluginConfig().showFileMenu !== false) {
        HFS.onEvent('fileMenu', ({ entry, menu }) => {
            // Lê config em tempo de execução
            const cfg = HFS.getPluginConfig() || {}
            if (cfg.enabled === false) return

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
