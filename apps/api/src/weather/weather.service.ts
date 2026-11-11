import { Injectable } from "@nestjs/common";
import { OpenMeteoService } from "../open-meteo/open-meteo.service.js";

@Injectable()
export class WeatherService {
  constructor(private readonly openMeteoService: OpenMeteoService) {}
  getCities(query: string) {
    return this.openMeteoService.getCities(query);
  }

  getCityById(id: string) {
    return this.openMeteoService.getCityById(id);
  }

  getForecast(latitude: number, longitude: number) {
    return this.openMeteoService.getForecast(latitude, longitude);
  }
}
