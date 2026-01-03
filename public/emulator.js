'use strict'; {
    // EmulatorJS Plugin for HFS
    console.log('[EmulatorJS] frontend script loaded')

    // Mapping of extensions to systems
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

        // Others
        'col': { system: 'colecovision', name: 'ColecoVision' },
        'a8': { system: 'atari2600', name: 'Atari 2600' },
    }

    const config = HFS.getPluginConfig()
    const emuVersion = config.emulatorsJsVersion || 'stable'
    const cdnUrl = `https://cdn.emulatorjs.org/${emuVersion}/`
    // Values obtained at the top: do not call HFS.getPluginConfig()/getPluginPublic() inside callbacks
    const pluginPublic = HFS.getPluginPublic()
    const defaultEmuVersion = emuVersion

    // Function to get the system based on file extension
    function getSystemFromFile(filename) {
        const ext = filename.split('.').pop().toLowerCase()
        return SYSTEM_MAP[ext]
    }

    // Create emulator page URL that resides in plugin public (avoids CORS issues)
    function createEmulatorPageUrl(gameUrl, system) {
        const version = defaultEmuVersion || 'stable'
        const base = pluginPublic || '' // ends with '/'

        // Ensure gameUrl is absolute (with protocol and domain)
        let absoluteGameUrl = gameUrl
        if (!gameUrl.startsWith('http://') && !gameUrl.startsWith('https://')) {
            // Create absolute URL using current origin
            absoluteGameUrl = window.location.origin + gameUrl
        }

        // Add ?dl at the end to force direct download in HFS
        if (!absoluteGameUrl.includes('?dl')) {
            absoluteGameUrl += '?dl'
        }

        const url = base + 'emulator_page.html?game=' + encodeURIComponent(absoluteGameUrl) + '&core=' + encodeURIComponent(system) + '&version=' + encodeURIComponent(version)
        console.log('[EmulatorJS] URL created:', url)
        console.log('[EmulatorJS] - original gameUrl:', gameUrl)
        console.log('[EmulatorJS] - absolute gameUrl:', absoluteGameUrl)
        console.log('[EmulatorJS] - system:', system)
        console.log('[EmulatorJS] - base:', base)
        return url
    }

    // Function to open game in emulator in new tab
    function openGameInEmulator(entry, gameUrl) {
        const systemInfo = getSystemFromFile(entry.name)

        if (!systemInfo) {
            HFS.toast(`File format not supported: ${entry.ext}`, 'error')
            return false
        }

        // Always opens in new tab
        console.log('[EmulatorJS] Opening emulator in new tab')
        const emulatorUrl = createEmulatorPageUrl(gameUrl, systemInfo.system)
        console.log('[EmulatorJS] URL:', emulatorUrl)
        window.open(emulatorUrl, '_blank')
        HFS.toast(`Opening ${systemInfo.name}...`, 'success')

        return true
    }

    // Hook to add 'Play' button in file menu
    if (config.showFileMenu !== false) {
        HFS.onEvent('fileMenu', ({ entry, menu }) => {
            // Use config loaded at the top
            if (config.enabled === false) return

            try {
                const filename = (entry && (entry.name || ''))
                // Prefer entry.ext when available
                const ext = (entry && entry.ext) ? entry.ext.toLowerCase() : (filename.includes('.') ? filename.split('.').pop().toLowerCase() : '')
                const systemInfo = getSystemFromFile(ext || filename)

                // Debug: logs when fileMenu is called
                console.log('[EmulatorJS] fileMenu called for', filename, 'ext=', ext, 'detected=', !!systemInfo)

                if (!systemInfo || entry.isFolder) return

                // Check if 'play' item already exists to avoid duplication
                if (menu.some(i => i && i.id === 'play')) return

                // Add 'Play' option at the top of menu for supported ROMs
                const item = {
                    id: 'play',
                    label: 'Play',
                    subLabel: systemInfo.name,
                    icon: 'play',
                    onClick: () => {
                        console.log('[EmulatorJS] Play button clicked!')
                        console.log('[EmulatorJS] - entry.uri:', entry.uri)
                        console.log('[EmulatorJS] - entry:', entry)
                        openGameInEmulator(entry, entry.uri)
                        return true
                    }
                }

                // Insert at the top to be visible
                menu.unshift(item)
            } catch (err) {
                console.error('[EmulatorJS] error in fileMenu handler', err)
            }
        })
    }

    console.log('[EmulatorJS] Plugin loaded successfully')
}
