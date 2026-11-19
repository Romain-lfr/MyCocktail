import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('se connecte à la base au démarrage du module', async () => {
    // on remplace $connect : aucun accès réel à la base pendant les tests
    const connect = jest.spyOn(service, '$connect').mockResolvedValue();
    await service.onModuleInit();
    expect(connect).toHaveBeenCalledTimes(1);
  });
});
