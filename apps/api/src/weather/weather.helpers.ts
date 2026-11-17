import { City, ForecastResponse } from "../open-meteo/open-meteo-schemas.js";

export const normalizeCurrent = (current: ForecastResponse["current"]) => {
  return {
    time: current.time,
    temperature: current.temperature_2m,
    apparentTemperature: current.apparent_temperature,
    weatherCode: current.weather_code,
    humidity: current.relative_humidity_2m,
    windSpeed: current.wind_speed_10m,
    windDirection: current.wind_direction_10m,
    precipitation: current.precipitation,
    seaLevelPressure: current.pressure_msl,
  };
};

export const normalizeHourly = (hourly: ForecastResponse["hourly"]) => {
  return hourly.time.map((time, index) => ({
    time,
    temperature: hourly.temperature_2m[index] ?? null,
    humidity: hourly.relative_humidity_2m[index] ?? null,
    precipitationProbability: hourly.precipitation_probability[index] ?? null,
    precipitation: hourly.precipitation[index] ?? null,
    weatherCode: hourly.weather_code[index] ?? null,
    windSpeed: hourly.wind_speed_10m[index] ?? null,
  }));
};

export const normalizeDaily = (daily: ForecastResponse["daily"]) => {
  return daily.time.map((date, index) => ({
    date,
    weatherCode: daily.weather_code[index] ?? null,
    temperatureMax: daily.temperature_2m_max[index] ?? null,
    temperatureMin: daily.temperature_2m_min[index] ?? null,
    precipitationSum: daily.precipitation_sum[index] ?? null,
    precipitationProbabilityMax:
      daily.precipitation_probability_max[index] ?? null,
    windSpeedMax: daily.wind_speed_10m_max[index] ?? null,
    sunrise: daily.sunrise[index] ?? null,
    sunset: daily.sunset[index] ?? null,
  }));
};

export const normalizeLocation = (city: City) => {
  return {
    id: city.id,
    city: city.name,
    country: city.country,
    countryCode: city.country_code,
    timeZone: city.timezone,
  };
};
