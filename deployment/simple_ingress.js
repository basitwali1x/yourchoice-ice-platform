const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 80;
const BACKEND_PORT = 8000;

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
};

const DIRS = {
    'staff.yci.lvh.me': path.join(__dirname, '../frontend-staff/dist'),
    'admin.yci.lvh.me': path.join(__dirname, '../frontend-admin/dist'),
    'yci.lvh.me': path.join(__dirname, '../frontend-customer/dist'),
};

const server = http.createServer((req, res) => {
    const host = req.headers.host ? req.headers.host.split(':')[0] : 'localhost';

    // API Proxy
    if (host === 'api.yci.lvh.me') {
        const options = {
            hostname: '127.0.0.1',
            port: BACKEND_PORT,
            path: req.url,
            method: req.method,
            headers: req.headers,
        };

        const proxyReq = http.request(options, (proxyRes) => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res);
        });

        proxyReq.on('error', (e) => {
            console.error(`API Proxy Error: ${e.message}`);
            res.writeHead(502);
            res.end('Bad Gateway');
        });

        req.pipe(proxyReq);
        return;
    }

    // Static File Serving
    const rootDir = DIRS[host];
    if (!rootDir) {
        res.writeHead(404);
        res.end(`Unknown host: ${host}`);
        return;
    }

    let filePath = path.join(rootDir, req.url === '/' ? 'index.html' : req.url);
    const ext = path.extname(filePath).toLowerCase();

    // SPA Fallback: If file doesn't exist and no extension (or html), serve index.html
    if (!fs.existsSync(filePath)) {
        if (!ext || ext === '.html') {
            filePath = path.join(rootDir, 'index.html');
        } else {
            // Asset missing
            res.writeHead(404);
            res.end('Not found');
            return;
        }
    }

    // Serve file
    const contentType = MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(500);
            res.end(`Server Error: ${err.code}`);
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Ingress Server running on port ${PORT}`);
    console.log(`Routing (Zero-Config lvh.me):`);
    console.log(`  api.yci.lvh.me   -> localhost:${BACKEND_PORT}`);
    console.log(`  staff.yci.lvh.me -> static/frontend-staff`);
    console.log(`  admin.yci.lvh.me -> static/frontend-admin`);
    console.log(`  yci.lvh.me       -> static/frontend-customer`);
});
