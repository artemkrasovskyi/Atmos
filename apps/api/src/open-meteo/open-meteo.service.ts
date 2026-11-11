import { Injectable } from "@nestjs/common";
import { HttpClient, InjectHttpClient } from "@nestjs/http-client";

@Injectable()
export class OpenMeteoService {
  constructor(
    @InjectHttpClient("open-meteo-forecast")
    private readonly forecastHttp: HttpClient,

    @InjectHttpClient("open-meteo-geocoding")
    private readonly geocodingHttp: HttpClient,
  ) {}

  async getCities(query: string) {
    const { data } = await this.geocodingHttp.get("/search", {
      query: { name: query, count: 10 },
    });
    return data || [];
  }
  async getCityById(id: string) {
    const { data } = await this.geocodingHttp.get("/get", {
      query: { id },
    });
    return data || [];
  }
  async getForecast(latitude: number, longitude: number) {
    const { data } = await this.forecastHttp.get("/forecast", {
      query: {
        latitude,
        longitude,
        current: "temperature_2m,weather_code",
      },
    });
    return data || {};
  }
}
