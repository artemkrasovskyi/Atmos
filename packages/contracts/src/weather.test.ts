import { describe, expect, it } from "vitest";
import {
  locationSchema,
  locationSearchResponseSchema,
  weatherErrorSchema,
  weatherResponseSchema,
  healthResponseSchema,
} from "./index.js";

const kyiv = { id: "703448", city: "Kyiv", country: "Ukraine", countryCode: "UA", region: "Kyiv City", timeZone: "Europe/Kyiv" };

const day = (n: number) => ({
  date: `2026-10-${String(20 + n).padStart(2, "0")}`,
  weatherCode: 3, temperatureMax: 10, temperatureMin: 2, precipitationSum: 0, windSpeedMax: 15,
});

const weather = () => ({
  location: kyiv,
  timeZone: "Europe/Kyiv",
  current: {
    time: "2026-10-27T12:00:00.000Z", temperature: 0, apparentTemperature: -3, weatherCode: 3,
    humidity: 80, windSpeed: 0, windDirection: 180, precipitation: 0, seaLevelPressure: null,
  },
  hourly: [{ time: "2026-10-27T12:00:00.000Z", temperature: 1, apparentTemperature: null, weatherCode: 3, humidity: 80, windSpeed: 2, precipitation: 0 }],
  daily: [0, 1, 2, 3, 4, 5, 6].map(day),
  units: { temperature: "°C", windSpeed: "km/h", precipitation: "mm", pressure: "hPa", windDirection: "°", humidity: "%" },
});

describe("location contract (WAPI-CON-AC-001/002)", () => {
  it("accepts a result with and without region", () => {
    expect(locationSchema.safeParse(kyiv).success).toBe(true);
    const { region: _r, ...noRegion } = kyiv;
    expect(locationSchema.safeParse(noRegion).success).toBe(true);
  });

  it.each([
    ["missing id", { ...kyiv, id: undefined }],
    ["numeric id", { ...kyiv, id: 703448 }],
    ["zero id", { ...kyiv, id: "0" }],
    ["leading-zero id", { ...kyiv, id: "012" }],
    ["missing city", { ...kyiv, city: undefined }],
    ["missing country", { ...kyiv, country: undefined }],
  ])("rejects %s", (_n, v) => {
    expect(locationSchema.safeParse(v).success).toBe(false);
  });

  it("treats an empty match set as success, distinct from error payloads", () => {
    expect(locationSearchResponseSchema.safeParse({ locations: [] }).success).toBe(true);
    const err = { code: "SEARCH_UNAVAILABLE", message: "x", statusCode: 502 };
    expect(locationSearchResponseSchema.safeParse(err).success).toBe(false);
    expect(weatherErrorSchema.safeParse(err).success).toBe(true);
    expect(weatherErrorSchema.safeParse({ locations: [] }).success).toBe(false);
  });

  it("accepts each scoped error code and rejects unknown ones", () => {
    for (const [code, statusCode] of [["INVALID_SEARCH", 400], ["INVALID_LOCATION_ID", 400], ["LOCATION_NOT_FOUND", 404], ["SEARCH_UNAVAILABLE", 502], ["WEATHER_UNAVAILABLE", 502]] as const) {
      expect(weatherErrorSchema.safeParse({ code, message: "m", statusCode }).success).toBe(true);
    }
    expect(weatherErrorSchema.safeParse({ code: "OTHER", message: "m", statusCode: 500 }).success).toBe(false);
  });
});

describe("weather contract (WAPI-CON-AC-003/004)", () => {
  it("accepts a valid weather result", () => {
    expect(weatherResponseSchema.safeParse(weather()).success).toBe(true);
  });

  it("keeps measured zero and unavailable (null) distinct", () => {
    const parsed = weatherResponseSchema.parse(weather());
    expect(parsed.current.temperature).toBe(0);
    expect(parsed.current.seaLevelPressure).toBeNull();
    const missing = { ...weather(), current: { ...weather().current, temperature: undefined } };
    expect(weatherResponseSchema.safeParse(missing).success).toBe(false);
  });

  it.each([
    ["six daily dates", (w: any) => { w.daily.pop(); }],
    ["non-ISO date", (w: any) => { w.daily[0].date = "27/10/2026"; }],
    ["offset-less instant", (w: any) => { w.current.time = "2026-10-27 12:00"; }],
    ["NaN measurement", (w: any) => { w.current.temperature = NaN; }],
    ["string measurement", (w: any) => { w.current.humidity = "80"; }],
    ["missing time zone", (w: any) => { delete w.timeZone; }],
    ["wrong unit", (w: any) => { w.units.temperature = "°F"; }],
  ])("rejects %s", (_n, mutate) => {
    const w = weather();
    mutate(w);
    expect(weatherResponseSchema.safeParse(w).success).toBe(false);
  });
});

describe("package exports", () => {
  it("keeps the Foundation health export", () => {
    expect(healthResponseSchema.safeParse({ status: "ok" }).success).toBe(true);
  });
});
