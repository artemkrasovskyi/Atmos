import { Controller, Get, Query } from "@nestjs/common";
import { WeatherService } from "./weather.service.js";
import { ForecastQueryDto, ForecastQuerySchema } from "@atmos/contracts";

@Controller("weather")
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get("forecast")
  getForecast(@Query() rawQuery: ForecastQueryDto) {
    const query = ForecastQuerySchema.parse(rawQuery);

    return this.weatherService.getForecast(
      Number(query.latitude),
      Number(query.longitude),
    );
  }

  @Get("cities")
  getCities(@Query("q") query: string) {
    return this.weatherService.getCities(query);
  }

  @Get("city")
  getCityById(@Query("id") id: string) {
    return this.weatherService.getCityById(id);
  }
}
