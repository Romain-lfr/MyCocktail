import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCocktailDto } from './dto/create-cocktail.dto';
import { CreateEtapeDto } from './dto/create-etape.dto';
import { CreateDosageDto } from './dto/create-dosage.dto';
import { CreateUstensileDto } from './dto/create-ustensile.dto';

@Injectable()
export class CocktailService {
  constructor(private prisma: PrismaService) {}

  async findAll(alcool?: boolean) {
    return this.prisma.cocktail.findMany({
      where: alcool !== undefined ? { alcool } : {},
    });
  }

  async findByNom(nom: string, user?: any) {
    const cocktail = await this.prisma.cocktail.findFirst({
      where: { nomcocktail: { equals: nom, mode: 'insensitive' } },
      include: {
        etape: {
          orderBy: { numeroetape: 'asc' },
          include: { etape_ustensile: { include: { ustensile: true } } },
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

    // Récupère l'image du cocktail
    if (cocktail) {
      const image = await this.prisma.image.findFirst({
        where: { typeimage: 'cocktail', urlimage: { contains: cocktail.idcocktail } },
      });
      return { ...cocktail, image };
    }

    return cocktail;
  }

  async create(data: CreateCocktailDto, idcompte: string) {
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM ajouter_cocktail(${data.nomcocktail}, ${data.description}, ${data.duree}, ${idcompte}, ${data.difficulte}::"difficulte_enum", ${data.alcool}, 'brouillon'::"statut_enum")
    `;
    return result[0];
  }

  async addEtape(idcocktail: string, data: CreateEtapeDto) {
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM ajouter_etape_cocktail(${idcocktail}, ${data.descriptionetape})
    `;
    return result[0];
  }

  async addDosage(idcocktail: string, data: CreateDosageDto) {
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM ajouter_dosage(${idcocktail}, ${data.idingredient}, ${data.quantite}::numeric, ${data.unite}, ${data.idetape || null})
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