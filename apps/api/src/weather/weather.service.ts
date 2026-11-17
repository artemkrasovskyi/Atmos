import { Injectable } from "@nestjs/common";
import { OpenMeteoService } from "../open-meteo/open-meteo.service.js";
import {
  normalizeCurrent,
  normalizeDaily,
  normalizeHourly,
  normalizeLocation,
} from "./weather.helpers.js";
import { weatherResponseSchema } from "@atmos/contracts";

@Injectable()
export class WeatherService {
  constructor(private readonly openMeteoService: OpenMeteoService) {}
  async getCities(query: string) {
    const cities = await this.openMeteoService.getCities(query);

    return { locations: cities.map(normalizeLocation) };
  }

  async getCityById(locationId: number) {
    const city = await this.openMeteoService.getCityById(locationId);

    return normalizeLocation(city);
  }

  async getWeather(locationId: number) {
    const city = await this.openMeteoService.getCityById(locationId);

    const forecast = await this.openMeteoService.getForecast(
      city.latitude,
      city.longitude,
    );

    return weatherResponseSchema.parse({
      location: normalizeLocation(city),
      current: normalizeCurrent(forecast.current),
      hourly: normalizeHourly(forecast.hourly),
      daily: normalizeDaily(forecast.daily),
    });
  }
}
