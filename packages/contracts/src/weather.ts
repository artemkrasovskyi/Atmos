import { z } from "zod";
import { locationSchema } from "./location.js";

// Unavailable source values are null; a measured zero stays 0.
const measurement = z.number().nullable();
const utcInstant = z.iso.datetime();

export const weatherUnitsSchema = z.strictObject({
  temperature: z.literal("°C"),
  windSpeed: z.literal("km/h"),
  precipitation: z.literal("mm"),
  pressure: z.literal("hPa"),
  windDirection: z.literal("°"),
  humidity: z.literal("%"),
});

export const currentWeatherSchema = z.strictObject({
  time: utcInstant,
  temperature: measurement,
  apparentTemperature: measurement,
  weatherCode: measurement,
  humidity: measurement,
  windSpeed: measurement,
  windDirection: measurement,
  precipitation: measurement,
  seaLevelPressure: measurement,
});

export const hourlyWeatherSchema = z.strictObject({
  time: utcInstant,
  temperature: measurement,
  apparentTemperature: measurement,
  weatherCode: measurement,
  humidity: measurement,
  windSpeed: measurement,
  precipitation: measurement,
});

export const dailyWeatherSchema = z.strictObject({
  // Calendar date in the location's IANA time zone.
  date: z.iso.date(),
  weatherCode: measurement,
  temperatureMax: measurement,
  temperatureMin: measurement,
  precipitationSum: measurement,
  windSpeedMax: measurement,
});

export const weatherResponseSchema = z.strictObject({
  location: locationSchema,
  timeZone: z.string().min(1),
  current: currentWeatherSchema,
  hourly: z.array(hourlyWeatherSchema),
  daily: z.array(dailyWeatherSchema).length(7),
  units: weatherUnitsSchema,
});

export const ForecastQuerySchema = z.strictObject({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
});

export type WeatherUnits = z.infer<typeof weatherUnitsSchema>;
export type CurrentWeather = z.infer<typeof currentWeatherSchema>;
export type HourlyWeather = z.infer<typeof hourlyWeatherSchema>;
export type DailyWeather = z.infer<typeof dailyWeatherSchema>;
export type WeatherResponse = z.infer<typeof weatherResponseSchema>;
export type ForecastQueryDto = z.infer<typeof ForecastQuerySchema>;
