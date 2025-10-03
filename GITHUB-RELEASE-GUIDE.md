# 📦 Creating GitHub Release - Step by Step Guide

## 🎯 What You're Releasing

- **Version**: v1.0.0
- **Package**: Remote-Soundboard-v1.0.0-Windows.zip (16 MB)
- **Type**: Portable Windows executable (no installation needed)

## 📋 Method 1: GitHub Web Interface (Easiest)

### Step 1: Go to Releases Page
1. Open your repository: https://github.com/lukaspenz/Remote-Soundboard
2. Click on **"Releases"** (right sidebar under "About")
3. Click **"Create a new release"** or **"Draft a new release"**

### Step 2: Create Tag
1. Click "Choose a tag"
2. Type: `v1.0.0`
3. Click "Create new tag: v1.0.0 on publish"

### Step 3: Set Release Title
```
Remote Soundboard v1.0.0 - Portable Edition
```

### Step 4: Add Description
Copy and paste from `RELEASE-NOTES-v1.0.0.md`:

```markdown
**First stable release!** A locally hosted soundboard with remote triggering capabilities.

## ✨ Features

- 🎵 Remote Triggering: Control sounds from phone/tablet
- 🖥️ Audio Device Selection: Choose output device
- 🔒 Password Protection: Secure remote access
- 📁 Sound Management: Add, rename, delete sounds
- 📤 File Upload: Upload audio files directly
- 🌐 Real-time Sync: WebSocket updates
- 🎨 Dark Mode: Sleek interface

## 📦 What's Included

- soundboard.exe - Standalone executable (no Node.js needed!)
- Web interface (public/)
- Sample audio files
- Complete documentation

## 🚀 Quick Start

1. Download and extract the ZIP
2. Double-click soundboard.exe
3. Browser opens automatically
4. Done! No installation needed

**Default password for remote devices:** soundboard123

See README.md for full documentation.
```

### Step 5: Upload Files
1. Drag and drop: `Remote-Soundboard-v1.0.0-Windows.zip`
2. Or click "Attach binaries by dropping them here or selecting them"

### Step 6: Publish
1. Check "Set as the latest release" ✅
2. Click **"Publish release"** 🎉

## 📋 Method 2: GitHub CLI (Advanced)

If you have GitHub CLI installed:

```bash
# Create release with file
gh release create v1.0.0 \
  Remote-Soundboard-v1.0.0-Windows.zip \
  --title "Remote Soundboard v1.0.0 - Portable Edition" \
  --notes-file RELEASE-NOTES-v1.0.0.md
```

## 📋 Method 3: Using Git Tags

```bash
# Create and push tag
git tag -a v1.0.0 -m "Release version 1.0.0 - Portable edition"
git push main v1.0.0

# Then go to GitHub web interface to create release from tag
```

## ✅ After Publishing

Your release will be available at:
```
https://github.com/lukaspenz/Remote-Soundboard/releases/tag/v1.0.0
```

### What Users Will See:

**Download Button:**
```
Remote-Soundboard-v1.0.0-Windows.zip (16 MB)
```

**Plus automatic:**
- Source code (zip)
- Source code (tar.gz)

## 🎨 Optional: Add Assets Badge to README

Add this to your main README.md:

```markdown
[![GitHub release](https://img.shields.io/github/v/release/lukaspenz/Remote-Soundboard)](https://github.com/lukaspenz/Remote-Soundboard/releases)
[![Downloads](https://img.shields.io/github/downloads/lukaspenz/Remote-Soundboard/total)](https://github.com/lukaspenz/Remote-Soundboard/releases)
```

## 📊 Future Releases

### For v1.1.0 (next version):

1. **Update version** in package.json:
   ```json
   "version": "1.1.0"
   ```

2. **Rebuild executable**:
   ```bash
   npm run build
   .\create-portable.bat
   ```

3. **Create new ZIP**:
   ```powershell
   Compress-Archive -Path "Remote-Soundboard-Portable\*" -DestinationPath "Remote-Soundboard-v1.1.0-Windows.zip" -Force
   ```

4. **Create new release** on GitHub with tag `v1.1.0`

## 🌐 Multi-Platform Releases

To include macOS and Linux builds:

```bash
# Build for all platforms
npm run build:all

# Create separate ZIPs for each platform
# Windows
Compress-Archive -Path "Remote-Soundboard-Portable-Win\*" -Dest "Remote-Soundboard-v1.0.0-Windows.zip"

# macOS (requires manual packaging on Mac)
zip -r Remote-Soundboard-v1.0.0-macOS.zip Remote-Soundboard-Portable-Mac/

# Linux (requires manual packaging on Linux)
tar -czf Remote-Soundboard-v1.0.0-Linux.tar.gz Remote-Soundboard-Portable-Linux/
```

Then upload all three files to the same release.

## 📝 Release Checklist

Before publishing:
- [ ] Version number updated in package.json
- [ ] Executable built and tested
- [ ] ZIP file created and tested
- [ ] Release notes written
- [ ] README updated (if needed)
- [ ] All changes committed and pushed
- [ ] Tag created
- [ ] Release assets uploaded
- [ ] Release published

## 🎉 Post-Release

### Announce Your Release:
- Tweet/post about it
- Share in relevant communities
- Update your project homepage/portfolio

### Monitor:
- Check download statistics
- Respond to issues
- Collect feedback

---

**Ready to publish your first release!** 🚀

Your file is ready: `Remote-Soundboard-v1.0.0-Windows.zip` (16 MB)

Just follow Method 1 above to publish on GitHub! 🎵
