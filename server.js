const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const devcert = require('devcert');

const app = next({ dev: true });
const handle = app.getRequestHandler();

(async () => {
  const ssl = await devcert.certificateFor('192.168.15.5');
  await app.prepare();
  createServer(ssl, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(3000, err => {
    if (err) throw err;
    console.log('> Ready on http://192.168.15.5:3000');
  });
})();
