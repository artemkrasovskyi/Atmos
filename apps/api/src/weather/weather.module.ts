import { Module } from "@nestjs/common";
import { WeatherService } from "./weather.service.js";
import { WeatherController } from "./weather.controller.js";
import { OpenMeteoModule } from "../open-meteo/open-meteo.module.js";

@Module({
  imports: [OpenMeteoModule],
  controllers: [WeatherController],
  providers: [WeatherService],
})
export class WeatherModule {}
