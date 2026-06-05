import { IsString, IsInt, MinLength, Min } from 'class-validator';

export class CreateEtapeDto {
  @IsInt()
  @Min(1, { message: 'Le numéro d\'étape doit être positif' })
  numeroetape: number;

  @IsString()
  @MinLength(5, { message: 'La description doit faire au moins 5 caractères' })
  descriptionetape: string;
}