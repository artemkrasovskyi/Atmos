import { Module } from "@nestjs/common";
import { OpenMeteoService } from "./open-meteo.service.js";
import { OpenMeteoController } from "./open-meteo.controller.js";
import { HttpClientModule } from "@nestjs/http-client";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  controllers: [OpenMeteoController],
  providers: [OpenMeteoService],
  imports: [
    HttpClientModule.registerAsync({
      name: "open-meteo-forecast",
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        baseUrl: config.getOrThrow<string>("OPEN_METEO_FORECAST_URL"),
      }),
    }),

    HttpClientModule.registerAsync({
      name: "open-meteo-geocoding",
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        baseUrl: config.getOrThrow<string>("OPEN_METEO_GEOCODING_URL"),
      }),
    }),
  ],
  exports: [OpenMeteoService],
})
export class OpenMeteoModule {}
