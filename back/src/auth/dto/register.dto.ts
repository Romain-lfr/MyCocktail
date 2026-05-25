import { IsString, IsEmail, MinLength, IsDateString } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(3, { message: 'Le pseudo doit faire au moins 3 caractères' })
  pseudo: string;

  @IsEmail({}, { message: 'Email invalide' })
  mail: string;

  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit faire au moins 8 caractères' })
  mdp: string;

  @IsDateString({}, { message: 'Date de naissance invalide' })
  dateNaissance: string;
}