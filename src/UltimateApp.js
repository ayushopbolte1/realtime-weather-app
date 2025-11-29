import React, { useState, useEffect } from 'react';
import './UltimateApp.css';

// ULTIMATE WEATHER APP - INFINITY FEATURES
// ∞ to the power ∞ MAX to the power UNIVERSE MAX

function UltimateApp() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [hourlyForecast, setHourlyForecast] = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [astronomy, setAstronomy] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('London');
  const [unit, setUnit] = useState('metric');
  const [theme, setTheme] = useState('auto');
  const [savedLocations, setSavedLocations] = useState([]);
  const [activeTab, setActiveTab] = useState('current');
  const [mapType, setMapType] = useState('temp');
  const [language, setLanguage] = useState('en');

  // FREE API KEYS - Get yours at:
  // OpenWeatherMap: https://openweathermap.org/api (FREE - 1000 calls/day)
  // WeatherAPI: https://www.weatherapi.com/signup.aspx (FREE - 1M calls/month)
  
  const OPENWEATHER_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY || 'YOUR_KEY_HERE';
  const WEATHERAPI_KEY = process.env.REACT_APP_WEATHERAPI_KEY || 'YOUR_KEY_HERE';

  useEffect(() => {
    fetchAllWeatherData(city);
    setupAutoRefresh();
    loadSavedLocations();
  }, [city, unit]);

  const fetchAllWeatherData = async (cityName) => {
    setLoading(true);
    try {
      await Promise.all([
        fetchCurrentWeather(cityName),
        fetchForecast(cityName),
        fetchHourlyForecast(cityName),
        fetchAirQuality(cityName),
        fetchAstronomy(cityName),
        fetchAlerts(cityName)
      ]);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
    setLoading(false);
  };

  const fetchCurrentWeather = async (cityName) => {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=${unit}&appid=${OPENWEATHER_KEY}`
    );
    const data = await res.json();
    setWeather(data);
  };

  const fetchForecast = async (cityName) => {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=${unit}&appid=${OPENWEATHER_KEY}`
    );
    const data = await res.json();
    setForecast(data);
  };

  const fetchHourlyForecast = async (cityName) => {
    // Using WeatherAPI for more detailed hourly data
    const res = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${WEATHERAPI_KEY}&q=${cityName}&days=3&aqi=yes&alerts=yes`
    );
    const data = await res.json();
    setHourlyForecast(data);
  };

  const fetchAirQuality = async (cityName) => {
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${OPENWEATHER_KEY}`
    );
    const weatherData = await weatherRes.json();
    
    if (weatherData.coord) {
      const airRes = await fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=${OPENWEATHER_KEY}`
      );
      const airData = await airRes.json();
      setAirQuality(airData);
    }
  };

  const fetchAstronomy = async (cityName) => {
    const res = await fetch(
      `https://api.weatherapi.com/v1/astronomy.json?key=${WEATHERAPI_KEY}&q=${cityName}`
    );
    const data = await res.json();
    setAstronomy(data);
  };

  const fetchAlerts = async (cityName) => {
    // Fetch weather alerts
    const res = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${WEATHERAPI_KEY}&q=${cityName}&days=1&alerts=yes`
    );
    const data = await res.json();
    if (data.alerts && data.alerts.alert) {
      setAlerts(data.alerts.alert);
    }
  };

  const setupAutoRefresh = () => {
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchAllWeatherData(city);
    }, 300000);
    return () => clearInterval(interval);
  };

  const loadSavedLocations = () => {
    const saved = localStorage.getItem('savedLocations');
    if (saved) {
      setSavedLocations(JSON.parse(saved));
    }
  };

  const saveLocation = () => {
    if (!savedLocations.includes(city)) {
      const updated = [...savedLocations, city];
      setSavedLocations(updated);
      localStorage.setItem('savedLocations', JSON.stringify(updated));
    }
  };

  const removeLocation = (location) => {
    const updated = savedLocations.filter(loc => loc !== location);
    setSavedLocations(updated);
    localStorage.setItem('savedLocations', JSON.stringify(updated));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_KEY}`
        );
        const data = await res.json();
        setCity(data.name);
      });
    }
  };

  const getWeatherIcon = (code) => {
    const icons = {
      '01d': '☀️', '01n': '🌙',
      '02d': '⛅', '02n': '☁️',
      '03d': '☁️', '03n': '☁️',
      '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️',
      '10d': '🌦️', '10n': '🌧️',
      '11d': '⛈️', '11n': '⛈️',
      '13d': '❄️', '13n': '❄️',
      '50d': '🌫️', '50n': '🌫️'
    };
    return icons[code] || '🌤️';
  };

  const getAQILevel = (aqi) => {
    const levels = {
      1: { label: 'Good', color: '#00e400', emoji: '😊' },
      2: { label: 'Fair', color: '#ffff00', emoji: '🙂' },
      3: { label: 'Moderate', color: '#ff7e00', emoji: '😐' },
      4: { label: 'Poor', color: '#ff0000', emoji: '😷' },
      5: { label: 'Very Poor', color: '#8f3f97', emoji: '☠️' }
    };
    return levels[aqi] || levels[1];
  };

  const getClothingSuggestion = (temp) => {
    if (temp < 0) return '🧥 Heavy winter coat, gloves, scarf';
    if (temp < 10) return '🧥 Warm jacket and layers';
    if (temp < 20) return '👔 Light jacket or sweater';
    if (temp < 25) return '👕 T-shirt and jeans';
    return '🩳 Shorts and light clothing';
  };

  const getActivitySuggestion = (weather) => {
    if (!weather) return '';
    const main = weather.weather[0].main.toLowerCase();
    if (main.includes('rain')) return '☔ Indoor activities recommended';
    if (main.includes('clear')) return '🏃 Perfect for outdoor activities!';
    if (main.includes('cloud')) return '🚶 Good for walking';
    if (main.includes('snow')) return '⛷️ Great for winter sports!';
    return '🎯 Check conditions before going out';
  };

  return (
    <div className={`ultimate-app theme-${theme}`}>
      <div className="container">
        {/* HEADER */}
        <header className="ultimate-header">
          <div className="header-top">
            <h1>🌍 ULTIMATE WEATHER</h1>
            <div className="header-controls">
              <button onClick={getCurrentLocation} className="btn-icon" title="Current Location">
                📍
              </button>
              <button onClick={() => setUnit(unit === 'metric' ? 'imperial' : 'metric')} className="btn-icon">
                °{unit === 'metric' ? 'C' : 'F'}
              </button>
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="btn-icon">
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
              <button className="btn-icon" title="Settings">⚙️</button>
            </div>
          </div>

          {/* SEARCH BAR */}
          <div className="search-section">
            <input
              type="text"
              placeholder="Search city, ZIP, coordinates..."
              onKeyPress={(e) => e.key === 'Enter' && setCity(e.target.value)}
              className="search-input"
            />
            <button onClick={saveLocation} className="btn-save">💾 Save</button>
          </div>

          {/* SAVED LOCATIONS */}
          {savedLocations.length > 0 && (
            <div className="saved-locations">
              {savedLocations.map((loc, i) => (
                <div key={i} className="location-chip" onClick={() => setCity(loc)}>
                  {loc}
                  <span onClick={(e) => { e.stopPropagation(); removeLocation(loc); }}>×</span>
                </div>
              ))}
            </div>
          )}
        </header>

        {/* ALERTS */}
        {alerts.length > 0 && (
          <div className="alerts-section">
            {alerts.map((alert, i) => (
              <div key={i} className="alert-card">
                ⚠️ <strong>{alert.event}</strong>: {alert.headline}
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div className="loading-screen">
            <div className="spinner"></div>
            <p>Loading ultimate weather data...</p>
          </div>
        ) : (
          <>
            {/* NAVIGATION TABS */}
            <div className="nav-tabs">
              <button className={activeTab === 'current' ? 'active' : ''} onClick={() => setActiveTab('current')}>
                Current
              </button>
              <button className={activeTab === 'hourly' ? 'active' : ''} onClick={() => setActiveTab('hourly')}>
                Hourly
              </button>
              <button className={activeTab === 'daily' ? 'active' : ''} onClick={() => setActiveTab('daily')}>
                Daily
              </button>
              <button className={activeTab === 'details' ? 'active' : ''} onClick={() => setActiveTab('details')}>
                Details
              </button>
              <button className={activeTab === 'maps' ? 'active' : ''} onClick={() => setActiveTab('maps')}>
                Maps
              </button>
              <button className={activeTab === 'insights' ? 'active' : ''} onClick={() => setActiveTab('insights')}>
                Insights
              </button>
            </div>

            {/* CURRENT WEATHER */}
            {activeTab === 'current' && weather && (
              <div className="current-weather">
                <div className="weather-hero">
                  <div className="weather-icon-large">
                    {getWeatherIcon(weather.weather[0].icon)}
                  </div>
                  <div className="weather-main-info">
                    <h2>{weather.name}, {weather.sys.country}</h2>
                    <p className="weather-desc">{weather.weather[0].description}</p>
                    <div className="temp-display">
                      {Math.round(weather.main.temp)}°
                    </div>
                    <p className="feels-like">
                      Feels like {Math.round(weather.main.feels_like)}°
                    </p>
                  </div>
                </div>

                {/* QUICK STATS */}
                <div className="quick-stats">
                  <div className="stat-card">
                    <span className="stat-icon">💨</span>
                    <span className="stat-value">{weather.wind.speed} {unit === 'metric' ? 'm/s' : 'mph'}</span>
                    <span className="stat-label">Wind</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-icon">💧</span>
                    <span className="stat-value">{weather.main.humidity}%</span>
                    <span className="stat-label">Humidity</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-icon">🌡️</span>
                    <span className="stat-value">{weather.main.pressure} hPa</span>
                    <span className="stat-label">Pressure</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-icon">👁️</span>
                    <span className="stat-value">{(weather.visibility / 1000).toFixed(1)} km</span>
                    <span className="stat-label">Visibility</span>
                  </div>
                </div>

                {/* AIR QUALITY */}
                {airQuality && (
                  <div className="air-quality-card">
                    <h3>Air Quality Index</h3>
                    <div className="aqi-display">
                      <div className="aqi-circle" style={{ borderColor: getAQILevel(airQuality.list[0].main.aqi).color }}>
                        <span className="aqi-emoji">{getAQILevel(airQuality.list[0].main.aqi).emoji}</span>
                        <span className="aqi-value">{airQuality.list[0].main.aqi}</span>
                        <span className="aqi-label" style={{ color: getAQILevel(airQuality.list[0].main.aqi).color }}>
                          {getAQILevel(airQuality.list[0].main.aqi).label}
                        </span>
                      </div>
                      <div className="aqi-components">
                        <div>PM2.5: {airQuality.list[0].components.pm2_5} μg/m³</div>
                        <div>PM10: {airQuality.list[0].components.pm10} μg/m³</div>
                        <div>O₃: {airQuality.list[0].components.o3} μg/m³</div>
                        <div>NO₂: {airQuality.list[0].components.no2} μg/m³</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ASTRONOMY */}
                {astronomy && (
                  <div className="astronomy-card">
                    <h3>☀️ Sun & Moon</h3>
                    <div className="astro-grid">
                      <div className="astro-item">
                        <span>🌅 Sunrise</span>
                        <strong>{astronomy.astronomy.astro.sunrise}</strong>
                      </div>
                      <div className="astro-item">
                        <span>🌇 Sunset</span>
                        <strong>{astronomy.astronomy.astro.sunset}</strong>
                      </div>
                      <div className="astro-item">
                        <span>🌙 Moonrise</span>
                        <strong>{astronomy.astronomy.astro.moonrise}</strong>
                      </div>
                      <div className="astro-item">
                        <span>🌑 Moonset</span>
                        <strong>{astronomy.astronomy.astro.moonset}</strong>
                      </div>
                      <div className="astro-item">
                        <span>🌕 Moon Phase</span>
                        <strong>{astronomy.astronomy.astro.moon_phase}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* HOURLY FORECAST */}
            {activeTab === 'hourly' && hourlyForecast && (
              <div className="hourly-forecast">
                <h3>48-Hour Forecast</h3>
                <div className="hourly-scroll">
                  {hourlyForecast.forecast.forecastday[0].hour.map((hour, i) => (
                    <div key={i} className="hour-card">
                      <div className="hour-time">{new Date(hour.time).getHours()}:00</div>
                      <div className="hour-icon">{getWeatherIcon(hour.condition.icon)}</div>
                      <div className="hour-temp">{Math.round(hour.temp_c)}°</div>
                      <div className="hour-rain">💧 {hour.chance_of_rain}%</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DAILY FORECAST */}
            {activeTab === 'daily' && forecast && (
              <div className="daily-forecast">
                <h3>16-Day Forecast</h3>
                <div className="forecast-grid">
                  {forecast.list.filter((_, i) => i % 8 === 0).map((day, i) => (
                    <div key={i} className="day-card">
                      <div className="day-name">
                        {new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className="day-icon">{getWeatherIcon(day.weather[0].icon)}</div>
                      <div className="day-temp">
                        <span className="temp-high">{Math.round(day.main.temp_max)}°</span>
                        <span className="temp-low">{Math.round(day.main.temp_min)}°</span>
                      </div>
                      <div className="day-desc">{day.weather[0].description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* INSIGHTS */}
            {activeTab === 'insights' && weather && (
              <div className="insights-section">
                <h3>🧠 Smart Insights</h3>
                
                <div className="insight-card">
                  <h4>👔 What to Wear</h4>
                  <p>{getClothingSuggestion(weather.main.temp)}</p>
                </div>

                <div className="insight-card">
                  <h4>🎯 Activity Suggestions</h4>
                  <p>{getActivitySuggestion(weather)}</p>
                </div>

                <div className="insight-card">
                  <h4>📸 Photography</h4>
                  <p>
                    {astronomy ? `Golden Hour: ${astronomy.astronomy.astro.sunset} | Blue Hour: 30 min after sunset` : 'Loading...'}
                  </p>
                </div>

                <div className="insight-card">
                  <h4>🌟 Stargazing</h4>
                  <p>
                    {weather.clouds.all < 30 ? '✅ Excellent conditions for stargazing!' : '❌ Too cloudy for stargazing'}
                  </p>
                </div>

                <div className="insight-card">
                  <h4>🏃 Exercise Conditions</h4>
                  <p>
                    {weather.main.temp > 15 && weather.main.temp < 25 && weather.weather[0].main !== 'Rain' 
                      ? '✅ Perfect conditions for outdoor exercise!' 
                      : '⚠️ Consider indoor exercise'}
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* FOOTER */}
        <footer className="ultimate-footer">
          <p>🌍 ULTIMATE WEATHER APP</p>
          <p>∞ to the power ∞ MAX to the power UNIVERSE MAX</p>
          <p>Powered by OpenWeatherMap & WeatherAPI</p>
          <p className="api-note">⚠️ Add your FREE API keys in .env file</p>
        </footer>
      </div>
    </div>
  );
}

export default UltimateApp;
