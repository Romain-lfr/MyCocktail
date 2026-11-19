import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateCocktailDto } from './create-cocktail.dto';
import { UpdateCocktailDto } from './update-cocktail.dto';
import { CreateDosageDto } from './create-dosage.dto';
import { CreateEtapeDto } from './create-etape.dto';
import { CreateUstensileDto } from './create-ustensile.dto';

const champsInvalides = async (Dto: new () => object, corps: object) =>
  (await validate(plainToInstance(Dto, corps))).map((e) => e.property);

describe('DTO cocktail', () => {
  const cocktail = {
    nomcocktail: 'Mojito',
    description: 'Un classique cubain bien frais',
    difficulte: 'Facile',
    alcool: true,
    duree: 5,
  };

  describe('CreateCocktailDto', () => {
    it('accepte un cocktail valide', async () => {
      expect(await champsInvalides(CreateCocktailDto, cocktail)).toEqual([]);
    });

    it('refuse un nom de moins de 2 caractères', async () => {
      expect(await champsInvalides(CreateCocktailDto, { ...cocktail, nomcocktail: 'M' })).toEqual(['nomcocktail']);
    });

    it('refuse une description de moins de 10 caractères', async () => {
      expect(await champsInvalides(CreateCocktailDto, { ...cocktail, description: 'Court' })).toEqual([
        'description',
      ]);
    });

    it('refuse une difficulté hors enum (casse comprise)', async () => {
      expect(await champsInvalides(CreateCocktailDto, { ...cocktail, difficulte: 'facile' })).toEqual([
        'difficulte',
      ]);
    });

    it('refuse alcool non booléen', async () => {
      expect(await champsInvalides(CreateCocktailDto, { ...cocktail, alcool: 'oui' })).toEqual(['alcool']);
    });

    it.each([0, -3, 2.5])('refuse la durée %p (entier ≥ 1, en minutes)', async (duree) => {
      expect(await champsInvalides(CreateCocktailDto, { ...cocktail, duree })).toEqual(['duree']);
    });
  });

  describe('UpdateCocktailDto', () => {
    it('accepte une modification sans statut', async () => {
      expect(await champsInvalides(UpdateCocktailDto, cocktail)).toEqual([]);
    });

    it.each(['brouillon', 'publi_', 'priv_', 'archiv_'])('accepte le statut %p', async (statut) => {
      expect(await champsInvalides(UpdateCocktailDto, { ...cocktail, statut })).toEqual([]);
    });

    it('refuse un statut inconnu (y compris « publié » avec accent)', async () => {
      expect(await champsInvalides(UpdateCocktailDto, { ...cocktail, statut: 'publié' })).toEqual(['statut']);
    });

    it('garde les règles de création', async () => {
      expect(await champsInvalides(UpdateCocktailDto, { ...cocktail, duree: 0 })).toEqual(['duree']);
    });
  });

  describe('CreateDosageDto', () => {
    const dosage = { idingredient: 'ING-00001', quantite: 2, unite: 'cl', idetape: 'ETP-00001' };

    it('accepte un dosage valide', async () => {
      expect(await champsInvalides(CreateDosageDto, dosage)).toEqual([]);
    });

    it.each([0, -1])('refuse la quantité %p', async (quantite) => {
      expect(await champsInvalides(CreateDosageDto, { ...dosage, quantite })).toEqual(['quantite']);
    });

    it('accepte une quantité décimale', async () => {
      expect(await champsInvalides(CreateDosageDto, { ...dosage, quantite: 0.5 })).toEqual([]);
    });

    it('refuse un dosage sans ingrédient ni unité', async () => {
      expect((await champsInvalides(CreateDosageDto, { quantite: 1, idetape: 'ETP-00001' })).sort()).toEqual(
        ['idingredient', 'unite'].sort(),
      );
    });
  });

  describe('CreateEtapeDto', () => {
    it('accepte une étape sans numéro (calculé par la base)', async () => {
      expect(await champsInvalides(CreateEtapeDto, { descriptionetape: 'Piler la menthe' })).toEqual([]);
    });

    it('refuse une description de moins de 5 caractères', async () => {
      expect(await champsInvalides(CreateEtapeDto, { descriptionetape: 'Pil' })).toEqual(['descriptionetape']);
    });

    it('refuse un numéro d’étape inférieur à 1', async () => {
      expect(
        await champsInvalides(CreateEtapeDto, { descriptionetape: 'Piler la menthe', numeroetape: 0 }),
      ).toEqual(['numeroetape']);
    });
  });

  describe('CreateUstensileDto', () => {
    it('accepte une étape et un ustensile', async () => {
      expect(await champsInvalides(CreateUstensileDto, { idetape: 'ETP-00001', idustensile: 'UST-00001' })).toEqual(
        [],
      );
    });

    it('refuse un corps vide', async () => {
      expect((await champsInvalides(CreateUstensileDto, {})).sort()).toEqual(['idetape', 'idustensile']);
    });
  });
});
