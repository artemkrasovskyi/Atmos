import { Controller, Get, ParseIntPipe, Query } from "@nestjs/common";
import { WeatherService } from "./weather.service.js";

@Controller("weather")
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get("weather")
  getWeather(@Query("id", ParseIntPipe) locationId: number) {
    return this.weatherService.getWeather(locationId);
  }

  @Get("cities")
  getCities(@Query("q") query: string) {
    return this.weatherService.getCities(query);
  }

  @Get("city")
  getCityById(@Query("id") id: number) {
    return this.weatherService.getCityById(id);
  }
}
