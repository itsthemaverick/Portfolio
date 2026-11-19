#!/usr/bin/env node

/**
 * Production Static File Server for Hostinger Node.js / Custom VPS Deployments
 * Serves the exported static files in `out/` with appropriate MIME types, clean routing,
 * and 404 fallbacks.
 */

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';
const OUT_DIR = path.resolve(__dirname, 'out');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.xml': 'application/xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.txt': 'text/plain; charset=utf-8',
  '.pdf': 'application/pdf',
};

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
    return;
  }

  const parsedUrl = new URL(
    req.url,
    `http://${req.headers.host || 'localhost'}`,
  );
  const pathname = decodeURIComponent(parsedUrl.pathname);

  // Security check: prevent directory traversal
  const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(OUT_DIR, safePath);

  // If path is a directory or root, look for index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    if (!pathname.endsWith('/')) {
      // Redirect to trailing slash for canonical consistency
      res.writeHead(301, {
        Location: `${pathname}/${parsedUrl.search || ''}`,
      });
      res.end();
      return;
    }
    filePath = path.join(filePath, 'index.html');
  }

  // If file doesn't exist, try appending index.html (e.g. /about/) or .html (e.g. /about)
  if (!fs.existsSync(filePath)) {
    const asDirIndex = path.join(filePath, 'index.html');
    const asHtml = `${filePath}.html`;
    if (fs.existsSync(asDirIndex)) {
      filePath = asDirIndex;
    } else if (fs.existsSync(asHtml)) {
      filePath = asHtml;
    }
  }

  // If still not found, serve 404.html
  let statusCode = 200;
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(OUT_DIR, '404.html');
    statusCode = 404;
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(statusCode, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found (out/ directory not built yet. Run npm run build)');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  const headers = {
    'Content-Type': contentType,
    'X-Content-Type-Options': 'nosniff',
  };

  // Cache headers
  if (
    safePath.startsWith('/_next/static/') ||
    safePath.startsWith('\\_next\\static\\')
  ) {
    headers['Cache-Control'] = 'public, max-age=31536000, immutable';
  } else if (ext === '.html') {
    headers['Cache-Control'] = 'public, max-age=0, must-revalidate';
  }

  res.writeHead(statusCode, headers);
  if (req.method === 'HEAD') {
    res.end();
    return;
  }

  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
});

server.listen(PORT, HOST, () => {
  console.log(`Production static server listening on http://${HOST}:${PORT}`);
  console.log(`Serving static files from: ${OUT_DIR}`);
});
