// sharp est remplacé par un faux : aucune vraie conversion d'image pendant les tests
const toFile = jest.fn().mockResolvedValue({});
const webp = jest.fn(() => ({ toFile }));
const sharpMock = jest.fn(() => ({ webp }));
jest.mock('sharp', () => ({ __esModule: true, default: sharpMock }));

// fs.unlinkSync est remplacé : on ne supprime aucun vrai fichier
const unlinkSync = jest.fn();
const existsSync = jest.fn(() => true);
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  unlinkSync: (p: string) => unlinkSync(p),
  existsSync: (p: string) => existsSync(p),
}));

import { Test, TestingModule } from '@nestjs/testing';
import * as path from 'path';
import { ImageService } from './image.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ImageService', () => {
  let service: ImageService;
  const prisma = {
    $queryRaw: jest.fn(),
    image: { findFirst: jest.fn(), deleteMany: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.image.findFirst.mockResolvedValue(null);
    existsSync.mockReturnValue(true);
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImageService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<ImageService>(ImageService);
  });

  describe('convertAndSave', () => {
    it('convertit en WebP qualité 80 dans public/images', async () => {
      const url = await service.convertAndSave('public/images/123.png');

      expect(sharpMock).toHaveBeenCalledWith('public/images/123.png');
      expect(webp).toHaveBeenCalledWith({ quality: 80 });
      const destination = toFile.mock.calls[0][0] as string;
      expect(path.dirname(destination)).toBe(path.join('public', 'images'));
      expect(destination).toMatch(/\d+\.webp$/);
      expect(url).toBe(`/public/images/${path.basename(destination)}`);
    });

    it('supprime le fichier d’origine après conversion', async () => {
      await service.convertAndSave('public/images/123.png');
      expect(unlinkSync).toHaveBeenCalledWith('public/images/123.png');
    });

    it('garde le fichier d’origine si la conversion échoue', async () => {
      toFile.mockRejectedValueOnce(new Error('image corrompue'));
      await expect(
        service.convertAndSave('public/images/123.png'),
      ).rejects.toThrow('image corrompue');
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
    await expect(
      service[methode](id, 'public/images/1.png', 'photo.png'),
    ).resolves.toEqual([{ idimage: 'IMG-00001' }]);
    expect(toFile).toHaveBeenCalled();
    const valeursSql = prisma.$queryRaw.mock.calls[0].slice(1);
    expect(valeursSql[0]).toBe(id);
    expect(valeursSql[1]).toMatch(/^\/public\/images\/\d+\.webp$/);
    expect(valeursSql[2]).toBe('photo.png');
  });

  describe('photo de profil', () => {
    const ancienne = path.join('public', 'images', 'ancienne.webp');

    it('remplace la photo et supprime l’ancien fichier du disque', async () => {
      prisma.image.findFirst.mockResolvedValue({
        urlimage: '/public/images/ancienne.webp',
      });
      prisma.$queryRaw.mockResolvedValue([
        { urlimage: '/public/images/2.webp' },
      ]);
      await service.ajouterImageCompte(
        'CPT-00001',
        'public/images/2.png',
        'moi.png',
      );
      expect(prisma.image.findFirst).toHaveBeenCalledWith({
        where: { idcompte: 'CPT-00001', typeimage: 'profil' },
        select: { urlimage: true },
      });
      expect(unlinkSync).toHaveBeenCalledWith(ancienne);
    });

    it('garde l’ancien fichier si l’enregistrement en base échoue', async () => {
      prisma.image.findFirst.mockResolvedValue({
        urlimage: '/public/images/ancienne.webp',
      });
      prisma.$queryRaw.mockRejectedValue(new Error('base indisponible'));
      await expect(
        service.ajouterImageCompte(
          'CPT-00001',
          'public/images/2.png',
          'moi.png',
        ),
      ).rejects.toThrow('base indisponible');
      expect(unlinkSync).not.toHaveBeenCalledWith(ancienne);
    });

    it('retire la photo : ligne en base et fichier', async () => {
      prisma.image.findFirst.mockResolvedValue({
        urlimage: '/public/images/ancienne.webp',
      });
      await expect(service.supprimerImageCompte('CPT-00001')).resolves.toEqual({
        photo: null,
      });
      expect(prisma.image.deleteMany).toHaveBeenCalledWith({
        where: { idcompte: 'CPT-00001', typeimage: 'profil' },
      });
      expect(unlinkSync).toHaveBeenCalledWith(ancienne);
    });

    it('sans photo, ne supprime rien', async () => {
      await expect(service.supprimerImageCompte('CPT-00001')).resolves.toEqual({
        photo: null,
      });
      expect(prisma.image.deleteMany).not.toHaveBeenCalled();
      expect(unlinkSync).not.toHaveBeenCalled();
    });

    it('ne touche jamais un fichier hors de public/images, ni un fichier déjà absent', async () => {
      prisma.image.findFirst.mockResolvedValueOnce({
        urlimage: 'https://ailleurs.example/x.webp',
      });
      await service.supprimerImageCompte('CPT-00001');
      prisma.image.findFirst.mockResolvedValueOnce({
        urlimage: '/public/images/disparue.webp',
      });
      existsSync.mockReturnValueOnce(false);
      await service.supprimerImageCompte('CPT-00001');
      expect(unlinkSync).not.toHaveBeenCalled();
    });
  });
});
