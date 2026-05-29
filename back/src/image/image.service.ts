import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ImageService {
  constructor(private prisma: PrismaService) {}

  async convertAndSave(filePath: string, originalName: string): Promise<string> {
    const webpFilename = Date.now() + '.webp';
    const webpPath = path.join('./public/images', webpFilename);

    await sharp(filePath)
      .webp({ quality: 80 })
      .toFile(webpPath);

    // Supprimer l'original
    fs.unlinkSync(filePath);

    return `/public/images/${webpFilename}`;
  }

  async ajouterImageCocktail(idcocktail: string, filePath: string, originalName: string) {
    const urlimage = await this.convertAndSave(filePath, originalName);
    return this.prisma.$queryRaw`
      SELECT * FROM ajouter_image_cocktail(${idcocktail}, ${urlimage}, ${originalName})
    `;
  }

  async ajouterImageCompte(idcompte: string, filePath: string, originalName: string) {
    const urlimage = await this.convertAndSave(filePath, originalName);
    return this.prisma.$queryRaw`
      SELECT * FROM modifier_image_compte(${idcompte}, ${urlimage}, ${originalName})
    `;
  }

  async ajouterImageIngredient(idingredient: string, filePath: string, originalName: string) {
    const urlimage = await this.convertAndSave(filePath, originalName);
    return this.prisma.$queryRaw`
      SELECT * FROM modifier_image_ingredient(${idingredient}, ${urlimage}, ${originalName})
    `;
  }

  async ajouterImageAvis(idavis: string, filePath: string, originalName: string) {
    const urlimage = await this.convertAndSave(filePath, originalName);
    return this.prisma.$queryRaw`
      SELECT * FROM ajouter_image_avis(${idavis}, ${urlimage}, ${originalName})
    `;
  }
}