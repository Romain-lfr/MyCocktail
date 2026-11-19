import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CocktailService } from './cocktail.service';
import { PrismaService } from '../prisma/prisma.service';
import { DifficulteEnum } from './dto/create-cocktail.dto';
import { StatutEnum } from './dto/update-cocktail.dto';

// Faux Prisma : chaque méthode est un jest.fn() qu'on configure test par test
const creerPrismaMock = () => ({
  cocktail: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  etape: {
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  ingredient: { findUnique: jest.fn(), findMany: jest.fn() },
  ustensile: { findMany: jest.fn() },
  dosage: {
    findUnique: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    delete: jest.fn(),
  },
  etape_ustensile: { delete: jest.fn() },
  $queryRaw: jest.fn(),
});

const cocktailDe = (idcompte: string, extra: Record<string, unknown> = {}) => ({
  idcocktail: 'COK-00001',
  nomcocktail: 'Mojito',
  idcompte,
  alcool: false,
  statut: 'publi_',
  ...extra,
});

const donneesCocktail = {
  nomcocktail: 'Mojito',
  description: 'Un classique cubain bien frais',
  difficulte: DifficulteEnum.Facile,
  alcool: false,
  duree: 5,
};

describe('CocktailService', () => {
  let service: CocktailService;
  let prisma: ReturnType<typeof creerPrismaMock>;

  beforeEach(async () => {
    prisma = creerPrismaMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CocktailService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(CocktailService);
  });

  describe('verifierAuteur', () => {
    it('renvoie 404 si le cocktail n’existe pas', async () => {
      prisma.cocktail.findUnique.mockResolvedValue(null);
      await expect(
        service.verifierAuteur('COK-00001', 'CPT-00001'),
      ).rejects.toThrow(NotFoundException);
    });

    it('renvoie 403 si le cocktail appartient à un autre compte', async () => {
      prisma.cocktail.findUnique.mockResolvedValue(cocktailDe('CPT-00002'));
      await expect(
        service.verifierAuteur('COK-00001', 'CPT-00001'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('renvoie le cocktail si on en est l’auteur', async () => {
      const cocktail = cocktailDe('CPT-00001');
      prisma.cocktail.findUnique.mockResolvedValue(cocktail);
      await expect(
        service.verifierAuteur('COK-00001', 'CPT-00001'),
      ).resolves.toBe(cocktail);
    });
  });

  describe('findAll', () => {
    it('ne liste que les cocktails publiés', async () => {
      prisma.cocktail.findMany.mockResolvedValue([]);
      await service.findAll(undefined);
      expect(prisma.cocktail.findMany.mock.calls[0][0].where.statut).toBe(
        'publi_',
      );
    });

    it('applique le filtre alcool demandé', async () => {
      prisma.cocktail.findMany.mockResolvedValue([]);
      await service.findAll(false);
      expect(prisma.cocktail.findMany.mock.calls[0][0].where.alcool).toBe(
        false,
      );
    });
  });

  describe('findByNom', () => {
    it('cache un brouillon aux autres comptes (404)', async () => {
      prisma.cocktail.findFirst.mockResolvedValue(
        cocktailDe('CPT-00002', { statut: 'brouillon' }),
      );
      await expect(
        service.findByNom('Mojito', {
          idcompte: 'CPT-00001',
          pseudo: 'romain',
          role: 'user',
          estMineur: false,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('cache un brouillon aux visiteurs non connectés (404)', async () => {
      prisma.cocktail.findFirst.mockResolvedValue(
        cocktailDe('CPT-00002', { statut: 'brouillon' }),
      );
      await expect(service.findByNom('Mojito')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('montre un brouillon à son auteur', async () => {
      const cocktail = cocktailDe('CPT-00001', { statut: 'brouillon' });
      prisma.cocktail.findFirst.mockResolvedValue(cocktail);
      await expect(
        service.findByNom('Mojito', {
          idcompte: 'CPT-00001',
          pseudo: 'romain',
          role: 'user',
          estMineur: false,
        }),
      ).resolves.toBe(cocktail);
    });

    it('refuse un cocktail alcoolisé à un mineur (403)', async () => {
      prisma.cocktail.findFirst.mockResolvedValue(
        cocktailDe('CPT-00002', { alcool: true }),
      );
      await expect(
        service.findByNom('Mojito', {
          idcompte: 'CPT-00001',
          pseudo: 'romain',
          role: 'user',
          estMineur: true,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('refuse un cocktail alcoolisé à un visiteur non connecté (403)', async () => {
      prisma.cocktail.findFirst.mockResolvedValue(
        cocktailDe('CPT-00002', { alcool: true }),
      );
      await expect(service.findByNom('Mojito')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('montre un cocktail alcoolisé publié à un majeur', async () => {
      const cocktail = cocktailDe('CPT-00002', { alcool: true });
      prisma.cocktail.findFirst.mockResolvedValue(cocktail);
      await expect(
        service.findByNom('Mojito', {
          idcompte: 'CPT-00001',
          pseudo: 'romain',
          role: 'user',
          estMineur: false,
        }),
      ).resolves.toBe(cocktail);
    });
  });

  describe('create', () => {
    it('interdit à un mineur de créer un cocktail alcoolisé', async () => {
      await expect(
        service.create({ ...donneesCocktail, alcool: true }, 'CPT-00001', true),
      ).rejects.toThrow(ForbiddenException);
      expect(prisma.$queryRaw).not.toHaveBeenCalled();
    });

    it('crée le cocktail via ajouter_cocktail', async () => {
      prisma.$queryRaw.mockResolvedValue([{ idcocktail: 'COK-00002' }]);
      await expect(
        service.create(donneesCocktail, 'CPT-00001', false),
      ).resolves.toEqual({
        idcocktail: 'COK-00002',
      });
    });
  });

  describe('modifier', () => {
    it('refuse de passer en sans alcool s’il reste un ingrédient alcoolisé (409)', async () => {
      prisma.cocktail.findUnique.mockResolvedValue(
        cocktailDe('CPT-00001', { alcool: true }),
      );
      prisma.dosage.count.mockResolvedValue(1);
      await expect(
        service.modifier(
          'COK-00001',
          { ...donneesCocktail, alcool: false },
          'CPT-00001',
          false,
        ),
      ).rejects.toThrow(ConflictException);
      expect(prisma.cocktail.update).not.toHaveBeenCalled();
    });

    it('met à jour le statut quand il est fourni', async () => {
      prisma.cocktail.findUnique.mockResolvedValue(cocktailDe('CPT-00001'));
      prisma.dosage.count.mockResolvedValue(0);
      prisma.etape.count.mockResolvedValue(1);
      await service.modifier(
        'COK-00001',
        { ...donneesCocktail, statut: StatutEnum.publie },
        'CPT-00001',
        false,
      );
      expect(prisma.cocktail.update.mock.calls[0][0].data.statut).toBe(
        'publi_',
      );
    });

    it.each([StatutEnum.publie, StatutEnum.prive])(
      'refuse de passer en %s sans aucune étape (409)',
      async (statut) => {
        prisma.cocktail.findUnique.mockResolvedValue(
          cocktailDe('CPT-00001', { statut: 'brouillon' }),
        );
        prisma.dosage.count.mockResolvedValue(0);
        prisma.etape.count.mockResolvedValue(0);
        await expect(
          service.modifier(
            'COK-00001',
            { ...donneesCocktail, statut },
            'CPT-00001',
            false,
          ),
        ).rejects.toThrow(
          new ConflictException(
            'Ajoute au moins une étape avant de publier le cocktail',
          ),
        );
        expect(prisma.etape.count).toHaveBeenCalledWith({
          where: { idcocktail: 'COK-00001' },
        });
        expect(prisma.cocktail.update).not.toHaveBeenCalled();
      },
    );

    it.each([undefined, StatutEnum.brouillon, StatutEnum.archive])(
      'accepte un cocktail sans étape avec le statut %s',
      async (statut) => {
        prisma.cocktail.findUnique.mockResolvedValue(
          cocktailDe('CPT-00001', { statut: 'brouillon' }),
        );
        prisma.dosage.count.mockResolvedValue(0);
        prisma.etape.count.mockResolvedValue(0);
        await service.modifier(
          'COK-00001',
          { ...donneesCocktail, statut },
          'CPT-00001',
          false,
        );
        expect(prisma.etape.count).not.toHaveBeenCalled();
        expect(prisma.cocktail.update).toHaveBeenCalled();
      },
    );

    it('refuse la modification par un autre compte', async () => {
      prisma.cocktail.findUnique.mockResolvedValue(cocktailDe('CPT-00002'));
      await expect(
        service.modifier('COK-00001', donneesCocktail, 'CPT-00001', false),
      ).rejects.toThrow('Non autorisé');
    });
  });

  describe('addEtape', () => {
    it('refuse d’ajouter une étape au cocktail d’un autre (403)', async () => {
      prisma.cocktail.findUnique.mockResolvedValue(cocktailDe('CPT-00002'));
      await expect(
        service.addEtape(
          'COK-00001',
          { descriptionetape: 'Écraser la menthe' },
          'CPT-00001',
        ),
      ).rejects.toThrow(ForbiddenException);
      expect(prisma.$queryRaw).not.toHaveBeenCalled();
    });
  });

  describe('addUstensile', () => {
    it('refuse d’ajouter un ustensile à l’étape d’un autre (403)', async () => {
      prisma.etape.findUnique.mockResolvedValue({
        idetape: 'ETP-00001',
        cocktail: cocktailDe('CPT-00002'),
      });
      await expect(
        service.addUstensile(
          { idetape: 'ETP-00001', idustensile: 'UST-00001' },
          'CPT-00001',
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('addDosage', () => {
    const dosage = {
      idingredient: 'ING-00001',
      quantite: 2,
      unite: 'cl',
      idetape: 'ETP-00001',
    };

    beforeEach(() => {
      prisma.cocktail.findUnique.mockResolvedValue(cocktailDe('CPT-00001'));
      prisma.ingredient.findUnique.mockResolvedValue({
        idingredient: 'ING-00001',
        categorie: 'sirop',
      });
    });

    it('refuse un ingrédient alcoolisé dans un cocktail sans alcool', async () => {
      prisma.ingredient.findUnique.mockResolvedValue({
        idingredient: 'ING-00001',
        categorie: 'alcool',
      });
      await expect(
        service.addDosage('COK-00001', dosage, 'CPT-00001'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('crée un nouveau dosage via ajouter_dosage', async () => {
      prisma.dosage.findUnique.mockResolvedValue(null);
      prisma.$queryRaw.mockResolvedValue([{ ...dosage }]);
      await service.addDosage('COK-00001', dosage, 'CPT-00001');
      expect(prisma.$queryRaw).toHaveBeenCalled();
      expect(prisma.dosage.update).not.toHaveBeenCalled();
    });

    it('additionne les quantités si l’ingrédient est déjà présent avec la même unité', async () => {
      prisma.dosage.findUnique.mockResolvedValue({ ...dosage, unite: ' CL ' });
      await service.addDosage('COK-00001', dosage, 'CPT-00001');
      expect(prisma.dosage.update.mock.calls[0][0].data).toEqual({
        quantite: { increment: 2 },
      });
      expect(prisma.$queryRaw).not.toHaveBeenCalled();
    });

    it('refuse d’additionner deux unités différentes (409)', async () => {
      prisma.dosage.findUnique.mockResolvedValue({
        ...dosage,
        unite: 'feuilles',
      });
      await expect(
        service.addDosage('COK-00001', dosage, 'CPT-00001'),
      ).rejects.toThrow(ConflictException);
    });

    it('refuse d’ajouter un dosage au cocktail d’un autre (403)', async () => {
      prisma.cocktail.findUnique.mockResolvedValue(cocktailDe('CPT-00002'));
      await expect(
        service.addDosage('COK-00001', dosage, 'CPT-00001'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAll (filtres)', () => {
    it('cherche le nom sans tenir compte de la casse', async () => {
      prisma.cocktail.findMany.mockResolvedValue([]);
      await service.findAll(undefined, 'moj');
      expect(
        prisma.cocktail.findMany.mock.calls[0][0].where.nomcocktail,
      ).toEqual({
        contains: 'moj',
        mode: 'insensitive',
      });
    });

    it('exige chaque ingrédient demandé', async () => {
      prisma.cocktail.findMany.mockResolvedValue([]);
      await service.findAll(undefined, undefined, ['ING-00001', 'ING-00002']);
      expect(prisma.cocktail.findMany.mock.calls[0][0].where.AND).toEqual([
        { dosage: { some: { idingredient: 'ING-00001' } } },
        { dosage: { some: { idingredient: 'ING-00002' } } },
      ]);
    });

    it('exige chaque ustensile demandé, en gardant aussi les ingrédients', async () => {
      prisma.cocktail.findMany.mockResolvedValue([]);
      await service.findAll(undefined, undefined, ['ING-00001'], ['UST-00001']);
      expect(prisma.cocktail.findMany.mock.calls[0][0].where.AND).toEqual([
        { dosage: { some: { idingredient: 'ING-00001' } } },
        {
          etape: {
            some: { etape_ustensile: { some: { idustensile: 'UST-00001' } } },
          },
        },
      ]);
    });

    it('filtre par ustensile seul', async () => {
      prisma.cocktail.findMany.mockResolvedValue([]);
      await service.findAll(undefined, undefined, [], ['UST-00001']);
      expect(prisma.cocktail.findMany.mock.calls[0][0].where.AND).toEqual([
        {
          etape: {
            some: { etape_ustensile: { some: { idustensile: 'UST-00001' } } },
          },
        },
      ]);
    });
  });

  describe('findByNom (cas limites)', () => {
    it('renvoie null si le cocktail n’existe pas', async () => {
      prisma.cocktail.findFirst.mockResolvedValue(null);
      await expect(service.findByNom('Inconnu')).resolves.toBeNull();
    });
  });

  describe('modifier (cas limites)', () => {
    it('signale un cocktail introuvable', async () => {
      prisma.cocktail.findUnique.mockResolvedValue(null);
      await expect(
        service.modifier('COK-00099', donneesCocktail, 'CPT-00001', false),
      ).rejects.toThrow('Cocktail introuvable');
    });

    it('interdit à un mineur de passer son cocktail en alcoolisé', async () => {
      prisma.cocktail.findUnique.mockResolvedValue(cocktailDe('CPT-00001'));
      await expect(
        service.modifier(
          'COK-00001',
          { ...donneesCocktail, alcool: true },
          'CPT-00001',
          true,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('ne touche pas au statut s’il n’est pas fourni', async () => {
      prisma.cocktail.findUnique.mockResolvedValue(cocktailDe('CPT-00001'));
      prisma.dosage.count.mockResolvedValue(0);
      await service.modifier('COK-00001', donneesCocktail, 'CPT-00001', false);
      expect(prisma.cocktail.update.mock.calls[0][0].data).not.toHaveProperty(
        'statut',
      );
    });

    it('ne vérifie pas les ingrédients quand le cocktail reste alcoolisé', async () => {
      prisma.cocktail.findUnique.mockResolvedValue(
        cocktailDe('CPT-00001', { alcool: true }),
      );
      await service.modifier(
        'COK-00001',
        { ...donneesCocktail, alcool: true },
        'CPT-00001',
        false,
      );
      expect(prisma.dosage.count).not.toHaveBeenCalled();
      expect(prisma.cocktail.update).toHaveBeenCalled();
    });
  });

  describe('supprimer', () => {
    it('supprime son propre cocktail', async () => {
      prisma.cocktail.findUnique.mockResolvedValue(cocktailDe('CPT-00001'));
      await service.supprimer('COK-00001', 'CPT-00001');
      expect(prisma.cocktail.delete).toHaveBeenCalledWith({
        where: { idcocktail: 'COK-00001' },
      });
    });

    it('refuse de supprimer le cocktail d’un autre', async () => {
      prisma.cocktail.findUnique.mockResolvedValue(cocktailDe('CPT-00002'));
      await expect(service.supprimer('COK-00001', 'CPT-00001')).rejects.toThrow(
        'Non autorisé',
      );
      expect(prisma.cocktail.delete).not.toHaveBeenCalled();
    });

    it('signale un cocktail introuvable', async () => {
      prisma.cocktail.findUnique.mockResolvedValue(null);
      await expect(service.supprimer('COK-00099', 'CPT-00001')).rejects.toThrow(
        'Cocktail introuvable',
      );
    });
  });

  describe('étapes', () => {
    const etapeDe = (idcompte: string) => ({
      idetape: 'ETP-00001',
      cocktail: cocktailDe(idcompte),
    });

    it('addEtape crée l’étape via ajouter_etape_cocktail', async () => {
      prisma.cocktail.findUnique.mockResolvedValue(cocktailDe('CPT-00001'));
      prisma.$queryRaw.mockResolvedValue([{ idetape: 'ETP-00002' }]);
      await expect(
        service.addEtape(
          'COK-00001',
          { descriptionetape: 'Piler la menthe' },
          'CPT-00001',
        ),
      ).resolves.toEqual({ idetape: 'ETP-00002' });
    });

    it('modifierEtape modifie sa propre étape', async () => {
      prisma.etape.findUnique.mockResolvedValue(etapeDe('CPT-00001'));
      await service.modifierEtape(
        'ETP-00001',
        'Nouvelle description',
        'CPT-00001',
      );
      expect(prisma.etape.update).toHaveBeenCalledWith({
        where: { idetape: 'ETP-00001' },
        data: { descriptionetape: 'Nouvelle description' },
      });
    });

    it('modifierEtape refuse l’étape d’un autre', async () => {
      prisma.etape.findUnique.mockResolvedValue(etapeDe('CPT-00002'));
      await expect(
        service.modifierEtape('ETP-00001', 'x', 'CPT-00001'),
      ).rejects.toThrow('Non autorisé');
    });

    it('modifierEtape signale une étape introuvable', async () => {
      prisma.etape.findUnique.mockResolvedValue(null);
      await expect(
        service.modifierEtape('ETP-00099', 'x', 'CPT-00001'),
      ).rejects.toThrow('Etape introuvable');
    });

    it('supprimerEtape supprime sa propre étape', async () => {
      prisma.etape.findUnique.mockResolvedValue(etapeDe('CPT-00001'));
      prisma.etape.count.mockResolvedValue(2);
      await service.supprimerEtape('ETP-00001', 'CPT-00001');
      expect(prisma.etape.delete).toHaveBeenCalledWith({
        where: { idetape: 'ETP-00001' },
      });
    });

    it.each(['publi_', 'priv_'])(
      'supprimerEtape refuse la dernière étape d’un cocktail %s (409)',
      async (statut) => {
        prisma.etape.findUnique.mockResolvedValue({
          ...etapeDe('CPT-00001'),
          idcocktail: 'COK-00001',
          cocktail: cocktailDe('CPT-00001', { statut }),
        });
        prisma.etape.count.mockResolvedValue(1);
        await expect(
          service.supprimerEtape('ETP-00001', 'CPT-00001'),
        ).rejects.toThrow(ConflictException);
        expect(prisma.etape.count).toHaveBeenCalledWith({
          where: { idcocktail: 'COK-00001' },
        });
        expect(prisma.etape.delete).not.toHaveBeenCalled();
      },
    );

    it('supprimerEtape accepte une étape d’un cocktail publié qui en a d’autres', async () => {
      prisma.etape.findUnique.mockResolvedValue({
        ...etapeDe('CPT-00001'),
        cocktail: cocktailDe('CPT-00001', { statut: 'publi_' }),
      });
      prisma.etape.count.mockResolvedValue(2);
      await service.supprimerEtape('ETP-00001', 'CPT-00001');
      expect(prisma.etape.delete).toHaveBeenCalled();
    });

    it('supprimerEtape accepte la dernière étape d’un brouillon', async () => {
      prisma.etape.findUnique.mockResolvedValue({
        ...etapeDe('CPT-00001'),
        cocktail: cocktailDe('CPT-00001', { statut: 'brouillon' }),
      });
      prisma.etape.count.mockResolvedValue(1);
      await service.supprimerEtape('ETP-00001', 'CPT-00001');
      expect(prisma.etape.count).not.toHaveBeenCalled();
      expect(prisma.etape.delete).toHaveBeenCalled();
    });

    it('supprimerEtape refuse l’étape d’un autre', async () => {
      prisma.etape.findUnique.mockResolvedValue(etapeDe('CPT-00002'));
      await expect(
        service.supprimerEtape('ETP-00001', 'CPT-00001'),
      ).rejects.toThrow('Non autorisé');
      expect(prisma.etape.delete).not.toHaveBeenCalled();
    });

    it('supprimerEtape signale une étape introuvable', async () => {
      prisma.etape.findUnique.mockResolvedValue(null);
      await expect(
        service.supprimerEtape('ETP-00099', 'CPT-00001'),
      ).rejects.toThrow('Etape introuvable');
    });
  });

  describe('ustensiles d’étape', () => {
    it('addUstensile ajoute l’ustensile à sa propre étape', async () => {
      prisma.etape.findUnique.mockResolvedValue({
        idetape: 'ETP-00001',
        cocktail: cocktailDe('CPT-00001'),
      });
      prisma.$queryRaw.mockResolvedValue([
        { idetape: 'ETP-00001', idustensile: 'UST-00001' },
      ]);
      await service.addUstensile(
        { idetape: 'ETP-00001', idustensile: 'UST-00001' },
        'CPT-00001',
      );
      expect(prisma.$queryRaw).toHaveBeenCalled();
    });

    it('addUstensile signale une étape introuvable (404)', async () => {
      prisma.etape.findUnique.mockResolvedValue(null);
      await expect(
        service.addUstensile(
          { idetape: 'ETP-00099', idustensile: 'UST-00001' },
          'CPT-00001',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('supprimerDosage retire l’ingrédient de son propre cocktail', async () => {
      prisma.cocktail.findUnique.mockResolvedValue(cocktailDe('CPT-00001'));
      prisma.dosage.findUnique.mockResolvedValue({
        idcocktail: 'COK-00001',
        idingredient: 'ING-00001',
      });
      await service.supprimerDosage('COK-00001', 'ING-00001', 'CPT-00001');
      expect(prisma.dosage.delete).toHaveBeenCalledWith({
        where: {
          idcocktail_idingredient: {
            idcocktail: 'COK-00001',
            idingredient: 'ING-00001',
          },
        },
      });
    });

    it('supprimerDosage refuse le cocktail d’un autre (403)', async () => {
      prisma.cocktail.findUnique.mockResolvedValue(cocktailDe('CPT-00002'));
      await expect(
        service.supprimerDosage('COK-00001', 'ING-00001', 'CPT-00001'),
      ).rejects.toThrow(ForbiddenException);
      expect(prisma.dosage.delete).not.toHaveBeenCalled();
    });

    it('supprimerDosage signale un cocktail introuvable (404)', async () => {
      prisma.cocktail.findUnique.mockResolvedValue(null);
      await expect(
        service.supprimerDosage('COK-00099', 'ING-00001', 'CPT-00001'),
      ).rejects.toThrow(NotFoundException);
    });

    it('supprimerDosage signale un ingrédient absent du cocktail (404)', async () => {
      prisma.cocktail.findUnique.mockResolvedValue(cocktailDe('CPT-00001'));
      prisma.dosage.findUnique.mockResolvedValue(null);
      await expect(
        service.supprimerDosage('COK-00001', 'ING-00099', 'CPT-00001'),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.dosage.delete).not.toHaveBeenCalled();
    });

    it('supprimerUstensileEtape retire l’ustensile de sa propre étape', async () => {
      prisma.etape.findUnique.mockResolvedValue({
        idetape: 'ETP-00001',
        cocktail: cocktailDe('CPT-00001'),
      });
      await service.supprimerUstensileEtape(
        'ETP-00001',
        'UST-00001',
        'CPT-00001',
      );
      expect(prisma.etape_ustensile.delete).toHaveBeenCalledWith({
        where: {
          idetape_idustensile: {
            idetape: 'ETP-00001',
            idustensile: 'UST-00001',
          },
        },
      });
    });

    it('supprimerUstensileEtape refuse l’étape d’un autre (403)', async () => {
      prisma.etape.findUnique.mockResolvedValue({
        idetape: 'ETP-00001',
        cocktail: cocktailDe('CPT-00002'),
      });
      await expect(
        service.supprimerUstensileEtape('ETP-00001', 'UST-00001', 'CPT-00001'),
      ).rejects.toThrow(ForbiddenException);
      expect(prisma.etape_ustensile.delete).not.toHaveBeenCalled();
    });
  });

  describe('modifierDosage', () => {
    it('modifie la quantité et l’unité sur son propre cocktail', async () => {
      prisma.cocktail.findUnique.mockResolvedValue(cocktailDe('CPT-00001'));
      await service.modifierDosage(
        'COK-00001',
        'ING-00001',
        3,
        'cl',
        'CPT-00001',
      );
      expect(prisma.dosage.update).toHaveBeenCalledWith({
        where: {
          idcocktail_idingredient: {
            idcocktail: 'COK-00001',
            idingredient: 'ING-00001',
          },
        },
        data: { quantite: 3, unite: 'cl' },
      });
    });

    it('refuse sur le cocktail d’un autre (403)', async () => {
      prisma.cocktail.findUnique.mockResolvedValue(cocktailDe('CPT-00002'));
      await expect(
        service.modifierDosage('COK-00001', 'ING-00001', 3, 'cl', 'CPT-00001'),
      ).rejects.toThrow(ForbiddenException);
      expect(prisma.dosage.update).not.toHaveBeenCalled();
    });
  });

  describe('listes d’ingrédients et d’ustensiles', () => {
    it('getIngredients trie par nom', async () => {
      prisma.ingredient.findMany.mockResolvedValue([]);
      await service.getIngredients();
      expect(prisma.ingredient.findMany).toHaveBeenCalledWith({
        orderBy: { nomingredient: 'asc' },
      });
    });

    it('getUstensiles trie par nom', async () => {
      prisma.ustensile.findMany.mockResolvedValue([]);
      await service.getUstensiles();
      expect(prisma.ustensile.findMany).toHaveBeenCalledWith({
        orderBy: { nomustensile: 'asc' },
      });
    });

    it('ajouterIngredient passe par ajouter_ingredient', async () => {
      prisma.$queryRaw.mockResolvedValue([{ idingredient: 'ING-00010' }]);
      await expect(
        service.ajouterIngredient('Menthe', 'autre'),
      ).resolves.toEqual({ idingredient: 'ING-00010' });
    });

    it('ajouterUstensile passe par ajouter_ustensile', async () => {
      prisma.$queryRaw.mockResolvedValue([{ idustensile: 'UST-00010' }]);
      await expect(service.ajouterUstensile('Pilon')).resolves.toEqual({
        idustensile: 'UST-00010',
      });
    });
  });
});
