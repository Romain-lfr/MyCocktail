import { IsString, IsInt, Min, Max, MinLength } from 'class-validator';

export class CreateAvisDto {
  @IsInt()
  @Min(1, { message: 'La note doit être entre 1 et 5' })
  @Max(5, { message: 'La note doit être entre 1 et 5' })
  noteavis: number;

  @IsString()
  @MinLength(3, { message: 'Le titre doit faire au moins 3 caractères' })
  titreavis: string;

  @IsString()
  @MinLength(10, { message: 'La description doit faire au moins 10 caractères' })
  descriptionavis: string;
}