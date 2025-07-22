const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const devcert = require('devcert');

const app = next({ dev: true });
const handle = app.getRequestHandler();

const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3000;

(async () => {
  await app.prepare();
  if (HOST === 'localhost' || HOST === '127.0.0.1') {
    // HTTPS para localhost
    const ssl = await devcert.certificateFor('localhost');
    createServer(ssl, (req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    }).listen(PORT, err => {
      if (err) throw err;
      console.log(`> Ready on https://localhost:${PORT}`);
    });
  } else {
    // HTTP para IP ou outros domínios
    const http = require('http');
    http.createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    }).listen(PORT, HOST, err => {
      if (err) throw err;
      console.log(`> Ready on http://${HOST}:${PORT}`);
    });
  }
})();
