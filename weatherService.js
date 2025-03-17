const fetch = require('node-fetch'); 
const User = require('./models/User');
const nodemailer = require('nodemailer');

const fetchWeatherAndEmail = async () => {
  try {
    const users = await User.find();

    for (const user of users) {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${user.location}&appid=${process.env.WEATHER_API_KEY}&units=metric`
      );
      const weather = await response.json();
      if (!response.ok) throw new Error(weather.message || 'Weather API error');

      const temp = weather.main.temp;
      const desc = weather.weather[0].description;

      user.weatherData.push({ temperature: temp, description: desc });
      await user.save();
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const weatherText = (user.location, temp, desc);

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: `Weather Update for ${user.location}`,
        text: `${weatherText}`,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${user.email}`);
    }
  } catch (error) {
    console.error('Error in weather service:', error.message);
  }
};

module.exports = { fetchWeatherAndEmail };