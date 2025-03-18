const fetch = require('node-fetch'); 
const User = require('./models/User');
const nodemailer = require('nodemailer');

const endpoint = "https://models.inference.ai.azure.com";
const modelName = "gpt-4o";
const token = process.env.GITHUB_COPILOT_TOKEN;

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
      console.log('weather saved')

      

      const prompt = `Generate a friendly weather report less than 200 words for ${user.location}. The current temperature is ${temp}°C with ${desc}.`;

      const chatResponse = await fetch(`${endpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelName,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 200,
          temperature: 1.0,
        }),
      });

      const result = await chatResponse.json();
      console.log(chatResponse)
      if (!chatResponse.ok) throw new Error(result.error?.message || 'openAI API error');

      const weatherText = result.choices[0].message.content;

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      //const weatherText = (user.location, temp, desc);

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: `Weather Update for ${user.location}`,
        text: `${weatherText}\n\nWarm regards, \nWeatherApp\n\nclick here to unsubscribe `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${user.email}`);
    }
  } catch (error) {
    console.error('Error in weather service:', error.message);
  }
};

module.exports = { fetchWeatherAndEmail };