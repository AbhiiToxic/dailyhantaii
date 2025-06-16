const mongoose = require('mongoose');

const statsSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['visit', 'click'],
    required: true
  },
  date: {
    type: Date,
    required: true
  }
});

module.exports = mongoose.model('Stat', statsSchema);
