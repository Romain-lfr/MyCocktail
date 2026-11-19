import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, ForbiddenException } from '@nestjs/common';
import { AvisService } from './avis.service';
import { PrismaService } from '../prisma/prisma.service';

const creerPrismaMock = () => ({
  avis: { findUnique: jest.fn(), update: jest.fn(), delete: jest.fn() },
  reponse: { findUnique: jest.fn(), update: jest.fn(), delete: jest.fn() },
  $queryRaw: jest.fn(),
});

const avis = {
  noteavis: 4,
  titreavis: 'Très bon',
  descriptionavis: 'Frais et équilibré',
};

describe('AvisService', () => {
  let service: AvisService;
  let prisma: ReturnType<typeof creerPrismaMock>;

  beforeEach(async () => {
    prisma = creerPrismaMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [AvisService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(AvisService);
  });

  describe('ajouterAvis', () => {
    it('renvoie 409 si le compte a déjà noté ce cocktail', async () => {
      prisma.$queryRaw.mockRejectedValue({
        meta: { message: 'Key (idcocktail, idcompte) already exists' },
      });
      await expect(
        service.ajouterAvis('COK-00001', 'CPT-00001', avis),
      ).rejects.toThrow(
        new ConflictException('Vous avez déjà laissé un avis pour ce cocktail'),
      );
    });

    it('renvoie 409 si on note son propre cocktail', async () => {
      prisma.$queryRaw.mockRejectedValue({
        meta: {
          message: 'Un utilisateur ne peut pas noter son propre cocktail',
        },
      });
      await expect(
        service.ajouterAvis('COK-00001', 'CPT-00001', avis),
      ).rejects.toThrow(
        new ConflictException('Vous ne pouvez pas noter votre propre cocktail'),
      );
    });
  });

  describe('ajouterAvis (suite)', () => {
    it('crée l’avis via ajouter_avis', async () => {
      prisma.$queryRaw.mockResolvedValue([{ idavis: 'AVS-00002' }]);
      await expect(
        service.ajouterAvis('COK-00001', 'CPT-00001', avis),
      ).resolves.toEqual({
        idavis: 'AVS-00002',
      });
    });

    it('laisse passer les autres erreurs de la base', async () => {
      prisma.$queryRaw.mockRejectedValue(new Error('connexion perdue'));
      await expect(
        service.ajouterAvis('COK-00001', 'CPT-00001', avis),
      ).rejects.toThrow('connexion perdue');
    });
  });

  describe('modifierAvis / supprimerAvis', () => {
    it('modifie son propre avis', async () => {
      prisma.avis.findUnique.mockResolvedValue({
        idavis: 'AVS-00001',
        idcompte: 'CPT-00001',
      });
      await service.modifierAvis('AVS-00001', 'CPT-00001', avis);
      expect(prisma.avis.update).toHaveBeenCalledWith({
        where: { idavis: 'AVS-00001' },
        data: avis,
      });
    });

    it('supprime son propre avis', async () => {
      prisma.avis.findUnique.mockResolvedValue({
        idavis: 'AVS-00001',
        idcompte: 'CPT-00001',
      });
      await service.supprimerAvis('AVS-00001', 'CPT-00001');
      expect(prisma.avis.delete).toHaveBeenCalledWith({
        where: { idavis: 'AVS-00001' },
      });
    });

    it('signale un avis introuvable à la modification', async () => {
      prisma.avis.findUnique.mockResolvedValue(null);
      await expect(
        service.modifierAvis('AVS-00099', 'CPT-00001', avis),
      ).rejects.toThrow('Avis introuvable');
    });

    it('refuse de modifier l’avis d’un autre', async () => {
      prisma.avis.findUnique.mockResolvedValue({
        idavis: 'AVS-00001',
        idcompte: 'CPT-00002',
      });
      await expect(
        service.modifierAvis('AVS-00001', 'CPT-00001', avis),
      ).rejects.toThrow('Non autorisé');
      expect(prisma.avis.update).not.toHaveBeenCalled();
    });

    it('refuse de supprimer l’avis d’un autre', async () => {
      prisma.avis.findUnique.mockResolvedValue({
        idavis: 'AVS-00001',
        idcompte: 'CPT-00002',
      });
      await expect(
        service.supprimerAvis('AVS-00001', 'CPT-00001'),
      ).rejects.toThrow('Non autorisé');
      expect(prisma.avis.delete).not.toHaveBeenCalled();
    });

    it('signale un avis introuvable', async () => {
      prisma.avis.findUnique.mockResolvedValue(null);
      await expect(
        service.supprimerAvis('AVS-00099', 'CPT-00001'),
      ).rejects.toThrow('Avis introuvable');
    });
  });

  describe('ajouterReponse', () => {
    it('interdit de répondre à sa propre réponse', async () => {
      prisma.reponse.findUnique.mockResolvedValue({
        idreponse: 'REP-00001',
        idcompte: 'CPT-00001',
      });
      await expect(
        service.ajouterReponse(
          'AVS-00001',
          'CPT-00001',
          'Merci !',
          'REP-00001',
        ),
      ).rejects.toThrow(ForbiddenException);
      expect(prisma.$queryRaw).not.toHaveBeenCalled();
    });

    it('ajoute une réponse à l’avis', async () => {
      prisma.$queryRaw.mockResolvedValue([{ idreponse: 'REP-00002' }]);
      await expect(
        service.ajouterReponse('AVS-00001', 'CPT-00001', 'Merci !'),
      ).resolves.toEqual({
        idreponse: 'REP-00002',
      });
    });
  });

  describe('ajouterReponse (suite)', () => {
    it('autorise à répondre à la réponse de quelqu’un d’autre', async () => {
      prisma.reponse.findUnique.mockResolvedValue({
        idreponse: 'REP-00001',
        idcompte: 'CPT-00002',
      });
      prisma.$queryRaw.mockResolvedValue([{ idreponse: 'REP-00003' }]);
      await expect(
        service.ajouterReponse(
          'AVS-00001',
          'CPT-00001',
          'Bien vu',
          'REP-00001',
        ),
      ).resolves.toEqual({ idreponse: 'REP-00003' });
    });

    it('traduit la contrainte chk_reponse_self de la base en 403', async () => {
      prisma.$queryRaw.mockRejectedValue({
        meta: { message: 'violates check constraint "chk_reponse_self"' },
      });
      await expect(
        service.ajouterReponse('AVS-00001', 'CPT-00001', 'Merci'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('laisse passer les autres erreurs de la base', async () => {
      prisma.$queryRaw.mockRejectedValue(new Error('connexion perdue'));
      await expect(
        service.ajouterReponse('AVS-00001', 'CPT-00001', 'Merci'),
      ).rejects.toThrow('connexion perdue');
    });
  });

  describe('modifierReponse / supprimerReponse', () => {
    it('modifie sa propre réponse', async () => {
      prisma.reponse.findUnique.mockResolvedValue({
        idreponse: 'REP-00001',
        idcompte: 'CPT-00001',
      });
      await service.modifierReponse('REP-00001', 'CPT-00001', 'Edit');
      expect(prisma.reponse.update).toHaveBeenCalledWith({
        where: { idreponse: 'REP-00001' },
        data: { commentaire: 'Edit' },
      });
    });

    it('supprime sa propre réponse', async () => {
      prisma.reponse.findUnique.mockResolvedValue({
        idreponse: 'REP-00001',
        idcompte: 'CPT-00001',
      });
      await service.supprimerReponse('REP-00001', 'CPT-00001');
      expect(prisma.reponse.delete).toHaveBeenCalledWith({
        where: { idreponse: 'REP-00001' },
      });
    });

    it('signale une réponse introuvable', async () => {
      prisma.reponse.findUnique.mockResolvedValue(null);
      await expect(
        service.modifierReponse('REP-00099', 'CPT-00001', 'Edit'),
      ).rejects.toThrow('Réponse introuvable');
      await expect(
        service.supprimerReponse('REP-00099', 'CPT-00001'),
      ).rejects.toThrow('Réponse introuvable');
    });

    it('refuse de modifier la réponse d’un autre', async () => {
      prisma.reponse.findUnique.mockResolvedValue({
        idreponse: 'REP-00001',
        idcompte: 'CPT-00002',
      });
      await expect(
        service.modifierReponse('REP-00001', 'CPT-00001', 'Edit'),
      ).rejects.toThrow('Non autorisé');
    });

    it('refuse de supprimer la réponse d’un autre', async () => {
      prisma.reponse.findUnique.mockResolvedValue({
        idreponse: 'REP-00001',
        idcompte: 'CPT-00002',
      });
      await expect(
        service.supprimerReponse('REP-00001', 'CPT-00001'),
      ).rejects.toThrow('Non autorisé');
    });
  });
});
