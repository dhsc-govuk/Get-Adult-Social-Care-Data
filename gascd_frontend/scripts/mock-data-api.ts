import http from 'http';
import { getResponse } from 'msw';
import { handlers } from '@/mocks/handlers';
import { variedHandlers } from '@/mocks/variedHandlers';

// A standalone fake data API for the screenshot tests. Route handlers' fetch
// isn't intercepted by the in-process MOCK_SERVER, so the app points
// DATA_API_ROOT here instead. Run with DATA_API_ROOT set to this server's URL.

const port = Number(new URL(process.env.DATA_API_ROOT!).port);

// msw uses the first matching handler, so the varied ones take precedence
const allHandlers = [...variedHandlers, ...handlers];

http
  .createServer(async (req, res) => {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk);
    const hasBody = req.method !== 'GET' && req.method !== 'HEAD';

    const request = new Request(`${process.env.DATA_API_ROOT}${req.url}`, {
      method: req.method,
      headers: { 'content-type': req.headers['content-type'] ?? '' },
      body: hasBody ? Buffer.concat(chunks) : undefined,
    });

    const response = await getResponse(allHandlers, request);
    if (!response) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  })
  .listen(port, () => console.log(`Mock data API listening on ${port}`));
