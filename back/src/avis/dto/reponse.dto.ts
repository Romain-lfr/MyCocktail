import { IsOptional, IsString, MinLength } from 'class-validator';

/** Modifier une réponse : seul le commentaire change. */
export class ModifierReponseDto {
  @IsString()
  @MinLength(2, { message: 'La réponse doit faire au moins 2 caractères' })
  commentaire: string;
}

/** Répondre à un avis, ou à une réponse (idreponse_parent). */
export class CreateReponseDto extends ModifierReponseDto {
  @IsOptional()
  @IsString()
  idreponse_parent?: string;
}
