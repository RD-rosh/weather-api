const mongoose = require('mongoose');

const user = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  weatherData: [{
    date: { type: Date, default: Date.now },
    temperature: Number,
    description: String,
  }],
});

module.exports = mongoose.model('User', user);