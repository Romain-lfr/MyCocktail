import { IsEnum, IsOptional } from 'class-validator';
import { CreateCocktailDto } from './create-cocktail.dto';

// Valeurs du client Prisma (publié → publi_, privé → priv_, archivé → archiv_)
export enum StatutEnum {
  brouillon = 'brouillon',
  publie = 'publi_',
  prive = 'priv_',
  archive = 'archiv_',
}

export class UpdateCocktailDto extends CreateCocktailDto {
  @IsOptional()
  @IsEnum(StatutEnum, { message: 'Statut invalide' })
  statut?: StatutEnum;
}
