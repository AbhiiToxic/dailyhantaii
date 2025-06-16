const express = require('express');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const linksApi = require('./pages/api/links');
const app = express();

const PORT = process.env.PORT || 3000;

// Default MongoDB connection string
const MONGO_URL = process.env.MONGO_URL ||
  'mongodb+srv://SITE:SITE@cluster0.oscpdgu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
let linksCollection;

if (MONGO_URL) {
  MongoClient.connect(MONGO_URL)
    .then(client => {
      linksCollection = client.db().collection('links');
      console.log('Connected to MongoDB');
    })
    .catch(err => {
      console.error('Failed to connect to MongoDB', err);
    });
}

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

app.use(express.json());
app.use('/api/links', linksApi);

app.get('/links.json', async (req, res) => {
  if (linksCollection) {
    const data = await linksCollection.find().toArray();
    res.json(data);
  } else {
    res.sendFile(path.join(__dirname, 'links.json'));
  }
});

app.use(express.static(path.join(__dirname, '.')));

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

app.post('/api/add', basicAuth, async (req, res) => {
  const entry = {
    preview: req.body.preview,
    download: req.body.download
  };

  if (linksCollection) {
    const last = await linksCollection
      .find({}, { projection: { name: 1 } })
      .sort({ name: -1 })
      .limit(1)
      .toArray();
    const next = last.length ? (parseInt(last[0].name, 10) || 0) + 1 : 1;
    entry.name = String(next);
    await linksCollection.insertOne(entry);
    res.json(entry);
  } else {
    const linksPath = path.join(__dirname, 'links.json');
    const data = JSON.parse(fs.readFileSync(linksPath, 'utf8'));
    const numbers = data
      .map(l => parseInt(l.name, 10))
      .filter(n => !isNaN(n));
    const next = numbers.length ? Math.max(...numbers) + 1 : 1;
    entry.name = String(next);
    data.push(entry);
    fs.writeFileSync(linksPath, JSON.stringify(data, null, 2));
    res.json(entry);
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
