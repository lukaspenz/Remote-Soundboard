# Remote Soundboard v1.0.0 🎵

**First stable release!** A locally hosted soundboard with remote triggering capabilities.

## ✨ Features

- 🎵 **Remote Triggering**: Control sounds from your phone/tablet while audio plays on your PC
- 🖥️ **Audio Device Selection**: Choose which speaker/headphone output to use (Chrome/Edge)
- 🔒 **Password Protection**: Secure access for remote devices (default: `soundboard123`)
- 📁 **Sound Management**: Add, rename, delete sounds via web interface
- 📤 **File Upload**: Upload new audio files directly from browser
- 🌐 **Real-time Sync**: All devices update instantly via WebSocket
- 🎨 **Dark Mode**: Sleek, muted dark interface
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile

## 📦 Downloads

### Windows Portable (Recommended)
**[Remote-Soundboard-v1.0.0-Windows.zip](download-link)** (16 MB)
- No installation required
- No Node.js needed
- Just extract and run!

**What's included:**
- `soundboard.exe` - Standalone executable
- `public/` - Web interface
- `sounds/` - Sample audio files
- `README.txt` - Instructions
- `start.bat` - Optional launcher with password config

### Source Code
Install Node.js and run:
```bash
git clone https://github.com/lukaspenz/Remote-Soundboard.git
cd Remote-Soundboard
npm install
npm start
```

## 🚀 Quick Start (Portable Version)

1. **Download** and extract `Remote-Soundboard-v1.0.0-Windows.zip`
2. **Double-click** `soundboard.exe`
3. **Browser opens** automatically to `http://localhost:3030`
4. **Done!** No installation needed

### For Remote Access:
1. Click "Network" button to see your IP address
2. Open that URL on phone/tablet (e.g., `http://192.168.1.100:3030`)
3. Enter password: `soundboard123`
4. Trigger sounds remotely!

## 📖 Documentation

- **README.md** - Complete documentation
- **PASSWORD-CONFIG.md** - Password configuration guide
- **BUILD-PORTABLE.md** - How to build your own executable
- **PORTABLE-SUCCESS.md** - Distribution guide

## 🔧 System Requirements

### Host PC (plays audio):
- Windows 10 or later
- Chrome or Edge browser (for audio device selection)
- 50MB free disk space

### Remote Devices:
- Any device with a web browser
- Connected to same network as host PC

## 🔒 Security

- Host PC (localhost) automatically authenticated
- Remote devices require password
- Default password: `soundboard123`
- Change via environment variable: `SOUNDBOARD_PASSWORD`

## 🐛 Known Issues

- Audio device selection only works in Chrome/Edge
- Executable may trigger antivirus false positives (common with pkg)
- Windows Firewall may prompt on first run (allow access for network features)

## 🎯 What's New in v1.0.0

This is the first stable release with:
- Complete authentication system
- Sound management interface (host only)
- File upload functionality
- Persistent sound configuration
- WebSocket-based remote triggering
- Audio fade in/out (eliminates clicks)
- Portable Windows executable

## 📝 Changelog

### Added
- Password authentication for remote devices
- Sound management UI (add, rename, delete)
- File upload with validation (max 10MB)
- Audio device selection (Chrome/Edge)
- Real-time sync via WebSocket
- Persistent configuration (sounds-config.json)
- 20ms fade in/out for smooth audio playback
- Portable executable for Windows
- Comprehensive documentation

### Fixed
- Click/pop sounds on audio start/stop
- Device selection showing inputs instead of outputs
- Password prompt appearing on host PC
- CSS class specificity issues

## 🙏 Credits

Built with:
- Node.js & Express
- WebSocket (ws library)
- Multer (file uploads)
- Web Audio API
- pkg (executable packaging)

## 📄 License

MIT License - Free to use for personal and commercial purposes

---

**Enjoy your remote soundboard!** 🎵🎉

For issues or questions, please open an issue on GitHub.
