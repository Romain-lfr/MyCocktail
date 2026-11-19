import {
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

/** Quantité + unité (dosage d'un cocktail, contenu du frigo). */
export class QuantiteDto {
  @IsNumber({}, { message: 'La quantité doit être un nombre' })
  @Min(0.01, { message: 'La quantité doit être positive' })
  quantite: number;

  @IsString()
  @IsNotEmpty({ message: "L'unité est obligatoire" })
  @MaxLength(20, { message: "L'unité fait au plus 20 caractères" })
  unite: string;
}
