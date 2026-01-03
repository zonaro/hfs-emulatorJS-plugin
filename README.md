# EmulatorJS Plugin for HFS

A plugin for [HFS (HTTP File Server)](https://github.com/rejetto/hfs) that integrates [EmulatorJS](https://emulatorjs.org/) allowing you to run ROMs from various retro consoles directly in the browser.

## 🎮 Features

- ✅ Support for multiple systems (NES, SNES, Mega Drive, PlayStation, and more)
- ✅ Seamless integration with HFS
- ✅ Integrated modal or new tab interface
- ✅ Context menu to open games
- ✅ Support for multiple EmulatorJS versions (stable, latest, nightly)
- ✅ Configurable via HFS admin panel

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

2. Restart HFS or wait for automatic reload

3. Access the HFS admin panel to configure the plugin

## ⚙️ Configuration

In the HFS admin panel, you will find the following options:

### Enable EmulatorJS
- Activates/deactivates the plugin completely

### EmulatorJS Version
- **Stable** (`stable`): Most stable and tested version
- **Latest** (`latest`): Most recent code with stable colors
- **Nightly** (`nightly`): Most recent code and colors (alpha)

### Enabled Systems
- List of systems that can be emulated (configurable)

### Use Embedded UI
- ✅ Opens the emulator in a modal within HFS
- ❌ Opens the emulator in a new browser tab

### Show button in file menu
- Displays the "Play" option in the context menu of files

## 🎮 Usage

### Via Context Menu
1. Navigate to a folder containing ROMs
2. Right-click on a supported ROM file
3. Select "Play (System Name)"

### Via Preview
1. Click on the ROM file to see the preview
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

## 📄 License

This plugin follows the same license as HFS.

## 🔗 Useful Resources

- [HFS - HTTP File Server](https://github.com/rejetto/hfs)
- [EmulatorJS](https://emulatorjs.org/)
- [HFS Plugin Development Guide](https://github.com/rejetto/hfs/blob/main/dev-plugins.md)

## 💬 Support

For reporting issues or suggesting improvements, open an issue in the repository.

## 🎉 Future Features

- [ ] Support for synchronized saves
- [ ] Custom core selection interface
- [ ] Online multiplayer support
- [ ] Integrated ROM manager
- [ ] Custom emulator themes

---

**Version**: 1.0  
**Last Updated**: January 2026
