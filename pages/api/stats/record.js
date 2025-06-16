const express = require('express');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const router = express.Router();

const MONGO_URL = process.env.MONGO_URL || null;
let statsCollection;
if (MONGO_URL) {
  MongoClient.connect(MONGO_URL)
    .then(client => {
      statsCollection = client.db().collection('stats');
      console.log('Stats record route connected to MongoDB');
    })
    .catch(err => {
      console.error('Stats record route failed to connect to MongoDB', err);
    });
}

const statsFile = path.join(process.cwd(), 'stats.json');
function readLocalStats() {
  if (!fs.existsSync(statsFile)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(statsFile, 'utf8'));
}
function writeLocalStats(data) {
  fs.writeFileSync(statsFile, JSON.stringify(data, null, 2));
}

router.post('/', async (req, res) => {
  try {
    const { type } = req.body;
    if (type !== 'visit' && type !== 'click') {
      return res.status(400).json({ error: 'type must be visit or click' });
    }
    const entry = { type, date: new Date() };
    if (statsCollection) {
      await statsCollection.insertOne(entry);
      return res.json(entry);
    }
    const data = readLocalStats();
    data.push(entry);
    writeLocalStats(data);
    res.json(entry);
  } catch (err) {
    console.error('Failed to record stat', err);
    res.status(500).json({ error: 'Failed to record stat' });
  }
});

module.exports = router;
