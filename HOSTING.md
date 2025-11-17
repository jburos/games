# Hosting Soccer Rocker 2P for External Users

## Quick Setup for Local Network (Same WiFi)

If both players are on the same network (same WiFi/router):

### 1. Find Your Local IP Address

**Mac/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" (usually starts with 192.168.x.x or 10.x.x.x)

### 2. Start the Server

```bash
npm start
```

The server will listen on all network interfaces and is ready for connections.

### 3. Share the Game

**Option A: Direct IP Access (Easiest)**
- Share your local IP address (e.g., `192.168.87.22`) with the other player
- They open: `http://YOUR_IP:3000/soccer-rocker-2p.html?ip=YOUR_IP`
- Replace `YOUR_IP` with your actual IP address

**Option B: URL Parameter**
- You open: `http://YOUR_IP:3000/soccer-rocker-2p.html?ip=YOUR_IP`
- They open: `http://YOUR_IP:3000/soccer-rocker-2p.html?ip=YOUR_IP`
- The `?ip=` parameter tells the client which IP to connect to

**Option C: Serve via HTTP Server**
If you're using `npm run serve`, it runs on port 3000. Make sure both players can access:
- `http://YOUR_IP:3000/soccer-rocker-2p.html`

### 4. Firewall Configuration

You may need to allow incoming connections:

**Mac:**
1. System Settings → Network → Firewall
2. Click "Options" or "Firewall Options"
3. Allow incoming connections for Node.js, or add port 3001

**Linux:**
```bash
sudo ufw allow 3001
sudo ufw allow 3000  # For HTTP server
```

**Windows:**
1. Windows Defender Firewall → Advanced Settings
2. Inbound Rules → New Rule
3. Allow TCP port 3001 and 3000

## Hosting for Internet Access (Different Networks)

For players on different networks, you need:

### 1. Port Forwarding on Your Router

1. Log into your router (usually `192.168.1.1` or `192.168.0.1`)
2. Find "Port Forwarding" or "Virtual Server" settings
3. Forward port 3001 (TCP) to your computer's local IP
4. Optionally forward port 3000 for the HTTP server

### 2. Find Your Public IP

```bash
curl ifconfig.me
```

Or visit: https://whatismyipaddress.com/

### 3. Share Your Public IP

- Share your public IP with the other player
- They connect to: `http://YOUR_PUBLIC_IP:3000/soccer-rocker-2p.html?ip=YOUR_PUBLIC_IP`

**⚠️ Security Note:** Opening ports exposes your server to the internet. For production, consider:
- Using a cloud service (Heroku, Railway, Render, etc.)
- Setting up HTTPS/WSS
- Adding authentication

## Using a Cloud Service (Recommended for Internet)

### Option 1: Railway.app (Free tier available)

1. Sign up at https://railway.app
2. Create new project → Deploy from GitHub
3. Add environment variable: `PORT=3001`
4. Railway will provide a public URL

### Option 2: Render.com (Free tier available)

1. Sign up at https://render.com
2. Create new Web Service
3. Connect your GitHub repo
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Add environment variable: `PORT=3001`

### Option 3: Heroku

1. Install Heroku CLI
2. Create `Procfile`:
   ```
   web: node soccer-server.js
   ```
3. Deploy:
   ```bash
   heroku create
   git push heroku main
   ```

## Testing External Access

### Test from Another Device

1. On your phone/tablet (different network), open:
   ```
   http://YOUR_PUBLIC_IP:3000/soccer-rocker-2p.html?ip=YOUR_PUBLIC_IP
   ```

2. Check if connection works

### Troubleshooting

**"Connection refused"**
- Check firewall settings
- Verify port forwarding is configured
- Make sure server is running

**"Connection timeout"**
- Router may be blocking connections
- Check if your ISP blocks incoming connections
- Try a different port (some ISPs block common ports)

**"Mixed content" error**
- If hosting on HTTPS, WebSocket must use `wss://` (secure)
- Update server to support WSS or use HTTP

## Quick Reference

**Local Network (Same WiFi):**
- Server: `npm start` (listens on 0.0.0.0:3001)
- HTTP: `npm run serve` (listens on 0.0.0.0:3000)
- Player 1: `http://YOUR_LOCAL_IP:3000/soccer-rocker-2p.html?ip=YOUR_LOCAL_IP`
- Player 2: `http://YOUR_LOCAL_IP:3000/soccer-rocker-2p.html?ip=YOUR_LOCAL_IP`

**Internet (Different Networks):**
- Requires port forwarding or cloud hosting
- Use public IP instead of local IP
- Consider using a cloud service for easier setup

## Security Considerations

⚠️ **Warning:** The current setup has no authentication. Anyone with the IP and port can:
- Create/join rooms
- See game state
- Send commands

For production use, consider adding:
- Room code authentication
- Rate limiting
- HTTPS/WSS encryption
- User authentication

