const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes'); 
const cron = require('node-cron');

dotenv.config(); 

const app = express();
app.use(express.json()); 

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to db'))
  .catch(err => console.log('Connection error:', err));

app.use('/api/users', userRoutes);

//5 mins cronjob
cron.schedule('*/5 * * * *', () => {
  console.log('fetch weather');
  fetchWeather();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running port ${PORT}`);
});