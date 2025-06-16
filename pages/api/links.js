const express = require('express');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const router = express.Router();

// MongoDB setup if MONGO_URL provided
const MONGO_URL = process.env.MONGO_URL || null;
let linksCollection;
if (MONGO_URL) {
  MongoClient.connect(MONGO_URL)
    .then(client => {
      linksCollection = client.db().collection('links');
      console.log('API route connected to MongoDB');
    })
    .catch(err => {
      console.error('API route failed to connect to MongoDB', err);
    });
}

// Helper to read links from local file
const linksFile = path.join(process.cwd(), 'links.json');
function readLocalLinks() {
  if (!fs.existsSync(linksFile)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(linksFile, 'utf8'));
}

// Helper to write links to local file
function writeLocalLinks(data) {
  fs.writeFileSync(linksFile, JSON.stringify(data, null, 2));
}

// GET /api/links - fetch all links
router.get('/', async (req, res) => {
  try {
    if (linksCollection) {
      const data = await linksCollection.find().toArray();
      return res.json(data);
    }
    const data = readLocalLinks();
    return res.json(data);
  } catch (err) {
    console.error('Failed to fetch links', err);
    res.status(500).json({ error: 'Failed to fetch links' });
  }
});

// POST /api/links - add a new link
router.post('/', async (req, res) => {
  try {
    const { preview, download } = req.body;
    if (!preview || !download) {
      return res.status(400).json({ error: 'preview and download required' });
    }
    const entry = { preview, download };

    if (linksCollection) {
      const last = await linksCollection.find({}, { projection: { name: 1 } }).sort({ name: -1 }).limit(1).toArray();
      const next = last.length ? (parseInt(last[0].name, 10) || 0) + 1 : 1;
      entry.name = String(next);
      await linksCollection.insertOne(entry);
      return res.json(entry);
    }

    const data = readLocalLinks();
    const numbers = data.map(l => parseInt(l.name, 10)).filter(n => !isNaN(n));
    const next = numbers.length ? Math.max(...numbers) + 1 : 1;
    entry.name = String(next);
    data.push(entry);
    writeLocalLinks(data);
    return res.json(entry);
  } catch (err) {
    console.error('Failed to add link', err);
    res.status(500).json({ error: 'Failed to add link' });
  }
});

module.exports = router;
