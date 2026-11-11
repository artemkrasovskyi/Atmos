import { Test, TestingModule } from '@nestjs/testing';
import { OpenMeteoService } from './open-meteo.service.js';

describe('OpenMeteoService', () => {
  let service: OpenMeteoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpenMeteoService],
    }).compile();

    service = module.get<OpenMeteoService>(OpenMeteoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
