import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Pseudo ou email obligatoire' })
  pseudoOrMail: string;

  @IsString()
  @IsNotEmpty({ message: 'Mot de passe obligatoire' })
  mdp: string;
}
