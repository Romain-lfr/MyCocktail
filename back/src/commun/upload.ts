import { BadRequestException } from '@nestjs/common';
import { extname } from 'path';

// Réglages communs des envois d'images (photo de cocktail, photo de profil)

export const TAILLE_MAX_IMAGE = 5 * 1024 * 1024; // 5 Mo

// Nom du fichier sur le disque : horodatage + extension d'origine
export function nomFichierUpload(
  req: unknown,
  file: Express.Multer.File,
  cb: (erreur: Error | null, nom: string) => void,
) {
  cb(null, Date.now() + extname(file.originalname));
}

// N'accepte que les images jpg, png ou webp
export function filtreImage(
  req: unknown,
  file: Express.Multer.File,
  cb: (erreur: Error | null, accepte: boolean) => void,
) {
  if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
    cb(
      new BadRequestException('Format non supporté (jpg, png ou webp)'),
      false,
    );
  } else {
    cb(null, true);
  }
}
