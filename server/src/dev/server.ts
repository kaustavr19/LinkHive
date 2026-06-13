import { createServer } from 'node:http';
import 'dotenv/config';

const PORT = parseInt(process.env.PORT || '3001', 10);

const linksApi = (await import('../functions/links-api.js')).default;
const enrichLink = (await import('../functions/enrich-link.js')).default;

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://localhost:${PORT}`);
  const path = url.pathname;

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(chunk as Buffer);
  }
  const bodyStr = Buffer.concat(chunks).toString('utf-8');

  const query: Record<string, string> = {};
  url.searchParams.forEach((v, k) => { query[k] = v; });

  const context = {
    req: {
      method: req.method || 'GET',
      url: req.url || '/',
      path: '',
      headers: req.headers as Record<string, string>,
      body: bodyStr,
      bodyRaw: bodyStr,
      query,
    },
    res: {
      send(body: string, statusCode = 200, headers: Record<string, string> = {}) {
        res.writeHead(statusCode, { 'Content-Type': 'text/plain', ...headers });
        res.end(body);
      },
      json(body: unknown, statusCode = 200, headers: Record<string, string> = {}) {
        res.writeHead(statusCode, { 'Content-Type': 'application/json', ...headers });
        res.end(JSON.stringify(body, null, 2));
      },
      empty() {
        res.writeHead(204);
        res.end();
      },
    },
    log: (msg: string) => console.log(`[LOG] ${msg}`),
    error: (msg: string) => console.error(`[ERR] ${msg}`),
  };

  try {
    if (path.startsWith('/api/links')) {
      context.req.path = path.replace('/api/links', '') || '/';
      await linksApi(context as any);
      return;
    }

    if (path.startsWith('/api/enrich')) {
      context.req.path = path.replace('/api/enrich', '') || '/';
      await enrichLink(context as any);
      return;
    }

    if (path === '/' || path === '/health') {
      context.res.json({ status: 'ok', functions: ['links-api', 'enrich-link'] });
      return;
    }

    context.res.json({ error: 'Not found' }, 404);
  } catch (err: any) {
    console.error('Unhandled:', err);
    if (!res.headersSent) {
      context.res.json({ error: err.message }, 500);
    }
  }
});

server.listen(PORT, () => {
  console.log(`\n🚀 LinkHive dev server running at http://localhost:${PORT}\n`);
  console.log('Routes:');
  console.log('  GET    /health              → Health check');
  console.log('  POST   /api/links           → Create link');
  console.log('  GET    /api/links           → List links');
  console.log('  GET    /api/links/:id       → Get single link');
  console.log('  PATCH  /api/links/:id       → Update link');
  console.log('  DELETE /api/links/:id       → Delete link');
  console.log('  POST   /api/links/bulk-import → Bulk import');
  console.log('  GET    /api/links/export    → Export links');
  console.log('  POST   /api/enrich          → Manual enrich test');
  console.log(`\nNote: Set x-appwrite-user-id header to simulate auth.\n`);
});
