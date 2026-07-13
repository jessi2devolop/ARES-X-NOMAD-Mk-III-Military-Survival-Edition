const express = require('express');
const path = require('path');

const app = express();
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '0.0.0.0';

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, host, async () => {
  const url = `http://localhost:${port}`;
  console.log(`ARES-X NOMAD running at ${url}`);

  if (process.env.NO_OPEN !== '1') {
    try {
      const { default: open } = await import('open');
      await open(url);
    } catch (error) {
      console.warn('Could not open browser automatically:', error.message);
    }
  }
});
