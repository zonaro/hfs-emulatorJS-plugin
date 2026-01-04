# EmulatorJS Plugin for HFS

A plugin for [HFS (HTTP File Server)](https://github.com/rejetto/hfs) that integrates [EmulatorJS](https://emulatorjs.org/) allowing you to run ROMs from various retro consoles directly in the browser.

## 🎮 Features

- ✅ Support for multiple systems (NES, SNES, Mega Drive, PlayStation, and more)
- ✅ Seamless integration with HFS
- ✅ Integrated modal or new tab interface
- ✅ Context menu to open games
- ✅ Support for multiple EmulatorJS versions (stable, latest, nightly)
- ✅ Configurable via HFS admin panel
- ✅ **Automatic game cover display with smart crawling**
- ✅ **Configurable covers folder with intelligent fallback**
- ✅ **NEW: Game cover search and download from IGDB**
- ✅ **NEW: Cover display as file thumbnails in HFS**
- ✅ **NEW: Local image override support (jpg, jpeg, png)**

## 🎯 Supported Systems

### Nintendo
- NES/Famicom (`.nes`, `.fds`)
- SNES (`.snes`, `.smc`)
- Game Boy (`.gb`)
- Game Boy Color (`.gbc`)
- Game Boy Advance (`.gba`)
- Nintendo 64 (`.n64`, `.z64`)
- Nintendo DS (`.nds`)
- Virtual Boy (`.vb`)

### Sega
- Mega Drive (`.gen`, `.md`, `.smd`)
- Game Gear (`.gg`)
- Master System (`.sms`)
- Saturn (`.sat`)
- Sega 32X (`.32x`)

### Atari
- Atari 2600 (`.a26`)
- Atari 5200 (`.a52`)
- Atari 7800 (`.a78`)
- Lynx (`.lnx`)
- Jaguar (`.j64`)

### Others
- PlayStation (`.cue`, `.cimg`)
- PlayStation Portable (`.pbp`)
- Arcade/MAME (`.zip`)
- Commodore 64 (`.prg`, `.d64`)
- Commodore Amiga (`.adf`)
- Commodore VIC-20 (`.tap`)
- ColecoVision (`.col`)

## 📦 Installation

1. Copy the `emulatorJS-plugin` folder to `.hfs/plugins/`
   ```bash
   cp -r emulatorJS-plugin ~/.hfs/plugins/
   ```
## 🔑 IGDB API Setup (For Cover Search Feature)

To use the game cover search feature, you need to set up IGDB API credentials:

### 1. Create Twitch Account
If you don't already have one:
- Go to https://www.twitch.tv and create an account
- Enable Two-Factor Authentication in account settings

### 2. Register Your Application
1. Visit https://dev.twitch.tv/console/apps/create
2. Create a new application with any name (e.g., "HFS EmulatorJS")
3. Set "OAuth Redirect URL" to: `http://localhost` (not used, but required)
4. Set "Client Type" to **Confidential**
5. Click "Create"

### 3. Get Your Credentials
1. Go to your app settings: https://dev.twitch.tv/console/apps
2. Copy your **Client ID**
3. Click "Manage" → "New Secret" to generate **Client Secret**
4. Copy the **Client Secret**

### 4. Configure in HFS Admin Panel
1. Open HFS Admin Panel
2. Go to Plugins → EmulatorJS Plugin
3. Fill in the two new fields:
   - **IGDB Client ID**: Paste your Client ID
   - **IGDB Client Secret**: Paste your Client Secret
4. Click "Save"
5. Done! The cover search feature is now enabled

## ⚙️ Configuration

In the HFS admin panel, you will find the following options:

### Enable EmulatorJS
- Activates/deactivates the plugin completely

### EmulatorJS Version
- **Stable** (`stable`): Most stable and tested version
- **Latest** (`latest`): Most recent code with stable colors
- **Nightly** (`nightly`): Most recent code and colors (alpha)

### Show button in file menu
- Displays the "Play" and "Set Cover" options in the context menu of files

## 🖼️ Game Covers

### How Cover Search Works
1. Right-click on a ROM file in HFS
2. Select "Set Cover" from the context menu
3. Search for the game name (IGDB will return results)
4. Click on a game to see its cover
5. Click "Download & Set Cover" to download and save

### Cover Storage
Covers are saved in the plugin folder: `plugin/covers/rom_name/cover.jpg`

### Priority Order for Cover Display
1. **Local image in ROM folder** - If you have a `.jpg`, `.jpeg`, or `.png` file with the same name as the ROM in the same directory
2. **Downloaded cover from IGDB** - Cover saved in the plugin's covers folder
3. **Default icon** - If no cover is found

**Example:**
```
/Games/NES/
  ├── Super Mario.nes
  ├── Super Mario.jpg      ← This will be used as cover
  
/hfs-plugin/covers/
  └── Super Mario/
      └── cover.jpg        ← This is the IGDB download
```

## 🎮 Usage

### Playing Games
1. Navigate to a folder containing ROMs
2. Right-click on a supported ROM file
3. Select "Play (System Name)" from the context menu

### Setting Game Covers
1. Right-click on a ROM file
2. Select "Set Cover" from the context menu
3. Type the game name (minimum 3 characters)
4. Search results will appear with cover previews
5. Click on a game to select it
6. Click "Download & Set Cover" to save the cover

2. Click the "Open in Emulator" button

## 🔧 Plugin Structure

```
emulatorJS-plugin/
├── plugin.js          # Plugin backend
├── public/
│   ├── emulator.js   # Frontend/emulator logic
│   └── emulator.css  # Styles
└── README.md         # This file
```

## 📝 Supported Extensions

The plugin automatically recognizes file extensions and maps them to the appropriate system:

| Extension | System |
|----------|--------|
| .nes, .fds | NES |
| .snes, .smc | SNES |
| .gb, .gbc | Game Boy |
| .gba | Game Boy Advance |
| .n64, .z64 | Nintendo 64 |
| .nds | Nintendo DS |
| .gen, .md, .smd | Mega Drive |
| .gg | Game Gear |
| .cue, .cimg | PlayStation |
| .pbp | PSP |
| .zip | Arcade/MAME |
| .prg, .d64 | Commodore 64 |

## 🌐 EmulatorJS CDN

The plugin uses the official EmulatorJS CDN at `https://cdn.emulatorjs.org/`.

Available versions are:
- `stable`: Stable version (default)
- `latest`: Latest code with stable colors
- `nightly`: Latest code and colors

## 📋 Requirements

- HFS v0.51.0 or higher (API v8.65+)
- Modern browser with WebGL support
- Internet connection to load EmulatorJS via CDN

## 🐛 Troubleshooting

### Emulator doesn't load
- Check your internet connection (EmulatorJS is loaded from CDN)
- Try changing the EmulatorJS version in settings
- Check the browser console (F12) for errors

### File not recognized
- Make sure the file extension is correct
- Check the list of supported extensions above

### Controls don't work
- See EmulatorJS documentation at https://emulatorjs.org/docs/

## � Save Management (NEW!)

The plugin now includes a complete save synchronization system for authenticated users:

### Features
- **Per-user saves**: Each user has their own save storage
- **Per-game organization**: Saves organized by `{username}/{game_name}/`
- **Dual storage**: Saves stored locally (IndexedDB) and on server
- **Automatic sync**: Syncs to server when online
- **Offline mode**: Works offline, syncs when connection restored
- **Persistent storage**: All saves preserved in `.hfs/plugins/emulatorjs-plugin/storage/`

### Usage
Saves are automatically managed for authenticated users. No configuration needed!

For developer integration, see [SAVE_SYNC_GUIDE.md](SAVE_SYNC_GUIDE.md) and [SAVE_INTEGRATION_EXAMPLE.js](SAVE_INTEGRATION_EXAMPLE.js).

## 📄 License

This plugin follows the same license as HFS.

## 🔗 Useful Resources

- [HFS - HTTP File Server](https://github.com/rejetto/hfs)
- [EmulatorJS](https://emulatorjs.org/)
- [HFS Plugin Development Guide](https://github.com/rejetto/hfs/blob/main/dev-plugins.md)
- [Save Sync Guide](SAVE_SYNC_GUIDE.md)
- [Implementation Summary](IMPLEMENTATION_SUMMARY.md)

## 💬 Support

For reporting issues or suggesting improvements, open an issue in the repository.

## 🎉 Recent Features

- ✅ **Save Synchronization System** - Persistent per-user saves with automatic sync
- ✅ Game covers with intelligent fallback
- ✅ Multiple system support
- ✅ Multiple EmulatorJS versions

---

**Version**: 1.1  
**Last Update**: January 4, 2026
  
**Last Updated**: January 2026
