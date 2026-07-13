const express = require('express');
const path = require('path');

const app = express();
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '0.0.0.0';

app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (_req, res) => {
  res.json({ ok: true, app: 'ARES-X NOMAD 3D Showcase' });
});

app.listen(port, host, async () => {
  const url = `http://localhost:${port}`;
  console.log(`ARES-X 3D website running at ${url}`);

  if (process.env.NO_OPEN !== '1') {
    try {
      const { default: open } = await import('open');
      await open(url);
    } catch (error) {
      console.warn('Could not open the browser automatically:', error.message);
    }
  }
});
