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

  async modifierCompte(idcompte: string, data: { pseudo?: string; mailcompte?: string; numtel?: string; datenaissance?: string }) {
    return this.prisma.compte.update({
      where: { idcompte },
      data: {
        ...(data.pseudo ? { pseudo: data.pseudo } : {}),
        ...(data.mailcompte ? { mailcompte: data.mailcompte.toLowerCase() } : {}),
        ...(data.numtel !== undefined ? { numtel: data.numtel } : {}),
        ...(data.datenaissance ? { datenaissance: new Date(data.datenaissance) } : {}),
      },
      select: {
        idcompte: true,
        pseudo: true,
        mailcompte: true,
        numtel: true,
        dateinscription: true,
        datenaissance: true,
        role: true,
      },
    });
  }

  async getMonFrigo(idcompte: string) {
    return this.prisma.frigo.findUnique({
      where: { idcompte },
      include: {
        frigo_composition: {
          include: { ingredient: true },
          orderBy: { ingredient: { nomingredient: 'asc' } },
        },
      },
    });
  }

  async ajouterIngredientFrigo(idcompte: string, idingredient: string, quantite: number, unite: string) {
    const frigo = await this.prisma.frigo.findUnique({ where: { idcompte } });
    return this.prisma.frigo_composition.upsert({
      where: { idfrigo_idingredient: { idfrigo: frigo!.idfrigo, idingredient } },
      update: { quantite, unite },
      create: { idfrigo: frigo!.idfrigo, idingredient, quantite, unite },
    });
  }

  async supprimerIngredientFrigo(idcompte: string, idingredient: string) {
    const frigo = await this.prisma.frigo.findUnique({ where: { idcompte } });
    return this.prisma.frigo_composition.delete({
      where: { idfrigo_idingredient: { idfrigo: frigo!.idfrigo, idingredient } },
    });
  }

  async getCocktailsRealisables(idcompte: string) {
    const frigo = await this.prisma.frigo.findUnique({
      where: { idcompte },
      include: { frigo_composition: true },
    });

    if (!frigo || frigo.frigo_composition.length === 0) return [];

    const ingredientsFrigo = frigo.frigo_composition.map((f) => f.idingredient);

    const cocktails = await this.prisma.cocktail.findMany({
      where: { statut: 'publi_' },
      include: {
        image: true,
        avis: { select: { noteavis: true } },
        dosage: true,
      },
    });

    // Filtrer côté Node : tous les ingrédients du cocktail sont dans le frigo
    return cocktails.filter((c) =>
      c.dosage.every((d) => ingredientsFrigo.includes(d.idingredient))
    );
  }
}