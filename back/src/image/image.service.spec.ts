// sharp est remplacé par un faux : aucune vraie conversion d'image pendant les tests
const toFile = jest.fn().mockResolvedValue({});
const webp = jest.fn(() => ({ toFile }));
const sharpMock = jest.fn(() => ({ webp }));
jest.mock('sharp', () => ({ __esModule: true, default: sharpMock }));

// fs.unlinkSync est remplacé : on ne supprime aucun vrai fichier
const unlinkSync = jest.fn();
jest.mock('fs', () => ({ ...jest.requireActual('fs'), unlinkSync: (p: string) => unlinkSync(p) }));

import { Test, TestingModule } from '@nestjs/testing';
import * as path from 'path';
import { ImageService } from './image.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ImageService', () => {
  let service: ImageService;
  const prisma = { $queryRaw: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImageService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<ImageService>(ImageService);
  });

  describe('convertAndSave', () => {
    it('convertit en WebP qualité 80 dans public/images', async () => {
      const url = await service.convertAndSave('public/images/123.png', 'photo.png');

      expect(sharpMock).toHaveBeenCalledWith('public/images/123.png');
      expect(webp).toHaveBeenCalledWith({ quality: 80 });
      const destination = toFile.mock.calls[0][0] as string;
      expect(path.dirname(destination)).toBe(path.join('public', 'images'));
      expect(destination).toMatch(/\d+\.webp$/);
      expect(url).toBe(`/public/images/${path.basename(destination)}`);
    });

    it('supprime le fichier d’origine après conversion', async () => {
      await service.convertAndSave('public/images/123.png', 'photo.png');
      expect(unlinkSync).toHaveBeenCalledWith('public/images/123.png');
    });

    it('garde le fichier d’origine si la conversion échoue', async () => {
      toFile.mockRejectedValueOnce(new Error('image corrompue'));
      await expect(service.convertAndSave('public/images/123.png', 'photo.png')).rejects.toThrow(
        'image corrompue',
      );
      expect(unlinkSync).not.toHaveBeenCalled();
    });
  });

  // Chaque méthode convertit l'image puis appelle sa fonction SQL
  it.each([
    ['ajouterImageCocktail', 'COK-00001'],
    ['ajouterImageCompte', 'CPT-00001'],
    ['ajouterImageIngredient', 'ING-00001'],
    ['ajouterImageAvis', 'AVS-00001'],
  ] as const)('%s convertit puis enregistre en base', async (methode, id) => {
    prisma.$queryRaw.mockResolvedValue([{ idimage: 'IMG-00001' }]);
    await expect(service[methode](id, 'public/images/1.png', 'photo.png')).resolves.toEqual([
      { idimage: 'IMG-00001' },
    ]);
    expect(toFile).toHaveBeenCalled();
    const valeursSql = prisma.$queryRaw.mock.calls[0].slice(1);
    expect(valeursSql[0]).toBe(id);
    expect(valeursSql[1]).toMatch(/^\/public\/images\/\d+\.webp$/);
    expect(valeursSql[2]).toBe('photo.png');
  });
});
