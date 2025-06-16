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
      console.log('Stats summary route connected to MongoDB');
    })
    .catch(err => {
      console.error('Stats summary failed to connect to MongoDB', err);
    });
}

const statsFile = path.join(process.cwd(), 'stats.json');

function readLocalStats() {
  if (!fs.existsSync(statsFile)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(statsFile, 'utf8'));
}

router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    let todayVisits = 0;
    let monthVisits = 0;
    let yearVisits = 0;
    let totalClicks = 0;

    if (statsCollection) {
      todayVisits = await statsCollection.countDocuments({ type: 'visit', date: { $gte: startOfToday } });
      monthVisits = await statsCollection.countDocuments({ type: 'visit', date: { $gte: startOfMonth } });
      yearVisits = await statsCollection.countDocuments({ type: 'visit', date: { $gte: startOfYear } });
      totalClicks = await statsCollection.countDocuments({ type: 'click' });
    } else {
      const data = readLocalStats();
      for (const entry of data) {
        const d = new Date(entry.date);
        if (entry.type === 'visit') {
          if (d >= startOfToday) todayVisits++;
          if (d >= startOfMonth) monthVisits++;
          if (d >= startOfYear) yearVisits++;
        } else if (entry.type === 'click') {
          totalClicks++;
        }
      }
    }

    res.json({ todayVisits, monthVisits, yearVisits, totalClicks });
  } catch (err) {
    console.error('Failed to fetch stats summary', err);
    res.status(500).json({ error: 'Failed to fetch stats summary' });
  }
});

module.exports = router;
