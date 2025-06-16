const express = require('express');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const router = express.Router({ mergeParams: true });

const MONGO_URL = process.env.MONGO_URL || null;
let linksCollection;
if (MONGO_URL) {
  MongoClient.connect(MONGO_URL)
    .then(client => {
      linksCollection = client.db().collection('links');
      console.log('API [id] route connected to MongoDB');
    })
    .catch(err => {
      console.error('API [id] route failed to connect to MongoDB', err);
    });
}

const linksFile = path.join(process.cwd(), 'links.json');
function readLocalLinks() {
  if (!fs.existsSync(linksFile)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(linksFile, 'utf8'));
}
function writeLocalLinks(data) {
  fs.writeFileSync(linksFile, JSON.stringify(data, null, 2));
}

router.put('/', async (req, res) => {
  const id = req.params.id;
  try {
    const { preview, download } = req.body;
    if (!preview || !download) {
      return res.status(400).json({ error: 'preview and download required' });
    }
    if (linksCollection) {
      const result = await linksCollection.findOneAndUpdate(
        { name: id },
        { $set: { preview, download } },
        { returnDocument: 'after' }
      );
      if (!result.value) {
        return res.status(404).json({ error: 'Link not found' });
      }
      return res.json(result.value);
    }
    const data = readLocalLinks();
    const index = data.findIndex(l => l.name === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Link not found' });
    }
    data[index].preview = preview;
    data[index].download = download;
    writeLocalLinks(data);
    return res.json(data[index]);
  } catch (err) {
    console.error('Failed to update link', err);
    res.status(500).json({ error: 'Failed to update link' });
  }
});

router.delete('/', async (req, res) => {
  const id = req.params.id;
  try {
    if (linksCollection) {
      const result = await linksCollection.deleteOne({ name: id });
      if (!result.deletedCount) {
        return res.status(404).json({ error: 'Link not found' });
      }
      return res.json({ success: true });
    }
    const data = readLocalLinks();
    const index = data.findIndex(l => l.name === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Link not found' });
    }
    data.splice(index, 1);
    writeLocalLinks(data);
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to delete link', err);
    res.status(500).json({ error: 'Failed to delete link' });
  }
});

module.exports = router;
