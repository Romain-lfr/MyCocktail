import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateDosageDto {
  @IsString()
  idingredient: string;

  @IsNumber()
  @Min(0.01, { message: 'La quantité doit être positive' })
  quantite: number;

  @IsString()
  unite: string;

  // Un dosage peut ne pas être lié à une étape (voir docs/Bdd.md)
  @IsOptional()
  @IsString()
  idetape?: string;
}
