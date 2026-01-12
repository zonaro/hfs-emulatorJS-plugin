

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

    'ecm': [
        { system: 'psx', name: 'PlayStation', core: [ /* ecm isint really compatible, but is playstation*/], icon: 'PSX_-_Sony_-_PlayStation.png' }
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

const compatibleExtensions = Object.keys(SYSTEM_MAP);

// if is node.js module, export SYSTEM_MAP

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SYSTEM_MAP,
        compatibleExtensions
    };

}


