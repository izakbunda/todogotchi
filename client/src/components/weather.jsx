import {React, useState, useEffect} from "react";
import '../css/weather.css'
const API_KEY = "af1a879872f71503b73bc89905f2db99";

import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
/*
  Weather component that will dynamically display the Temperature,
  one word weather description, and an icon for the landing page.
*/
const DEFAULT_LAT = 34.0522; // Latitude for Los Angeles
const DEFAULT_LON = -118.2437; // Longitude for Los Angeles

function Weather(){
  const [temperature, setTemperature] = useState(null);
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [error, setError] = useState(null);
  
  useEffect(() => {
      // Fetch Los Angeles weather data only
      fetchWeatherData(DEFAULT_LAT, DEFAULT_LON);

      // UNCOMMENT to use actual location
      /*
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
              (position) => {
                  const {latitude, longitude } = position.coords;
                  fetchWeatherData(latitude, longitude);
              },
              (error) => {
                  setError("Failed to retrieve location. Showing default location weather.");
                  fetchWeatherData(DEFAULT_LAT, DEFAULT_LON); // Use default location on failure
              }
          );
      } else {
          setError("Geo Location not supported. Showing default location weather.");
          fetchWeatherData(DEFAULT_LAT, DEFAULT_LON); // Use default location if geolocation is unsupported
      }
      */
  }, []);

  const fetchWeatherData = async (lat, lon) => {
      try{
          const response = await fetch(
              `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`
          );
          const data = await response.json();
          if (response.ok) {
              setTemperature(data.main.temp);
              setDescription(data.weather[0].description);
              setIcon(`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`);
          } else {
              setError(data.message);
          }
      } catch (error) {
          setError("Failed to fetch weather data.");
      }
  };

  return (
      <div className="weather-container">
          {error ? (
              <p className="error-message">{error}</p>
          ) : (
              <>
                  {temperature !== null && (
                      <div className="weather-content">
                          <div className="weather-info">
                              <span className="temperature">{Math.round(temperature)}°F</span>
                              <span className="forecast">{description}</span>
                          </div>
                          {icon && <img src={icon} alt="Weather icon" className="weather-icon" />}
                      </div>
                  )}
              </>
          )}
      </div>
  );
}

export default Weather;