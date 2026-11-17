import { Controller, Get, ParseIntPipe, Query } from "@nestjs/common";
import { OpenMeteoService } from "./open-meteo.service.js";
import { ForecastQuerySchema, type ForecastQueryDto } from "@atmos/contracts";

@Controller("open-meteo")
export class OpenMeteoController {
  constructor(private readonly openMeteoService: OpenMeteoService) {}

  @Get("forecast")
  getForecast(@Query() rawQuery: ForecastQueryDto) {
    const query = ForecastQuerySchema.parse(rawQuery);

    return this.openMeteoService.getForecast(
      Number(query.latitude),
      Number(query.longitude),
    );
  }

  @Get("cities")
  getCities(@Query("q") query: string) {
    return this.openMeteoService.getCities(query);
  }

  @Get("city")
  getCityById(@Query("id", ParseIntPipe) id: number) {
    return this.openMeteoService.getCityById(id);
  }
}
