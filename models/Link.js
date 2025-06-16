const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  preview: {
    type: String,
    required: true
  },
  download: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Link', linkSchema);
