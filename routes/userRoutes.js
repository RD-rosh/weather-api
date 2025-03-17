const express = require('express');
const User = require('../models/User');
const router = express.Router();

router.post('/add', async (req, res) => {
  try {
    const { email, location } = req.body;
    const user = new User({ email, location });
    await user.save();
    res.status(201).json({ message: 'User added', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/update/:email', async (req, res) => {
  try {
    const { location } = req.body;
    const user = await User.findOneAndUpdate(
      { email: req.params.email },
      { location },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Location updated', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/weather/:email', async (req, res) => {
  try {
    const { date } = req.query; 
    const start = new Date(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 1);

    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const weatherData = user.weatherData.filter(
      (data) => data.date >= start && data.date < end
    );
    res.json({ email: user.email, location: user.location, weatherData });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;