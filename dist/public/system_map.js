
// Platform System Map
// Based on EmulatorJS documentation: https://emulatorjs.org/docs/systems and https://emulatorjs.org/docs4devs/cores



const SYSTEM_MAP = [
    // ===== NINTENDO SYSTEMS =====
    { system: '3ds', manufacturer: 'Nintendo', name: '3DS', extensions: ['3ds', 'cia'], core: [], icons: ['Nintendo_-_Nintendo_3DS.png', 'Nintendo_-_Nintendo_3DS-content.png'] },
    { system: 'gamecube', manufacturer: 'Nintendo', name: 'GameCube', extensions: ['rvz', 'gcz', 'gcm', 'iso'], core: [], icons: ['Nintendo_-_GameCube.png', 'Nintendo_-_GameCube-content.png'] },
    { system: 'nes', manufacturer: 'Nintendo', name: 'NES/Famicom', extensions: ['nes', 'fds', 'unif', 'unf'], core: ['fceumm', 'nestopia'], icons: ['Nintendo_-_Nintendo_Entertainment_System.png', 'Nintendo_-_Nintendo_Entertainment_System-content.png', 'Nintendo_-_Family_Computer_Disk_System.png', 'Nintendo_-_Family_Computer_Disk_System-content.png'] },
    { system: 'snes', manufacturer: 'Nintendo', name: 'SNES/Super Famicom', extensions: ['snes', 'smc', 'sfc', 'fig', 'gd3', 'gd7', 'dx2', 'bsx', 'swc'], core: ['snes9x', 'bsnes'], icons: ['Nintendo_-_Super_Nintendo_Entertainment_System.png', 'Nintendo_-_Super_Nintendo_Entertainment_System-content.png', 'Nintendo_-_Satellaview.png', 'Nintendo_-_Satellaview-content.png'] },
    { system: 'n64', manufacturer: 'Nintendo', name: '64', extensions: ['n64', 'z64', 'v64'], core: ['mupen64plus_next', 'parallel-n64'], icons: ['Nintendo_-_Nintendo_64.png', 'Nintendo_-_Nintendo_64-content.png', 'Nintendo_-_Nintendo_64DD.png', 'Nintendo_-_Nintendo_64DD-content.png'] },
    { system: 'gb', manufacturer: 'Nintendo', name: 'Game Boy/Game Boy Color', extensions: ['gb', 'gbc', 'sgb'], core: ['gambatte'], icons: ['Nintendo_-_Game_Boy.png', 'Nintendo_-_Game_Boy-content.png', 'Nintendo_-_Game_Boy_Color.png', 'Nintendo_-_Game_Boy_Color-content.png'] },
    { system: 'gba', manufacturer: 'Nintendo', name: 'Game Boy Advance', extensions: ['gba'], core: ['mgba'], icons: ['Nintendo_-_Game_Boy_Advance.png', 'Nintendo_-_Game_Boy_Advance-content.png'] },
    { system: 'nds', manufacturer: 'Nintendo', name: 'DS', extensions: ['nds'], core: ['melonds', 'desmume2015', 'desmume'], icons: ['Nintendo_-_Nintendo_DS.png', 'Nintendo_-_Nintendo_DS-content.png', 'Nintendo_-_Nintendo_DSi.png', 'Nintendo_-_Nintendo_DSi-content.png'] },
    { system: 'vb', manufacturer: 'Nintendo', name: 'Virtual Boy', extensions: ['vb', 'vboy'], core: ['beetle_vb'], icons: ['Nintendo_-_Virtual_Boy.png', 'Nintendo_-_Virtual_Boy-content.png'] },
    { system: 'wii', manufacturer: 'Nintendo', name: 'Wii', extensions: ['wbfs', 'wia', 'iso'], core: [], icons: ['Nintendo_-_Wii.png', 'Nintendo_-_Wii-content.png'] },
    { system: 'wiiu', manufacturer: 'Nintendo', name: 'Wii U', extensions: ['wud', 'wux', 'rpx', 'wua'], core: [], icons: ['Nintendo_-_Wii_U.png', 'Nintendo_-_Wii_U-content.png'] },
    { system: 'switch', manufacturer: 'Nintendo', name: 'Switch', extensions: ['nsp', 'xci', 'nsz', 'xcz'], core: [], icons: ['Nintendo_-_Switch.png', 'Nintendo_-_Switch-content.png'] },
    { system: 'pokemini', manufacturer: 'Nintendo', name: 'Pokemon Mini', extensions: ['min'], core: [], icons: ['Nintendo_-_Pokemon_Mini.png', 'Nintendo_-_Pokemon_Mini-content.png'] },

    // ===== SEGA SYSTEMS =====
    { system: 'segaMD', manufacturer: 'Sega', name: 'Mega Drive/Genesis', extensions: ['md', 'smd', 'gen', 'sg', 'bin'], core: ['genesis_plus_gx', 'genesis_plus_gx_wide'], icons: ['Sega_-_Mega_Drive_-_Genesis.png', 'Sega_-_Mega_Drive_-_Genesis-content.png', 'Sega_-_Mega-CD_-_Sega_CD.png', 'Sega_-_Mega-CD_-_Sega_CD-content.png', 'Sega_-_32X.png', 'Sega_-_32X-content.png'] },
    { system: 'segaMS', manufacturer: 'Sega', name: 'Master System', extensions: ['sms'], core: ['smsplus', 'genesis_plus_gx'], icons: ['Sega_-_Master_System_-_Mark_III.png', 'Sega_-_Master_System_-_Mark_III-content.png'] },
    { system: 'segaGG', manufacturer: 'Sega', name: 'Game Gear', extensions: ['gg'], core: ['genesis_plus_gx', 'genesis_plus_gx_wide'], icons: ['Sega_-_Game_Gear.png', 'Sega_-_Game_Gear-content.png'] },
    { system: 'segaCD', manufacturer: 'Sega', name: 'CD', extensions: ['cue', 'chd'], core: ['genesis_plus_gx', 'genesis_plus_gx_wide'], icons: ['Sega_-_Mega-CD_-_Sega_CD.png', 'Sega_-_Mega-CD_-_Sega_CD-content.png'] },
    { system: 'sega32x', manufacturer: 'Sega', name: '32X', extensions: ['32x'], core: ['picodrive'], icons: ['Sega_-_32X.png', 'Sega_-_32X-content.png'] },
    { system: 'segaSaturn', manufacturer: 'Sega', name: 'Saturn', extensions: ['ccd', 'mds'], core: ['yabause'], icons: ['Sega_-_Saturn.png', 'Sega_-_Saturn-content.png'] },
    { system: 'dreamcast', manufacturer: 'Sega', name: 'Dreamcast', extensions: ['cdi', 'gdi'], core: [], icons: ['Sega_-_Dreamcast.png', 'Sega_-_Dreamcast-content.png'] },
    { system: 'sg1000', manufacturer: 'Sega', name: 'SG-1000', extensions: ['sg1000'], core: [], icons: ['Sega_-_SG-1000.png', 'Sega_-_SG-1000-content.png'] },
    { system: 'pico', manufacturer: 'Sega', name: 'PICO', extensions: ['pico'], core: [], icons: ['Sega_-_PICO.png', 'Sega_-_PICO-content.png'] },

    // ===== SONY SYSTEMS =====
    { system: 'psx', manufacturer: 'Sony', name: 'PlayStation/PS1', extensions: ['bin', 'iso', 'img', 'toc', 'exe', 'm3u', 'cue', 'chd', 'ecm'], core: ['pcsx_rearmed', 'mednafen_psx_hw'], icons: ['Sony_-_PlayStation.png', 'Sony_-_PlayStation-content.png'] },
    { system: 'psp', manufacturer: 'Sony', name: 'PlayStation Portable/PSP', extensions: ['pbp', 'cso', 'elf', 'prx', 'iso'], core: ['ppsspp'], icons: ['Sony_-_PlayStation_Portable.png', 'Sony_-_PlayStation_Portable-content.png'] },
    { system: 'ps2', manufacturer: 'Sony', name: 'PlayStation 2/PS2', extensions: ['ps2'], core: [], icons: ['Sony_-_PlayStation_2.png', 'Sony_-_PlayStation_2-content.png'] },
    { system: 'psvita', manufacturer: 'Sony', name: 'PlayStation Vita/PSVita', extensions: ['psv', 'vita'], core: [], icons: ['Sony_-_PlayStation_Vita.png', 'Sony_-_PlayStation_Vita-content.png'] },

    // ===== ATARI SYSTEMS =====
    { system: 'atari2600', manufacturer: 'Atari', name: 'Atari 2600', extensions: ['a26', 'bin'], core: ['stella2014'], icons: ['Atari_-_2600.png', 'Atari_-_2600-content.png'] },
    { system: 'atari5200', manufacturer: 'Atari', name: 'Atari 5200', extensions: ['a52', 'car'], core: ['a5200'], icons: ['Atari_-_5200.png', 'Atari_-_5200-content.png'] },
    { system: 'atari7800', manufacturer: 'Atari', name: 'Atari 7800', extensions: ['a78'], core: ['prosystem'], icons: ['Atari_-_7800.png', 'Atari_-_7800-content.png'] },
    { system: 'lynx', manufacturer: 'Atari', name: 'Atari Lynx', extensions: ['lnx', 'lyx', 'o'], core: ['handy'], icons: ['Atari_-_Lynx.png', 'Atari_-_Lynx-content.png'] },
    { system: 'jaguar', manufacturer: 'Atari', name: 'Atari Jaguar', extensions: ['j64', 'jag'], core: ['virtualjaguar'], icons: ['Atari_-_Jaguar.png', 'Atari_-_Jaguar-content.png', 'Atari_-_Jaguar_CD.png', 'Atari_-_Jaguar_CD-content.png'] },

    // ===== ARCADE SYSTEMS =====
    { system: 'arcade', manufacturer: 'Various', name: 'Arcade/MAME', extensions: ['zip', '7z'], core: ['fbneo', 'fbalpha2012_cps1', 'fbalpha2012_cps2', 'mame2003', 'mame2003_plus'], icons: ['MAME.png', 'MAME-content.png'] },
    { system: 'neogeo', manufacturer: 'SNK', name: 'Neo Geo', extensions: ['neo'], core: ['fbneo'], icons: ['SNK_-_Neo_Geo.png', 'SNK_-_Neo_Geo-content.png'] },
    { system: 'neogeocd', manufacturer: 'SNK', name: 'Neo Geo CD', extensions: ['neocd'], core: [], icons: ['SNK_-_Neo_Geo_CD.png', 'SNK_-_Neo_Geo_CD-content.png'] },
    { system: 'cps1', manufacturer: 'Capcom', name: 'Capcom CPS1', extensions: ['cps1'], core: ['fbalpha2012_cps1', 'fbneo'], icons: ['Capcom_-_CP_System_I.png'] },
    { system: 'cps2', manufacturer: 'Capcom', name: 'Capcom CPS2', extensions: ['cps2'], core: ['fbalpha2012_cps2', 'fbneo'], icons: ['Capcom_-_CP_System_II.png'] },
    { system: 'cps3', manufacturer: 'Capcom', name: 'Capcom CPS3', extensions: ['cps3'], core: ['fbneo'], icons: ['Capcom_-_CP_System_III.png'] },

    // ===== COMMODORE SYSTEMS =====
    { system: 'vice_x64sc', manufacturer: 'Commodore', name: '64', extensions: ['d64', 'g64', 'x64', 't64', 'tap', 'prg', 'p00', 'crt'], core: ['vice_x64sc'], icons: ['Commodore_-_64.png', 'Commodore_-_64-content.png'] },
    { system: 'vice_xvic', manufacturer: 'Commodore', name: 'VIC-20', extensions: ['tap'], core: ['vice_xvic'], icons: ['Commodore_-_VIC-20.png'] },
    { system: 'vice_x128', manufacturer: 'Commodore', name: '128', extensions: ['d81', 'prg'], core: ['vice_x128'], icons: ['Commodore_-_128.png'] },
    { system: 'amiga', manufacturer: 'Commodore', name: 'Amiga', extensions: ['adf', 'dms', 'fdi', 'ipf', 'adz', 'hdf', 'hdz', 'lha', 'slave', 'info', 'rp9'], core: ['puae'], icons: ['Commodore_-_Amiga.png', 'Commodore_-_Amiga-content.png'] },

    // ===== OTHER SYSTEMS =====
    { system: '3do', manufacturer: 'Panasonic', name: '3DO', extensions: ['3do'], core: ['opera'], icons: ['The_3DO_Company_-_3DO.png', 'The_3DO_Company_-_3DO-content.png'] },
    { system: 'coleco', manufacturer: 'Coleco', name: 'ColecoVision', extensions: ['col', 'cv', 'rom'], core: ['gearcoleco'], icons: ['Coleco_-_ColecoVision.png', 'Coleco_-_ColecoVision-content.png'] },
    { system: 'pce', manufacturer: 'NEC', name: 'PC Engine/TurboGrafx-16', extensions: ['pce', 'sgx'], core: ['mednafen_pce'], icons: ['NEC_-_PC_Engine_-_TurboGrafx_16.png', 'NEC_-_PC_Engine_-_TurboGrafx_16-content.png', 'NEC_-_PC_Engine_CD_-_TurboGrafx-CD.png', 'NEC_-_PC_Engine_CD_-_TurboGrafx-CD-content.png'] },
    { system: 'pcfx', manufacturer: 'NEC', name: 'PC-FX', extensions: ['pcfx', 'toc'], core: ['mednafen_pcfx'], icons: ['NEC_-_PC-FX.png', 'NEC_-_PC-FX-content.png'] },
    { system: 'ngp', manufacturer: 'SNK', name: 'Neo Geo Pocket/Color', extensions: ['ngp', 'ngc', 'ngpc', 'npc'], core: ['mednafen_ngp'], icons: ['SNK_-_Neo_Geo_Pocket.png', 'SNK_-_Neo_Geo_Pocket-content.png', 'SNK_-_Neo_Geo_Pocket_Color.png', 'SNK_-_Neo_Geo_Pocket_Color-content.png'] },
    { system: 'ws', manufacturer: 'Bandai', name: 'WonderSwan/WonderSwan Color', extensions: ['ws', 'wsc', 'pc2'], core: ['mednafen_wswan'], icons: ['Bandai_-_WonderSwan.png', 'Bandai_-_WonderSwan-content.png', 'Bandai_-_WonderSwan_Color.png', 'Bandai_-_WonderSwan_Color-content.png'] },
    { system: 'dos', manufacturer: 'Microsoft', name: 'DOS', extensions: ['exe', 'com', 'bat', 'conf', 'dosz'], core: ['dosbox_pure'], icons: ['DOS.png', 'DOS-content.png'] },
    { system: 'xbox', manufacturer: 'Microsoft', name: 'Xbox', extensions: ['xbe', 'xbox'], core: [], icons: ['Microsoft_-_Xbox.png'] },
    { system: 'xbox360', manufacturer: 'Microsoft', name: 'Xbox 360', extensions: ['x360'], core: [], icons: ['Microsoft_-_Xbox_360.png'] },
    { system: 'xboxone', manufacturer: 'Microsoft', name: 'Xbox One', extensions: ['xone'], core: [], icons: ['Microsoft_-_Xbox_One.png'] },
    { system: 'msx', manufacturer: 'Microsoft', name: 'MSX', extensions: ['msx', 'mx1'], core: [], icons: ['Microsoft_-_MSX.png', 'Microsoft_-_MSX-content.png'] },
    { system: 'msx2', manufacturer: 'Microsoft', name: 'MSX2', extensions: ['msx2', 'mx2'], core: [], icons: ['Microsoft_-_MSX2.png', 'Microsoft_-_MSX2-content.png'] },
    { system: 'cpc', manufacturer: 'Amstrad', name: 'CPC', extensions: ['cpc', 'dsk'], core: [], icons: ['Amstrad_-_CPC.png'] },
    { system: 'x68000', manufacturer: 'Sharp', name: 'Sharp X68000', extensions: ['x68', 'dim'], core: [], icons: ['Sharp_-_X68000.png'] },
    { system: 'pc98', manufacturer: 'NEC', name: 'PC-98', extensions: ['pc98', 'd88'], core: [], icons: ['NEC_-_PC-98.png'] },
    { system: 'zxspectrum', manufacturer: 'Sinclair', name: 'ZX Spectrum', extensions: ['zx', 'tzx', 'sna'], core: [], icons: ['Sinclair_-_ZX_Spectrum.png', 'Sinclair_-_ZX_Spectrum-content.png'] },
    { system: 'vectrex', manufacturer: 'GCE', name: 'Vectrex', extensions: ['vec'], core: [], icons: ['GCE_-_Vectrex.png', 'GCE_-_Vectrex-content.png'] },
    { system: 'scummvm', manufacturer: 'ScummVM', name: 'ScummVM', extensions: ['scummvm'], core: [], icons: ['ScummVM.png', 'ScummVM-content.png'] }
]
    ;





// Helper function to get compatible extensions
const compatibleExtensions = (() => {
    const extensions = new Set();
    SYSTEM_MAP.forEach(platform => {
        platform.extensions.forEach(ext => extensions.add(ext));
    });
    return Array.from(extensions);
})();

// Helper function to get platform by extension
function getPlatformsByExtension(extension) {
    return SYSTEM_MAP.filter(platform =>
        platform.extensions.includes(extension.toLowerCase())
    ) || [];
}

// Helper function to detect platform by arbitrary text, file name or folder
function possiblePlatforms(text) {
    if (typeof text !== 'string') {
        console.log('[system_map.js] possiblePlatforms: valor inesperado para text:', text);
        text = '';
    }

    text = text.trim().toLowerCase();


    detectedSystems = {};

    function addSystemMatch(systemEntry) {
        if (detectedSystems[systemEntry.system]) {
            detectedSystems[systemEntry.system][1]++;
        } else {
            detectedSystems[systemEntry.system] = [systemEntry, 1];
        }
    }



    if (text.includes('/') || text.includes('\\')) {
        var pathParts = text.split(/[\\/]/);
        for (const part of pathParts) {
            var pp = possiblePlatforms(part);
            if (pp) {

                for (const platform of pp) {
                    // platform is exactly an entry of System_map
                    addSystemMatch(platform);
                }
            }
        }

    } else {

        console.log(`[system_map.js] possiblePlatforms: analyzing text "${text}"`);



        let tryParts = [];

        // check if text is a filename
        if (text.includes('.')) {
            // is a filename
            let nameParts = text.split('.');
            let extension = nameParts.length > 0 ? nameParts.pop() : '';
            let name = nameParts.join('.');


            if (name) {
                console.log(`[system_map.js] possiblePlatforms: detected name "${name}"`);
                tryParts.push(name);
            }

            if (extension) {
                console.log(`[system_map.js] possiblePlatforms: detected extension "${extension}"`);
                extPlatforms = getPlatformsByExtension(extension);
                if (extPlatforms) {
                    console.log(`[system_map.js] possiblePlatforms: detected compatible extension "${extension}"`);
                    extPlatforms.forEach(platform => {
                        addSystemMatch(platform);
                    });
                }
                tryParts.push(extension);
            }

        } else {
            // just split everything by spaces
            tryParts = text.split('/').join(' ').split(' ');
        }

        // remove empty or blank parts
        tryParts = tryParts.map(part => part?.trim() || '').filter(part => part.length > 0);


        SYSTEM_MAP.forEach(systemEntry => {

            tryParts.forEach(part => {

                [systemEntry.manufacturer, systemEntry.name, systemEntry.system, ...systemEntry.core, ...systemEntry.extensions, ...systemEntry.icons].forEach(sp => {
                    systemPart = (sp || '').toLowerCase().split('_').join(' ').split('/').join(' ');
                    if (systemPart.length > 0) {

                        if (systemPart.toLowerCase().includes(part)) {
                            console.log(`Matched part "${part}" with system part "${systemPart}" for system "${systemEntry.system}"`);
                            addSystemMatch(systemEntry);
                        }
                        if (systemPart.toLowerCase() === part) {
                            console.log(`Exact match for part "${part}" with system part "${systemPart}" for system "${systemEntry.system}"`);
                            addSystemMatch(systemEntry);
                        }
                    }

                });

            });
        });
    }

    // convert detectedSystems to array and sort by count (most matches first)
    const detectedArray = Object.values(detectedSystems);
    detectedArray.sort((a, b) => b[1] - a[1]);
    const finalArray = detectedArray
        .map(entry => entry[0]);
    console.log('Detected platforms:', finalArray);
    return finalArray;

}
// Helper function to detect the first platform by arbitrary text, file name or folder
function tryDetectPlatform(text) {

    if (!text) return null;

    // try get exactly matching system first
    let platform = SYSTEM_MAP.find((platform) => platform.system.toLowerCase() === text.toLowerCase()) || null;
    if (platform) return platform;
    // otherwise, use possiblePlatforms
    var plats = possiblePlatforms(text);

    // return the first platform with more points
    return plats.length > 0 ? plats[0] : null;
}


// Helper function to get all icons from all platforms
// MainIcons: true = only main icons, false = only -content icons, null = all icons
function getAllIcons(theme, mainIcons) {
    theme = theme || 'monochrome';
    const icons = [];
    SYSTEM_MAP.forEach(platform => {
        if (platform.icons && Array.isArray(platform.icons)) {
            platform.icons.forEach(iconName => {
                icons.push({
                    name: iconName,
                    platform: platform.name,
                    system: platform.system,
                    manufacturer: platform.manufacturer,
                    path: `/icons/${theme}/${iconName}`
                });
            });
        }
    });

    mainIcons = mainIcons || null;
    if (mainIcons === false) {
        icons = icons.filter(icon => icon.name.toLowerCase().includes('-content'));
    } else if (mainIcons === true) {
        icons = icons.filter(icon => !icon.name.toLowerCase().includes('-content'));
    }

    return icons;
}


// Helper function to detect icons from text
function detectIcons(text, theme, mainIcons) {
    const icons = [];

    // Get candidate platforms using existing logic
    const platforms = possiblePlatforms(text);

    theme = theme || 'monochrome';
    platforms.forEach(platform => {

        if (!platform || !platform.icons) {
            return
        }


        platform.icons.forEach(function (iconName) {

            if (platform.icons.length > 1) {

                if (mainIcons === true && iconName.toLowerCase().includes('-content')) {
                    return; // skip -content icons
                }
                if (mainIcons === false && !iconName.toLowerCase().includes('-content')) {
                    return; // skip main icons
                }
            }

            return icons.push({
                name: iconName,
                path: `/icons/${theme}/${iconName}`,
                platform: platform.name,
                system: platform.system
            });
        });

    });
    return icons;
}

// Helper function to get best icon
// If text is a file with compatible extension, prefer -content icons
// Otherwise, prefer main icons (without -content)
function detectBestIcon(text, theme) {
    if (!text) return null;
    // Check if text appears to be a file with extension
    const hasExtension = text.includes('.') && !text.endsWith('.');
    // Get multiple results to have options
    let results = detectIcons(text, theme, hasExtension ? false : null);
    if (results.length === 0) return null;
    return results[0];
}

// Function to get all systems that can run a file with a given extension
// Returns an array of systems
function getAllSystemsFromFile(filename) {
    if (filename) {
        const ext = filename.indexOf('.') === -1 ? filename : filename.split('.').pop().toLowerCase()
        return SYSTEM_MAP.filter(platform =>
            platform.extensions.includes(ext)
        );
    }
    return [];
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

// Export for Node.js (backend)
if (typeof module !== 'undefined' && module.exports) {
    console.log('[system_map.js] Exporting module for Node.js');
    console.log('[system_map.js] compatibleExtensions type:', typeof compatibleExtensions);
    console.log('[system_map.js] compatibleExtensions isArray:', Array.isArray(compatibleExtensions));
    console.log('[system_map.js] compatibleExtensions length:', compatibleExtensions ? compatibleExtensions.length : 'undefined');

    // Export detectIcons também como detectIcon para compatibilidade
    module.exports = {
        SYSTEM_MAP,
        compatibleExtensions,
        detectBestIcon,
        detectIcons,
        tryDetectPlatform,
        possiblePlatforms,
        cleanFilename,
        getPlatformByExtension: getPlatformsByExtension,
        getAllSystemsFromFile,
        getAllIcons
    };

    console.log('[system_map.js] Module exported. Keys:', Object.keys(module.exports).join(', '));
}
