// Simple HTTP server to serve the HTML files
// This is needed because WebSockets don't work with file:// protocol
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json'
};

const server = http.createServer((req, res) => {
  // Parse URL to separate path from query string
  // Remove query string and hash from the URL
  let urlPath = req.url.split('?')[0].split('#')[0];
  let filePath = '.' + urlPath;
  
  // Default to index.html for root
  if (filePath === './' || filePath === '.') {
    filePath = './index.html';
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  // Log requests for debugging
  console.log(`${req.method} ${req.url} -> ${filePath}`);

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        console.error(`404: File not found - ${filePath} (requested: ${req.url})`);
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(`<h1>404 - File Not Found</h1><p>Requested: ${req.url}</p><p>File path: ${filePath}</p>`, 'utf-8');
      } else {
        console.error(`500: Server error - ${error.code} for ${filePath}`);
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`, 'utf-8');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// Listen on all interfaces (0.0.0.0) to allow external connections
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✓ HTTP server running on http://localhost:${PORT}`);
  console.log(`\nFor local network access:`);
  console.log(`  http://YOUR_LOCAL_IP:${PORT}/soccer-rocker-2p.html`);
  console.log(`\nTo find your local IP: ifconfig | grep "inet " | grep -v 127.0.0.1\n`);
});

