# Building Portable Executable

This guide explains how to create a standalone executable that runs without Node.js installed.

## 🚀 Quick Build

### Build for Windows (current PC)
```bash
npm run build
```

This creates: `dist/soundboard.exe`

### Build for All Platforms
```bash
npm run build:all
```

This creates:
- `dist/soundboard-win.exe` (Windows)
- `dist/soundboard-macos` (macOS)
- `dist/soundboard-linux` (Linux)

## 📦 What Gets Included

The executable bundles:
- ✅ Node.js runtime
- ✅ All npm dependencies
- ✅ server.js (your backend)
- ✅ public/ folder (HTML, CSS, JS)
- ✅ sounds/ folder (audio files)

## 💾 Distribution Package

After building, create a portable folder:

```
Remote-Soundboard-Portable/
├── soundboard.exe          # The executable
├── sounds/                 # Audio files (can be empty initially)
├── public/                 # Web interface files
└── README.txt             # Instructions
```

### Copy Files:
```powershell
# Create distribution folder
New-Item -ItemType Directory -Path "Remote-Soundboard-Portable"

# Copy executable
Copy-Item "dist/soundboard.exe" -Destination "Remote-Soundboard-Portable/"

# Copy assets (pkg needs these external)
Copy-Item "public" -Destination "Remote-Soundboard-Portable/" -Recurse
Copy-Item "sounds" -Destination "Remote-Soundboard-Portable/" -Recurse
```

## 📝 User Instructions (README.txt)

Create a `README.txt` file in your portable folder:

```
REMOTE SOUNDBOARD - PORTABLE EDITION

QUICK START:
1. Double-click "soundboard.exe" to start the server
2. Open your browser to: http://localhost:3030
3. Click "Network" to see the URL for remote devices

ADDING SOUNDS:
- Place audio files (.wav, .mp3, .ogg, .m4a) in the "sounds" folder
- Use the "Manage Sounds" button in the app to add them

PASSWORD:
- Default password: soundboard123
- To change: Set environment variable SOUNDBOARD_PASSWORD

REQUIREMENTS:
- Windows 10 or later
- No Node.js installation needed!
- Firewall may prompt - allow access for network features

TROUBLESHOOTING:
- If port 3030 is busy, close the app and try again
- For remote access, ensure devices are on same network
- Check Windows Firewall if remote devices can't connect

Enjoy your portable soundboard!
```

## 🎯 Usage on New PC

### User Experience:
1. Copy the entire `Remote-Soundboard-Portable` folder to new PC
2. Double-click `soundboard.exe`
3. Browser opens automatically to `http://localhost:3030`
4. No installation needed!

### What Users Need:
- ✅ Windows 10/11 (for .exe version)
- ✅ A web browser (Chrome/Edge recommended)
- ❌ No Node.js required
- ❌ No npm required
- ❌ No installation process

## ⚙️ Advanced Configuration

### Custom Password via Batch File

Create `start.bat`:
```batch
@echo off
set SOUNDBOARD_PASSWORD=your_password_here
soundboard.exe
pause
```

Users can then double-click `start.bat` instead of the exe.

### Custom Port

Modify `server.js` before building:
```javascript
const PORT = process.env.PORT || 3030; // Change 3030 to desired port
```

## 🔧 Build Options

### Specific Node Version
```bash
pkg . --targets node16-win-x64
```

### Multiple Platforms at Once
```bash
pkg . --targets node18-win-x64,node18-macos-x64,node18-linux-x64
```

### Debug Build
```bash
pkg . --debug
```

## 📊 File Sizes

Approximate sizes:
- **soundboard.exe**: ~50-60 MB (includes Node.js runtime)
- **public/ folder**: ~10 KB
- **sounds/ folder**: Varies (depends on audio files)

Total portable package: ~60-100 MB

## ⚠️ Important Notes

### Static Assets
The `public/` and `sounds/` folders MUST be in the same directory as the .exe file. They can't be bundled inside the executable due to how Express serves static files.

### Sound Files
- Users can add their own sound files to the `sounds/` folder
- The app will detect them automatically
- No need to rebuild the executable

### Configuration Files
- `sounds-config.json` is created automatically at runtime
- Stored next to the executable
- Can be deleted to reset sound configuration

### Antivirus False Positives
Some antivirus software may flag the executable as suspicious (common with pkg). This is a false positive. If distributing:
- Add notes about this in README
- Consider code signing (requires certificate)
- Or distribute source code with instructions

## 🚀 Shipping to GitHub

### Option 1: Source Code Only
Let users build their own:
```bash
git clone <your-repo>
npm install
npm run build
```

### Option 2: Release with Binaries
1. Build for all platforms
2. Create GitHub Release
3. Attach executables as release assets
4. Users download and run

### .gitignore
Already configured to ignore:
- `node_modules/`
- `dist/` (build output)

## 🎉 Distribution Checklist

Before sharing your portable version:
- [ ] Test on clean Windows PC (no Node.js)
- [ ] Include README.txt with instructions
- [ ] Include example sound files
- [ ] Test password authentication
- [ ] Test remote access from phone
- [ ] Verify firewall doesn't block (or include instructions)
- [ ] Test "Manage Sounds" feature
- [ ] Check file upload works

## 💡 Pro Tips

1. **Smaller Builds**: Remove unused dependencies before building
2. **Faster Startup**: Use `node18` instead of `node20` (smaller runtime)
3. **Custom Icon**: Use resource editor tools to add icon to .exe
4. **Installer**: Use tools like Inno Setup to create proper Windows installer
5. **Auto-Updater**: Consider adding update checking for distributed versions

---

**Your soundboard is now fully portable!** 🎵✨
