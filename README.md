# EmulatorJS Plugin - Emulation and Game Management directly into you HFS

A powerful plugin for [HFS (HTTP File Server)](https://github.com/rejetto/hfs) that integrates [EmulatorJS](https://emulatorjs.org/), enabling you to play ROM files from dozens of classic gaming systems directly in your browser.

## 🎮 Features

- ✅ **Extensive System Support** - 40+ classic gaming systems (Nintendo, Sega, Sony, Atari, Arcade, and more)
- ✅ **Smart Cover Display** - Automatic game cover thumbnails with multiple fallback options
- ✅ **IGDB Integration** - Search and download game covers, metadata, and game information from IGDB
- ✅ **Game Metadata** - Display detailed game information including ratings, genres, developers, publishers, and more
- ✅ **Multi-System Support** - Some files can run on multiple systems (e.g., `.bin`, `.cue`) with automatic detection
- ✅ **Admin Console Icons** - Custom folder icons for different game systems
- ✅ **Context Menu Integration** - Easy "Play" buttons with system detection
- ✅ **Multiple EmulatorJS Versions** - Choose between stable, latest, or nightly builds
- ✅ **Admin-Only Features** - Game info and cover management restricted to administrators
- ✅ **Seamless HFS Integration** - Native file menu integration with metadata display

## 🎯 Supported Systems

### Nintendo
- **NES/Famicom** (`.nes`, `.fds`, `.unif`, `.unf`)
- **SNES/Super Famicom** (`.snes`, `.smc`, `.sfc`, `.fig`, `.gd3`, `.gd7`, `.dx2`, `.bsx`, `.swc`)
- **Game Boy** (`.gb`)
- **Game Boy Color** (`.gbc`, `.sgb`)
- **Game Boy Advance** (`.gba`)
- **Nintendo 64** (`.n64`, `.z64`, `.v64`)
- **Nintendo DS** (`.nds`)
- **Virtual Boy** (`.vb`, `.vboy`)

### Sega
- **Mega Drive/Genesis** (`.md`, `.smd`, `.gen`, `.sg`)
- **Master System** (`.sms`)
- **Game Gear** (`.gg`)
- **Sega CD** (`.cue`, `.chd`)
- **Sega 32X** (`.32x`)
- **Sega Saturn** (`.ccd`, `.mds`)

### Sony
- **PlayStation** (`.cue`, `.chd`, `.bin`, `.iso`, `.img`, `.toc`, `.exe`, `.m3u`)
- **PlayStation Portable** (`.pbp`, `.cso`, `.elf`, `.prx`)

### Atari
- **Atari 2600** (`.a26`, `.bin`)
- **Atari 5200** (`.a52`, `.car`)
- **Atari 7800** (`.a78`)
- **Atari Lynx** (`.lnx`, `.lyx`, `.o`)
- **Atari Jaguar** (`.j64`, `.jag`)

### Commodore
- **Commodore 64** (`.d64`, `.g64`, `.x64`, `.t64`, `.tap`, `.prg`, `.p00`, `.crt`)
- **Commodore 128** (`.d81`, `.prg`)
- **Commodore VIC-20** (`.tap`)
- **Commodore Plus/4** (`.prg`, `.tap`)
- **Commodore PET** (`.prg`, `.tap`)
- **Commodore Amiga** (`.adf`, `.dms`, `.fdi`, `.ipf`, `.adz`, `.hdf`, `.hdz`, `.lha`, `.slave`, `.info`, `.rp9`)

### Arcade & Others
- **Arcade/MAME** (`.zip`, `.7z`)
- **ColecoVision** (`.col`, `.cv`, `.rom`)
- **PC Engine/TurboGrafx-16** (`.pce`, `.sgx`)
- **PC-FX** (`.pcfx`, `.toc`)
- **Neo Geo Pocket** (`.ngp`, `.ngc`, `.ngpc`, `.npc`)
- **WonderSwan** (`.ws`, `.wsc`, `.pc2`)
- **3DO** (`.3do`)
- **DOS/DOSBox** (`.exe`, `.com`, `.bat`, `.conf`, `.dosz`)

## 📦 Installation

1. Download or clone the plugin repository
2. Copy the entire `hfs-emulatorJS-plugin` folder to your HFS plugins directory:
   - **Default location**: `%APPDATA%/HFS/plugins/` (Windows) or `~/.hfs/plugins/` (Linux/macOS)
3. Restart HFS
4. The plugin should appear in the HFS admin panel under **Plugins → EmulatorJS Plugin**

## 🔑 IGDB API Setup (Required for Game Cover & Info Features)

The IGDB integration allows you to search for game covers and detailed game information (ratings, genres, developers, etc.). Setup is quick and free:

### Step 1: Create a Twitch Account
If you don't already have one:
- Go to https://www.twitch.tv and create an account
- (Two-Factor Authentication recommended but not required)

### Step 2: Register Your Application
1. Visit https://dev.twitch.tv/console/apps/create
2. Enter any application name (e.g., "HFS EmulatorJS")
3. Select **OAuth Redirect URL** and set it to: `http://localhost`
4. Select **Client Type** as **Confidential**
5. Click **Create**

### Step 3: Get Your API Credentials
1. Go to https://dev.twitch.tv/console/apps
2. Click your application name
3. Copy your **Client ID** from the main settings
4. Click **Manage** and create a **New Secret**, then copy your **Client Secret**

### Step 4: Configure in HFS Admin Panel
1. Open the HFS admin panel
2. Navigate to **Plugins → EmulatorJS Plugin**
3. Fill in the configuration fields:
   - **IGDB Client ID**: Paste your Client ID
   - **IGDB Client Secret**: Paste your Client Secret
4. Click **Save**
5. Done! You can now search for covers and game information

## ⚙️ Configuration

Access plugin settings from the HFS admin panel under **Plugins → EmulatorJS Plugin**.

### Basic Settings

**Enable EmulatorJS Plugin**
- Toggle the entire plugin on/off (default: enabled)

**Show File Menu Options**
- Display Play buttons and Game Info/Cover options in file context menus (default: enabled)

### EmulatorJS Version
Select which EmulatorJS build to use:
- **`stable`** (default) - Most tested and reliable version
- **`latest`** - Recent code with stable color support
- **`nightly`** - Cutting-edge code with latest features (alpha quality)

### IGDB API Configuration
- **IGDB Client ID** - Required for cover search and game information lookup
- **IGDB Client Secret** - Required for cover search and game information lookup

## 🖼️ Game Covers & Icons

### Cover Priority System
The plugin uses a smart fallback system for displaying game covers:

1. **Local ROM Folder Cover** (Highest Priority) - If you place a `.jpg`, `.jpeg`, or `.png` file with the same name as the ROM in the same directory, it will be used as the cover
2. **Downloaded IGDB Cover** - If you've downloaded a cover from IGDB using the "Set Cover" feature
3. **Folder Custom Icon** - If an admin has assigned a custom console icon to the folder
4. **Default Console Icon** - A generic console icon for the detected system
5. **Generic Game Controller Icon** (Lowest Priority) - Fallback for undetected file types

**Example folder structure:**
```
Games/
├── NES/
│   ├── Super Mario Bros.nes
│   └── Super Mario Bros.jpg        ← Used as cover
│
├── SNES/
│   ├── Super Mario World.snes
│   └── (cover-folder-icon.png)    ← Admin-set folder icon
│
└── PlayStation/
    └── Final Fantasy VII.cue       ← Uses downloaded IGDB cover
```

### Setting Game Covers (Admin Only)

1. Click on any ROM file in HFS
2. Select **"Set Cover"** from the context menu
3. Type the game name (minimum 3 characters) to search IGDB
4. Browse through search results with cover previews
5. Click on the desired game to select it
6. Click **"Download & Set Cover"** to save the cover locally

Covers are stored in the plugin's data directory with the ROM filename as the folder name.

### Setting Folder Icons (Admin Only)

1. Click on a folder containing ROMs
2. Select **"Set Folder Icon"** from the context menu
3. Search for a console system (the plugin auto-detects compatible systems in the folder)
4. Click to select the console icon
5. The icon is saved and will display for all games in that folder

Supported console icons include all major systems: NES, SNES, Genesis, PlayStation, Game Boy, and many more.

## 🎮 Usage Guide

### Playing Games

1. Navigate to a folder containing ROM files in HFS
2. Click on any supported ROM file
3. Select **"Play"** (or the specific system name if multiple systems are supported for that file type)
4. The game will open in EmulatorJS in a new browser tab
5. Use standard emulator controls (see EmulatorJS documentation for system-specific controls)

**Multi-System Support:** Some file formats (`.bin`, `.cue`, `.chd`, `.exe`) can run on multiple systems. When you click such a file, you'll see multiple "Play" options, each for a different system.

### Viewing Game Information (Admin Only)

1. Click on a ROM file
2. Select **"Game Info"** from the context menu
3. Type a game name (minimum 3 characters) to search IGDB
4. Browse detailed information including:
   - User ratings and critic scores
   - Game description/summary
   - Genres, themes, and game modes
   - Developers and publishers
   - Game engines
   - Supported languages
   - Player perspectives
   - Age ratings
   - Alternative names
   - Cover artwork

5. Selected game information is automatically saved and displayed in the file properties

### Viewing Game Properties in File List

Once game information has been looked up, properties like **Game Title**, **Ratings**, **Genres**, **Platforms**, **Developers**, and more will automatically display in the file properties panel when you select a game.

 

## 📝 File Extension Reference

The plugin automatically recognizes hundreds of file extensions. Here's a quick reference:

| Extensions | System | Notes |
|-----------|--------|-------|
| `.nes`, `.fds`, `.unif`, `.unf` | NES/Famicom | |
| `.snes`, `.smc`, `.sfc` | SNES | |
| `.gb`, `.gbc`, `.sgb` | Game Boy | |
| `.gba` | Game Boy Advance | |
| `.n64`, `.z64`, `.v64` | Nintendo 64 | |
| `.nds` | Nintendo DS | |
| `.vb`, `.vboy` | Virtual Boy | |
| `.md`, `.smd`, `.gen`, `.sg` | Mega Drive/Genesis | |
| `.sms` | Master System | |
| `.gg` | Game Gear | |
| `.cue`, `.chd` | Sega CD / PlayStation | Multi-system (see file) |
| `.32x` | Sega 32X | |
| `.ccd`, `.mds` | Saturn | |
| `.iso`, `.bin`, `.img`,  `.m3u` | PlayStation | Some support multiple systems |
| `.pbp`, `.cso`, `.elf`, `.prx` | PlayStation Portable | |
| `.zip`, `.7z` | Arcade/MAME | |
| `.a26` | Atari 2600 | |
| `.a52`, `.car` | Atari 5200 | |
| `.a78` | Atari 7800 | |
| `.lnx`, `.lyx` | Atari Lynx | |
| `.j64`, `.jag` | Atari Jaguar | |
| `.d64`, `.g64`, `.t64`, `.prg`, `.crt` | Commodore 64 | |
| `.d81` | Commodore 128 | |
| `.adf`, `.hdf`, `.ipf` | Commodore Amiga | |
| `.col`, `.cv` | ColecoVision | |
| `.pce`, `.sgx` | PC Engine/TurboGrafx | |
| `.ws`, `.wsc` | WonderSwan | |
| `.ngp`, `.ngc` | Neo Geo Pocket | |
| `.exe`, `.com`, `.bat` | DOS | |
| `.3do` | 3DO | |

**Note:** Some extensions (like `.bin`, `.cue`, `.chd`, `.exe`) can map to multiple systems. The plugin will show multiple Play buttons for these files.

## 🌐 EmulatorJS CDN Versions

The plugin loads EmulatorJS from the official CDN at `https://cdn.emulatorjs.org/`. You can select from three build versions:

- **`stable`** - Tested production build with stable emulator cores (recommended for most users)
- **`latest`** - Recent updates with stable color support; more features than stable
- **`nightly`** - Latest development code with newest features and color schemes (may be unstable)

The selected version is configurable in the admin panel and applies globally to all users.

## 📋 System Requirements

- **HFS**: v0.51.0 or higher
- **Browser**: Modern browser with WebGL and JavaScript support (Chrome, Firefox, Safari, Edge, etc.)
- **Internet Connection**: Required to load EmulatorJS from CDN
- **Admin Access** (for cover/info management): Admin credentials for setting covers and game information

## 🐛 Troubleshooting

### EmulatorJS doesn't load or games won't start
- **Check internet connection** - EmulatorJS is loaded from CDN, so an active internet connection is required
- **Try a different EmulatorJS version** - Switch between stable, latest, or nightly in plugin settings
- **Check browser console** (F12) for JavaScript errors
- **Clear browser cache** - Sometimes cached files can cause issues

### File format is not recognized
- Verify the file extension matches the supported extensions list above
- Ensure the file has the correct extension (some emulators are strict about this)
- Check if the file is corrupted

### Covers don't download
- Ensure IGDB Client ID and Client Secret are correctly configured
- Verify your Twitch account hasn't restricted API access
- Check that the game name exists in IGDB database (try searching with different keywords)
- Look at browser console (F12) for API errors

### Game information doesn't appear
- Ensure IGDB credentials are configured correctly
- Some games might not exist in IGDB database (try alternate game titles)
- Admin user (with IGDB setup) must look up game info first

### Controls don't respond during gameplay
- Different systems use different control schemes
- Consult the [EmulatorJS Controls Guide](https://emulatorjs.org/docs/)
- Your browser might be blocking keyboard input (try fullscreen mode)

### Folder icons not displaying
- Only administrators can set folder icons
- The folder must contain compatible ROM files
- Try refreshing the page if icons don't update immediately

 
## 📄 License

This plugin follows the same license as HFS.

## 🔗 Resources

- [HFS - HTTP File Server](https://github.com/rejetto/hfs)
- [EmulatorJS](https://emulatorjs.org/)
- [EmulatorJS Documentation](https://emulatorjs.org/docs/)
- [HFS Plugin Development](https://github.com/rejetto/hfs/blob/main/dev-plugins.md)
- [IGDB API](https://api-docs.igdb.com/)

## 💬 Support

For reporting issues, questions, or feature requests, please open an issue in the repository.

---

**Version**: 2.0  
**Last Updated**: January 2026

Plugin developed for [HFS (HTTP File Server)](https://github.com/rejetto/hfs) with EmulatorJS integration
