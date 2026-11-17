import { z } from "zod";

export const ForecastQuerySchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),

  timezone: z.string().default("auto"),
  forecast_days: z.number().int().min(1).max(16).default(7),

  temperature_unit: z.enum(["celsius", "fahrenheit"]).default("celsius"),
  wind_speed_unit: z.enum(["kmh", "ms", "mph", "kn"]).default("kmh"),
  precipitation_unit: z.enum(["mm", "inch"]).default("mm"),

  current: z.array(
    z.enum([
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "precipitation",
      "weather_code",
      "wind_speed_10m",
      "wind_direction_10m",
      "pressure_msl",
      "cloud_cover",
      "is_day",
    ]),
  ),

  hourly: z.array(
    z.enum([
      "temperature_2m",
      "relative_humidity_2m",
      "precipitation_probability",
      "precipitation",
      "weather_code",
      "wind_speed_10m",
    ]),
  ),

  daily: z.array(
    z.enum([
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_sum",
      "precipitation_probability_max",
      "wind_speed_10m_max",
      "sunrise",
      "sunset",
    ]),
  ),
});

const WeatherValue = z.number().nullable();
const WeatherValues = z.array(WeatherValue);

// Current weather
const CurrentSchema = z.object({
  time: z.string(),
  interval: z.number(),
  temperature_2m: WeatherValue,
  relative_humidity_2m: WeatherValue,
  apparent_temperature: WeatherValue,
  precipitation: WeatherValue,
  weather_code: WeatherValue,
  wind_speed_10m: WeatherValue,
  wind_direction_10m: WeatherValue,
  pressure_msl: WeatherValue,
  cloud_cover: WeatherValue,
  is_day: WeatherValue,
});

// Hourly forecast
const HourlySchema = z.object({
  time: z.array(z.string()),
  temperature_2m: WeatherValues,
  relative_humidity_2m: WeatherValues,
  precipitation_probability: WeatherValues,
  precipitation: WeatherValues,
  weather_code: WeatherValues,
  wind_speed_10m: WeatherValues,
});

// Daily forecast
const DailySchema = z.object({
  time: z.array(z.string()),
  weather_code: WeatherValues,
  temperature_2m_max: WeatherValues,
  temperature_2m_min: WeatherValues,
  precipitation_sum: WeatherValues,
  precipitation_probability_max: WeatherValues,
  wind_speed_10m_max: WeatherValues,
  sunrise: z.array(z.string()),
  sunset: z.array(z.string()),
});

// Units returned by Open-Meteo
const CurrentUnitsSchema = z.object({
  time: z.string(),
  interval: z.string(),
  temperature_2m: z.string(),
  relative_humidity_2m: z.string(),
  apparent_temperature: z.string(),
  precipitation: z.string(),
  weather_code: z.string(),
  wind_speed_10m: z.string(),
  wind_direction_10m: z.string(),
  pressure_msl: z.string(),
  cloud_cover: z.string(),
  is_day: z.string(),
});

const HourlyUnitsSchema = z.object({
  time: z.string(),
  temperature_2m: z.string(),
  relative_humidity_2m: z.string(),
  precipitation_probability: z.string(),
  precipitation: z.string(),
  weather_code: z.string(),
  wind_speed_10m: z.string(),
});

const DailyUnitsSchema = z.object({
  time: z.string(),
  weather_code: z.string(),
  temperature_2m_max: z.string(),
  temperature_2m_min: z.string(),
  precipitation_sum: z.string(),
  precipitation_probability_max: z.string(),
  wind_speed_10m_max: z.string(),
  sunrise: z.string(),
  sunset: z.string(),
});

// Full Open-Meteo response
export const ForecastResponseSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  generationtime_ms: z.number(),
  utc_offset_seconds: z.number(),
  timezone: z.string(),
  timezone_abbreviation: z.string(),
  elevation: z.number(),

  current_units: CurrentUnitsSchema,
  current: CurrentSchema,

  hourly_units: HourlyUnitsSchema,
  hourly: HourlySchema,

  daily_units: DailyUnitsSchema,
  daily: DailySchema,
});

export const CitiesQuerySchema = z.object({
  name: z.string().min(1),
  count: z.number().int().min(1).max(100).default(10),
});

export const CitySchema = z.object({
  id: z.number(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  elevation: z.number().optional(),
  feature_code: z.string().optional(),
  country_code: z.string(),
  admin1_id: z.number().optional(),
  timezone: z.string(),
  population: z.number().optional(),
  country_id: z.number().optional(),
  country: z.string(),
  admin1: z.string().optional(),
});

export const CitiesResponseSchema = z.object({
  results: z.array(CitySchema).default([]),
});

export type CitiesQuery = z.infer<typeof CitiesQuerySchema>;
export type City = z.infer<typeof CitySchema>;
export type CitiesResponse = z.infer<typeof CitiesResponseSchema>;

export type ForecastQueryInput = z.input<typeof ForecastQuerySchema>;
export type ForecastQuery = z.output<typeof ForecastQuerySchema>;
export type ForecastResponse = z.infer<typeof ForecastResponseSchema>;
