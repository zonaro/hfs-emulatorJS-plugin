# EmulatorJS Plugin for HFS

[EmulatorJS](https://emulatorjs.org/) integration for [HFS (HTTP File Server)](https://github.com/rejetto/hfs).

This plugin turns your HFS file server into a retro-gaming front end: browse to a
folder with ROMs and launch classic console games directly in the browser — no
desktop emulator required. It also adds console icons, IGDB-powered covers and
game metadata, and per-user cloud saves (save states and SRAM).

> Plugin version: **1.5** · Requires HFS API **12.9+**

---

## Features

- **Play ROMs in the browser** — adds one or more **Play** entries to the file
  context menu for every compatible ROM. Games run inline in a modal using
  EmulatorJS cores loaded from the EmulatorJS CDN.
- **Multiple emulators per extension** — when a file extension is compatible with
  more than one system, one Play option is shown per system/core (for example a
  `.bin` file offers both *PlayStation* and *Mega Drive*).
- **Automatic system detection** — `system_map.js` detects the console from the
  file extension, the file name and the folder path, so no manual tagging is
  needed.
- **Console icons** — ROMs and folders automatically get a console/system icon,
  with five icon themes and 120 icons per theme.
- **Custom folder icons (admin)** — set or remove a console icon for any folder
  that contains ROMs.
- **IGDB game info & covers (admin)** — search the
  [IGDB](https://www.igdb.com/) database, view full game details and download
  official cover art.
- **Cloud saves per user** — save states, screenshots and SRAM saves are stored
  per HFS user, so progress follows the account across devices.
- **Configurable** — choose the EmulatorJS version (stable/latest/nightly) and
  the icon theme from the HFS admin panel.

---

## Requirements

- A running **HFS** server with plugin API **12.9 or newer**.
- A modern browser with WebAssembly support.
- *(Optional, for IGDB covers/metadata)* Twitch application **Client ID** and
  **Client Secret**. See [IGDB_SETUP.md](IGDB_SETUP.md).
- Internet access on the client, since emulator cores and the EmulatorJS loader
  are served from the EmulatorJS CDN
  (`https://cdn.emulatorjs.org/<version>/data/`).

---

## Installation

The plugin ships as plain source in the [`dist/`](dist) folder
(`plugin.js` + `public/`). Install it by copying that folder's contents into the
HFS `plugins` directory.

### Manual installation

1. Locate your HFS plugins folder, for example:
   - Windows: `D:\hfs\plugins\`
   - Linux/macOS: `<hfs-config-dir>/plugins/`
2. Create a folder named `emulatorJS-plugin`.
3. Copy the **contents** of `dist/` into it so the layout looks like:

   ```
   plugins/
   └── emulatorJS-plugin/
       ├── plugin.js
       └── public/
           ├── emulator.css
           ├── emulator.js
           ├── system_map.js
           └── icons/
   ```

4. Restart HFS (or reload plugins) and enable **EmulatorJS** in the admin panel.

### Automatic installation (Windows)

The included [`deploy.ps1`](deploy.ps1) script copies `dist/` into the HFS
plugins folder.

1. Open `deploy.ps1` and adjust `$destDir` if your HFS folder is not
   `D:\hfs\plugins\emulatorJS-plugin`.
2. Run it from a PowerShell prompt:

   ```powershell
   powershell -ExecutionPolicy Bypass -File .\deploy.ps1
   ```

   Or use the VS Code task **"Deploy para HFS"** (default build task).

---

## Configuration

Open **HFS Admin Panel → Plugins → EmulatorJS**. All settings take effect
immediately — no restart required.

| Setting | Description | Default |
| --- | --- | --- |
| **EmulatorJS Version** | EmulatorJS release channel: `Stable`, `Latest` or `Nightly`. | `Stable` |
| **Icon Theme** | Visual style of console icons: `Automatic`, `Monochrome`, `Daite`, `FlatUX`, `Systematic`. | `Systematic` |
| **IGDB Client ID** | Twitch application Client ID (for covers & game info). | — |
| **IGDB Client Secret** | Twitch application Client Secret (kept secret). | — |

To enable IGDB features, follow the step-by-step guide in
[IGDB_SETUP.md](IGDB_SETUP.md).

---

## Usage

### Playing a game

1. Browse to a folder that contains ROMs in the HFS web interface.
2. Open the context menu for a ROM file (three-dot / right-click).
3. Select **Play**.
4. If the extension maps to multiple systems, pick the desired system — each
   entry shows the system name and core (e.g. `Play — PlayStation/PS1 · pcsx_rearmed`).

The game opens in a fullscreen, inline emulator modal.

### Admin options

When logged in as an administrator, extra entries appear in the context menu:

| Entry | Scope | Description |
| --- | --- | --- |
| **Game Info** | ROM file | View IGDB details (summary, ratings, genres, platforms, release dates, etc.). |
| **Set Cover** | ROM file | Search IGDB (or paste a direct image URL) and download the cover. |
| **Remove Cover** | ROM file | Delete the stored cover for the ROM. |
| **View Cover** | ROM file | Preview the current cover. |
| **Set Console Icon** | ROM folder | Pick a console icon for a folder that contains ROMs. |
| **Remove Console Icon** | ROM folder | Remove a folder's custom icon. |

---

## Supported Systems

Detection is based on file extension, file name and folder name. A subset of
systems has a ready-to-use EmulatorJS core and therefore exposes the **Play**
action; systems marked with `—` are recognized (icons/detection) but have no
bundled core yet.

| Manufacturer | System | Extensions | Core |
| --- | --- | --- | --- |
| Nintendo | NES / Famicom | `nes`, `fds`, `unif`, `unf` | fceumm |
| Nintendo | SNES / Super Famicom | `snes`, `smc`, `sfc`, `fig`, `gd3`, `gd7`, `dx2`, `bsx`, `swc` | snes9x |
| Nintendo | Nintendo 64 | `n64`, `z64`, `v64` | mupen64plus_next |
| Nintendo | Game Boy / Color | `gb`, `gbc`, `sgb` | gambatte |
| Nintendo | Game Boy Advance | `gba` | mgba |
| Nintendo | DS | `nds` | melonds |
| Nintendo | Virtual Boy | `vb`, `vboy` | beetle_vb |
| Nintendo | 3DS | `3ds`, `cia` | — |
| Nintendo | GameCube | `rvz`, `gcz`, `gcm`, `iso` | — |
| Nintendo | Wii / Wii U | `wbfs`, `wia`, `iso` / `wud`, `wux`, `rpx`, `wua` | — |
| Nintendo | Switch | `nsp`, `xci`, `nsz`, `xcz` | — |
| Nintendo | Pokémon Mini | `min` | — |
| Sega | Mega Drive / Genesis | `md`, `smd`, `gen`, `sg`, `bin` | genesis_plus_gx |
| Sega | Master System | `sms` | smsplus |
| Sega | Game Gear | `gg` | genesis_plus_gx |
| Sega | Sega CD | `cue`, `chd` | genesis_plus_gx |
| Sega | 32X | `32x` | picodrive |
| Sega | Saturn | `ccd`, `mds` | yabause |
| Sega | Dreamcast | `cdi`, `gdi` | — |
| Sega | SG-1000 / PICO | `sg1000` / `pico` | — |
| Sony | PlayStation | `bin`, `iso`, `img`, `toc`, `exe`, `m3u`, `cue`, `chd`, `ecm` | pcsx_rearmed |
| Sony | PSP | `pbp`, `cso`, `elf`, `prx`, `iso` | ppsspp |
| Sony | PlayStation 2 | `ps2` | — |
| Sony | PS Vita | `psv`, `vita` | — |
| Atari | 2600 | `a26`, `bin` | stella2014 |
| Atari | 5200 | `a52`, `car` | a5200 |
| Atari | 7800 | `a78` | prosystem |
| Atari | Lynx | `lnx`, `lyx`, `o` | handy |
| Atari | Jaguar | `j64`, `jag` | virtualjaguar |
| Arcade | Arcade / MAME | `zip`, `7z` | fbneo |
| SNK | Neo Geo | `neo` | fbneo |
| SNK | Neo Geo CD | `neocd` | — |
| SNK | Neo Geo Pocket / Color | `ngp`, `ngc`, `ngpc`, `npc` | mednafen_ngp |
| Capcom | CPS1 / CPS2 / CPS3 | `cps1` / `cps2` / `cps3` | fbneo |
| Commodore | Commodore 64 | `d64`, `g64`, `x64`, `t64`, `tap`, `prg`, `p00`, `crt` | vice_x64sc |
| Commodore | VIC-20 / C128 | `tap` / `d81`, `prg` | vice_xvic / vice_x128 |
| Commodore | Amiga | `adf`, `dms`, `fdi`, `ipf`, `adz`, `hdf`, `hdz`, `lha`, `slave`, `info`, `rp9` | puae |
| Panasonic | 3DO | `3do` | opera |
| Coleco | ColecoVision | `col`, `cv`, `rom` | gearcoleco |
| NEC | PC Engine / TurboGrafx-16 | `pce`, `sgx` | mednafen_pce |
| NEC | PC-FX | `pcfx`, `toc` | mednafen_pcfx |
| NEC | PC-98 | `pc98`, `d88` | — |
| Bandai | WonderSwan / Color | `ws`, `wsc`, `pc2` | mednafen_wswan |
| Microsoft | DOS | `exe`, `com`, `bat`, `conf`, `dosz` | dosbox_pure |
| Microsoft | MSX / MSX2 | `msx`, `mx1` / `msx2`, `mx2` | — |
| Microsoft | Xbox / Xbox 360 / Xbox One | `xbe`, `xbox` / `x360` / `xone` | — |
| Amstrad | CPC | `cpc`, `dsk` | — |
| Sharp | X68000 | `x68`, `dim` | — |
| Sinclair | ZX Spectrum | `zx`, `tzx`, `sna` | — |
| GCE | Vectrex | `vec` | — |
| ScummVM | ScummVM | `scummvm` | — |

The full, authoritative mapping lives in
[`dist/public/system_map.js`](dist/public/system_map.js).

---

## Data & Storage

The plugin stores everything inside its HFS storage directory:

```
<plugin-storage>/
├── covers/      # downloaded cover images, named after the ROM
├── gameinfo/    # cached IGDB game info (JSON, one file per ROM)
├── saves/
│   └── <username>/
│       └── <game>/
│           ├── save.state   # save state
│           ├── save.png     # save-state screenshot
│           └── save.srm     # battery / SRAM save
└── icon-mappings.json       # custom folder → icon mappings
```

Covers can also be placed manually: create a `.jpg` or `.png` file named after
the ROM (e.g. `Super Mario.nes.jpg`) inside `covers/`.

---

## Project Structure

```
.
├── dist/
│   ├── plugin.js              # HFS backend plugin (routes, IGDB, storage)
│   └── public/
│       ├── emulator.js        # frontend: menus, modals, emulator launcher
│       ├── emulator.css       # modal & player styles
│       ├── system_map.js      # system database + detection helpers
│       └── icons/<theme>/     # console icons (5 themes × 120 icons)
├── deploy.ps1                 # Windows deploy helper (copies dist/ to HFS)
├── IGDB_SETUP.md              # IGDB/Twitch credentials setup guide
├── CHANGELOG_MULTI_PLAY.md    # notes on multi-emulator Play support
└── .vscode/                   # VS Code deploy task and MCP config
```

---

## Credits

- [EmulatorJS](https://emulatorjs.org/) — browser-based emulation front end.
- [HFS](https://github.com/rejetto/hfs) by rejetto — HTTP File Server.
- [IGDB](https://www.igdb.com/) — game database and cover art.
- Console icons from the community icon sets (Daite, FlatUX, Systematic, Monochrome).
