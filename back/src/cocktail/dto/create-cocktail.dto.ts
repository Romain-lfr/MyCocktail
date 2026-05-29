import { IsString, IsBoolean, IsInt, IsEnum, MinLength, Min } from 'class-validator';

export enum DifficulteEnum {
  Facile = 'Facile',
  Moyen = 'Moyen',
  Difficile = 'Difficile',
}

export class CreateCocktailDto {
  @IsString()
  @MinLength(2, { message: 'Le nom doit faire au moins 2 caractères' })
  nomcocktail: string;

  @IsString()
  @MinLength(10, { message: 'La description doit faire au moins 10 caractères' })
  description: string;

  @IsEnum(DifficulteEnum, { message: 'Difficulté invalide' })
  difficulte: DifficulteEnum;

  @IsBoolean()
  alcool: boolean;

  @IsInt()
  @Min(1, { message: 'La durée doit être positive' })
  duree: number;
}