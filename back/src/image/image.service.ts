import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ImageService {
  constructor(private prisma: PrismaService) {}

  async convertAndSave(filePath: string): Promise<string> {
    const webpFilename = Date.now() + '.webp';
    const webpPath = path.join('./public/images', webpFilename);

    await sharp(filePath).webp({ quality: 80 }).toFile(webpPath);

    // Supprimer l'original
    fs.unlinkSync(filePath);

    return `/public/images/${webpFilename}`;
  }

  async ajouterImageCocktail(
    idcocktail: string,
    filePath: string,
    originalName: string,
  ) {
    const urlimage = await this.convertAndSave(filePath);
    return this.prisma.$queryRaw`
      SELECT * FROM ajouter_image_cocktail(${idcocktail}, ${urlimage}, ${originalName})
    `;
  }

  /**
   * Photo de profil : modifier_image_compte remplace la ligne en base,
   * puis l'ancien fichier est supprimé du disque.
   */
  async ajouterImageCompte(
    idcompte: string,
    filePath: string,
    originalName: string,
  ) {
    const ancienne = await this.photoDeProfil(idcompte);
    const urlimage = await this.convertAndSave(filePath);
    const result = await this.prisma.$queryRaw<{ urlimage: string }[]>`
      SELECT * FROM modifier_image_compte(${idcompte}, ${urlimage}, ${originalName})
    `;
    if (ancienne) this.supprimerFichier(ancienne.urlimage);
    return result;
  }

  /** Retire la photo de profil (base + fichier). Sans photo : rien à faire. */
  async supprimerImageCompte(idcompte: string) {
    const ancienne = await this.photoDeProfil(idcompte);
    if (ancienne) {
      await this.prisma.image.deleteMany({
        where: { idcompte, typeimage: 'profil' },
      });
      this.supprimerFichier(ancienne.urlimage);
    }
    return { photo: null };
  }

  private photoDeProfil(idcompte: string) {
    return this.prisma.image.findFirst({
      where: { idcompte, typeimage: 'profil' },
      select: { urlimage: true },
    });
  }

  // Supprime un fichier de public/images (jamais en dehors, même avec une URL piégée)
  private supprimerFichier(urlimage: string) {
    if (!urlimage.startsWith('/public/images/')) return;
    const fichier = path.join('./public/images', path.basename(urlimage));
    if (fs.existsSync(fichier)) fs.unlinkSync(fichier);
  }

  async ajouterImageIngredient(
    idingredient: string,
    filePath: string,
    originalName: string,
  ) {
    const urlimage = await this.convertAndSave(filePath);
    return this.prisma.$queryRaw`
      SELECT * FROM modifier_image_ingredient(${idingredient}, ${urlimage}, ${originalName})
    `;
  }

  async ajouterImageAvis(
    idavis: string,
    filePath: string,
    originalName: string,
  ) {
    const urlimage = await this.convertAndSave(filePath);
    return this.prisma.$queryRaw`
      SELECT * FROM ajouter_image_avis(${idavis}, ${urlimage}, ${originalName})
    `;
  }
}
