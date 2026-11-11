import { z } from "zod";

// Open-Meteo geocoding ID as a positive decimal string; the stable selection reference.
export const locationIdSchema = z.string().regex(/^[1-9]\d*$/);

export const locationSchema = z.strictObject({
  id: locationIdSchema,
  city: z.string().min(1),
  country: z.string().min(1),
  countryCode: z.string().length(2),
  region: z.string().min(1).optional(),
  timeZone: z.string().min(1),
});

// An empty `locations` array is a successful search with no matches.
export const locationSearchResponseSchema = z.strictObject({
  locations: z.array(locationSchema),
});

export type Location = z.infer<typeof locationSchema>;
export type LocationSearchResponse = z.infer<typeof locationSearchResponseSchema>;
