#!/usr/bin/env node

/**
 * Simple IP Discovery Server
 * Run this on your laptop to help the mobile app auto-discover the backend IP
 * 
 * Usage: node discovery-server.js
 * The app will hit http://192.168.1.54:8001/ip to get the current IP
 */

const http = require('http');
const os = require('os');

// Get the local IPv4 address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Filter out internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

const PORT = 8001;
const LOCAL_IP = getLocalIP();

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.url === '/ip') {
    res.writeHead(200);
    res.end(JSON.stringify({ ip: LOCAL_IP }));
    console.log(`[${new Date().toLocaleTimeString()}] IP request from ${req.socket.remoteAddress} → ${LOCAL_IP}`);
  } else if (req.url === '/health') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ok', ip: LOCAL_IP }));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║          🌐 IP Discovery Server Started                      ║
╚══════════════════════════════════════════════════════════════╝

📍 Current IP Address: ${LOCAL_IP}
🔌 Listening on:      0.0.0.0:${PORT}

✅ Mobile app can now find your IP automatically!

📱 The app will check: http://<phone-ip>:${PORT}/ip
🔄 Automatic fallback:  http://${LOCAL_IP}:8000

Keep this running while developing!
Press Ctrl+C to stop.
  `);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use!`);
    console.error('Kill the process using this port and try again.');
    process.exit(1);
  }
  throw err;
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 IP Discovery Server stopped.');
  server.close();
  process.exit(0);
});
