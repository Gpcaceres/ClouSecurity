const express = require('express');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || 'changeme';

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'CloudSecurity example app', host: os.hostname() });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Endpoint protegido con un API key simple (para demo)
app.get('/secure', (req, res) => {
  const key = req.header('x-api-key');
  if (!key || key !== API_KEY) {
    console.warn('Unauthorized access attempt from', req.ip);
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json({ secret: 'datos-sensibles-de-ejemplo' });
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
