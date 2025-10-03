// DOM Elements
const soundboard = document.getElementById('soundboard');
const statusDiv = document.getElementById('status');
const stopAllBtn = document.getElementById('stopAll');
const showInfoBtn = document.getElementById('showInfo');
const closeInfoBtn = document.getElementById('closeInfo');
const networkInfo = document.getElementById('networkInfo');
const networkAddresses = document.getElementById('networkAddresses');
const showDevicesBtn = document.getElementById('showDevices');
const closeDevicesBtn = document.getElementById('closeDevices');
const deviceInfo = document.getElementById('deviceInfo');
const deviceList = document.getElementById('deviceList');

let currentDeviceId = null;
let currentAudio = null;
let audioContext = null;
let gainNode = null;
let ws = null;
let isHostDevice = false; // Track if this is the host PC or remote device
let authToken = null; // Authentication token for remote devices

// Initialize WebSocket connection
function initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
        console.log('WebSocket connected');
        // Ask user if this is the host PC (device that plays sound)
        checkIfHostDevice();
    };
    
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'play') {
            // Only play on host device
            if (isHostDevice) {
                playAudioOnHost(data.soundId, data.soundName, data.audioUrl);
            }
            // Show status on all devices
            showStatus(`Playing: ${data.soundName}`, 'success');
        } else if (data.type === 'stop') {
            // Only stop on host device
            if (isHostDevice) {
                stopAudioOnHost();
            }
            showStatus('Stopped', 'success');
        } else if (data.type === 'soundsUpdated') {
            // Reload sounds when updated
            console.log('Sounds updated, reloading...');
            displaySounds(data.sounds);
        }
    };
    
    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
    
    ws.onclose = () => {
        console.log('WebSocket disconnected, reconnecting...');
        setTimeout(initWebSocket, 2000);
    };
}

// Check if this device should play audio (host PC)
async function checkIfHostDevice() {
    try {
        const response = await fetch('/api/auth/check', {
            headers: authToken ? { 'X-Auth-Token': authToken } : {}
        });
        const data = await response.json();
        
        isHostDevice = data.isHost;
        
        if (data.isHost) {
            // Host device - no password needed
            console.log('Device mode: HOST (plays audio)');
            document.body.classList.add('host-device');
            showStatus('Host PC - Audio will play here', 'success');
            
            // Show manage button for host
            document.getElementById('manageBtn').classList.remove('hidden');
            
            await loadSounds();
        } else if (data.authenticated) {
            // Remote device - already authenticated
            console.log('Device mode: REMOTE (triggers only)');
            document.body.classList.add('remote-device');
            showStatus('Remote Device - Authenticated', 'success');
            await loadSounds();
        } else {
            // Remote device - needs authentication
            console.log('Device mode: REMOTE (needs authentication)');
            document.body.classList.add('remote-device');
            showPasswordDialog();
        }
        
        setTimeout(() => {
            statusDiv.classList.add('hidden');
        }, 3000);
    } catch (error) {
        console.error('Error checking auth:', error);
    }
}

// Initialize audio context and gain node for fade effects
function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        gainNode = audioContext.createGain();
        gainNode.connect(audioContext.destination);
    }
}

// Load sounds from server
async function loadSounds() {
    try {
        const headers = authToken ? { 'X-Auth-Token': authToken } : {};
        const response = await fetch('/api/sounds', { headers });
        
        if (response.status === 401) {
            showPasswordDialog();
            return;
        }
        
        const sounds = await response.json();
        displaySounds(sounds);
    } catch (error) {
        showStatus('Failed to load sounds', 'error');
        console.error('Error loading sounds:', error);
    }
}

// Display sounds in the soundboard
function displaySounds(sounds) {
    soundboard.innerHTML = '';
    
    sounds.forEach(sound => {
        const button = document.createElement('button');
        button.className = 'sound-button';
        button.innerHTML = `<span>${sound.name}</span>`;
        button.dataset.id = sound.id;
        
        button.addEventListener('click', () => playSound(sound.id, button));
        
        soundboard.appendChild(button);
    });
}

// Trigger sound (send request to server, WebSocket will handle playback)
async function playSound(id, button) {
    try {
        button.classList.add('playing');
        
        const headers = authToken ? { 'X-Auth-Token': authToken } : {};
        
        // Send trigger request to server
        const response = await fetch(`/api/play/${id}`, {
            method: 'POST',
            headers
        });
        
        if (response.status === 401) {
            showPasswordDialog();
            button.classList.remove('playing');
            return;
        }
        
        const result = await response.json();
        
        if (!response.ok) {
            showStatus(`Error: ${result.error}`, 'error');
        }
        // Note: Status message will be shown via WebSocket message
        
        // Remove playing animation after 500ms
        setTimeout(() => {
            button.classList.remove('playing');
        }, 500);
    } catch (error) {
        showStatus('Failed to trigger sound', 'error');
        console.error('Error triggering sound:', error);
        button.classList.remove('playing');
    }
}

// Play audio on host device (called via WebSocket)
async function playAudioOnHost(soundId, soundName, audioUrl) {
    try {
        // Stop current audio if playing with fade out
        if (currentAudio) {
            await fadeOutAndStop(currentAudio);
        }
        
        // Create new audio element and play on host PC
        currentAudio = new Audio(audioUrl);
        
        // Set volume to 0 initially for fade in
        currentAudio.volume = 0;
        
        // Set the output device if one is selected and setSinkId is supported
        if (currentDeviceId && currentAudio.setSinkId) {
            try {
                await currentAudio.setSinkId(currentDeviceId);
                console.log(`Playing on device: ${currentDeviceId}`);
            } catch (err) {
                console.warn('Failed to set sink ID:', err);
            }
        }
        
        // Start playing
        await currentAudio.play();
        
        // Quick fade in to prevent click/pop (20ms)
        fadeIn(currentAudio, 20);
        
        console.log(`Playing audio: ${soundName}`);
    } catch (error) {
        console.error('Error playing audio:', error);
        showStatus('Failed to play audio', 'error');
    }
}

// Stop audio on host device (called via WebSocket)
async function stopAudioOnHost() {
    if (currentAudio) {
        await fadeOutAndStop(currentAudio);
        currentAudio = null;
    }
}

// Fade in audio to prevent DC offset click
function fadeIn(audioElement, duration = 20) {
    const steps = 10;
    const stepTime = duration / steps;
    let currentStep = 0;
    
    const fadeInterval = setInterval(() => {
        currentStep++;
        audioElement.volume = currentStep / steps;
        
        if (currentStep >= steps) {
            audioElement.volume = 1.0;
            clearInterval(fadeInterval);
        }
    }, stepTime);
}

// Fade out audio to prevent DC offset click
async function fadeOutAndStop(audioElement, duration = 20) {
    const steps = 10;
    const stepTime = duration / steps;
    let currentStep = steps;
    
    return new Promise((resolve) => {
        const fadeInterval = setInterval(() => {
            currentStep--;
            audioElement.volume = currentStep / steps;
            
            if (currentStep <= 0) {
                audioElement.volume = 0;
                audioElement.pause();
                audioElement.currentTime = 0;
                clearInterval(fadeInterval);
                resolve();
            }
        }, stepTime);
    });
}

// Stop all sounds
async function stopAllSounds() {
    try {
        const headers = authToken ? { 'X-Auth-Token': authToken } : {};
        
        // Send stop request to server (will broadcast via WebSocket)
        await fetch('/api/stop', {
            method: 'POST',
            headers
        });
        // Status message will be shown via WebSocket
    } catch (error) {
        console.error('Error stopping sounds:', error);
        showStatus('Failed to stop', 'error');
    }
}

// Show network info
async function showNetworkInfo() {
    try {
        const response = await fetch('/api/info');
        const info = await response.json();
        
        networkAddresses.innerHTML = '';
        
        if (info.addresses.length === 0) {
            networkAddresses.innerHTML = '<p>No network addresses found</p>';
        } else {
            info.addresses.forEach(addr => {
                const div = document.createElement('div');
                div.className = 'network-address';
                div.textContent = `http://${addr.address}:${info.port}`;
                networkAddresses.appendChild(div);
            });
        }
        
        networkInfo.classList.remove('hidden');
    } catch (error) {
        showStatus('Failed to get network info', 'error');
        console.error('Error getting network info:', error);
    }
}

// Show status message
function showStatus(message, type = 'success') {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.classList.remove('hidden');
    
    setTimeout(() => {
        statusDiv.classList.add('hidden');
    }, 3000);
}

// Load audio output devices
async function loadAudioDevices() {
    try {
        // Check if browser supports device selection
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            deviceList.innerHTML = '<p style="color: #a0a0a0; padding: 10px;">Audio device selection is not supported in this browser. Use Chrome or Edge on the host PC.</p>';
            deviceInfo.classList.remove('hidden');
            return;
        }
        
        // Check if setSinkId is supported
        if (!HTMLMediaElement.prototype.setSinkId) {
            deviceList.innerHTML = '<p style="color: #a0a0a0; padding: 10px;">Audio output device selection is not supported in this browser. Use Chrome or Edge.</p>';
            deviceInfo.classList.remove('hidden');
            return;
        }
        
        // Request microphone permission first (required to get device labels)
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
        } catch (err) {
            console.log('Microphone permission not granted, device labels may be limited');
        }
        
        // Get all media devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        
        // Filter for audio OUTPUT devices only
        const audioOutputs = devices.filter(device => device.kind === 'audiooutput');
        
        console.log('All devices:', devices);
        console.log('Audio outputs:', audioOutputs);
        
        deviceList.innerHTML = '';
        
        if (audioOutputs.length === 0) {
            deviceList.innerHTML = '<p style="color: #a0a0a0; padding: 10px;">No audio output devices found. Make sure you\'re using Chrome or Edge browser.<br><br>Note: This feature must be accessed locally on the host PC (not remotely).</p>';
        } else {
            // Get currently selected device (or default)
            if (!currentDeviceId && audioOutputs.length > 0) {
                currentDeviceId = audioOutputs[0].deviceId;
            }
            
            audioOutputs.forEach((device, index) => {
                const div = document.createElement('div');
                div.className = 'device-item';
                div.dataset.deviceId = device.deviceId;
                
                if (device.deviceId === currentDeviceId || (!currentDeviceId && index === 0)) {
                    div.classList.add('active');
                    if (!currentDeviceId) currentDeviceId = device.deviceId;
                }
                
                const name = document.createElement('span');
                name.className = 'device-name';
                // Show better labels
                const label = device.label || `Audio Output Device ${index + 1}`;
                name.textContent = label;
                div.appendChild(name);
                
                div.addEventListener('click', () => selectDevice(device.deviceId, div));
                
                deviceList.appendChild(div);
            });
            
            // Add info message
            const info = document.createElement('p');
            info.style.cssText = 'color: #6a6a6a; padding: 10px; margin-top: 10px; font-size: 0.85rem; border-top: 1px solid #2a2a2a;';
            info.textContent = `Found ${audioOutputs.length} output device${audioOutputs.length !== 1 ? 's' : ''}. Sounds will play through the selected device.`;
            deviceList.appendChild(info);
        }
        
        deviceInfo.classList.remove('hidden');
    } catch (error) {
        deviceList.innerHTML = '<p style="color: #a0a0a0; padding: 10px;">Unable to load audio devices. This feature requires Chrome/Edge browser and microphone permissions.</p>';
        deviceInfo.classList.remove('hidden');
        console.error('Error loading devices:', error);
    }
}

// Select audio output device
async function selectDevice(deviceId, element) {
    try {
        currentDeviceId = deviceId;
        
        // Update active state
        document.querySelectorAll('.device-item').forEach(item => {
            item.classList.remove('active');
        });
        element.classList.add('active');
        
        // Notify server (for logging/reference only)
        await fetch('/api/device', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deviceId })
        });
        
        showStatus('Audio output device selected', 'success');
        console.log(`Selected device: ${deviceId}`);
    } catch (error) {
        showStatus('Failed to set device', 'error');
        console.error('Error setting device:', error);
    }
}

// Event listeners
stopAllBtn.addEventListener('click', stopAllSounds);
showInfoBtn.addEventListener('click', showNetworkInfo);
closeInfoBtn.addEventListener('click', () => {
    networkInfo.classList.add('hidden');
});
showDevicesBtn.addEventListener('click', loadAudioDevices);
closeDevicesBtn.addEventListener('click', () => {
    deviceInfo.classList.add('hidden');
});

// Password authentication
const passwordDialog = document.getElementById('passwordDialog');
const passwordInput = document.getElementById('passwordInput');
const passwordSubmit = document.getElementById('passwordSubmit');
const passwordError = document.getElementById('passwordError');

function showPasswordDialog() {
    passwordDialog.classList.remove('hidden');
    passwordInput.value = '';
    passwordError.classList.add('hidden');
    passwordInput.focus();
}

passwordSubmit.addEventListener('click', async () => {
    const password = passwordInput.value;
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            passwordDialog.classList.add('hidden');
            showStatus('Authenticated successfully', 'success');
            await loadSounds();
        } else {
            passwordError.textContent = 'Invalid password';
            passwordError.classList.remove('hidden');
        }
    } catch (error) {
        passwordError.textContent = 'Authentication failed';
        passwordError.classList.remove('hidden');
    }
});

passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        passwordSubmit.click();
    }
});

// Sound Management (Host Only)
const manageBtn = document.getElementById('manageBtn');
const soundManagement = document.getElementById('soundManagement');
const closeManage = document.getElementById('closeManage');
const availableFiles = document.getElementById('availableFiles');
const currentSounds = document.getElementById('currentSounds');
const fileInput = document.getElementById('fileInput');
const uploadName = document.getElementById('uploadName');
const uploadBtn = document.getElementById('uploadBtn');

manageBtn.addEventListener('click', async () => {
    soundManagement.classList.remove('hidden');
    await loadAvailableFiles();
    await loadCurrentSounds();
});

closeManage.addEventListener('click', () => {
    soundManagement.classList.add('hidden');
});

// Load available files from sounds folder
async function loadAvailableFiles() {
    try {
        const response = await fetch('/api/sounds/files');
        const data = await response.json();
        
        availableFiles.innerHTML = '';
        
        if (data.files.length === 0) {
            availableFiles.innerHTML = '<p style="color: #6a6a6a; padding: 10px;">No unused files found</p>';
        } else {
            data.files.forEach(file => {
                const div = document.createElement('div');
                div.className = 'file-item';
                
                const span = document.createElement('span');
                span.textContent = file;
                div.appendChild(span);
                
                const btn = document.createElement('button');
                btn.textContent = 'Add';
                btn.addEventListener('click', () => addExistingFile(file));
                div.appendChild(btn);
                
                availableFiles.appendChild(div);
            });
        }
    } catch (error) {
        console.error('Error loading available files:', error);
    }
}

// Add existing file to soundboard
async function addExistingFile(filename) {
    const soundName = prompt(`Name for "${filename}"?`, filename.replace(/\.[^/.]+$/, ''));
    
    if (!soundName) return;
    
    try {
        const response = await fetch('/api/sounds/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename, soundName })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showStatus(`Added: ${soundName}`, 'success');
            await loadAvailableFiles();
            await loadCurrentSounds();
        } else {
            showStatus(`Error: ${data.error}`, 'error');
        }
    } catch (error) {
        showStatus('Failed to add sound', 'error');
        console.error('Error adding sound:', error);
    }
}

// Upload new sound file
uploadBtn.addEventListener('click', async () => {
    const file = fileInput.files[0];
    
    if (!file) {
        showStatus('Please select a file', 'error');
        return;
    }
    
    const formData = new FormData();
    formData.append('soundFile', file);
    formData.append('soundName', uploadName.value || file.name.replace(/\.[^/.]+$/, ''));
    
    try {
        const response = await fetch('/api/sounds/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showStatus(`Uploaded: ${data.sound.name}`, 'success');
            fileInput.value = '';
            uploadName.value = '';
            await loadAvailableFiles();
            await loadCurrentSounds();
        } else {
            showStatus(`Error: ${data.error}`, 'error');
        }
    } catch (error) {
        showStatus('Failed to upload', 'error');
        console.error('Error uploading:', error);
    }
});

// Load current sounds for management
async function loadCurrentSounds() {
    try {
        const response = await fetch('/api/sounds');
        const sounds = await response.json();
        
        currentSounds.innerHTML = '';
        
        sounds.forEach(sound => {
            const div = document.createElement('div');
            div.className = 'sound-item';
            
            const info = document.createElement('div');
            info.className = 'sound-item-info';
            
            const name = document.createElement('div');
            name.className = 'sound-item-name';
            name.textContent = sound.name;
            info.appendChild(name);
            
            const file = document.createElement('div');
            file.className = 'sound-item-file';
            file.textContent = sound.file;
            info.appendChild(file);
            
            div.appendChild(info);
            
            const actions = document.createElement('div');
            actions.className = 'sound-item-actions';
            
            const renameBtn = document.createElement('button');
            renameBtn.textContent = 'Rename';
            renameBtn.addEventListener('click', () => renameSound(sound.id, sound.name));
            actions.appendChild(renameBtn);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', () => deleteSound(sound.id, sound.name));
            actions.appendChild(deleteBtn);
            
            div.appendChild(actions);
            currentSounds.appendChild(div);
        });
    } catch (error) {
        console.error('Error loading current sounds:', error);
    }
}

// Rename sound
async function renameSound(id, currentName) {
    const newName = prompt(`Rename "${currentName}" to:`, currentName);
    
    if (!newName || newName === currentName) return;
    
    try {
        const response = await fetch(`/api/sounds/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showStatus(`Renamed to: ${newName}`, 'success');
            await loadCurrentSounds();
        } else {
            showStatus(`Error: ${data.error}`, 'error');
        }
    } catch (error) {
        showStatus('Failed to rename', 'error');
        console.error('Error renaming sound:', error);
    }
}

// Delete sound
async function deleteSound(id, name) {
    if (!confirm(`Delete "${name}"?`)) return;
    
    try {
        const response = await fetch(`/api/sounds/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showStatus(`Deleted: ${name}`, 'success');
            await loadCurrentSounds();
            await loadAvailableFiles();
        } else {
            showStatus(`Error: ${data.error}`, 'error');
        }
    } catch (error) {
        showStatus('Failed to delete', 'error');
        console.error('Error deleting sound:', error);
    }
}

// Initialize
initWebSocket();
//loadSounds(); // Will be called after auth check
