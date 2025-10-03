# Password Configuration Guide

## Default Password

**`soundboard123`**

## Changing the Password

### Option 1: Environment Variable (Recommended)

**Windows PowerShell:**
```powershell
$env:SOUNDBOARD_PASSWORD="your_secure_password"
npm start
```

**Windows Command Prompt:**
```cmd
set SOUNDBOARD_PASSWORD=your_secure_password
npm start
```

**Linux/Mac:**
```bash
export SOUNDBOARD_PASSWORD="your_secure_password"
npm start
```

### Option 2: Edit server.js

Find this line in `server.js`:
```javascript
const PASSWORD = process.env.SOUNDBOARD_PASSWORD || 'soundboard123';
```

Change `'soundboard123'` to your desired password:
```javascript
const PASSWORD = process.env.SOUNDBOARD_PASSWORD || 'your_new_password';
```

## Authentication Behavior

| Device Type | Authentication | Features |
|-------------|---------------|----------|
| **Host PC (localhost)** | ✅ Automatic | Full access - manage sounds, upload, rename, delete |
| **Remote Device** | 🔑 Password Required | Trigger sounds only (read-only) |

## Security Notes

- ✅ Host PC (localhost) always trusted
- 🔒 Remote devices must authenticate with password
- 💾 Session tokens stored in server memory
- ♻️ Sessions expire when server restarts
- 🌐 Password sent over HTTP (use HTTPS in production)

---

For full documentation, see [README.md](README.md)
