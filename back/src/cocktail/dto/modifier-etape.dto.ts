import { IsString, MinLength } from 'class-validator';

export class ModifierEtapeDto {
  @IsString()
  @MinLength(5, { message: 'La description doit faire au moins 5 caractères' })
  descriptionetape: string;
}
