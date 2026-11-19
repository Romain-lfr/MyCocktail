import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { CompteService } from './compte.service';
import { PrismaService } from '../prisma/prisma.service';

const creerPrismaMock = () => ({
  compte: { update: jest.fn(), findUnique: jest.fn(), findMany: jest.fn() },
  frigo: { findUnique: jest.fn() },
  frigo_composition: { upsert: jest.fn(), delete: jest.fn() },
  cocktail: { findMany: jest.fn() },
  favori: { findMany: jest.fn(), findUnique: jest.fn(), delete: jest.fn() },
  avis: { findMany: jest.fn() },
  $queryRaw: jest.fn(),
});

describe('CompteService', () => {
  let service: CompteService;
  let prisma: ReturnType<typeof creerPrismaMock>;

  beforeEach(async () => {
    prisma = creerPrismaMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompteService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(CompteService);
  });

  describe('getCocktailsRealisables', () => {
    const frigo = (...ingredients: string[]) => ({
      idfrigo: 'FRG-00001',
      frigo_composition: ingredients.map((idingredient) => ({ idingredient })),
    });
    const cocktail = (id: string, ...ingredients: string[]) => ({
      idcocktail: id,
      dosage: ingredients.map((idingredient) => ({ idingredient })),
    });

    it('renvoie une liste vide si le frigo est vide', async () => {
      prisma.frigo.findUnique.mockResolvedValue(frigo());
      await expect(
        service.getCocktailsRealisables('CPT-00001', false),
      ).resolves.toEqual([]);
      expect(prisma.cocktail.findMany).not.toHaveBeenCalled();
    });

    it('exclut les cocktails alcoolisés pour un mineur', async () => {
      prisma.frigo.findUnique.mockResolvedValue(frigo('ING-00001'));
      prisma.cocktail.findMany.mockResolvedValue([]);
      await service.getCocktailsRealisables('CPT-00001', true);
      expect(prisma.cocktail.findMany.mock.calls[0][0].where.alcool).toBe(
        false,
      );
    });

    it('ne filtre pas l’alcool pour un majeur', async () => {
      prisma.frigo.findUnique.mockResolvedValue(frigo('ING-00001'));
      prisma.cocktail.findMany.mockResolvedValue([]);
      await service.getCocktailsRealisables('CPT-00001', false);
      expect(
        prisma.cocktail.findMany.mock.calls[0][0].where.alcool,
      ).toBeUndefined();
    });

    it('ne cherche que des cocktails publiés qui ont au moins un ingrédient', async () => {
      prisma.frigo.findUnique.mockResolvedValue(frigo('ING-00001'));
      prisma.cocktail.findMany.mockResolvedValue([]);
      await service.getCocktailsRealisables('CPT-00001', false);
      const where = prisma.cocktail.findMany.mock.calls[0][0].where;
      expect(where.statut).toBe('publi_');
      expect(where.dosage).toEqual({ some: {} });
    });

    it('garde seulement les cocktails dont tous les ingrédients sont dans le frigo', async () => {
      prisma.frigo.findUnique.mockResolvedValue(
        frigo('ING-00001', 'ING-00002'),
      );
      prisma.cocktail.findMany.mockResolvedValue([
        cocktail('COK-00001', 'ING-00001', 'ING-00002'),
        cocktail('COK-00002', 'ING-00001', 'ING-00003'),
      ]);
      const resultat = await service.getCocktailsRealisables(
        'CPT-00001',
        false,
      );
      expect(resultat.map((c) => c.idcocktail)).toEqual(['COK-00001']);
    });
  });

  describe('modifierCompte', () => {
    it('renvoie 409 si le pseudo ou l’email est déjà pris', async () => {
      prisma.compte.update.mockRejectedValue({ code: 'P2002' });
      await expect(
        service.modifierCompte('CPT-00001', { pseudo: 'romain' }),
      ).rejects.toThrow(ConflictException);
    });

    it('ne modifie jamais la date de naissance', async () => {
      prisma.compte.update.mockResolvedValue({});
      const corps = { pseudo: 'nouveau', datenaissance: '1990-01-01' } as any;
      await service.modifierCompte('CPT-00001', corps);
      expect(prisma.compte.update.mock.calls[0][0].data).not.toHaveProperty(
        'datenaissance',
      );
    });

    it('met l’email en minuscules', async () => {
      prisma.compte.update.mockResolvedValue({});
      await service.modifierCompte('CPT-00001', {
        mailcompte: 'Romain@MyCocktail.com',
      });
      expect(prisma.compte.update.mock.calls[0][0].data.mailcompte).toBe(
        'romain@mycocktail.com',
      );
    });
  });

  describe('getMonCompte', () => {
    it('ne renvoie jamais le mot de passe', async () => {
      prisma.compte.findUnique.mockResolvedValue({});
      await service.getMonCompte('CPT-00001');
      const select = prisma.compte.findUnique.mock.calls[0][0].select;
      expect(select).not.toHaveProperty('mdpcompte');
      expect(select).toMatchObject({
        idcompte: true,
        pseudo: true,
        mailcompte: true,
      });
    });
  });

  describe('modifierCompte (suite)', () => {
    it('ne renvoie jamais le mot de passe', async () => {
      prisma.compte.update.mockResolvedValue({});
      await service.modifierCompte('CPT-00001', { pseudo: 'nouveau' });
      expect(prisma.compte.update.mock.calls[0][0].select).not.toHaveProperty(
        'mdpcompte',
      );
    });

    it('permet d’effacer le numéro de téléphone (null)', async () => {
      prisma.compte.update.mockResolvedValue({});
      await service.modifierCompte('CPT-00001', { numtel: null });
      expect(prisma.compte.update.mock.calls[0][0].data).toEqual({
        numtel: null,
      });
    });

    it('ignore les champs absents', async () => {
      prisma.compte.update.mockResolvedValue({});
      await service.modifierCompte('CPT-00001', {});
      expect(prisma.compte.update.mock.calls[0][0].data).toEqual({});
    });

    it('laisse passer les autres erreurs', async () => {
      prisma.compte.update.mockRejectedValue(new Error('panne'));
      await expect(
        service.modifierCompte('CPT-00001', { pseudo: 'x' }),
      ).rejects.toThrow('panne');
    });
  });

  describe('mes cocktails / avis', () => {
    it('getMesCocktails liste tous mes cocktails, brouillons compris', async () => {
      prisma.cocktail.findMany.mockResolvedValue([]);
      await service.getMesCocktails('CPT-00001');
      expect(prisma.cocktail.findMany.mock.calls[0][0].where).toEqual({
        idcompte: 'CPT-00001',
      });
    });

    it('getMesAvis liste mes avis du plus récent au plus ancien', async () => {
      prisma.avis.findMany.mockResolvedValue([]);
      await service.getMesAvis('CPT-00001');
      const args = prisma.avis.findMany.mock.calls[0][0];
      expect(args.where).toEqual({ idcompte: 'CPT-00001' });
      expect(args.orderBy).toEqual({ dateavis: 'desc' });
    });
  });

  describe('favoris', () => {
    it('getMesFavoris liste mes favoris avec le cocktail', async () => {
      prisma.favori.findMany.mockResolvedValue([]);
      await service.getMesFavoris('CPT-00001');
      expect(prisma.favori.findMany.mock.calls[0][0].where).toEqual({
        idcompte: 'CPT-00001',
      });
    });

    it('ajouterFavori passe par ajouter_favori', async () => {
      prisma.$queryRaw.mockResolvedValue([
        { idcompte: 'CPT-00001', idcocktail: 'COK-00001' },
      ]);
      await expect(
        service.ajouterFavori('CPT-00001', 'COK-00001'),
      ).resolves.toEqual({
        idcompte: 'CPT-00001',
        idcocktail: 'COK-00001',
      });
    });

    it('supprimerFavori supprime le couple compte/cocktail', async () => {
      await service.supprimerFavori('CPT-00001', 'COK-00001');
      expect(prisma.favori.delete).toHaveBeenCalledWith({
        where: {
          idcompte_idcocktail: {
            idcompte: 'CPT-00001',
            idcocktail: 'COK-00001',
          },
        },
      });
    });

    it.each([
      [{ idcompte: 'CPT-00001' }, true],
      [null, false],
    ])('isFavori renvoie %p → %p', async (favori, attendu) => {
      prisma.favori.findUnique.mockResolvedValue(favori);
      await expect(service.isFavori('CPT-00001', 'COK-00001')).resolves.toEqual(
        { isFavori: attendu },
      );
    });
  });

  describe('rechercherComptes', () => {
    it('cherche sans casse et n’expose que des infos publiques', async () => {
      prisma.compte.findMany.mockResolvedValue([]);
      await service.rechercherComptes('rom');
      const args = prisma.compte.findMany.mock.calls[0][0];
      expect(args.where).toEqual({
        pseudo: { contains: 'rom', mode: 'insensitive' },
      });
      expect(args.select).toEqual({
        idcompte: true,
        pseudo: true,
        dateinscription: true,
      });
    });
  });

  describe('frigo', () => {
    it('getMonFrigo renvoie le frigo trié par nom d’ingrédient', async () => {
      prisma.frigo.findUnique.mockResolvedValue({});
      await service.getMonFrigo('CPT-00001');
      const args = prisma.frigo.findUnique.mock.calls[0][0];
      expect(args.where).toEqual({ idcompte: 'CPT-00001' });
      expect(args.include.frigo_composition.orderBy).toEqual({
        ingredient: { nomingredient: 'asc' },
      });
    });

    it('ajouterIngredientFrigo crée ou met à jour l’ingrédient dans mon frigo', async () => {
      prisma.frigo.findUnique.mockResolvedValue({ idfrigo: 'FRG-00001' });
      await service.ajouterIngredientFrigo('CPT-00001', 'ING-00001', 50, 'cl');
      expect(prisma.frigo_composition.upsert).toHaveBeenCalledWith({
        where: {
          idfrigo_idingredient: {
            idfrigo: 'FRG-00001',
            idingredient: 'ING-00001',
          },
        },
        update: { quantite: 50, unite: 'cl' },
        create: {
          idfrigo: 'FRG-00001',
          idingredient: 'ING-00001',
          quantite: 50,
          unite: 'cl',
        },
      });
    });

    it('supprimerIngredientFrigo retire l’ingrédient de mon frigo', async () => {
      prisma.frigo.findUnique.mockResolvedValue({ idfrigo: 'FRG-00001' });
      await service.supprimerIngredientFrigo('CPT-00001', 'ING-00001');
      expect(prisma.frigo_composition.delete).toHaveBeenCalledWith({
        where: {
          idfrigo_idingredient: {
            idfrigo: 'FRG-00001',
            idingredient: 'ING-00001',
          },
        },
      });
    });

    it('getCocktailsRealisables renvoie une liste vide si le compte n’a pas de frigo', async () => {
      prisma.frigo.findUnique.mockResolvedValue(null);
      await expect(
        service.getCocktailsRealisables('CPT-00001', false),
      ).resolves.toEqual([]);
    });
  });
});
