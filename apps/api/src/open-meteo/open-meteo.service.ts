import { Injectable } from "@nestjs/common";
import { HttpClient, InjectHttpClient } from "@nestjs/http-client";
import {
  CitiesQuerySchema,
  CitiesResponseSchema,
  City,
  CitySchema,
  ForecastQuerySchema,
  ForecastResponseSchema,
} from "./open-meteo-schemas.js";

@Injectable()
export class OpenMeteoService {
  constructor(
    @InjectHttpClient("open-meteo-forecast")
    private readonly forecastHttp: HttpClient,

    @InjectHttpClient("open-meteo-geocoding")
    private readonly geocodingHttp: HttpClient,
  ) {}

  async getCities(query: string): Promise<City[]> {
    const params = CitiesQuerySchema.parse({
      name: query,
      count: 10,
    });
    const { data } = await this.geocodingHttp.get("/search", {
      query: params,
    });

    return CitiesResponseSchema.parse(data).results;
  }
  async getCityById(id: number): Promise<City> {
    const { data } = await this.geocodingHttp.get("/get", {
      query: { id },
    });
    return CitySchema.parse(data);
  }
  async getForecast(latitude: number, longitude: number) {
    const params = ForecastQuerySchema.parse({
      latitude,
      longitude,
      current: [
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
      ],
      hourly: [
        "temperature_2m",
        "relative_humidity_2m",
        "precipitation_probability",
        "precipitation",
        "weather_code",
        "wind_speed_10m",
      ],
      daily: [
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "precipitation_sum",
        "precipitation_probability_max",
        "wind_speed_10m_max",
        "sunrise",
        "sunset",
      ],
    });

    const { data } = await this.forecastHttp.get("/forecast", {
      query: {
        ...params,
        current: params.current.join(","),
        hourly: params.hourly.join(","),
        daily: params.daily.join(","),
      },
    });
    return ForecastResponseSchema.parse(data);
  }
}
