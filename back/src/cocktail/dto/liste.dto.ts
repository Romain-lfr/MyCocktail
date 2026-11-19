import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';

export const CATEGORIES_INGREDIENT = [
  'alcool',
  'jus',
  'sirop',
  'soda',
  'eau',
  'fruit',
  'autre',
] as const;

/** Nouvel ingrédient proposé depuis le formulaire d'un cocktail. */
export class NouvelIngredientDto {
  @IsString()
  @MinLength(2, { message: 'Le nom doit faire au moins 2 caractères' })
  @MaxLength(100, { message: 'Le nom fait au plus 100 caractères' })
  nomingredient: string;

  @IsIn(CATEGORIES_INGREDIENT, { message: 'Catégorie inconnue' })
  categorie: (typeof CATEGORIES_INGREDIENT)[number];
}

/** Nouvel ustensile proposé depuis le formulaire d'un cocktail. */
export class NouvelUstensileDto {
  @IsString()
  @MinLength(2, { message: 'Le nom doit faire au moins 2 caractères' })
  @MaxLength(100, { message: 'Le nom fait au plus 100 caractères' })
  nomustensile: string;
}
