# Troubleshooting Soccer Rocker 2P Connection Issues

## Common Issues and Solutions

### 1. "Connection error" or "Connection closed"

**Problem:** The WebSocket server isn't running or can't be reached.

**Solution:**
1. Make sure the server is running:
   ```bash
   npm start
   ```
   You should see: `Soccer Rocker server running on port 8080`

2. Check if port 8080 is in use:
   ```bash
   lsof -i :8080
   ```

3. If port 8080 is busy, use a different port:
   ```bash
   PORT=3000 npm start
   ```
   Then update `WS_URL` in `soccer-rocker-2p.html` to match.

### 2. Opening HTML file directly (file:// protocol)

**Problem:** If you open `soccer-rocker-2p.html` directly from the file system (double-clicking it), WebSockets won't work due to browser security restrictions.

**Solution:** Use a local web server:

**Option A: Use the provided HTTP server:**
```bash
node serve.js
```
Then open: `http://localhost:3000/soccer-rocker-2p.html`

**Option B: Use Python (if installed):**
```bash
python3 -m http.server 3000
```
Then open: `http://localhost:3000/soccer-rocker-2p.html`

**Option C: Use Node.js http-server (install first):**
```bash
npx http-server -p 3000
```

### 3. Browser Console Errors

**Check the browser console (F12 or Cmd+Option+I) for errors:**

- **"WebSocket connection failed"**: Server isn't running
- **"Mixed Content"**: Using HTTPS page with WS (should use WSS)
- **CORS errors**: Usually not an issue with WebSockets, but check server logs

### 4. Server Running But No Response

**Check server logs** - you should see:
- `Soccer Rocker server running on port 8080`
- `Received message: create from player: unknown` (when client connects)

**If you don't see messages:**
- The server might be a different process
- Check if multiple Node processes are running: `ps aux | grep node`
- Kill old processes and restart: `pkill -f soccer-server` then `npm start`

### 5. Testing the Connection

Run the test script:
```bash
node test-server.js
```

This will verify:
- ✓ Server is running
- ✓ WebSocket connection works
- ✓ Server responds to messages

### 6. Firewall Issues

**If connecting from different devices on the same network:**

1. Make sure your firewall allows connections on port 8080
2. Use your computer's local IP address instead of localhost:
   - Find your IP: `ifconfig | grep "inet "` (Mac/Linux) or `ipconfig` (Windows)
   - Update `WS_URL` in `soccer-rocker-2p.html` to use your IP:
     ```javascript
     const WS_URL = 'ws://192.168.1.XXX:8080';  // Replace with your IP
     ```

### 7. Quick Checklist

- [ ] Server is running (`npm start`)
- [ ] HTML file is opened via `http://localhost` (not `file://`)
- [ ] Browser console shows connection attempts
- [ ] Server logs show incoming connections
- [ ] Both players are using the same server URL
- [ ] Room code is entered correctly (6 characters, case-insensitive)

### 8. Still Not Working?

1. **Check server logs** - Look for error messages
2. **Check browser console** - Look for WebSocket errors
3. **Try the test script**: `node test-server.js`
4. **Restart everything**: 
   - Stop server (Ctrl+C)
   - Close browser tabs
   - Restart server
   - Open fresh browser tabs

## Getting Help

If you're still having issues:
1. Check the server terminal for error messages
2. Check the browser console (F12) for errors
3. Note the exact error messages you see
4. Make sure both the server and client are using the same port

