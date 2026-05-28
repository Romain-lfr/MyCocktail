import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompteService {
  constructor(private prisma: PrismaService) {}

  async getMonCompte(idcompte: string) {
    return this.prisma.compte.findUnique({
      where: { idcompte },
      select: {
        idcompte: true,
        pseudo: true,
        mailcompte: true,
        dateinscription: true,
        datenaissance: true,
        role: true,
      },
    });
  }

  async getMesCocktails(idcompte: string) {
    return this.prisma.cocktail.findMany({
      where: { idcompte },
      include: {
        image_cocktail: { include: { image: true } },
      },
    });
  }

  async getMesFavoris(idcompte: string) {
    return this.prisma.favori.findMany({
      where: { idcompte },
      include: {
        cocktail: {
          include: {
            image_cocktail: { include: { image: true } },
          },
        },
      },
    });
  }

  async getMesAvis(idcompte: string) {
    return this.prisma.avis.findMany({
      where: { idcompte },
      include: {
        cocktail: { select: { nomcocktail: true } },
      },
      orderBy: { dateavis: 'desc' },
    });
  }
}