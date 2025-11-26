import React, { useState } from "react";
import "./App.css";

// ----------- IMPORT IMAGES -----------
import sun from "./sun.jpeg";
import fog from "./foggy.jpeg";
import storm from "./storm.jpeg";
import rain from "./rainy.jpeg";
import cloud from "./cloud.jpeg";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [weatherImg, setWeatherImg] = useState(sun);

  // ----------- WEATHER CONDITION IMAGES -----------
  const getWeatherImage = (code) => {
    if (code === 0) return sun;
    if (code >= 1 && code <= 3) return cloud;
    if (code >= 45 && code <= 48) return fog;
    if (code >= 51 && code <= 82) return rain;
    if (code >= 95 && code <= 99) return storm;
    return sun;
  };

  const getWeather = async () => {
    if (!city.trim()) return;

    // -------- GEO LOCATION API --------
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
    );
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      setWeather(null);
      return;
    }

    const { latitude, longitude, name, country } = geoData.results[0];

    // -------- WEATHER + FORECAST API --------
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`
    );
    const weatherData = await weatherRes.json();
    const weatherCode = weatherData.current_weather.weathercode;

    // -------- SAVE CURRENT WEATHER --------
    setWeather({
      name,
      country,
      temp: weatherData.current_weather.temperature,
      wind: weatherData.current_weather.windspeed,
      condition: weatherCode,
    });

    setWeatherImg(getWeatherImage(weatherCode));

    // -------- SAVE FORECAST (Next 5 Days) --------
    const days = weatherData.daily.time.map((date, i) => ({
      date,
      code: weatherData.daily.weathercode[i],
      max: weatherData.daily.temperature_2m_max[i],
      min: weatherData.daily.temperature_2m_min[i],
    }));

    setForecast(days.slice(1, 6)); // skip today, show next 5 days
  };

  return (
    <div className="container">
      <h2>🌍 Weather App</h2>

      <div className="input-box">
        <input
          type="text"
          placeholder="Search any city..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && getWeather()}
        />
        <button onClick={getWeather}>Search</button>
      </div>

      {weather && (
        <div className="card fadeIn">
          <img src={weatherImg} alt="weather" className="weather-img" />

          <h2>📍 {weather.name}, {weather.country}</h2>
          <h1>{weather.temp}°C</h1>
          <h3>🌬 Wind: {weather.wind} km/h</h3>
          <p>Weather Code: {weather.condition}</p>
        </div>
      )}

      {/* ----------- FORECAST SECTION ----------- */}
      {forecast.length > 0 && (
        <div className="forecast">
          <h3 style={{ marginBottom: "10px" }}>📅 Next 5 Days Forecast</h3>

          <div className="forecast-grid">
            {forecast.map((day, index) => (
              <div key={index} className="forecast-card">
                <p><b>{new Date(day.date).toLocaleDateString("en-IN", { weekday: "short" })}</b></p>
                <img src={getWeatherImage(day.code)} alt="" width={50} />
                <p>{day.min}°C / <b>{day.max}°C</b></p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
