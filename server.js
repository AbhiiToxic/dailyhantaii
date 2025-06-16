const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'password';

function basicAuth(req, res, next) {
  const header = req.headers['authorization'] || '';
  const token = header.split(' ')[1];
  if (token) {
    const decoded = Buffer.from(token, 'base64').toString();
    const index = decoded.indexOf(':');
    const user = index >= 0 ? decoded.slice(0, index) : decoded;
    const pass = index >= 0 ? decoded.slice(index + 1) : '';
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      return next();
    }
  }
  res.setHeader('WWW-Authenticate', 'Basic');
  res.status(401).send('Authentication required.');
}

app.use(express.static(path.join(__dirname, '.')));
app.use(express.json());

// Fallback to index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/view', (req, res) => {
  res.sendFile(path.join(__dirname, 'view.html'));
});

app.get('/admin', basicAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.post('/api/add', basicAuth, (req, res) => {
  const linksPath = path.join(__dirname, 'links.json');
  const data = JSON.parse(fs.readFileSync(linksPath, 'utf8'));
  const numbers = data
    .map(l => parseInt(l.name, 10))
    .filter(n => !isNaN(n));
  const next = numbers.length ? Math.max(...numbers) + 1 : 1;
  const entry = {
    name: String(next),
    preview: req.body.preview,
    download: req.body.download
  };
  data.push(entry);
  fs.writeFileSync(linksPath, JSON.stringify(data, null, 2));
  res.json(entry);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
