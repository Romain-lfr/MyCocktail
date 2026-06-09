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
        image: true,
      },
    });
  }

  async getMesFavoris(idcompte: string) {
    return this.prisma.favori.findMany({
      where: { idcompte },
      include: {
        cocktail: {
          include: {
            image: true,
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

  async ajouterFavori(idcompte: string, idcocktail: string) {
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM ajouter_favori(${idcompte}::varchar, ${idcocktail}::varchar)
    `;
    return result[0];
  }

  async supprimerFavori(idcompte: string, idcocktail: string) {
    return this.prisma.favori.delete({
      where: {
        idcompte_idcocktail: { idcompte, idcocktail },
      },
    });
  }

  async isFavori(idcompte: string, idcocktail: string) {
    const favori = await this.prisma.favori.findUnique({
      where: {
        idcompte_idcocktail: { idcompte, idcocktail },
      },
    });
    return { isFavori: !!favori };
  }

  async rechercherComptes(recherche: string) {
    return this.prisma.compte.findMany({
      where: {
        pseudo: { contains: recherche, mode: 'insensitive' },
      },
      select: {
        idcompte: true,
        pseudo: true,
        dateinscription: true,
      },
    });
  }
}