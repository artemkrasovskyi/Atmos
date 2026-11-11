import { Test, TestingModule } from '@nestjs/testing';
import { OpenMeteoController } from './open-meteo.controller.js';
import { OpenMeteoService } from './open-meteo.service.js';

describe('OpenMeteoController', () => {
  let controller: OpenMeteoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpenMeteoController],
      providers: [OpenMeteoService],
    }).compile();

    controller = module.get<OpenMeteoController>(OpenMeteoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
