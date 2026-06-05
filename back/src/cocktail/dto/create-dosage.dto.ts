import { IsString, IsNumber, Min } from 'class-validator';

export class CreateDosageDto {
  @IsString()
  idingredient: string;

  @IsNumber()
  @Min(0.01, { message: 'La quantité doit être positive' })
  quantite: number;

  @IsString()
  unite: string;

  @IsString()
  idetape?: string;
}