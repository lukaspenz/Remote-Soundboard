const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');
const multer = require('multer');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = 3030;

// Detect if running as packaged executable (pkg)
const isPkg = typeof process.pkg !== 'undefined';

// Use executable directory for file storage when packaged
// This allows the sounds folder to be read/write even in packaged version
const APP_ROOT = isPkg ? path.dirname(process.execPath) : __dirname;

console.log(`Running mode: ${isPkg ? 'PACKAGED' : 'DEVELOPMENT'}`);
console.log(`App root: ${APP_ROOT}`);

// Store current audio device
let currentAudioDevice = null;

// Authentication
const PASSWORD = process.env.SOUNDBOARD_PASSWORD || 'soundboard123'; // Change this or set via environment variable
const sessionTokens = new Set();

// Generate session token
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(APP_ROOT, 'sounds'));
  },
  filename: (req, file, cb) => {
    // Sanitize filename
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, sanitized);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept audio files only
    if (file.mimetype.startsWith('audio/') || file.originalname.match(/\.(wav|mp3|ogg|m4a)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// WebSocket connections
const clients = new Set();

// Handle WebSocket connections
wss.on('connection', (ws, req) => {
  const clientIp = req.socket.remoteAddress;
  console.log(`WebSocket client connected from ${clientIp}`);
  clients.add(ws);
  
  ws.on('close', () => {
    console.log(`WebSocket client disconnected from ${clientIp}`);
    clients.delete(ws);
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

// Broadcast to all connected clients
function broadcast(data) {
  const message = JSON.stringify(data);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Middleware
app.use(express.json());
app.use(express.static(path.join(APP_ROOT, 'public')));

// Authentication middleware
function requireAuth(req, res, next) {
  const token = req.headers['x-auth-token'] || req.query.token;
  
  if (sessionTokens.has(token)) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized', requireAuth: true });
  }
}

// Check if request is from localhost (host device)
function isLocalhost(req) {
  const ip = req.socket.remoteAddress;
  const host = req.headers.host || '';
  
  // Check if IP is localhost
  const isLocalIP = ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1';
  
  // Check if accessing via localhost hostname
  const isLocalHost = host.startsWith('localhost:') || host === 'localhost';
  
  console.log(`isLocalhost check: ip=${ip}, host=${host}, isLocalIP=${isLocalIP}, isLocalHost=${isLocalHost}`);
  
  return isLocalIP || isLocalHost;
}

// Store available sounds
const sounds = [
  { id: 1, name: 'Sound 1', file: 'sound1.wav' },
  { id: 2, name: 'Sound 2', file: 'sound2.wav' },
  { id: 3, name: 'Sound 3', file: 'sound3.wav' },
  { id: 4, name: 'Sound 4', file: 'sound4.wav' },
  { id: 5, name: 'Sound 5', file: 'sound5.wav' },
  { id: 6, name: 'Sound 6', file: 'sound6.wav' }
];

// Save sounds to file
function saveSounds() {
  fs.writeFileSync(
    path.join(APP_ROOT, 'sounds-config.json'),
    JSON.stringify(sounds, null, 2)
  );
}

// Load sounds from file if exists
function loadSounds() {
  const configPath = path.join(APP_ROOT, 'sounds-config.json');
  if (fs.existsSync(configPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      sounds.length = 0;
      sounds.push(...data);
      console.log(`Loaded ${sounds.length} sounds from config`);
    } catch (err) {
      console.error('Error loading sounds config:', err);
    }
  }
}

// Ensure sounds directory exists (important for packaged version)
function ensureSoundsDirectory() {
  const soundsDir = path.join(APP_ROOT, 'sounds');
  if (!fs.existsSync(soundsDir)) {
    console.log('Creating sounds directory...');
    fs.mkdirSync(soundsDir, { recursive: true });
  }
}

// Initialize
ensureSoundsDirectory();
loadSounds();

// Authentication endpoints
app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  
  if (password === PASSWORD) {
    const token = generateToken();
    sessionTokens.add(token);
    res.json({ success: true, token });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

app.get('/api/auth/check', (req, res) => {
  const token = req.headers['x-auth-token'] || req.query.token;
  const clientIp = req.socket.remoteAddress;
  const isLocal = isLocalhost(req);
  
  console.log(`Auth check from ${clientIp}, isLocalhost: ${isLocal}`);
  
  // Localhost always authenticated
  if (isLocal) {
    console.log('✅ Host PC authenticated (localhost)');
    res.json({ authenticated: true, isHost: true });
  } else if (sessionTokens.has(token)) {
    console.log('✅ Remote device authenticated (valid token)');
    res.json({ authenticated: true, isHost: false });
  } else {
    console.log('❌ Remote device needs authentication');
    res.json({ authenticated: false, isHost: false });
  }
});

// Get all sounds (no auth needed for viewing)
app.get('/api/sounds', (req, res) => {
  // Check auth for remote devices
  if (!isLocalhost(req)) {
    const token = req.headers['x-auth-token'] || req.query.token;
    if (!sessionTokens.has(token)) {
      return res.status(401).json({ error: 'Unauthorized', requireAuth: true });
    }
  }
  res.json(sounds);
});

// Serve audio files
app.get('/api/audio/:id', (req, res) => {
  const soundId = parseInt(req.params.id);
  const sound = sounds.find(s => s.id === soundId);
  
  if (!sound) {
    return res.status(404).json({ error: 'Sound not found' });
  }
  
  const soundPath = path.join(APP_ROOT, 'sounds', sound.file);
  
  // Check if file exists
  if (!fs.existsSync(soundPath)) {
    return res.status(404).json({ error: 'Sound file not found', file: sound.file });
  }
  
  // Stream the audio file
  res.sendFile(soundPath);
});

// Play a sound on the server (host PC) - requires auth for remote
app.post('/api/play/:id', async (req, res) => {
  // Check auth for remote devices
  if (!isLocalhost(req)) {
    const token = req.headers['x-auth-token'] || req.query.token;
    if (!sessionTokens.has(token)) {
      return res.status(401).json({ error: 'Unauthorized', requireAuth: true });
    }
  }
  
  const soundId = parseInt(req.params.id);
  const sound = sounds.find(s => s.id === soundId);
  
  if (!sound) {
    return res.status(404).json({ error: 'Sound not found' });
  }
  
  const soundPath = path.join(APP_ROOT, 'sounds', sound.file);
  
  // Check if file exists
  if (!fs.existsSync(soundPath)) {
    return res.status(404).json({ error: 'Sound file not found', file: sound.file });
  }
  
  console.log(`Broadcasting sound trigger: ${sound.name}`);
  
  // Broadcast to ALL connected clients (including host PC)
  broadcast({
    type: 'play',
    soundId: soundId,
    soundName: sound.name,
    audioUrl: `/api/audio/${soundId}`
  });
  
  res.json({ 
    success: true, 
    sound: sound.name
  });
});

// Stop all sounds
app.post('/api/stop', (req, res) => {
  // Check auth for remote devices
  if (!isLocalhost(req)) {
    const token = req.headers['x-auth-token'] || req.query.token;
    if (!sessionTokens.has(token)) {
      return res.status(401).json({ error: 'Unauthorized', requireAuth: true });
    }
  }
  
  console.log('Broadcasting stop command');
  
  // Broadcast stop to all connected clients
  broadcast({
    type: 'stop'
  });
  
  res.json({ success: true, message: 'Stopped' });
});

// Upload sound file (host only)
app.post('/api/sounds/upload', upload.single('soundFile'), (req, res) => {
  if (!isLocalhost(req)) {
    return res.status(403).json({ error: 'Upload only allowed from host PC' });
  }
  
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const soundName = req.body.soundName || req.file.originalname.replace(/\.[^/.]+$/, '');
  const newId = sounds.length > 0 ? Math.max(...sounds.map(s => s.id)) + 1 : 1;
  
  const newSound = {
    id: newId,
    name: soundName,
    file: req.file.filename
  };
  
  sounds.push(newSound);
  saveSounds();
  
  // Notify all clients about new sound
  broadcast({
    type: 'soundsUpdated',
    sounds: sounds
  });
  
  console.log(`Added new sound: ${soundName} (${req.file.filename})`);
  
  res.json({ 
    success: true, 
    sound: newSound 
  });
});

// Get available sound files from sounds directory (host only)
app.get('/api/sounds/files', (req, res) => {
  if (!isLocalhost(req)) {
    return res.status(403).json({ error: 'Only available from host PC' });
  }
  
  const soundsDir = path.join(APP_ROOT, 'sounds');
  const files = fs.readdirSync(soundsDir)
    .filter(file => file.match(/\.(wav|mp3|ogg|m4a)$/i))
    .filter(file => !sounds.some(s => s.file === file)); // Exclude already added files
  
  res.json({ files });
});

// Add existing sound file (host only)
app.post('/api/sounds/add', (req, res) => {
  if (!isLocalhost(req)) {
    return res.status(403).json({ error: 'Only available from host PC' });
  }
  
  const { filename, soundName } = req.body;
  
  if (!filename) {
    return res.status(400).json({ error: 'Filename required' });
  }
  
  const soundPath = path.join(APP_ROOT, 'sounds', filename);
  if (!fs.existsSync(soundPath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  const name = soundName || filename.replace(/\.[^/.]+$/, '');
  const newId = sounds.length > 0 ? Math.max(...sounds.map(s => s.id)) + 1 : 1;
  
  const newSound = {
    id: newId,
    name: name,
    file: filename
  };
  
  sounds.push(newSound);
  saveSounds();
  
  // Notify all clients about new sound
  broadcast({
    type: 'soundsUpdated',
    sounds: sounds
  });
  
  console.log(`Added existing sound: ${name} (${filename})`);
  
  res.json({ 
    success: true, 
    sound: newSound 
  });
});

// Delete sound (host only)
app.delete('/api/sounds/:id', (req, res) => {
  if (!isLocalhost(req)) {
    return res.status(403).json({ error: 'Only available from host PC' });
  }
  
  const soundId = parseInt(req.params.id);
  const index = sounds.findIndex(s => s.id === soundId);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Sound not found' });
  }
  
  const removed = sounds.splice(index, 1)[0];
  saveSounds();
  
  // Notify all clients about removed sound
  broadcast({
    type: 'soundsUpdated',
    sounds: sounds
  });
  
  console.log(`Removed sound: ${removed.name}`);
  
  res.json({ 
    success: true, 
    removed: removed 
  });
});

// Rename sound (host only)
app.patch('/api/sounds/:id', (req, res) => {
  if (!isLocalhost(req)) {
    return res.status(403).json({ error: 'Only available from host PC' });
  }
  
  const soundId = parseInt(req.params.id);
  const sound = sounds.find(s => s.id === soundId);
  
  if (!sound) {
    return res.status(404).json({ error: 'Sound not found' });
  }
  
  if (req.body.name) {
    sound.name = req.body.name;
    saveSounds();
    
    // Notify all clients about updated sound
    broadcast({
      type: 'soundsUpdated',
      sounds: sounds
    });
    
    console.log(`Renamed sound ${soundId} to: ${sound.name}`);
  }
  
  res.json({ 
    success: true, 
    sound: sound 
  });
});

// Get network info
app.get('/api/info', (req, res) => {
  const os = require('os');
  const networkInterfaces = os.networkInterfaces();
  const addresses = [];
  
  for (const name of Object.keys(networkInterfaces)) {
    for (const net of networkInterfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push({
          interface: name,
          address: net.address
        });
      }
    }
  }
  
  res.json({
    port: PORT,
    addresses: addresses
  });
});

// Get available audio devices (for browser-based selection)
app.get('/api/devices', (req, res) => {
  // Note: This endpoint returns a placeholder response
  // Actual device enumeration happens in the browser using Web Audio API
  res.json({
    currentDevice: currentAudioDevice,
    devices: [], // Browser will enumerate devices client-side
    note: 'Device selection works in the browser using Web Audio API (Chrome/Edge required)'
  });
});

// Set audio output device
app.post('/api/device', (req, res) => {
  const { deviceId } = req.body;
  
  if (!deviceId) {
    return res.status(400).json({ error: 'Device ID required' });
  }
  
  currentAudioDevice = deviceId;
  console.log(`Audio device set to: ${deviceId}`);
  
  res.json({ 
    success: true, 
    deviceId: currentAudioDevice,
    note: 'Device preference stored. Browser will use this for audio playback.'
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`🔊 Soundboard Server Running`);
  console.log(`${'='.repeat(50)}`);
  console.log(`\n📍 Local Access:  http://localhost:${PORT}`);
  console.log(`📍 Network Access: http://[your-ip]:${PORT}`);
  console.log(`\n💡 Tip: Open on HOST PC first to play audio`);
  console.log(`💡 Tip: Then use remote devices to trigger sounds`);
  console.log(`💡 Tip: Click "Network" button to see your network addresses`);
  console.log(`${'='.repeat(50)}\n`);
});
