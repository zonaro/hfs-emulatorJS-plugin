'use strict';
{



    // EmulatorJS Plugin for HFS
    console.log('[EmulatorJS] frontend script loaded')

    const pluginPublic = HFS.getPluginPublic();
    const config = HFS.getPluginConfig()
    const emuVersion = config.emulatorsJsVersion || 'stable'
    console.log('[EmulatorJS] HFS.getPluginPublic() returned:', pluginPublic);



    // Mapping of extensions to systems (cores)
    // Each extension can now map to multiple systems [{ system, name }, ...]
    // When an extension supports multiple systems, multiple Play buttons will be shown
    // Based on EmulatorJS documentation: https://emulatorjs.org/docs/systems and https://emulatorjs.org/docs4devs/cores
    const SYSTEM_MAP = {
        // ===== NINTENDO SYSTEMS =====    


        // NES/Famicom - Cores: fceumm (default), nestopia
        'nes': [{ system: 'nes', name: 'NES/Famicom', core: ['fceumm', 'nestopia'], icon: 'NES_-_Nintendo_-_Nintendo_Entertainment_System.png' }],
        'fds': [{ system: 'nes', name: 'Famicom Disk System', core: ['fceumm', 'nestopia'], icon: 'NES_-_Nintendo_-_Nintendo_Entertainment_System.png' }],
        'unif': [{ system: 'nes', name: 'NES/Famicom', core: ['fceumm', 'nestopia'], icon: 'NES_-_Nintendo_-_Nintendo_Entertainment_System.png' }],
        'unf': [{ system: 'nes', name: 'NES/Famicom', core: ['fceumm', 'nestopia'], icon: 'NES_-_Nintendo_-_Nintendo_Entertainment_System.png' }],

        // SNES/Super Famicom - Cores: snes9x (default), bsnes
        'snes': [{ system: 'snes', name: 'SNES', core: ['snes9x', 'bsnes'], icon: 'SNES_-_Nintendo_-_Super_Nintendo_Entertainment_System.png' }],
        'smc': [{ system: 'snes', name: 'SNES', core: ['snes9x', 'bsnes'], icon: 'SNES_-_Nintendo_-_Super_Nintendo_Entertainment_System.png' }],
        'sfc': [{ system: 'snes', name: 'Super Famicom', core: ['snes9x', 'bsnes'], icon: 'SNES_-_Nintendo_-_Super_Nintendo_Entertainment_System.png' }],
        'fig': [{ system: 'snes', name: 'SNES', core: ['snes9x', 'bsnes'], icon: 'SNES_-_Nintendo_-_Super_Nintendo_Entertainment_System.png' }],
        'gd3': [{ system: 'snes', name: 'SNES', core: ['snes9x', 'bsnes'], icon: 'SNES_-_Nintendo_-_Super_Nintendo_Entertainment_System.png' }],
        'gd7': [{ system: 'snes', name: 'SNES', core: ['snes9x', 'bsnes'], icon: 'SNES_-_Nintendo_-_Super_Nintendo_Entertainment_System.png' }],
        'dx2': [{ system: 'snes', name: 'SNES', core: ['snes9x', 'bsnes'], icon: 'SNES_-_Nintendo_-_Super_Nintendo_Entertainment_System.png' }],
        'bsx': [{ system: 'snes', name: 'SNES Satellaview', core: ['snes9x', 'bsnes'], icon: 'SNES_-_Nintendo_-_Super_Nintendo_Entertainment_System.png' }],
        'swc': [{ system: 'snes', name: 'SNES', core: ['snes9x', 'bsnes'], icon: 'SNES_-_Nintendo_-_Super_Nintendo_Entertainment_System.png' }],

        // Nintendo 64 - Cores: mupen64plus_next (default), parallel-n64
        'n64': [{ system: 'n64', name: 'Nintendo 64', core: ['mupen64plus_next', 'parallel-n64'], icon: 'N64_-_Nintendo_-_Nintendo_64.png' }],
        'z64': [{ system: 'n64', name: 'Nintendo 64', core: ['mupen64plus_next', 'parallel-n64'], icon: 'N64_-_Nintendo_-_Nintendo_64.png' }],
        'v64': [{ system: 'n64', name: 'Nintendo 64', core: ['mupen64plus_next', 'parallel-n64'], icon: 'N64_-_Nintendo_-_Nintendo_64.png' }],

        // Game Boy / Game Boy Color - Cores: gambatte (default), mgba
        'gb': [{ system: 'gb', name: 'Game Boy', core: ['gambatte'], icon: 'GB_-_Nintendo_-_Game_Boy.png' }],
        'gbc': [{ system: 'gb', name: 'Game Boy Color', core: ['gambatte'], icon: 'GBC_-_Nintendo_-_Game_Boy_Color.png' }],
        'sgb': [{ system: 'gb', name: 'Super Game Boy', core: ['gambatte'], icon: 'GB_-_Nintendo_-_Game_Boy.png' }],

        // Game Boy Advance - Core: mgba
        'gba': [{ system: 'gba', name: 'Game Boy Advance', core: ['mgba'], icon: 'GBA_-_Nintendo_-_Game_Boy_Advance.png' }],

        // Nintendo DS - Cores: melonds (default), desmume2015, desmume
        'nds': [{ system: 'nds', name: 'Nintendo DS', core: ['melonds', 'desmume2015', 'desmume'], icon: 'NDS_-_Nintendo_-_Nintendo_DS.png' }],

        // Virtual Boy - Core: beetle_vb
        'vb': [{ system: 'vb', name: 'Virtual Boy', core: ['beetle_vb'], icon: 'VB_-_Nintendo_-_Virtual_Boy.png' }],
        'vboy': [{ system: 'vb', name: 'Virtual Boy', core: ['beetle_vb'], icon: 'VB_-_Nintendo_-_Virtual_Boy.png' }],

        // ===== SEGA SYSTEMS =====

        // Sega Mega Drive/Genesis - Cores: genesis_plus_gx (default), genesis_plus_gx_wide, picodrive
        'md': [{ system: 'segaMD', name: 'Sega Mega Drive', core: ['genesis_plus_gx', 'genesis_plus_gx_wide', 'picodrive'], icon: 'MD_-_Sega_-_Mega_Drive.png' }],
        'smd': [{ system: 'segaMD', name: 'Sega Mega Drive', core: ['genesis_plus_gx', 'genesis_plus_gx_wide', 'picodrive'], icon: 'MD_-_Sega_-_Mega_Drive.png' }],
        'gen': [{ system: 'segaMD', name: 'Sega Genesis', core: ['genesis_plus_gx', 'genesis_plus_gx_wide', 'picodrive'], icon: 'MD_-_Sega_-_Mega_Drive.png' }],
        'sg': [{ system: 'segaMD', name: 'Sega Genesis', core: ['genesis_plus_gx', 'genesis_plus_gx_wide', 'picodrive'], icon: 'MD_-_Sega_-_Mega_Drive.png' }],

        // Sega Master System - Cores: smsplus (default), genesis_plus_gx, picodrive
        'sms': [{ system: 'segaMS', name: 'Sega Master System', core: ['smsplus', 'genesis_plus_gx', 'picodrive'], icon: 'MS_-_Sega_-_Master_System.png' }],

        // Sega Game Gear - Cores: genesis_plus_gx (default), genesis_plus_gx_wide
        'gg': [{ system: 'segaGG', name: 'Sega Game Gear', core: ['genesis_plus_gx', 'genesis_plus_gx_wide'], icon: 'GG_-_Sega_-_Game_Gear.png' }],

        // Sega CD - Cores: genesis_plus_gx (default), genesis_plus_gx_wide
        'cue': [
            { system: 'segaCD', name: 'Sega CD', core: ['genesis_plus_gx', 'genesis_plus_gx_wide'], icon: 'MD_-_Sega_-_Mega_Drive.png' },
            { system: 'psx', name: 'PlayStation', core: ['pcsx_rearmed', 'mednafen_psx_hw'], icon: 'PSX_-_Sony_-_PlayStation.png' }
        ],
        'chd': [
            { system: 'segaCD', name: 'Sega CD', core: ['genesis_plus_gx', 'genesis_plus_gx_wide'], icon: 'MD_-_Sega_-_Mega_Drive.png' },
            { system: 'psx', name: 'PlayStation', core: ['pcsx_rearmed', 'mednafen_psx_hw'], icon: 'PSX_-_Sony_-_PlayStation.png' }
        ],

        // Sega 32X - Core: picodrive
        '32x': [{ system: 'sega32x', name: 'Sega 32X', core: ['picodrive'], icon: '32X_-_Sega_-_32X.png' }],

        // Sega Saturn - Core: yabause
        'ccd': [{ system: 'segaSaturn', name: 'Sega Saturn', core: ['yabause'], icon: 'SAT_-_Sega_-_Saturn.png' }],
        'mds': [{ system: 'segaSaturn', name: 'Sega Saturn', core: ['yabause'], icon: 'SAT_-_Sega_-_Saturn.png' }],

        // ===== SONY SYSTEMS =====

        // PlayStation - Cores: pcsx_rearmed (default), mednafen_psx_hw
        'bin': [
            { system: 'psx', name: 'PlayStation', core: ['pcsx_rearmed', 'mednafen_psx_hw'], icon: 'PSX_-_Sony_-_PlayStation.png' },
            { system: 'segaMD', name: 'Sega Mega Drive', core: ['genesis_plus_gx', 'genesis_plus_gx_wide', 'picodrive'], icon: 'MD_-_Sega_-_Mega_Drive.png' }
        ],
        'iso': [
            { system: 'psx', name: 'PlayStation', core: ['pcsx_rearmed', 'mednafen_psx_hw'], icon: 'PSX_-_Sony_-_PlayStation.png' },
            { system: 'psp', name: 'PlayStation Portable', core: ['ppsspp'], icon: 'PSP_-_Sony_-_PlayStation_Portable.png' }
        ],
        'img': [{ system: 'psx', name: 'PlayStation', core: ['pcsx_rearmed', 'mednafen_psx_hw'], icon: 'PSX_-_Sony_-_PlayStation.png' }],
        'toc': [{ system: 'psx', name: 'PlayStation', core: ['pcsx_rearmed', 'mednafen_psx_hw'], icon: 'PSX_-_Sony_-_PlayStation.png' }],
        'exe': [{ system: 'psx', name: 'PlayStation', core: ['pcsx_rearmed', 'mednafen_psx_hw'], icon: 'PSX_-_Sony_-_PlayStation.png' }],
        'm3u': [{ system: 'psx', name: 'PlayStation', core: ['pcsx_rearmed', 'mednafen_psx_hw'], icon: 'PSX_-_Sony_-_PlayStation.png' }],

        // PlayStation Portable - Core: ppsspp (requires threads)
        'pbp': [{ system: 'psp', name: 'PlayStation Portable', core: ['ppsspp'], icon: 'PSP_-_Sony_-_PlayStation_Portable.png' }],
        'cso': [{ system: 'psp', name: 'PlayStation Portable', core: ['ppsspp'], icon: 'PSP_-_Sony_-_PlayStation_Portable.png' }],
        'elf': [{ system: 'psp', name: 'PlayStation Portable', core: ['ppsspp'], icon: 'PSP_-_Sony_-_PlayStation_Portable.png' }],
        'prx': [{ system: 'psp', name: 'PlayStation Portable', core: ['ppsspp'], icon: 'PSP_-_Sony_-_PlayStation_Portable.png' }],

        // ===== ATARI SYSTEMS =====

        // Atari 2600 - Core: stella2014
        'a26': [{ system: 'atari2600', name: 'Atari 2600', core: ['stella2014'], icon: 'A2600_-_Atari_-_Atari_2600.png' }],
        'bin': [
            { system: 'atari2600', name: 'Atari 2600', core: ['stella2014'], icon: 'A2600_-_Atari_-_Atari_2600.png' },
            { system: 'psx', name: 'PlayStation', core: ['pcsx_rearmed', 'mednafen_psx_hw'], icon: 'PSX_-_Sony_-_PlayStation.png' },
            { system: 'segaMD', name: 'Sega Mega Drive', core: ['genesis_plus_gx', 'genesis_plus_gx_wide', 'picodrive'], icon: 'MD_-_Sega_-_Mega_Drive.png' }
        ],

        // Atari 5200 - Core: a5200
        'a52': [{ system: 'atari5200', name: 'Atari 5200', core: ['a5200'], icon: 'A2600_-_Atari_-_Atari_2600.png' }],
        'car': [{ system: 'atari5200', name: 'Atari 5200', core: ['a5200'], icon: 'A2600_-_Atari_-_Atari_2600.png' }],

        // Atari 7800 - Core: prosystem
        'a78': [{ system: 'atari7800', name: 'Atari 7800', core: ['prosystem'], icon: 'A2600_-_Atari_-_Atari_2600.png' }],

        // Atari Lynx - Core: handy
        'lnx': [{ system: 'lynx', name: 'Atari Lynx', core: ['handy'], icon: 'LYNX_-_Atari_-_Lynx.png' }],
        'lyx': [{ system: 'lynx', name: 'Atari Lynx', core: ['handy'], icon: 'LYNX_-_Atari_-_Lynx.png' }],
        'o': [{ system: 'lynx', name: 'Atari Lynx', core: ['handy'], icon: 'LYNX_-_Atari_-_Lynx.png' }],

        // Atari Jaguar - Core: virtualjaguar
        'j64': [{ system: 'jaguar', name: 'Atari Jaguar', core: ['virtualjaguar'], icon: 'JAG_-_Atari_-_Jaguar.png' }],
        'jag': [{ system: 'jaguar', name: 'Atari Jaguar', core: ['virtualjaguar'], icon: 'JAG_-_Atari_-_Jaguar.png' }],

        // ===== ARCADE SYSTEMS =====

        // Arcade/MAME - Cores: fbneo (default), fbalpha2012_cps1, fbalpha2012_cps2, mame2003, mame2003_plus
        'zip': [{ system: 'arcade', name: 'Arcade/MAME', core: ['fbneo', 'fbalpha2012_cps1', 'fbalpha2012_cps2', 'mame2003', 'mame2003_plus'], icon: 'ARC_-_FBNeo_-_Arcade.png' }],
        '7z': [{ system: 'arcade', name: 'Arcade/MAME', core: ['fbneo', 'fbalpha2012_cps1', 'fbalpha2012_cps2', 'mame2003', 'mame2003_plus'], icon: 'ARC_-_FBNeo_-_Arcade.png' }],

        // MAME 2003 - Cores: mame2003 (default), mame2003_plus
        // Uses same extensions as arcade

        // ===== COMMODORE SYSTEMS =====

        // Commodore 64 - Core: vice_x64sc
        'd64': [{ system: 'vice_x64sc', name: 'Commodore 64', core: ['vice_x64sc'], icon: 'VICE64_-_Commodore_-_C64.png' }],
        'g64': [{ system: 'vice_x64sc', name: 'Commodore 64', core: ['vice_x64sc'], icon: 'VICE64_-_Commodore_-_C64.png' }],
        'x64': [{ system: 'vice_x64sc', name: 'Commodore 64', core: ['vice_x64sc'], icon: 'VICE64_-_Commodore_-_C64.png' }],
        't64': [{ system: 'vice_x64sc', name: 'Commodore 64', core: ['vice_x64sc'], icon: 'VICE64_-_Commodore_-_C64.png' }],
        'tap': [
            { system: 'vice_x64sc', name: 'Commodore 64', core: ['vice_x64sc'], icon: 'VICE64_-_Commodore_-_C64.png' },
            { system: 'vice_xvic', name: 'Commodore VIC-20', core: ['vice_xvic'], icon: 'VICE64_-_Commodore_-_C64.png' }
        ],
        'prg': [
            { system: 'vice_x64sc', name: 'Commodore 64', core: ['vice_x64sc'], icon: 'VICE64_-_Commodore_-_C64.png' },
            { system: 'vice_x128', name: 'Commodore 128', core: ['vice_x128'], icon: 'VICE128_-_Commodore_-_C128.png' }
        ],
        'p00': [{ system: 'vice_x64sc', name: 'Commodore 64', core: ['vice_x64sc'], icon: 'VICE64_-_Commodore_-_C64.png' }],
        'crt': [{ system: 'vice_x64sc', name: 'Commodore 64', core: ['vice_x64sc'], icon: 'VICE64_-_Commodore_-_C64.png' }],

        // Commodore 128 - Core: vice_x128
        'd81': [{ system: 'vice_x128', name: 'Commodore 128' }],



        // Commodore Amiga - Core: puae
        'adf': [{ system: 'amiga', name: 'Commodore Amiga', core: ['puae'], icon: 'AMIGA_-_Commodore_-_Amiga.png' }],
        'dms': [{ system: 'amiga', name: 'Commodore Amiga', core: ['puae'], icon: 'AMIGA_-_Commodore_-_Amiga.png' }],
        'fdi': [{ system: 'amiga', name: 'Commodore Amiga', core: ['puae'], icon: 'AMIGA_-_Commodore_-_Amiga.png' }],
        'ipf': [{ system: 'amiga', name: 'Commodore Amiga', core: ['puae'], icon: 'AMIGA_-_Commodore_-_Amiga.png' }],
        'adz': [{ system: 'amiga', name: 'Commodore Amiga', core: ['puae'], icon: 'AMIGA_-_Commodore_-_Amiga.png' }],
        'hdf': [{ system: 'amiga', name: 'Commodore Amiga', core: ['puae'], icon: 'AMIGA_-_Commodore_-_Amiga.png' }],
        'hdz': [{ system: 'amiga', name: 'Commodore Amiga', core: ['puae'], icon: 'AMIGA_-_Commodore_-_Amiga.png' }],
        'lha': [{ system: 'amiga', name: 'Commodore Amiga', core: ['puae'], icon: 'AMIGA_-_Commodore_-_Amiga.png' }],
        'slave': [{ system: 'amiga', name: 'Commodore Amiga', core: ['puae'], icon: 'AMIGA_-_Commodore_-_Amiga.png' }],
        'info': [{ system: 'amiga', name: 'Commodore Amiga', core: ['puae'], icon: 'AMIGA_-_Commodore_-_Amiga.png' }],
        'rp9': [{ system: 'amiga', name: 'Commodore Amiga', core: ['puae'], icon: 'AMIGA_-_Commodore_-_Amiga.png' }],

        // ===== OTHER SYSTEMS =====

        // 3DO - Core: opera
        '3do': [{ system: '3do', name: '3DO', core: ['opera'], icon: '3DO_-_Panasonic_-_3DO.png' }],

        // ColecoVision - Core: gearcoleco
        'col': [{ system: 'coleco', name: 'ColecoVision', core: ['gearcoleco'], icon: 'COLECO_-_Coleco_-_ColecoVision.png' }],
        'cv': [{ system: 'coleco', name: 'ColecoVision', core: ['gearcoleco'], icon: 'COLECO_-_Coleco_-_ColecoVision.png' }],
        'rom': [{ system: 'coleco', name: 'ColecoVision', core: ['gearcoleco'], icon: 'COLECO_-_Coleco_-_ColecoVision.png' }],

        // NEC PC Engine/TurboGrafx-16 - Core: mednafen_pce
        'pce': [{ system: 'pce', name: 'PC Engine/TurboGrafx-16', core: ['mednafen_pce'], icon: 'PCE_-_NEC_-_PC_Engine.png' }],
        'sgx': [{ system: 'pce', name: 'PC Engine SuperGrafx', core: ['mednafen_pce'], icon: 'PCE_-_NEC_-_PC_Engine.png' }],

        // NEC PC-FX - Core: mednafen_pcfx
        'pcfx': [{ system: 'pcfx', name: 'PC-FX', core: ['mednafen_pcfx'], icon: 'PCFX_-_NEC_-_PC-FX.png' }],
        'toc': [
            { system: 'pcfx', name: 'PC-FX', core: ['mednafen_pcfx'], icon: 'PCFX_-_NEC_-_PC-FX.png' },
            { system: 'psx', name: 'PlayStation', core: ['pcsx_rearmed', 'mednafen_psx_hw'], icon: 'PSX_-_Sony_-_PlayStation.png' }
        ],

        // Neo Geo Pocket - Core: mednafen_ngp
        'ngp': [{ system: 'ngp', name: 'Neo Geo Pocket', core: ['mednafen_ngp'], icon: 'NGP_-_SNK_-_Neo_Geo_Pocket.png' }],
        'ngc': [{ system: 'ngp', name: 'Neo Geo Pocket Color', core: ['mednafen_ngp'], icon: 'NGP_-_SNK_-_Neo_Geo_Pocket.png' }],
        'ngpc': [{ system: 'ngp', name: 'Neo Geo Pocket Color', core: ['mednafen_ngp'], icon: 'NGP_-_SNK_-_Neo_Geo_Pocket.png' }],
        'npc': [{ system: 'ngp', name: 'Neo Geo Pocket Color', core: ['mednafen_ngp'], icon: 'NGP_-_SNK_-_Neo_Geo_Pocket.png' }],

        // WonderSwan - Core: mednafen_wswan
        'ws': [{ system: 'ws', name: 'WonderSwan', core: ['mednafen_wswan'], icon: 'WS_-_Bandai_-_WonderSwan.png' }],
        'wsc': [{ system: 'ws', name: 'WonderSwan Color', core: ['mednafen_wswan'], icon: 'WS_-_Bandai_-_WonderSwan.png' }],
        'pc2': [{ system: 'ws', name: 'WonderSwan', core: ['mednafen_wswan'], icon: 'WS_-_Bandai_-_WonderSwan.png' }],

        // DOSBOX - Core: dosbox_pure (requires special setup)
        'exe': [
            { system: 'dos', name: 'DOS', core: ['dosbox_pure'], icon: 'DOS_-_Microsoft_-_DOS.png' },
            { system: 'psx', name: 'PlayStation', core: ['pcsx_rearmed', 'mednafen_psx_hw'], icon: 'PSX_-_Sony_-_PlayStation.png' }
        ],
        'com': [{ system: 'dos', name: 'DOS', core: ['dosbox_pure'], icon: 'DOS_-_Microsoft_-_DOS.png' }],
        'bat': [{ system: 'dos', name: 'DOS', core: ['dosbox_pure'], icon: 'DOS_-_Microsoft_-_DOS.png' }],
        'conf': [{ system: 'dos', name: 'DOS', core: ['dosbox_pure'], icon: 'DOS_-_Microsoft_-_DOS.png' }],
        'dosz': [{ system: 'dos', name: 'DOS', core: ['dosbox_pure'], icon: 'DOS_-_Microsoft_-_DOS.png' }],
    }



    // Function to get all systems that can run a file with a given extension
    // Returns an array of systems
    function getAllSystemsFromFile(filename) {
        const ext = filename.split('.').pop().toLowerCase()
        return SYSTEM_MAP[ext] || []
    }

    // Create emulator page URL that resides in plugin public (avoids CORS issues)
    function createEmulatorPageUrl(gameUrl, core) {

        // Ensure gameUrl is absolute (with protocol and domain)

        if (!gameUrl.startsWith('http://') && !gameUrl.startsWith('https://')) {
            // Create absolute URL using current origin
            gameUrl = window.location.origin + gameUrl
        }

        // Add ?dl at the end to force direct download in HFS
        if (!gameUrl.includes('?dl')) {
            gameUrl += '?dl'
        }

        // Get username from HFS state
        const username = (HFS.state && HFS.state.username) || ''

        const url = pluginPublic + 'emulator_page.html?game=' + encodeURIComponent(gameUrl) + '&core=' + encodeURIComponent(core) + '&version=' + encodeURIComponent(emuVersion) + '&username=' + encodeURIComponent(username)
        console.log('[EmulatorJS] - core:', core)
        console.log('[EmulatorJS] - username:', username)
        console.log('[EmulatorJS] - base:', pluginPublic)
        console.log('[EmulatorJS] URL created:', url)
        return url
    }


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

        //remove numbers on beggining of file names before -, names like "1234 - Game Title" becomes  "Game Title"
        cleaned = cleaned.replace(/^\d+\s*-\s*/, '').trim()

        // Remove numbering like "Part 1", "Disc 2", "Episode 3"
        cleaned = cleaned.replace(/\s+(Part|Disc|Episode|CD|Vol|Volume)\s*\d+$/i, '').trim()

        return cleaned
    }

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

    function getPlatformIconUrl(platform, isName) {
        var icon = getPlatformIcon(platform);
        if (isName) {
            /// If platform is actually the name of the icon, use it directly
            icon = platform
        }
        if (icon) {
            console.log('[EmulatorJS] Getting icon for platform:', platform, '->', icon);
            if (HFS) {
                // Return full URL to the icon in plugin public directory
                return pluginPublic + 'console-icons/' + icon;
            }
        }
        return null;
    }

    function getPlatformIcon(platform) {
        // Returns the icon filename in the format 'SHORT - Manufacturer - Platform.png' or null if unknown
        if (!platform) return null
        const key = platform.toString().toLowerCase()

        // First search SYSTEM_MAP for an entry matching the system and with an icon defined
        for (const ext in SYSTEM_MAP) {
            const arr = SYSTEM_MAP[ext]
            if (!Array.isArray(arr)) continue
            for (const obj of arr) {
                if (String(obj.system).toLowerCase() === key && obj.icon) {
                    return obj.icon
                }
            }
        }

        return null;
    }

    function playGameInEmulator(gameUrl, core) {

        console.log('[EmulatorJS] playGameInEmulator called with:', gameUrl, core)
        const emulatorPageUrl = createEmulatorPageUrl(gameUrl, core)
        console.log('[EmulatorJS] Opening emulator page URL:', emulatorPageUrl)
        window.open(emulatorPageUrl, '_blank')
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

    HFS.onEvent('fileShow', ({ entry }) => {
        console.log('[EmulatorJS] fileOpen event for entry:', entry.name)
        const filename = entry.name
        const ext = (entry && entry.ext) ? entry.ext.toLowerCase() : (filename.includes('.') ? filename.split('.').pop().toLowerCase() : '')
        const allSystems = getAllSystemsFromFile(ext || filename)
        if (!allSystems || allSystems.length === 0 || entry.isFolder) {
            return
        }

        console.log('[EmulatorJS] Detected systems for', filename, ':', allSystems)
    })

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

            // Add 'View Cover' option 
            const viewCoverItem = {
                id: 'view-cover',
                label: 'View Cover',
                subLabel: 'Preview cover image',
                icon: 'image',

                onClick: async () => {
                    console.log('[EmulatorJS] View cover button clicked!')

                    try {
                        const res = await HFS.customRestCall('getCover', { rom: entry.name })
                        const { dialogLib } = HFS

                        if (!res || !res.success) {
                            HFS.toast(res?.error || 'No cover found', 'warning')
                            return false
                        }

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
                            img.src = `data:${res.mimeType || 'image/jpeg'};base64,${res.data}`
                            img.style.maxWidth = '100%'
                            img.style.maxHeight = '70vh'
                            img.style.borderRadius = '4px'
                            img.alt = entry.name

                            container.appendChild(img)
                            contentArea.insertBefore(container, contentArea.firstChild)
                        }, 50)

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
                const cores = (Array.isArray(systemInfo.core) && systemInfo.core.length) ? systemInfo.core : [systemInfo.system]

                // add a separator for this system group
                menu.unshift({ id: `separator-emulatorjs-play-${sysIndex}`, type: 'separator' })

                cores.forEach(coreId => {
                    const playItem = {
                        id: `play-${systemInfo.system}-${coreId}`,
                        label: 'Play',
                        subLabel: `${systemInfo.name} · ${coreId}`,
                        icon: getPlatformIconUrl(systemInfo.system) || '🕹️',
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

    // Cache para capas já carregadas
    const coverCache = {}


    // Função para verificar se uma pasta contém arquivos compatíveis com emuladores
    async function folderHasCompatibleRoms(folderUri) {
        try {
            console.log('[EmulatorJS] Checking folder for compatible ROMs:', folderUri)

            // Fazer requisição para listar os arquivos da pasta em plain text
            const response = await fetch(folderUri + '?get=list&folders=0')
            if (!response.ok) {
                console.log('[EmulatorJS] Failed to fetch folder contents')
                return false
            }

            const text = await response.text()
            const fileExtensions = Object.keys(SYSTEM_MAP)

            // Processar cada linha (arquivo)
            const lines = text.split('\n')
            for (const line of lines) {
                const filename = line.trim()
                if (!filename) continue

                // Extrair extensão do arquivo
                const ext = filename.includes('.') ? filename.split('.').pop().toLowerCase() : ''

                if (fileExtensions.includes(ext)) {
                    console.log('[EmulatorJS] Found compatible ROM:', filename)
                    return true
                }
            }

            console.log('[EmulatorJS] No compatible ROMs found in folder')
            return false
        } catch (err) {
            console.error('[EmulatorJS] Error checking folder contents:', err)
            return false
        }
    }

    // Função para detectar quais consoles estão presentes na pasta
    async function detectFolderConsoles(folderUri) {
        try {
            console.log('[EmulatorJS] Detecting consoles in folder:', folderUri)

            const folderName = decodeURIComponent(folderUri.split('/').filter(part => part).pop() || '').toLowerCase()

            console.log('[EmulatorJS] Folder name for detection:', folderName)

            const detectedConsoles = new Set()

            // check for folder name 
            Object.values(SYSTEM_MAP).forEach(systemInfos => {
                systemInfos.forEach(systemInfo => {
                    if (systemInfo) {
                        if (folderName.includes(systemInfo.name.toLowerCase()) || folderName.includes(systemInfo.system.toLowerCase())) {
                            detectedConsoles.add(systemInfo.name)
                        }
                    }
                })
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

            // Buscar ícones disponíveis
            const result = await HFS.customRestCall('getAvailableIcons')
            if (!result.success || !result.icons || result.icons.length === 0) {
                HFS.toast('No console icons available', 'error')
                return
            }

            // Detectar consoles na pasta
            const detectedConsoles = await detectFolderConsoles(folderEntry.uri || folderEntry.url)
            let initialSearchValue = ''

            initialSearchValue = detectedConsoles.join("/")


            const icons = result.icons
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
                    if (!searchTerms.some(term => icon.displayName.toLowerCase().includes(term) || icon.filename.toLowerCase().includes(term))) {
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
                    img.src = icon.dataUrl
                    img.alt = icon.displayName
                    img.style.width = '64px'
                    img.style.height = '64px'
                    img.style.objectFit = 'contain'
                    img.style.filter = 'invert(0.8)'
                    img.style.marginBottom = '8px'

                    const label = document.createElement('div')
                    label.textContent = icon.displayName
                    label.style.fontSize = '11px'
                    label.style.textAlign = 'center'
                    label.style.wordWrap = 'break-word'
                    label.style.maxWidth = '100px'

                    iconDiv.appendChild(img)
                    iconDiv.appendChild(label)

                    iconDiv.addEventListener('click', async () => {
                        try {
                            console.log('[EmulatorJS] Setting icon:', icon.filename)

                            const setResult = await HFS.customRestCall('setFolderIcon', {
                                folderPath: folderEntry.uri || folderEntry.url,
                                iconName: icon.filename
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
    if (config.showFileMenu !== false) {
        HFS.onEvent('fileMenu', async ({ entry, menu }) => {
            try {
                // Verificar se é uma pasta
                if (!entry.isFolder) return

                // Verificar se a pasta tem arquivos compatíveis
                const hasRoms = await folderHasCompatibleRoms(entry.uri || entry.url)
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
                try {
                    const folderIconResult = await HFS.customRestCall('getFolderIcon', {
                        folderPath: folderPath
                    })

                    if (folderIconResult.success && folderIconResult.iconName) {
                        console.log('[EmulatorJS] Folder has custom icon, adding remove option')

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
                    }
                } catch (err) {
                    console.error('[EmulatorJS] Error checking folder icon:', err)
                }
            } catch (err) {
                console.error('[EmulatorJS] error in fileMenu handler for folders', err)
            }
        })
    }

    // Hook para aplicar ícone customizado às pastas
    HFS.onEvent('entryIcon', async ({ entry }) => {

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

        const filename = (entry && (entry.name || ''))
        const compatibleExtensions = Object.keys(SYSTEM_MAP)
        const ext = (entry && !entry.isFolder && entry.ext) ? entry.ext.toLowerCase() : (filename.includes('.') ? filename.split('.').pop().toLowerCase() : '')
        if (!entry.isFolder) {
            try {

                // check if extension is compatible with emulators
                if (!compatibleExtensions.includes(ext)) {
                    return undefined
                }

                // Caminho completo do arquivo ROM
                const romPath = entry.url || entry.path || entry.name

                // Componente React que carrega a capa de forma assíncrona
                const CoverIcon = () => {
                    const cacheKey = filename

                    // Hook para carregar a capa
                    const [cover, setCover] = HFS.React.useState(coverCache[cacheKey] || null)
                    const [consoleIcon, setConsoleIcon] = HFS.React.useState(null)
                    const [loading, setLoading] = HFS.React.useState(!coverCache[cacheKey])

                    HFS.React.useEffect(() => {
                        if (coverCache[cacheKey]) {
                            setCover(coverCache[cacheKey])
                            setLoading(false)
                            return
                        }

                        setLoading(true)
                        HFS.customRestCall('getCover', { rom: filename, romPath })
                            .then(result => {
                                console.log(`[EmulatorJS] Cover carregada para ${filename}:`, { success: result.success, hasData: !!result.data })
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
                                console.error(`[EmulatorJS] Erro ao carregar capa para ${filename}:`, err)
                                setLoading(false)
                            })
                    }, [])

                    // Carregar ícone do console quando a capa não está disponível
                    HFS.React.useEffect(() => {
                        if (cover) return // Não precisa do ícone do console se houver capa

                        const loadConsoleIcon = async () => {
                            try {

                                const allSystems = getAllSystemsFromFile(ext || filename)

                                // Determinar qual console usar
                                let consoleToUse = null
                                let iconFileName = null

                                // 1. Primeiro, tentar buscar ícone customizado da pasta
                                console.log(`[EmulatorJS] Trying to get folder icon for ${filename}`)
                                console.log(`[EmulatorJS] entry.url: ${entry.url}`)
                                console.log(`[EmulatorJS] entry.uri: ${entry.uri}`)

                                let parentPath = null
                                if (entry.url) {
                                    parentPath = entry.url.substring(0, entry.url.lastIndexOf('/'))
                                } else if (entry.uri) {
                                    parentPath = entry.uri.substring(0, entry.uri.lastIndexOf('/'))
                                }

                                console.log(`[EmulatorJS] Extracted parentPath: ${parentPath}`)

                                if (parentPath) {
                                    try {
                                        const folderIconResult = await HFS.customRestCall('getFolderIcon', {
                                            folderPath: parentPath
                                        })
                                        console.log(`[EmulatorJS] getFolderIcon result:`, folderIconResult)
                                        if (folderIconResult.success && folderIconResult.iconName) {
                                            iconFileName = getPlatformIconUrl(folderIconResult.iconName, true)
                                            console.log(`[EmulatorJS] Found folder icon: ${iconFileName}`)
                                        }
                                    } catch (folderErr) {
                                        console.error(`[EmulatorJS] Error calling getFolderIcon:`, folderErr)
                                    }
                                }

                                // 2. Se não achou ícone da pasta, tentar usar ícone do console (se há apenas 1)
                                if (!iconFileName && allSystems.length === 1) {
                                    consoleToUse = allSystems[0].system
                                    // Mapear system para icon filename usando getPlatformIcon
                                    iconFileName = getPlatformIconUrl(consoleToUse)
                                }

                                // 3. Se conseguiu determinar um ícone, carregar sua imagem
                                if (iconFileName) {
                                    setConsoleIcon({
                                        src: iconFileName,
                                        alt: consoleToUse || 'Console Icon'
                                    })

                                }
                            } catch (err) {
                                console.error(`[EmulatorJS] Error loading console icon for ${filename}:`, err)
                            }
                        }

                        loadConsoleIcon()
                    }, [cover])

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
                                alt: filename
                            })
                        )
                    }

                    // Se conseguiu carregar o ícone do console, mostrar
                    if (consoleIcon) {
                        return HFS.h('div', {
                            className: 'emulatorjs-icon-container',
                            style: containerStyle
                        },
                            HFS.h('img', {
                                src: consoleIcon.src,
                                style: {
                                    width: '80%',
                                    height: '80%',
                                    objectFit: 'contain',
                                    borderRadius: '2px',
                                    filter: 'invert(0.8)'
                                },
                                alt: consoleIcon.alt
                            })
                        )
                    }


                    if (compatibleExtensions.includes(ext)) {
                        return HFS.h('div', {
                            className: 'emulatorjs-icon-container',
                            style: containerStyle
                        }, gameControllerIcon)
                    }
                    else {
                        // devolve padrao
                        return undefined
                    }
                }
                return HFS.h(CoverIcon)
            } catch (err) {
                console.error('[EmulatorJS] erro no handler entryIcon', err)
                return undefined
            }
        } else {

            try {



                // Tentar buscar ícone customizado
                const result = await HFS.customRestCall('getFolderIcon', {
                    folderPath: entry.uri || entry.url
                })

                if (result.success && result.dataUrl) {
                    console.log('[EmulatorJS] Applying custom icon to folder:', entry.name, result.iconName)

                    // Estilos do container (igual ao das capas)
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

                    return HFS.h('div', {
                        className: 'emulatorjs-icon-container',
                        style: containerStyle
                    }, HFS.h('img', {
                        src: result.dataUrl,
                        alt: 'Console Icon',
                        style: {
                            width: '100%',
                        }
                    }))


                }
            } catch (err) {
                console.error('[EmulatorJS] Error applying custom icon:', err)
                return undefined
            }
        }
    })


}

