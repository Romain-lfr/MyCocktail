import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCocktailDto } from './dto/create-cocktail.dto';
import { CreateEtapeDto } from './dto/create-etape.dto';
import { CreateDosageDto } from './dto/create-dosage.dto';
import { CreateUstensileDto } from './dto/create-ustensile.dto';

@Injectable()
export class CocktailService {
  constructor(private prisma: PrismaService) {}

  async findAll(alcool?: boolean, recherche?: string) {
    return this.prisma.cocktail.findMany({
      where: {
        ...(alcool !== undefined ? { alcool } : {}),
        ...(recherche ? { nomcocktail: { contains: recherche, mode: 'insensitive' } } : {}),
      },
      include: {
        image: true,
      },
    });
  }

  async findByNom(nom: string, user?: any) {
    const cocktail = await this.prisma.cocktail.findFirst({
      where: { nomcocktail: { equals: nom, mode: 'insensitive' } },
      include: {
        image: true,
        etape: {
          orderBy: { numeroetape: 'asc' },
          include: { 
            etape_ustensile: { include: { ustensile: true } },
            dosage: { include: { ingredient: true } },
          },
        },
        dosage: { include: { ingredient: true } },
        avis: {
          include: {
            compte: { select: { pseudo: true } },
            reponse: {
              include: { compte: { select: { pseudo: true } } },
            },
          },
          orderBy: { dateavis: 'desc' },
        },
      },
    });

    if (cocktail?.alcool && (!user || user.estMineur)) {
      throw new ForbiddenException('Accès refusé');
    }

    return cocktail;
  }

  async create(data: CreateCocktailDto, idcompte: string) {
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM ajouter_cocktail(
        ${data.nomcocktail}::varchar,
        ${data.description}::text,
        ${data.duree}::int,
        ${idcompte}::varchar,
        ${data.difficulte}::difficulte_enum,
        ${data.alcool}::boolean,
        'brouillon'::statut_enum
      )
    `;
    return result[0];
  }

  async modifier(idcocktail: string, data: CreateCocktailDto, idcompte: string) {
  // Vérifier que l'auteur est bien le propriétaire
  const cocktail = await this.prisma.cocktail.findUnique({
    where: { idcocktail },
  });

  if (!cocktail) throw new Error('Cocktail introuvable');
  if (cocktail.idcompte !== idcompte) throw new Error('Non autorisé');

  return this.prisma.cocktail.update({
    where: { idcocktail },
    data: {
      nomcocktail: data.nomcocktail,
      description: data.description,
      difficulte: data.difficulte,
      alcool: data.alcool,
      duree: data.duree,
    },
  });
}

  async supprimer(idcocktail: string, idcompte: string) {
    const cocktail = await this.prisma.cocktail.findUnique({
      where: { idcocktail },
    });

    if (!cocktail) throw new Error('Cocktail introuvable');
    if (cocktail.idcompte !== idcompte) throw new Error('Non autorisé');

    return this.prisma.cocktail.delete({
      where: { idcocktail },
    });
  }

  async addEtape(idcocktail: string, data: CreateEtapeDto) {
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM ajouter_etape_cocktail(${idcocktail}, ${data.descriptionetape})
    `;
    return result[0];
  }

  async addDosage(idcocktail: string, data: CreateDosageDto) {
    const result = await this.prisma.$queryRaw<any[]>`
      INSERT INTO _dosage (idcocktail, idingredient, quantite, unite, idetape)
      VALUES (
        ${idcocktail}::varchar,
        ${data.idingredient}::varchar,
        ${data.quantite}::numeric,
        ${data.unite}::varchar,
        ${data.idetape || null}::varchar
      )
      ON CONFLICT (idcocktail, idingredient)
      DO UPDATE SET quantite = _dosage.quantite + EXCLUDED.quantite
      RETURNING *
    `;
    return result[0];
  }

  async addUstensile(data: CreateUstensileDto) {
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM ajouter_ustensile_etape(${data.idetape}, ${data.idustensile})
    `;
    return result[0];
  }

  async getIngredients() {
    return this.prisma.ingredient.findMany({
      orderBy: { nomingredient: 'asc' },
    });
  }

  async getUstensiles() {
    return this.prisma.ustensile.findMany({
      orderBy: { nomustensile: 'asc' },
    });
  }
}