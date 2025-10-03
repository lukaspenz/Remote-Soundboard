# Re## ✨ Features

- 🎵 **Remote Triggering**: Trigger sounds from phone/tablet, audio plays on host PC
- 🖥️ **Audio Device Selection**: Choose which speaker/headphone output to use (Chrome/Edge)
- 🔒 **Password Protection**: Secure access for remote devices
- 📁 **Sound Management**: Add, rename, delete sounds via web interface (host only)
- 📤 **File Upload**: Upload new audio files directly from browser
- 🌐 **Real-time Sync**: All devices update instantly via WebSocket
- 🎨 **Dark Mode**: Sleek, muted dark interface
- 📱 **Responsive Design**: Works on desktop, tablet, and mobiledboard

A locally hosted soundboard application with a sleek dark mode design that allows you to trigger sounds remotely from any device on your local network, with full control over audio output device selection.

## Features

- 🎵 Play sounds on the host PC from any device on the network
- 🔊 **Select audio output device** - Choose which speakers/headphones play sounds
- 🎨 **Sleek muted dark mode design** - Professional, minimal aesthetic
- 📱 Responsive design for phones, tablets, and desktops
- � Large, distinct buttons for each sound
- 🌐 Network information display for easy remote access
- ⏹️ Stop playback functionality

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ installed
- Audio files in WAV, MP3, OGG, or M4A format

### Installation

1. **Clone or download this repository**
   ```bash
   git clone <your-repo-url>
   cd Remote-Soundboard
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Add your sound files**
   - Place audio files in the `sounds/` folder
   - Or upload them via the web interface after starting

4. **Start the server**

   ```bash
   npm start
   ```

5. **Open on host PC**
   ```
   http://localhost:3030
   ```

6. **Access from remote devices**
   - Click "Network" button to see your network address
   - Open that URL on phone/tablet
   - Enter password: `soundboard123`

## 📖 Usage Guide

### Host PC (localhost)
- ✅ Automatically authenticated
- 🔊 Audio plays through selected device
- 🛠️ Can manage sounds (add/delete/rename)
- 📤 Can upload new files
- 🎚️ Can select audio output device

### Remote Devices (network)
- 🔑 Requires password authentication
- 🎯 Can trigger sounds
- 👁️ Read-only access
- 🔄 Updates in real-time

### Sound Management (Host Only)

Click **"Manage Sounds"** to:

1. **Add Existing Files**: Select audio files from `sounds/` folder
2. **Upload New Files**: Upload audio directly from your PC (max 10MB)
3. **Rename Sounds**: Change button labels
4. **Delete Sounds**: Remove sounds from soundboard

All changes sync instantly to connected devices!

## 🔒 Security

### Change Default Password

**Option 1: Environment Variable (Recommended)**
```powershell
# Windows PowerShell
$env:SOUNDBOARD_PASSWORD="your_secure_password"
npm start
```

```bash
# Linux/Mac
export SOUNDBOARD_PASSWORD="your_secure_password"
npm start
```

**Option 2: Edit server.js**
Find and change:
```javascript
const PASSWORD = process.env.SOUNDBOARD_PASSWORD || 'soundboard123';
```

### Authentication Details
- Host PC (localhost) bypasses authentication
- Remote devices must enter password
- Session tokens stored in memory
- Sessions expire on server restart

## 🎛️ Audio Configuration

### Output Device Selection
1. Open on host PC
2. Click **"Audio Devices"** button
3. Select your preferred output device
4. Requires Chrome or Edge browser

### Fade In/Out
- 20ms fade in prevents click/pop at start
- 20ms fade out prevents click/pop at stop
- Eliminates DC offset issues

## 🗂️ Project Structure

```
Remote-Soundboard/
├── server.js              # Main server with WebSocket & auth
├── public/
│   ├── index.html        # UI interface
│   ├── app.js            # Client-side logic
│   └── styles.css        # Dark mode styling
├── sounds/               # Audio files directory
├── package.json          # Dependencies
└── README.md            # This file
```

## 🔧 Configuration

### Port Configuration
Default port: `3030`

To change, edit `server.js`:
```javascript
const PORT = 3030; // Change this
```

### Supported Audio Formats
- WAV (recommended)
- MP3
- OGG
- M4A

### File Size Limit
- Max upload size: 10MB
- Change in `server.js` multer configuration

## 🌐 Network Access

### Find Your IP Address

**Windows:**
```powershell
ipconfig
# Look for "IPv4 Address" under your network adapter
```

**Linux/Mac:**
```bash
ifconfig
# or
ip addr show
```

### Access URL Format
```
http://[YOUR-IP]:3030
```

Example: `http://192.168.1.100:3030`

## Troubleshooting

- **Sounds not playing**: Make sure your sound files are in the `sounds/` folder and are in WAV format
- **Can't access remotely**: Check your firewall settings and ensure the port (default 3000) is not blocked
- **Wrong sound files**: Verify the filenames in `server.js` match your actual sound files

## License

MIT
