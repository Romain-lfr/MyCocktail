import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { NouvelIngredientDto, NouvelUstensileDto } from './liste.dto';
import { ModifierEtapeDto } from './modifier-etape.dto';
import { CreateDosageDto } from './create-dosage.dto';

const champsInvalides = async (classe: new () => object, corps: object) =>
  (await validate(plainToInstance(classe, corps))).map((e) => e.property);

describe('DTO des listes et des étapes', () => {
  it('NouvelIngredientDto : nom de 2 à 100 caractères, catégorie connue', async () => {
    expect(
      await champsInvalides(NouvelIngredientDto, {
        nomingredient: 'Basilic',
        categorie: 'autre',
      }),
    ).toEqual([]);
    expect(
      await champsInvalides(NouvelIngredientDto, {
        nomingredient: 'B',
        categorie: 'autre',
      }),
    ).toEqual(['nomingredient']);
    expect(
      await champsInvalides(NouvelIngredientDto, {
        nomingredient: 'x'.repeat(101),
        categorie: 'autre',
      }),
    ).toEqual(['nomingredient']);
    expect(
      await champsInvalides(NouvelIngredientDto, {
        nomingredient: 'Basilic',
        categorie: 'herbe',
      }),
    ).toEqual(['categorie']);
  });

  it('NouvelUstensileDto : nom de 2 à 100 caractères', async () => {
    expect(
      await champsInvalides(NouvelUstensileDto, { nomustensile: 'Pilon' }),
    ).toEqual([]);
    expect(
      await champsInvalides(NouvelUstensileDto, { nomustensile: 'P' }),
    ).toEqual(['nomustensile']);
    expect(await champsInvalides(NouvelUstensileDto, {})).toEqual([
      'nomustensile',
    ]);
  });

  it('ModifierEtapeDto : description d’au moins 5 caractères', async () => {
    expect(
      await champsInvalides(ModifierEtapeDto, {
        descriptionetape: 'Piler la menthe',
      }),
    ).toEqual([]);
    expect(
      await champsInvalides(ModifierEtapeDto, { descriptionetape: 'Pil' }),
    ).toEqual(['descriptionetape']);
  });

  it('CreateDosageDto : l’étape est facultative', async () => {
    const dosage = { idingredient: 'ING-00001', quantite: 2, unite: 'cl' };
    expect(await champsInvalides(CreateDosageDto, dosage)).toEqual([]);
    expect(
      await champsInvalides(CreateDosageDto, {
        ...dosage,
        idetape: 'ETP-00001',
      }),
    ).toEqual([]);
    expect(
      await champsInvalides(CreateDosageDto, { ...dosage, idetape: 12 }),
    ).toEqual(['idetape']);
  });
});
