'use strict';
{
    // EmulatorJS Plugin for HFS
    console.log('[EmulatorJS] frontend script loaded')

    const pluginPublic = HFS.getPluginPublic();
    const config = HFS.getPluginConfig()

    console.log('[EmulatorJS] HFS.getPluginConfig() returned:', config);

    const emuVersion = config.emulatorsJsVersion || 'stable'
    const iconTheme = config.iconTheme || 'monochrome';

    console.log('[EmulatorJS] HFS.getPluginPublic() returned:', pluginPublic);
    console.log('[EmulatorJS] Using EmulatorJS version:', emuVersion);



    // Function to search covers from IGDB
    async function openCoverSearchModal(entry) {
        console.log('[EmulatorJS Cover Modal] Starting openCoverSearchModal for entry:', entry.name)

        const { dialogLib } = HFS
        console.log('[EmulatorJS Cover Modal] dialogLib:', !!dialogLib)



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
                    resultsList.innerHTML = ''
                    const noRes = document.createElement('p')
                    noRes.style.color = '#999'
                    noRes.style.margin = '0'
                    noRes.textContent = 'No results found '
                    const a = document.createElement('a')
                    a.textContent = 'Google Search'
                    a.href = 'https://www.google.com/search?tbm=isch&q=' + encodeURIComponent(gameName)
                    a.target = '_blank'
                    a.style.marginLeft = '8px'
                    a.style.color = '#1976d2'
                    noRes.appendChild(a)
                    resultsList.appendChild(noRes)
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
                                console.log('[EmulatorJS Cover Modal] Closing dialog')
                                dialog.close()

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
                    titleP.textContent = 'Type at least 3 characters to search or paste image URL:'
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




    function playGameInEmulator(gameUrl, core) {
        console.log('[EmulatorJS] playGameInEmulator called with:', gameUrl, core)

        // Ensure gameUrl is absolute (with protocol and domain)
        if (!gameUrl.startsWith('http://') && !gameUrl.startsWith('https://')) {
            // Create absolute URL using current origin
            gameUrl = window.location.origin + gameUrl
        }

        // Add ?dl at the end to force direct download in HFS
        if (!gameUrl.includes('?dl')) {
            gameUrl += '?dl'
        }

        const { dialogLib } = HFS


        // Create game container
        const gameContainer = document.createElement('div')
        gameContainer.id = 'emulator-game-container'
        gameContainer.style.width = '100%'
        gameContainer.style.height = '600px'
        gameContainer.style.minHeight = '600px'
        gameContainer.style.backgroundColor = '#000'
        gameContainer.style.position = 'relative'
        gameContainer.style.display = 'flex'
        gameContainer.style.alignItems = 'center'
        gameContainer.style.justifyContent = 'center'

        // Variable to store the loaded script for cleanup
        let emulatorScript = null




        // Create dialog with HFS dialogLib
        const dialog = dialogLib.newDialog({

            title: `EmulatorJS - ${emuVersion} - ${core} - ${decodeURIComponent(gameUrl.split('/').pop().split('?')[0])}`,
            className: 'emulatorjs-game-modal',
            closable: true,
            onClose: () => {
                console.log('[EmulatorJS] Dialog closing, destroying emulator...')
                window.location.reload(); // Simple way to stop and unload the emulator
            },
            buttons: [
                {
                    text: 'Close',
                    onclick: () => {
                        console.log('[EmulatorJS] Closing emulator dialog')
                        dialog.close()
                    }
                }
            ]
        })

        console.log('[EmulatorJS] Dialog created:', !!dialog)

        // Add content to dialog after it's rendered
        setTimeout(() => {
            const dialogElement = document.querySelector('[role="dialog"]')
            console.log('[EmulatorJS] dialogElement found:', !!dialogElement)

            if (dialogElement) {
                // Apply modal size
                dialogElement.style.width = '75vw'
                dialogElement.style.height = '75vh'
                dialogElement.style.maxWidth = '75vw'
                dialogElement.style.maxHeight = '75vh'

                const contentArea = dialogElement.querySelector('main') || dialogElement.querySelector('[role="presentation"]') || dialogElement.querySelector('.dialog-content')
                console.log('[EmulatorJS] contentArea found:', !!contentArea)

                if (contentArea) {
                    // Style content area
                    contentArea.style.display = 'flex'
                    contentArea.style.flexDirection = 'column'
                    contentArea.style.height = '100%'
                    contentArea.style.padding = '0'
                    contentArea.style.overflow = 'hidden'

                    // Insert game container
                    contentArea.insertBefore(gameContainer, contentArea.firstChild)

                    // Now load the emulator
                    console.log('[EmulatorJS] Loading emulator in dialog...')



                    // Setup EmulatorJS callbacks
                    setupEmulatorCallbacks(gameUrl, core)

                    // Load EmulatorJS loader dynamically
                    emulatorScript = document.createElement('script')
                    emulatorScript.src = window.EJS_pathtodata + 'loader.js'
                    // emulatorScript.crossOrigin = 'anonymous'
                    emulatorScript.onload = () => console.log('[EmulatorJS] loader.js loaded in dialog')
                    emulatorScript.onerror = (e) => console.error('[EmulatorJS] Failed to load loader.js', e)
                    document.head.appendChild(emulatorScript)
                } else {
                    console.warn('[EmulatorJS] contentArea not found')
                }
            } else {
                console.warn('[EmulatorJS] dialogElement not found')
            }
        }, 100)
    }

    // Setup EmulatorJS callbacks for modal
    function setupEmulatorCallbacks(gameUrl, core) {
        // Helper function to convert buffer to base64
        function b64(buf) {
            if (buf instanceof Uint8Array) buf = buf.buffer;
            const bytes = new Uint8Array(buf);
            const chunkSize = 0x8000;
            let binary = '';
            for (let i = 0; i < bytes.length; i += chunkSize) {
                const sub = bytes.subarray(i, i + chunkSize);
                binary += String.fromCharCode.apply(null, sub);
            }
            return btoa(binary);
        }

        // Setup global variables for EmulatorJS
        window.EJS_player = '#emulator-game-container'
        window.EJS_gameUrl = gameUrl
        window.EJS_core = core
        //decode game name from URI
        window.EJS_gameName = decodeURIComponent(`${gameUrl.split('/').pop().split('?')[0]}`)
        window.EJS_startOnLoaded = true;

        //fullscreen mode
        window.EJS_fullscreenOnLoaded = true;
        window.EJS_alignStartButton = 'center';

        window.EJS_pathtodata = `https://cdn.emulatorjs.org/${emuVersion}/data/`
        window.EJS_threads = true;

        console.log('[EmulatorJS] Global variables set:')

        Object.entries(window).forEach(([key, value]) => {
            if (key.startsWith('EJS_')) {
                console.log(`[EmulatorJS] - ${key}:`, value);
            }
        });
        console.log('[EmulatorJS] Global variables logged. Ready to load emulator.');

    }

    // Function to display game information modal
    async function openGameInfoModal(entry) {
        console.log('[EmulatorJS Game Info] Starting openGameInfoModal for entry:', entry.name)

        const { dialogLib } = HFS


        const cleanedName = cleanFilename(entry.name)
        console.log('[EmulatorJS Game Info] Cleaned filename:', cleanedName)

        let selectedGame = null
        let dialog = null

        const gamesList = document.createElement('div')
        gamesList.id = 'game-info-list'
        gamesList.style.maxHeight = '500px'
        gamesList.style.overflowY = 'auto'
        gamesList.style.marginTop = '10px'
        gamesList.style.border = '1px solid #ccc'
        gamesList.style.padding = '10px'
        gamesList.style.borderRadius = '4px'
        gamesList.style.backgroundColor = '#f9f9f9'

        async function performSearch(gameName) {
            console.log('[EmulatorJS Game Info] performSearch called with:', gameName)
            try {
                gamesList.innerHTML = '<p style="text-align:center; color: #999;">Searching...</p>'

                const response = await HFS.customRestCall('searchGameInfo', { gameName: gameName })
                console.log('[EmulatorJS Game Info] Search response:', response)

                if (!response.success) {
                    gamesList.innerHTML = `<p style="color:red">Error: ${response.error}</p>`
                    return
                }

                if (response.results.length === 0) {
                    gamesList.innerHTML = ''
                    const noRes = document.createElement('p')
                    noRes.style.color = '#999'
                    noRes.style.margin = '0'
                    noRes.textContent = 'No results found '
                    const a = document.createElement('a')
                    a.textContent = 'Google Search'
                    a.href = 'https://www.google.com/search?tbm=isch&q=' + encodeURIComponent(gameName)
                    a.target = '_blank'
                    a.style.marginLeft = '8px'
                    a.style.color = '#1976d2'
                    noRes.appendChild(a)
                    gamesList.appendChild(noRes)
                    return
                }

                console.log('[EmulatorJS Game Info] Found results:', response.results.length)
                gamesList.innerHTML = ''
                let games = response.results;

                // order games by platform containsing the system of the rom, then alphabetically
                const romSystems = getAllSystemsFromFile(entry.name).map(s => s.system.toLowerCase())
                games.sort((a, b) => {
                    const aPlatforms = Array.isArray(a.platforms) ? a.platforms : (typeof a.platforms === 'string' ? a.platforms.split(',').map(s => s.trim()) : [])
                    const bPlatforms = Array.isArray(b.platforms) ? b.platforms : (typeof b.platforms === 'string' ? b.platforms.split(',').map(s => s.trim()) : [])
                    const aPlatformMatch = aPlatforms.some(p => romSystems.includes(String(p).toLowerCase()))
                    const bPlatformMatch = bPlatforms.some(p => romSystems.includes(String(p).toLowerCase()))
                    if (aPlatformMatch && !bPlatformMatch) return -1
                    if (!aPlatformMatch && bPlatformMatch) return 1
                    return a.name.localeCompare(b.name)
                });

                games.forEach(game => {
                    const item = document.createElement('div')
                    item.style.padding = '12px'
                    item.style.border = '1px solid #ddd'
                    item.style.marginBottom = '8px'
                    item.style.cursor = 'pointer'
                    item.style.borderRadius = '4px'
                    item.style.backgroundColor = '#fff'
                    item.style.transition = 'all 0.2s'

                    item.addEventListener('mouseenter', () => {
                        item.style.backgroundColor = '#f0f0f0'
                        item.style.borderColor = '#999'
                    })

                    item.addEventListener('mouseleave', () => {
                        if (selectedGame?.id !== game.id) {
                            item.style.backgroundColor = '#fff'
                            item.style.borderColor = '#ddd'
                        }
                    })

                    item.addEventListener('click', () => {
                        console.log('[EmulatorJS Game Info] Selected game:', game.name)
                        selectedGame = game
                        Array.from(gamesList.children).forEach(child => {
                            child.style.backgroundColor = '#fff'
                            child.style.borderColor = '#ddd'
                        })
                        item.style.backgroundColor = '#e3f2fd'
                        item.style.borderColor = '#1976d2'

                        // Auto-save the game info
                        console.log('[EmulatorJS Game Info] Auto-saving game info for:', entry.name)
                        HFS.customRestCall('saveGameInfo', {
                            romName: entry.name,
                            gameInfo: game
                        }).then(async result => {
                            console.log('[EmulatorJS Game Info] Save result:', result)
                            if (result.success) {
                                HFS.toast('Game info saved!', 'success')

                                // Download cover if it doesn't exist
                                if (game.coverUrl) {
                                    console.log('[EmulatorJS Game Info] Downloading cover for:', game.name)
                                    try {
                                        const setCoverResult = await HFS.customRestCall('setCover', {
                                            romName: entry.name,
                                            gameId: game.id,
                                            coverUrl: game.coverUrl,
                                            romPath: entry.uri,
                                            overwrite: false
                                        })

                                        if (setCoverResult.success) {
                                            console.log('[EmulatorJS Game Info] Cover downloaded successfully')
                                            HFS.toast('Cover downloaded successfully!', 'success')
                                        } else {
                                            console.log('[EmulatorJS Game Info] Cover already exists or failed to download:', setCoverResult.error)
                                        }
                                    } catch (err) {
                                        console.error('[EmulatorJS Game Info] Error downloading cover:', err)
                                    }
                                }

                                setTimeout(() => {
                                    dialog.close()
                                }, 1000)
                            } else {
                                HFS.toast('Error saving game info', 'error')
                            }
                        }).catch(err => {
                            console.error('[EmulatorJS] Save error:', err)
                            HFS.toast('Error saving game info', 'error')
                        })
                    })

                    // Game name
                    const nameDiv = document.createElement('div')
                    nameDiv.style.fontWeight = 'bold'
                    nameDiv.style.marginBottom = '8px'
                    nameDiv.style.fontSize = '16px'
                    nameDiv.style.color = '#222'
                    nameDiv.textContent = game.name
                    item.appendChild(nameDiv)

                    // Rating
                    if (game.rating || game.aggregatedRating) {
                        const ratingDiv = document.createElement('div')
                        ratingDiv.style.fontSize = '12px'
                        ratingDiv.style.marginBottom = '4px'
                        ratingDiv.style.color = '#666'
                        const userRating = game.rating ? game.rating.toFixed(1) : 'N/A'
                        const criticRating = game.aggregatedRating ? game.aggregatedRating.toFixed(1) : 'N/A'
                        ratingDiv.innerHTML = `<strong>Ratings:</strong> User: ${userRating}/100 | Critics: ${criticRating}/100`
                        item.appendChild(ratingDiv)
                    }

                    // Summary
                    if (game.summary) {
                        const summaryDiv = document.createElement('div')
                        summaryDiv.style.fontSize = '12px'
                        summaryDiv.style.marginBottom = '6px'
                        summaryDiv.style.color = '#555'
                        summaryDiv.style.lineHeight = '1.4'
                        summaryDiv.style.maxHeight = '60px'
                        summaryDiv.style.overflow = 'hidden'
                        summaryDiv.textContent = game.summary
                        item.appendChild(summaryDiv)
                    }

                    // Create info grid
                    const infoGrid = document.createElement('div')
                    infoGrid.style.fontSize = '11px'
                    infoGrid.style.color = '#666'
                    infoGrid.style.marginTop = '8px'
                    infoGrid.style.display = 'grid'
                    infoGrid.style.gridTemplateColumns = '1fr 1fr'
                    infoGrid.style.gap = '4px'

                    const infoItems = [
                        ['Genres', game.genres],
                        ['Platforms', game.platforms],
                        ['Game Modes', game.gameModes],
                        ['Themes', game.themes],
                        ['Developers', game.developers],
                        ['Publishers', game.publishers],
                        ['Engines', game.gameEngines],
                        ['Languages', game.languages],
                        ['Perspectives', game.playerPerspectives]
                    ]

                    infoItems.forEach(([label, value]) => {
                        if (value && value !== 'N/A') {
                            const infoItem = document.createElement('div')
                            infoItem.style.padding = '4px 0'
                            infoItem.innerHTML = `<strong>${label}:</strong> ${value}`
                            infoItem.style.wordBreak = 'break-word'
                            infoGrid.appendChild(infoItem)
                        }
                    })

                    if (infoGrid.children.length > 0) {
                        item.appendChild(infoGrid)
                    }

                    // Cover image
                    if (game.coverUrl) {
                        const imgDiv = document.createElement('div')
                        imgDiv.style.marginTop = '8px'
                        imgDiv.style.textAlign = 'center'
                        const img = document.createElement('img')
                        img.src = game.coverUrl
                        img.style.maxWidth = '100%'
                        img.style.maxHeight = '150px'
                        img.style.borderRadius = '2px'
                        img.addEventListener('error', () => {
                            img.style.display = 'none'
                        })
                        imgDiv.appendChild(img)
                        item.appendChild(imgDiv)
                    }

                    gamesList.appendChild(item)
                })
            } catch (err) {
                console.error('[EmulatorJS] Search error:', err)
                gamesList.innerHTML = '<p style="color:red">Search failed</p>'
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

        let searchTimeout
        inputElement.addEventListener('input', (e) => {
            clearTimeout(searchTimeout)
            const query = e.target.value
            console.log('[EmulatorJS Game Info] Input changed:', query)
            if (query.length > 2) {
                searchTimeout = setTimeout(() => performSearch(query), 500)
            } else {
                gamesList.innerHTML = ''
            }
        })

        // Auto-search with cleaned name
        if (cleanedName.length > 2) {
            console.log('[EmulatorJS Game Info] Auto-searching with cleaned name:', cleanedName)
            setTimeout(() => performSearch(cleanedName), 300)
        }

        console.log('[EmulatorJS Game Info] Creating dialog...')
        dialog = dialogLib.newDialog({
            title: 'Game Information',
            className: 'emulatorjs-game-info-modal',
            buttons: [
                {
                    text: 'Close',
                    onclick: () => {
                        console.log('[EmulatorJS Game Info] Close clicked')
                        dialog.close()
                    }
                }
            ]
        })

        console.log('[EmulatorJS Game Info] Dialog created:', !!dialog)

        // Find the dialog element and add content
        setTimeout(() => {
            console.log('[EmulatorJS Game Info] setTimeout callback - looking for dialog element')
            const dialogElement = document.querySelector('[role="dialog"]')
            console.log('[EmulatorJS Game Info] dialogElement found:', !!dialogElement)

            if (dialogElement) {
                const contentArea = dialogElement.querySelector('main') || dialogElement.querySelector('[role="presentation"]') || dialogElement.querySelector('.dialog-content')
                console.log('[EmulatorJS Game Info] contentArea found:', !!contentArea)

                if (contentArea) {
                    console.log('[EmulatorJS Game Info] Adding content to contentArea')
                    const container = document.createElement('div')
                    container.style.padding = '15px'
                    container.style.overflowY = 'auto'
                    container.style.maxHeight = '600px'

                    const titleP = document.createElement('p')
                    titleP.style.marginBottom = '10px'
                    titleP.style.color = '#666'
                    titleP.style.fontSize = '14px'
                    titleP.textContent = 'Search and view detailed game information from IGDB:'
                    container.appendChild(titleP)

                    container.appendChild(inputElement)
                    container.appendChild(gamesList)

                    console.log('[EmulatorJS Game Info] container created:', !!container)
                    contentArea.insertBefore(container, contentArea.firstChild)
                    inputElement.focus()
                    console.log('[EmulatorJS Game Info] container inserted and input focused')
                } else {
                    console.warn('[EmulatorJS Game Info] contentArea not found')
                }
            } else {
                console.warn('[EmulatorJS Game Info] dialogElement not found')
            }
        }, 100)
    }



    HFS.onEvent('fileMenu', ({ entry, menu, props }) => {


        const filename = entry.name
        // Prefer entry.ext when available
        const ext = (entry && entry.ext) ? entry.ext.toLowerCase() : (filename.includes('.') ? filename.split('.').pop().toLowerCase() : '')
        const allSystems = getAllSystemsFromFile(ext || filename)



        // Debug: logs when fileMenu is called
        console.log('[EmulatorJS] fileMenu called for', filename, 'ext=', ext, 'detected systems=', allSystems.length)



        if (!allSystems || allSystems.length === 0 || entry.isFolder) return


        console.log('[EmulatorJS] Detected systems for', filename, ':', allSystems)

        try {

            // Try to get cached game info
            HFS.customRestCall('getGameInfo', { romName: filename })
                .then(result => {
                    if (result.success && result.gameInfo) {
                        const game = result.gameInfo

                        // Add properties in a specific order
                        const propsToAdd = []

                        if (game.name) {
                            propsToAdd.push({ id: 'game-name', label: 'Game Title', value: game.name })
                        }

                        if (game.rating) {
                            propsToAdd.push({ id: 'game-rating', label: 'User Rating', value: Math.round(game.rating) + '/100' })
                        }

                        if (game.aggregatedRating) {
                            propsToAdd.push({ id: 'game-critic-rating', label: 'Critic Rating', value: Math.round(game.aggregatedRating) + '/100' })
                        }

                        if (game.genres && game.genres !== 'N/A') {
                            propsToAdd.push({ id: 'game-genres', label: 'Genres', value: game.genres })
                        }

                        if (game.platforms && game.platforms !== 'N/A') {
                            propsToAdd.push({ id: 'game-platforms', label: 'Platforms', value: game.platforms })
                        }

                        if (game.developers && game.developers !== 'N/A') {
                            propsToAdd.push({ id: 'game-developers', label: 'Developers', value: game.developers })
                        }

                        if (game.publishers && game.publishers !== 'N/A') {
                            propsToAdd.push({ id: 'game-publishers', label: 'Publishers', value: game.publishers })
                        }

                        if (game.gameModes && game.gameModes !== 'N/A') {
                            propsToAdd.push({ id: 'game-modes', label: 'Game Modes', value: game.gameModes })
                        }

                        if (game.themes && game.themes !== 'N/A') {
                            propsToAdd.push({ id: 'game-themes', label: 'Themes', value: game.themes })
                        }

                        if (game.playerPerspectives && game.playerPerspectives !== 'N/A') {
                            propsToAdd.push({ id: 'game-perspectives', label: 'Perspectives', value: game.playerPerspectives })
                        }

                        if (game.gameEngines && game.gameEngines !== 'N/A') {
                            propsToAdd.push({ id: 'game-engines', label: 'Game Engines', value: game.gameEngines })
                        }

                        if (game.languages && game.languages !== 'N/A') {
                            propsToAdd.push({ id: 'game-languages', label: 'Languages', value: game.languages })
                        }

                        if (game.releaseDates && game.releaseDates.length > 0) {
                            propsToAdd.push({ id: 'game-release', label: 'Release Dates', value: game.releaseDates.join(', ') })
                        }

                        if (game.ageRatings && game.ageRatings !== 'N/A') {
                            propsToAdd.push({ id: 'game-ratings', label: 'Age Ratings', value: game.ageRatings })
                        }

                        if (game.alternativeNames && game.alternativeNames !== 'N/A') {
                            propsToAdd.push({ id: 'game-alt-names', label: 'Alternative Names', value: game.alternativeNames })
                        }

                        // Add all properties to the props array
                        if (Array.isArray(props)) {
                            propsToAdd.forEach(prop => props.push(prop))
                        } else {
                            console.warn('[EmulatorJS] fileMenu props not available; skipping game properties')
                        }
                    }
                })
                .catch(err => {
                    console.error('[EmulatorJS] Error loading game info for menu:', err)
                })
        } catch (err) {
            console.error('[EmulatorJS] error in fileMenu props handler', err)
        }

        try {

            menu.unshift({ id: 'separator-emulatorjs-1', type: 'separator' })



            const entryPath = entry.uri || entry.url;
            const srcCover = entryPath + '?get=game_cover&t=' + Date.now();


            // Add 'View Cover' option 
            const viewCoverItem = {
                id: 'view-cover',
                label: 'View Cover',
                subLabel: 'Preview cover image',
                icon: srcCover,

                onClick: async () => {
                    console.log('[EmulatorJS] View cover button clicked!')

                    try {

                        const { dialogLib } = HFS

                        // Create modal to show image
                        let dialog = dialogLib.newDialog({
                            title: 'Cover Preview',
                            className: 'emulatorjs-view-cover-modal',
                            buttons: [
                                {
                                    text: 'Close',
                                    onclick: () => { dialog.close() }
                                }
                            ]
                        })

                        // Insert image into dialog once it's rendered
                        setTimeout(() => {
                            const dialogElement = document.querySelector('[role="dialog"]')
                            if (!dialogElement) return
                            const contentArea = dialogElement.querySelector('main') || dialogElement.querySelector('[role="presentation"]') || dialogElement.querySelector('.dialog-content')
                            if (!contentArea) return

                            // Clear and insert image
                            const container = document.createElement('div')
                            container.style.textAlign = 'center'
                            container.style.padding = '10px'

                            const img = document.createElement('img')
                            img.src = srcCover
                            img.style.maxWidth = '100%'
                            img.style.maxHeight = '70vh'
                            img.style.borderRadius = '4px'
                            img.alt = entry.name
                            img.onerror = () => {
                                dialog.close();
                                HFS.toast('Error loading cover image', 'error')
                            }

                            container.appendChild(img)
                            contentArea.insertBefore(container, contentArea.firstChild)
                        }, 100)

                        return true
                    } catch (err) {
                        console.error('[EmulatorJS] Error viewing cover:', err)
                        HFS.toast('Error loading cover', 'error')
                        return false
                    }
                }
            }

            // Add 'Game Info' option (only for admins)
            // Check if user has admin access via adminUrl property
            const isAdmin = Boolean(HFS.state.adminUrl)

            if (isAdmin) {
                const gameInfoItem = {
                    id: 'game-info',
                    label: 'Game Info',
                    subLabel: 'View IGDB details',
                    icon: 'info',
                    onClick: async () => {
                        console.log('[EmulatorJS] Game info button clicked!')
                        await openGameInfoModal(entry)
                        return true
                    }
                }

                // Add 'Set Cover' option (only for admins)
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



                // Add 'Remove Cover' option (only for admins)
                const removeCoverItem = {
                    id: 'remove-cover',
                    label: 'Remove Cover',
                    subLabel: 'Delete cover image',
                    icon: 'delete',
                    onClick: async () => {
                        console.log('[EmulatorJS] Remove cover button clicked!')

                        // Ask for confirmation
                        if (!confirm(`Remove cover for "${entry.name}"?`)) {
                            return false
                        }

                        try {
                            const result = await HFS.customRestCall('removeCover', { romName: entry.name })

                            if (result.success) {
                                HFS.toast('Cover removed successfully!', 'success')
                                // Refresh the page to update the display
                                location.reload()
                            } else {
                                HFS.toast(result.error || 'Failed to remove cover', 'error')
                            }
                        } catch (err) {
                            console.error('[EmulatorJS] Error removing cover:', err)
                            HFS.toast('Error removing cover', 'error')
                        }

                        return true
                    }
                }

                // Insert admin options at the top (order: Game Info, Set Cover, View Cover, Remove Cover)

                menu.unshift(removeCoverItem)
                menu.unshift(coverItem)
                menu.unshift(gameInfoItem)
            }

            // Finally add View Cover option
            menu.unshift(viewCoverItem)

            // Create a Play button for each compatible core for the detected systems
            allSystems.forEach((systemInfo, sysIndex) => {
                // cores can be defined on the systemInfo (array of core ids); fallback to system id
                const cores = (Array.isArray(systemInfo.core) && systemInfo.core.length) ? systemInfo.core : []

                // add a separator for this system group
                menu.unshift({ id: `separator-emulatorjs-play-${sysIndex}`, type: 'separator' })
                cores.forEach(coreId => {

                    const platIcon = detectBestIcon(systemInfo.system, iconTheme);
                    const playItem = {
                        id: `play-${systemInfo.system}-${coreId}`,
                        label: 'Play',
                        subLabel: `${systemInfo.name} · ${coreId}`,
                        icon: platIcon ? `${pluginPublic}${platIcon.path}` : '🕹️',
                        onClick: () => {
                            console.log(`[EmulatorJS] Play button clicked for ${systemInfo.name} (core=${coreId})!`)
                            console.log('[EmulatorJS] - entry.uri:', entry.uri)
                            console.log('[EmulatorJS] - entry:', entry)
                            console.log('[EmulatorJS] - system:', systemInfo.system)
                            console.log('[EmulatorJS] - core:', coreId)

                            // Open the game with the specific core selected
                            playGameInEmulator(entry.uri || entry.url || entry.path || entry.name, coreId)
                            return true
                        }
                    }

                    menu.unshift(playItem)
                })
            })

        } catch (err) {
            console.error('[EmulatorJS] error in fileMenu handler', err)
        }
    })




    console.log('[EmulatorJS] Plugin loaded successfully')

    // Função para detectar quais consoles estão presentes na pasta
    async function detectFolderConsoles(folderUri) {
        try {
            console.log('[EmulatorJS] Detecting consoles in folder:', folderUri)

            const detectedConsoles = new Set()

            possiblePlatforms(folderUri).forEach(systemInfo => {

                detectedConsoles.add(systemInfo.name)
            })

            const response = await fetch(folderUri + '?get=list&folders=0')
            if (response.ok) {

                const text = await response.text()

                const lines = text.split('\n')
                for (const line of lines) {
                    const filename = line.trim()
                    if (!filename) continue

                    getAllSystemsFromFile(filename).forEach(systemInfo => {
                        detectedConsoles.add(systemInfo.name)
                    })
                }
            }



            const consoles = Array.from(detectedConsoles)
            console.log('[EmulatorJS] Detected consoles:', consoles)
            return consoles
        } catch (err) {
            console.error('[EmulatorJS] Error detecting consoles:', err)
            return []
        }
    }

    // Função para abrir modal de seleção de ícone
    async function openIconSelectionModal(folderEntry) {
        try {
            console.log('[EmulatorJS] Opening icon selection modal for folder:', folderEntry.name)

            const { dialogLib } = HFS


            let icons = getAllIcons(iconTheme, false); // ommit content icons


            if (icons.length === 0) {
                HFS.toast('No console icons available', 'error')
                return
            }

            // Detectar consoles na pasta
            const detectedConsoles = await detectFolderConsoles(folderEntry.uri || folderEntry.url) || []
            detectedConsoles.sort()
            let initialSearchValue = ''

            initialSearchValue = detectedConsoles.join("/") + '/' + folderEntry.name


            let dialog = null
            let searchInput = null

            // Criar container para busca e ícones
            const mainContainer = document.createElement('div')
            mainContainer.style.display = 'flex'
            mainContainer.style.flexDirection = 'column'
            mainContainer.style.height = '100%'

            // Criar barra de busca
            const searchContainer = document.createElement('div')
            searchContainer.style.padding = '15px'
            searchContainer.style.borderBottom = '1px solid #ddd'

            searchInput = document.createElement('input')
            searchInput.type = 'text'
            searchInput.placeholder = 'Search console...'
            searchInput.value = initialSearchValue
            searchInput.style.width = '100%'
            searchInput.style.padding = '10px'
            searchInput.style.fontSize = '14px'
            searchInput.style.border = '1px solid #ccc'
            searchInput.style.borderRadius = '4px'
            searchInput.style.boxSizing = 'border-box'

            searchContainer.appendChild(searchInput)

            // Criar container para os ícones
            const iconsContainer = document.createElement('div')
            iconsContainer.style.display = 'grid'
            iconsContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(100px, 1fr))'
            iconsContainer.style.gap = '15px'
            iconsContainer.style.padding = '20px'
            iconsContainer.style.maxHeight = '400px'
            iconsContainer.style.overflowY = 'auto'
            iconsContainer.style.flex = '1'

            // Função para filtrar e exibir ícones
            function updateIconsDisplay(searchTerm) {
                iconsContainer.innerHTML = ''
                const searchLower = searchTerm.toLowerCase()

                icons.forEach(icon => {
                    // Filtrar por termo de busca, levando em conta varios consoles separados por /
                    const searchTerms = searchLower.split("/").map(term => term.trim()).filter(term => term.length > 0)
                    if (!searchTerms.some(term => icon.name.toLowerCase().includes(term) || icon.platform.toLowerCase().includes(term) || icon.system.toLowerCase().includes(term) || icon.manufacturer.toLowerCase().includes(term))) {
                        return
                    }

                    const iconDiv = document.createElement('div')
                    iconDiv.style.display = 'flex'
                    iconDiv.style.flexDirection = 'column'
                    iconDiv.style.alignItems = 'center'
                    iconDiv.style.cursor = 'pointer'
                    iconDiv.style.padding = '10px'
                    iconDiv.style.borderRadius = '8px'
                    iconDiv.style.border = '2px solid transparent'
                    iconDiv.style.transition = 'all 0.2s'

                    const img = document.createElement('img')
                    img.src = `${pluginPublic}${icon.path}`
                    img.alt = icon.name
                    img.style.width = '64px'
                    img.style.height = '64px'
                    img.style.objectFit = 'contain'
                    img.style.marginBottom = '8px'

                    const label = document.createElement('div')
                    label.textContent = icon.platform
                    label.style.fontSize = '11px'
                    label.style.textAlign = 'center'
                    label.style.wordWrap = 'break-word'
                    label.style.maxWidth = '100px'

                    const subLabel = document.createElement('div')
                    subLabel.textContent = icon.manufacturer
                    subLabel.style.fontSize = '9px'
                    subLabel.style.textAlign = 'center'
                    subLabel.style.wordWrap = 'break-word'
                    subLabel.style.maxWidth = '100px'

                    iconDiv.appendChild(img)
                    iconDiv.appendChild(label)
                    iconDiv.appendChild(subLabel)

                    iconDiv.addEventListener('click', async () => {
                        try {
                            console.log('[EmulatorJS] Setting icon:', icon.name)

                            const setResult = await HFS.customRestCall('setFolderIcon', {
                                folderPath: folderEntry.uri || folderEntry.url,
                                iconName: icon.name
                            })

                            if (setResult.success) {
                                HFS.toast('Console icon set successfully!', 'success')
                                dialog.close()
                            } else {
                                HFS.toast('Failed to set icon: ' + (setResult.error || 'Unknown error'), 'error')
                            }
                        } catch (err) {
                            console.error('[EmulatorJS] Error setting folder icon:', err)
                            HFS.toast('Error setting icon', 'error')
                        }
                    })

                    iconDiv.addEventListener('mouseover', () => {
                        iconDiv.style.borderColor = '#2196F3'
                        iconDiv.style.backgroundColor = 'rgba(33, 150, 243, 0.1)'
                    })

                    iconDiv.addEventListener('mouseout', () => {
                        iconDiv.style.borderColor = 'transparent'
                        iconDiv.style.backgroundColor = 'transparent'
                    })

                    iconsContainer.appendChild(iconDiv)
                })

                // Se não houver resultados
                if (iconsContainer.children.length === 0) {
                    const noResults = document.createElement('div')
                    noResults.style.gridColumn = '1 / -1'
                    noResults.style.textAlign = 'center'
                    noResults.style.padding = '20px'
                    noResults.style.color = '#999'
                    noResults.textContent = 'No console icons found'
                    iconsContainer.appendChild(noResults)
                }
            }

            // Listener para busca em tempo real
            searchInput.addEventListener('input', (e) => {
                updateIconsDisplay(e.target.value)
            })

            // Mostrar ícones iniciais
            updateIconsDisplay(initialSearchValue)

            mainContainer.appendChild(searchContainer)
            mainContainer.appendChild(iconsContainer)

            // Criar diálogo
            dialog = dialogLib.newDialog({
                title: 'Select Console Icon',
                className: 'emulatorjs-icon-modal',
                buttons: [
                    {
                        text: 'Cancel',
                        onclick: () => {
                            console.log('[EmulatorJS] Icon selection cancelled')
                            dialog.close()
                        }
                    }
                ]
            })

            // Adicionar conteúdo ao diálogo
            setTimeout(() => {
                const dialogElement = document.querySelector('[role="dialog"]')
                if (dialogElement) {
                    const contentArea = dialogElement.querySelector('main') || dialogElement.querySelector('[role="presentation"]') || dialogElement.querySelector('.dialog-content')
                    if (contentArea) {
                        contentArea.appendChild(mainContainer)
                        // Dar foco ao input de busca
                        searchInput.focus()
                    }
                }
            }, 100)
        } catch (err) {
            console.error('[EmulatorJS] Error in icon selection modal:', err)
            HFS.toast('Error opening icon selection', 'error')
        }
    }

    HFS.onEvent('fileMenu', async ({ entry, menu }) => {
        try {
            // Verificar se é uma pasta
            if (!entry.isFolder) return

            // Verificar se a pasta tem arquivos compatíveis
            const hasRoms = await detectFolderConsoles(entry.uri || entry.url)
            if (!hasRoms) return

            // Verificar se o usuário é admin
            const isAdmin = Boolean(HFS.state.adminUrl)
            if (!isAdmin) return

            console.log('[EmulatorJS] Adding "Set Console Icon" option for folder:', entry.name)

            // Adicionar item de menu para definir ícone
            const iconItem = {
                id: 'set-console-icon',
                label: 'Set Console Icon',
                subLabel: 'Choose an icon for this folder',
                icon: 'image',
                onClick: async () => {
                    console.log('[EmulatorJS] Set Console Icon clicked!')
                    await openIconSelectionModal(entry)
                    return true
                }
            }

            menu.unshift(iconItem)

            // Verificar se a pasta já tem um ícone customizado
            const folderPath = entry.uri || entry.url
            // Adicionar item de menu para remover ícone
            const removeIconItem = {
                id: 'remove-console-icon',
                label: 'Remove Console Icon',
                subLabel: 'Remove the custom icon from this folder',
                icon: 'trash',
                onClick: async () => {
                    console.log('[EmulatorJS] Remove Console Icon clicked!')
                    try {
                        const result = await HFS.customRestCall('removeFolderIcon', {
                            folderPath: folderPath
                        })

                        if (result.success) {
                            HFS.toast('Console icon removed successfully!', 'success')
                        } else {
                            HFS.toast('Error removing icon: ' + (result.error || 'Unknown error'), 'error')
                        }
                    } catch (err) {
                        console.error('[EmulatorJS] Error removing folder icon:', err)
                        HFS.toast('Error removing icon', 'error')
                    }
                    return true
                }
            }

            menu.unshift(removeIconItem)
        } catch (err) {
            console.error('[EmulatorJS] error in fileMenu handler for folders', err)
        }
    })


    // Hook para aplicar ícone customizado às pastas
    HFS.onEvent('entryIcon', async ({ entry }) => {

        function ImgFallback({ fallback, tag = 'img', props }) {
            const [err, setErr] = HFS.React.useState()
            return err ? fallback && HFS.h(fallback) : HFS.h(tag, Object.assign(props, {
                onError() { setErr(true) }
            }))
        }

        console.log('[EmulatorJS] entryIcon hook called for', entry.name)
        const entryPath = entry.uri || entry.url;
        const srcCover = entryPath + `?get=game_cover&t=` + Date.now();
        console.log('[EmulatorJS] entry path:', entryPath)

        if (entry.isFolder || (entry.isFolder == false && compatibleExtensions.includes(entry.ext))) {
            console.log('[EmulatorJS] Checking for custom icon at', srcCover)
            return HFS.h(ImgFallback, {
                fallback: () => entry.getDefaultIcon(),
                props: {
                    src: srcCover,
                    className: 'icon thumbnail'
                }

            })
        } else {
            console.log('[EmulatorJS] entry is not a folder or compatible ROM, skipping custom icon')
            return null // Retorna null explicitamente para que o HFS use o ícone padrão
        }
    })


}

