import { Test, TestingModule } from '@nestjs/testing';
import { CompteController } from './compte.controller';

describe('CompteController', () => {
  let controller: CompteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompteController],
    }).compile();

    controller = module.get<CompteController>(CompteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
