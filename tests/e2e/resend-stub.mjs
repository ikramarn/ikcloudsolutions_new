// Minimal Resend API stub for e2e runs.
// POST /emails -> 200 {"id":"stub"}, or 500 when the raw body contains the marker [force-fail].
// GET /__last  -> the last received payload (raw body, parsed when JSON) and its headers.
import { createServer } from 'node:http';

const port = Number(process.env.STUB_PORT ?? 3199);
let last = null;
// Recent payloads, newest last, so parallel tests can find THEIR message by a unique marker.
const recent = [];
const RECENT_LIMIT = 100;

const server = createServer((req, res) => {
  const chunks = [];
  req.on('data', (chunk) => chunks.push(chunk));
  req.on('end', () => {
    const raw = Buffer.concat(chunks).toString('utf8');
    const send = (status, body) => {
      res.writeHead(status, { 'content-type': 'application/json' });
      res.end(JSON.stringify(body));
    };

    if (req.method === 'GET' && req.url === '/__last') {
      send(200, last);
      return;
    }

    if (req.method === 'GET' && req.url?.startsWith('/__find')) {
      // GET /__find?q=marker -> the newest received payload whose raw body contains the marker.
      const q = new URL(req.url, 'http://stub').searchParams.get('q') ?? '';
      const hit = q ? [...recent].reverse().find((entry) => entry.raw.includes(q)) : undefined;
      send(hit ? 200 : 404, hit ?? null);
      return;
    }
    if (req.method === 'POST' && req.url === '/emails') {
      let payload = null;
      try {
        payload = JSON.parse(raw);
      } catch {
        payload = null;
      }
      last = { headers: req.headers, raw, payload };
      recent.push(last);
      if (recent.length > RECENT_LIMIT) recent.shift();
      if (raw.includes('[force-fail]')) {
        send(500, { name: 'application_error', message: 'stub failure', statusCode: 500 });
        return;
      }
      send(200, { id: 'stub' });
      return;
    }

    send(404, { name: 'not_found', message: 'not found', statusCode: 404 });
  });
});

server.listen(port, () => {
  console.warn(`resend stub listening on ${port}`);
});
