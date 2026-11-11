import { z } from "zod";

export const weatherErrorCodeSchema = z.enum([
  "INVALID_SEARCH",
  "INVALID_LOCATION_ID",
  "LOCATION_NOT_FOUND",
  "SEARCH_UNAVAILABLE",
  "WEATHER_UNAVAILABLE",
]);

export const weatherErrorSchema = z.strictObject({
  code: weatherErrorCodeSchema,
  message: z.string(),
  statusCode: z.union([z.literal(400), z.literal(404), z.literal(502)]),
});

export type WeatherErrorCode = z.infer<typeof weatherErrorCodeSchema>;
export type WeatherError = z.infer<typeof weatherErrorSchema>;
