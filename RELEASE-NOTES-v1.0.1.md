# Remote Soundboard v1.0.1 🔧

**Bug fix release** - Fixes sound management in portable executable

## 🐛 Bug Fixes

### Fixed: Adding sounds in packaged build
**Issue**: In v1.0.0, uploading and adding sounds didn't work in the portable .exe version
**Cause**: The executable tried to write to its internal virtual filesystem (read-only)
**Solution**: Updated file paths to use the actual executable directory instead of `__dirname`

**Now works correctly:**
- ✅ Upload new sound files
- ✅ Add existing files from sounds folder  
- ✅ Rename sounds
- ✅ Delete sounds
- ✅ All file operations persist correctly

### Additional Improvements
- ✅ Auto-creates `sounds/` directory if missing (helpful for first run)
- ✅ Shows running mode in console (`PACKAGED` vs `DEVELOPMENT`)
- ✅ Better error handling for missing sound files

## 📦 Downloads

### Windows Portable (Recommended)
**[Remote-Soundboard-v1.0.1-Windows.zip](download-link)** (16 MB)
- ✅ Sound management now fully functional
- No installation required
- No Node.js needed

## 🚀 What's Fixed

### Before (v1.0.0):
```
❌ Uploading sounds: Failed silently
❌ Adding files: Permission denied
❌ File operations: Didn't persist
```

### After (v1.0.1):
```
✅ Uploading sounds: Works perfectly
✅ Adding files: Success
✅ File operations: All persist correctly
✅ sounds-config.json: Saves in exe directory
```

## 📝 Technical Details

### Changes Made:
- Replaced `__dirname` with `APP_ROOT` throughout server.js
- `APP_ROOT` detects packaged mode and uses `process.execPath` directory
- Added automatic sounds directory creation
- Enhanced logging for debugging

### File Structure (Packaged):
```
soundboard.exe          ← Executable
public/                 ← Web interface (external)
sounds/                 ← Audio files (read/write)
sounds-config.json      ← Configuration (created at runtime)
```

## 🔄 Upgrade from v1.0.0

If you're using v1.0.0:

1. Download v1.0.1
2. **Keep your existing sounds folder**
3. Replace `soundboard.exe` with new version
4. Your sounds and configuration will carry over!

Or start fresh:
1. Extract new ZIP
2. Copy your sound files to the new `sounds/` folder
3. Done!

## ✨ All Features Working

- 🎵 Remote triggering from phone/tablet ✅
- 🖥️ Audio device selection ✅
- 🔒 Password protection ✅
- 📁 **Sound management (NOW FIXED)** ✅
- 📤 **File upload (NOW FIXED)** ✅
- 🌐 Real-time sync ✅
- 🎨 Dark mode interface ✅
- 📱 Responsive design ✅

## 📖 Documentation

Same as v1.0.0 - all documentation still valid:
- README.md
- PASSWORD-CONFIG.md
- BUILD-PORTABLE.md
- PORTABLE-SUCCESS.md

## 🔒 Security

- No security changes from v1.0.0
- Default password still: `soundboard123`
- Change via environment variable or start.bat

## 🎯 Changelog

### Fixed
- Sound management not working in packaged executable
- File uploads failing in .exe version
- sounds-config.json not persisting
- Permission errors when adding sounds

### Added
- Automatic sounds directory creation
- Running mode detection and logging
- Better path handling for packaged builds

### Changed
- File paths now use executable directory
- Improved error messages

## 🙏 Thanks

Thanks to the community for reporting the sound management issue!

## 📄 License

MIT License - Free to use for personal and commercial purposes

---

**Download v1.0.1 now for fully functional sound management!** 🎵✨

If you're still on v1.0.0, please upgrade to fix sound management issues.
