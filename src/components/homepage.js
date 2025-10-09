// App.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFrown } from '@fortawesome/free-solid-svg-icons';

import Humidity from '../images/humidity.png';
import Windspeed from '../images/windspeed.png';
import Clouds from '../images/clouds3.mp4';

function Weather() {
  const [input, setInput] = useState('');
  const [weather, setWeather] = useState({
    loading: false,
    data: {},
    error: false,
  });
  const [forecast, setForecast] = useState([]);
  const [dailyForecast, setDailyForecast] = useState([]);

  // Helpers for local time/date
  const getLocalTime = (timezoneOffset) => {
    const utc = new Date().getTime() + new Date().getTimezoneOffset() * 60000;
    const cityTime = new Date(utc + 1000 * timezoneOffset);
    return cityTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getLocalDate = (timezoneOffset) => {
    const utc = new Date().getTime() + new Date().getTimezoneOffset() * 60000;
    const cityDate = new Date(utc + 1000 * timezoneOffset);

    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const weekDays = [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ];

    return `${weekDays[cityDate.getDay()]}, ${cityDate.getDate()} ${
      months[cityDate.getMonth()]
    }, ${cityDate.getFullYear()}`;
  };

  const getCityTime = (unixTimestamp, timezoneOffset) => {
    const utc =
      new Date(unixTimestamp * 1000).getTime() +
      new Date().getTimezoneOffset() * 60000;
    const cityDate = new Date(utc + 1000 * timezoneOffset);
    return cityDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Group forecast data into daily chunks
  const getDailyForecast = (list) => {
    const days = {};

    list.forEach((item) => {
      const date = new Date(item.dt * 1000);
      const day = date.toLocaleDateString("en-US", { weekday: "long" });

      if (!days[day]) {
        days[day] = [];
      }
      days[day].push(item);
    });

    // Pick one forecast per day (12:00 if available)
    return Object.keys(days).map((day) => {
      const dailyData = days[day];

      const midday = dailyData.find(
        (d) => new Date(d.dt * 1000).getHours() === 12
      );
      const chosen = midday || dailyData[0];

      return {
        day,
        temp: Math.round(chosen.main.temp),
        icon: chosen.weather[0].icon,
        description: chosen.weather[0].description,
      };
    });
  };

  // Search & fetch current + forecast
  const search = async (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      setInput('');
      setWeather({ ...weather, loading: true });

      const url = 'https://api.openweathermap.org/data/2.5/weather';
      const forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';
      const api_key = 'f00c38e0279b7bc85480c3fe775d518c';

      try {
        const res = await axios.get(url, {
          params: {
            q: input,
            units: 'imperial',
            appid: api_key,
          },
        });

        setWeather({ data: res.data, loading: false, error: false });

        // fetch forecast using city coordinates
        const forecastRes = await axios.get(forecastUrl, {
          params: {
            lat: res.data.coord.lat,
            lon: res.data.coord.lon,
            units: 'imperial',
            appid: api_key,
          },
        });

        setForecast(forecastRes.data.list);

        // Process daily forecast
        const daily = getDailyForecast(forecastRes.data.list);
        setDailyForecast(daily);
      } catch (error) {
        setWeather({ ...weather, data: {}, error: true });
        setInput('');
        console.log('error', error);
      }
    }
  };

  return (
    <>
      <div className="video-background">
        <div className="clouds">
          <video src={Clouds} autoPlay loop muted />

          <div className="content">
            <div className="titles">
              <h1>Weather Data by Location</h1>
            </div>

            {/* Search bar */}
            <div className="search-bar">
              <input
                type="text"
                className="city-search"
                placeholder="Enter City Name.."
                name="query"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyPress={search}
              />

              {weather.loading && (
                <>
                  <br />
                  loading
                  <br />
                </>
              )}

              {weather.error && (
                <>
                  <FontAwesomeIcon icon={faFrown} />
                  <span
                    className="error-message"
                    style={{ fontSize: '20px' }}
                  >
                    City not found
                  </span>
                </>
              )}
            </div>

            {/* Current weather */}
            {weather && weather.data && weather.data.main && (
              <div className="Location-Container">
                <div className="location">
                  <strong>
                    {weather.data.name}, {weather.data.sys.country}
                  </strong>
                </div>
                <div className="date">{getLocalDate(weather.data.timezone)}</div>
                <div className="time">
                  <strong>{getLocalTime(weather.data.timezone)}</strong>
                </div>

                <div className="temprature">
                  <strong>🌡 {Math.round(weather.data.main.temp)} °F</strong>
                </div>

                <div className="highlow">
                  <div className="high">
                    
                      ⬆ {Math.round(weather.data.main.temp_max)}°F High
                  </div>
                  <div className="low">
                    
                      ⬇ {Math.round(weather.data.main.temp_min)}°F Low
                  </div>
                </div>

                <div className="sunrisesunset">
                  <div className="sunrise">
                    <p>
                      Sunrise:{' '}
                      {getCityTime(weather.data.sys.sunrise, weather.data.timezone)}
                    </p>
                  </div>
                  <div className="sunset">
                    <p>
                      Sunset:{' '}
                      {getCityTime(weather.data.sys.sunset, weather.data.timezone)}
                    </p>
                  </div>
                </div>

                <div className="weather-info">
                  <div className="weather">
                    <img
                      src={`http://openweathermap.org/img/w/${weather.data.weather ? weather.data.weather[0].icon : null}.png`}
                      alt="Weather"
                      width="120"
                      height="100"
                    />
                    <p>{weather.data.weather[0].description.toUpperCase()}</p>
                  </div>
                  <div className="windspeed">
                    <img src={Windspeed} alt="Windspeed" />
                    Wind Speed:
                    <br /> {weather.data.wind.speed.toFixed()}mph
                  </div>
                  <div className="humidity">
                    <img src={Humidity} alt="Humidity" />
                    Humidity:
                    <br /> {weather.data.main.humidity}%
                  </div>
                </div>
              </div>
            )}

            {/* Daily Forecast */}
            {dailyForecast.length > 0 && (
              <div className="daily-forecast-container">
                <h2>Daily Forecast</h2>
                <div className="forecast-list">
                  {dailyForecast.slice(0, 5).map((day, index) => (
                    <div key={index} className="forecast-item">
                      <p>{day.day}</p>
                      <img
                        src={`http://openweathermap.org/img/w/${day.icon}.png`}
                        alt={day.description}
                      />
                      <p>{day.temp} °F</p>
                      <small>{day.description}</small>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}

export default Weather;
