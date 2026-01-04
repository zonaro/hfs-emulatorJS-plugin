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

    // Function to search covers from IGDB
    async function openCoverSearchModal(entry) {
        console.log('[EmulatorJS Cover Modal] Starting openCoverSearchModal for entry:', entry.name)

        const { dialogLib } = HFS
        console.log('[EmulatorJS Cover Modal] dialogLib:', !!dialogLib)

        // Function to clean filename
        function cleanFilename(filename) {
            // Remove extension
            let cleaned = filename.substring(0, filename.lastIndexOf('.')) || filename
            // Remove content in parentheses
            cleaned = cleaned.replace(/\s*\([^)]*\)\s*/g, ' ')
            // Remove content in square brackets
            cleaned = cleaned.replace(/\s*\[[^\]]*\]\s*/g, ' ')
            // Clean up multiple spaces and trim
            cleaned = cleaned.replace(/\s+/g, ' ').trim()
            return cleaned
        }

        const cleanedName = cleanFilename(entry.name)
        console.log('[EmulatorJS Cover Modal] Cleaned filename:', cleanedName)

        let searchTimeout
        let selectedCover = null
        let dialog = null  // Will be set after dialog is created

        // Create real DOM elements (not React virtual elements)
        const resultsList = document.createElement('div')
        resultsList.id = 'covers-results'
        resultsList.style.maxHeight = '400px'
        resultsList.style.overflowY = 'auto'
        resultsList.style.marginTop = '10px'
        resultsList.style.border = '1px solid #ccc'
        resultsList.style.padding = '10px'
        resultsList.style.borderRadius = '4px'
        resultsList.style.backgroundColor = '#f9f9f9'
        console.log('[EmulatorJS Cover Modal] resultsList created:', !!resultsList)

        async function performSearch(gameName) {
            console.log('[EmulatorJS Cover Modal] performSearch called with:', gameName)
            try {
                resultsList.innerHTML = '<p style="text-align:center; color: #999;">Searching...</p>'

                const response = await HFS.customRestCall('searchCovers', { romName: gameName })
                console.log('[EmulatorJS Cover Modal] Search response:', response)

                if (!response.success) {
                    resultsList.innerHTML = `<p style="color:red">Error: ${response.error}</p>`
                    return
                }

                if (response.results.length === 0) {
                    resultsList.innerHTML = '<p style="color: #999;">No results found</p>'
                    return
                }

                console.log('[EmulatorJS Cover Modal] Found results:', response.results.length)
                resultsList.innerHTML = ''
                response.results.forEach(game => {
                    // Create item as real DOM element
                    const item = document.createElement('div')
                    item.style.padding = '10px'
                    item.style.border = '1px solid #ddd'
                    item.style.marginBottom = '5px'
                    item.style.cursor = 'pointer'
                    item.style.borderRadius = '4px'
                    item.style.backgroundColor = '#fff'
                    item.style.transition = 'all 0.2s'

                    item.addEventListener('mouseenter', () => {
                        item.style.backgroundColor = '#f0f0f0'
                        item.style.borderColor = '#999'
                    })

                    item.addEventListener('mouseleave', () => {
                        item.style.backgroundColor = '#fff'
                        item.style.borderColor = '#ddd'
                    })

                    item.addEventListener('click', async () => {
                        console.log('[EmulatorJS Cover Modal] Selected game:', game.name)
                        selectedCover = game
                        // Highlight selected
                        Array.from(resultsList.children).forEach(child => {
                            child.style.backgroundColor = '#fff'
                            child.style.borderColor = '#ddd'
                        })
                        item.style.backgroundColor = '#e3f2fd'
                        item.style.borderColor = '#1976d2'

                        // Auto-download the cover
                        console.log('[EmulatorJS Cover Modal] Auto-downloading cover for:', game.name)
                        try {
                            item.style.opacity = '0.6'
                            item.style.pointerEvents = 'none'

                            const result = await HFS.customRestCall('setCover', {
                                romName: entry.name,
                                gameId: selectedCover.id,
                                coverUrl: selectedCover.coverUrl,
                                romPath: entry.uri
                            })

                            console.log('[EmulatorJS Cover Modal] setCover result:', result)
                            if (result.success) {
                                HFS.toast('Cover downloaded successfully!', 'success')
                                // Close the dialog and reload
                                console.log('[EmulatorJS Cover Modal] Closing dialog')
                                dialog.close()
                                // Force page refresh to update icons
                                setTimeout(() => location.reload(), 300)
                            } else {
                                HFS.toast('Error: ' + result.error, 'error')
                                item.style.opacity = '1'
                                item.style.pointerEvents = 'auto'
                            }
                        } catch (err) {
                            console.error('[EmulatorJS] Cover download error:', err)
                            HFS.toast('Error downloading cover', 'error')
                            item.style.opacity = '1'
                            item.style.pointerEvents = 'auto'
                        }
                    })

                    // Create game name element
                    const nameDiv = document.createElement('div')
                    nameDiv.style.fontWeight = 'bold'
                    nameDiv.style.marginBottom = '5px'
                    nameDiv.style.fontSize = '14px'
                    nameDiv.textContent = game.name
                    item.appendChild(nameDiv)

                    // Create image element
                    const img = document.createElement('img')
                    img.src = game.coverUrl
                    img.style.maxWidth = '80px'
                    img.style.maxHeight = '120px'
                    img.style.borderRadius = '2px'
                    img.style.display = 'block'
                    img.style.marginTop = '5px'
                    img.addEventListener('error', () => {
                        img.style.display = 'none'
                    })
                    item.appendChild(img)

                    resultsList.appendChild(item)
                })
            } catch (err) {
                console.error('[EmulatorJS] Search error:', err)
                resultsList.innerHTML = '<p style="color:red">Search failed</p>'
            }
        }

        const inputElement = document.createElement('input')
        inputElement.type = 'text'
        inputElement.placeholder = 'Search game name...'
        inputElement.value = cleanedName
        inputElement.style.width = '100%'
        inputElement.style.padding = '10px'
        inputElement.style.marginBottom = '15px'
        inputElement.style.boxSizing = 'border-box'
        inputElement.style.borderRadius = '4px'
        inputElement.style.border = '1px solid #ccc'
        inputElement.style.fontSize = '14px'
        inputElement.addEventListener('input', (e) => {
            clearTimeout(searchTimeout)
            const query = e.target.value
            console.log('[EmulatorJS Cover Modal] Input changed:', query)
            if (query.length > 2) {
                searchTimeout = setTimeout(() => performSearch(query), 500)
            } else {
                resultsList.innerHTML = ''
            }
        })
        console.log('[EmulatorJS Cover Modal] inputElement created:', !!inputElement)

        // Auto-search with cleaned name if it's long enough
        if (cleanedName.length > 2) {
            console.log('[EmulatorJS Cover Modal] Auto-searching with cleaned name:', cleanedName)
            setTimeout(() => performSearch(cleanedName), 300)
        }

        console.log('[EmulatorJS Cover Modal] Creating dialog...')
        dialog = dialogLib.newDialog({
            title: 'Search Game Cover',
            className: 'emulatorjs-cover-modal',
            buttons: [
                {
                    text: 'Download & Set Cover',
                    onclick: async () => {
                        console.log('[EmulatorJS Cover Modal] Download button clicked, selectedCover:', !!selectedCover)
                        if (!selectedCover) {
                            HFS.toast('Please select a cover', 'warning')
                            return
                        }

                        try {
                            const result = await HFS.customRestCall('setCover', {
                                romName: entry.name,
                                gameId: selectedCover.id,
                                coverUrl: selectedCover.coverUrl,
                                romPath: entry.uri
                            })

                            console.log('[EmulatorJS Cover Modal] setCover result:', result)
                            if (result.success) {
                                HFS.toast('Cover downloaded successfully!', 'success')
                                dialog.close()
                            } else {
                                HFS.toast('Error: ' + result.error, 'error')
                            }
                        } catch (err) {
                            console.error('[EmulatorJS] Cover download error:', err)
                            HFS.toast('Error downloading cover', 'error')
                        }
                    }
                },
                {
                    text: 'Cancel',
                    onclick: () => {
                        console.log('[EmulatorJS Cover Modal] Cancel clicked')
                        dialog.close()
                    }
                }
            ]
        })
        console.log('[EmulatorJS Cover Modal] Dialog created:', !!dialog)

        // Find the dialog element and add content
        setTimeout(() => {
            console.log('[EmulatorJS Cover Modal] setTimeout callback - looking for dialog element')
            const dialogElement = document.querySelector('[role="dialog"]')
            console.log('[EmulatorJS Cover Modal] dialogElement found:', !!dialogElement)

            if (dialogElement) {
                const contentArea = dialogElement.querySelector('main') || dialogElement.querySelector('[role="presentation"]') || dialogElement.querySelector('.dialog-content')
                console.log('[EmulatorJS Cover Modal] contentArea found:', !!contentArea)
                console.log('[EmulatorJS Cover Modal] contentArea children count:', contentArea?.children.length)

                if (contentArea) {
                    console.log('[EmulatorJS Cover Modal] Adding content to contentArea')
                    // Create a real DOM container (not React virtual)
                    const container = document.createElement('div')
                    container.style.padding = '15px'
                    container.style.overflowY = 'auto'

                    // Add title paragraph
                    const titleP = document.createElement('p')
                    titleP.style.marginBottom = '10px'
                    titleP.style.color = '#666'
                    titleP.style.fontSize = '14px'
                    titleP.textContent = 'Type at least 3 characters to search:'
                    container.appendChild(titleP)

                    // Add input element
                    container.appendChild(inputElement)

                    // Add results list
                    container.appendChild(resultsList)

                    console.log('[EmulatorJS Cover Modal] container created:', !!container)
                    // Insert container at the beginning of contentArea (before any existing children like buttons)
                    contentArea.insertBefore(container, contentArea.firstChild)
                    inputElement.focus()
                    console.log('[EmulatorJS Cover Modal] container inserted at beginning and input focused')
                } else {
                    console.warn('[EmulatorJS Cover Modal] contentArea not found')
                }
            } else {
                console.warn('[EmulatorJS Cover Modal] dialogElement not found after 100ms')
            }
        }, 100)
    }

    // Hook to add 'Play' and 'Set Cover' buttons in file menu
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
                const playItem = {
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

                // Add 'Set Cover' option
                const coverItem = {
                    id: 'set-cover',
                    label: 'Set Cover',
                    subLabel: 'Search IGDB',
                    icon: 'image',
                    onClick: async () => {
                        console.log('[EmulatorJS] Set cover button clicked!')
                        await openCoverSearchModal(entry)
                        return true
                    }
                }

                // Insert at the top to be visible
                menu.unshift(coverItem)
                menu.unshift(playItem)
            } catch (err) {
                console.error('[EmulatorJS] error in fileMenu handler', err)
            }
        })
    }

    console.log('[EmulatorJS] Plugin loaded successfully')

    // Cache para capas já carregadas
    const coverCache = {}

    // Hook para exibir a capa como ícone da entrada
    HFS.onEvent('entryIcon', ({ entry }) => {
        try {
            const filename = (entry && (entry.name || ''))
            const ext = (entry && entry.ext) ? entry.ext.toLowerCase() : (filename.includes('.') ? filename.split('.').pop().toLowerCase() : '')
            const systemInfo = getSystemFromFile(ext || filename)

            // Mostrar capa apenas para arquivos ROM suportados
            if (!systemInfo || entry.isFolder) return undefined

            // Nome completo do ROM com extensão
            const romName = entry.name

            // Caminho completo do arquivo ROM
            const romPath = entry.url || entry.path || entry.name

            // Ícone SVG do controle de jogo (inline)
            const gameControllerIcon = HFS.h('svg', {
                viewBox: '0 0 512 512',
                xmlns: 'http://www.w3.org/2000/svg',
                style: {
                    width: '60px',
                    height: '60px',
                    borderRadius: '2px',
                    color: 'var(--emulatorjs-icon-color, currentColor)',
                    flexShrink: 0
                }
            },
                HFS.h('path', {
                    d: 'M467.51,248.83c-18.4-83.18-45.69-136.24-89.43-149.17A91.5,91.5,0,0,0,352,96c-26.89,0-48.11,16-96,16s-69.15-16-96-16a99.09,99.09,0,0,0-27.2,3.66C89,112.59,61.94,165.7,43.33,248.83c-19,84.91-15.56,152,21.58,164.88,26,9,49.25-9.61,71.27-37,25-31.2,55.79-40.8,119.82-40.8s93.62,9.6,118.66,40.8c22,27.41,46.11,45.79,71.42,37.16C487.1,399.86,486.52,334.74,467.51,248.83Z',
                    style: { fill: 'none', stroke: 'currentColor', strokeMiterlimit: '10', strokeWidth: '32px' }
                }),
                HFS.h('circle', { cx: '292', cy: '224', r: '20', fill: 'currentColor' }),
                HFS.h('path', {
                    d: 'M336,288a20,20,0,1,1,20-19.95A20,20,0,0,1,336,288Z',
                    fill: 'currentColor'
                }),
                HFS.h('circle', { cx: '336', cy: '180', r: '20', fill: 'currentColor' }),
                HFS.h('circle', { cx: '380', cy: '224', r: '20', fill: 'currentColor' }),
                HFS.h('line', {
                    x1: '160', y1: '176', x2: '160', y2: '272',
                    style: { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '32px' }
                }),
                HFS.h('line', {
                    x1: '208', y1: '224', x2: '112', y2: '224',
                    style: { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '32px' }
                })
            )

            // Componente React que carrega a capa de forma assíncrona
            const CoverIcon = () => {
                const cacheKey = romName

                // Hook para carregar a capa
                const [cover, setCover] = HFS.React.useState(coverCache[cacheKey] || null)
                const [loading, setLoading] = HFS.React.useState(!coverCache[cacheKey])

                HFS.React.useEffect(() => {
                    if (coverCache[cacheKey]) {
                        setCover(coverCache[cacheKey])
                        setLoading(false)
                        return
                    }

                    setLoading(true)
                    HFS.customRestCall('getCover', { rom: romName, romPath })
                        .then(result => {
                            console.log(`[EmulatorJS] Cover carregada para ${romName}:`, { success: result.success, hasData: !!result.data })
                            if (result.success && result.data) {
                                const coverData = {
                                    src: `data:${result.mimeType || 'image/jpeg'};base64,${result.data}`,
                                    mimeType: result.mimeType
                                }
                                coverCache[cacheKey] = coverData
                                setCover(coverData)
                            }
                            setLoading(false)
                        })
                        .catch(err => {
                            console.error(`[EmulatorJS] Erro ao carregar capa para ${romName}:`, err)
                            setLoading(false)
                        })
                }, [])

                // Estilos do container
                const containerStyle = {
                    width: '80px',
                    minHeight: '100px',
                    borderRadius: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'transparent',
                    overflow: 'hidden',
                    margin: '0 auto'
                }

                // Se a capa carregou com sucesso, mostrar
                if (cover) {
                    return HFS.h('div', {
                        className: 'emulatorjs-icon-container',
                        style: containerStyle
                    },
                        HFS.h('img', {
                            src: cover.src,
                            style: {
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: '2px'
                            },
                            alt: romName
                        })
                    )
                }

                // Caso contrário, mostrar o ícone do controle
                return HFS.h('div', {
                    className: 'emulatorjs-icon-container',
                    style: containerStyle
                }, gameControllerIcon)
            }

            return HFS.h(CoverIcon)
        } catch (err) {
            console.error('[EmulatorJS] erro no handler entryIcon', err)
            return undefined
        }
    })
}
