import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

// La date de naissance n'est volontairement pas modifiable :
// sinon un mineur pourrait se déclarer majeur.
export class UpdateCompteDto {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Le pseudo doit faire au moins 3 caractères' })
  pseudo?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email invalide' })
  mailcompte?: string;

  @IsOptional()
  @IsString()
  numtel?: string | null;
}
