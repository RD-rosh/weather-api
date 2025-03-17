const fetch = require('node-fetch'); 
const User = require('./models/User');

const fetchWeather = async () => {
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
      console.log('saved weather');
    }
  } catch (error) {
    console.error('Error in weather service:', error.message);
  }
};

module.exports = { fetchWeather };