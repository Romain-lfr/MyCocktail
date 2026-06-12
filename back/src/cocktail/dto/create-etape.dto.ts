import { IsString, IsInt, IsOptional, MinLength, Min } from 'class-validator';

export class CreateEtapeDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  numeroetape?: number;

  @IsString()
  @MinLength(5, { message: 'La description doit faire au moins 5 caractères' })
  descriptionetape: string;
}