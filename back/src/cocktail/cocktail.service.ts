import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCocktailDto } from './dto/create-cocktail.dto';


@Injectable()
export class CocktailService {
  constructor(private prisma: PrismaService) {}

  async findAll(alcool?: boolean) {
  return this.prisma.cocktail.findMany({
    where: alcool !== undefined ? { alcool } : {},
    include: {
      image_cocktail: {
        include: {
          image: true,
        },
      },
    },
  });
  }

  async findOne(id: string) {
  return this.prisma.cocktail.findUnique({
    where: { idcocktail: id },
    include: {
      image_cocktail: {
        include: { image: true },
      },
      etape: {
        orderBy: { numeroetape: 'asc' },
        include: {
          etape_ustensile: {
            include: { ustensile: true },
          },
        },
      },
      dosage: {
        include: { ingredient: true },
      },
    },
  });
  }

  async findByNom(nom: string, user?: any) {
    const cocktail = await this.prisma.cocktail.findFirst({
      where: { nomcocktail: { equals: nom, mode: 'insensitive' } },
      include: {
        image_cocktail: { include: { image: true } },
        etape: {
          orderBy: { numeroetape: 'asc' },
          include: { etape_ustensile: { include: { ustensile: true } } },
        },
        dosage: { include: { ingredient: true } },
        avis: {
          include: {
            compte: { select: { pseudo: true } },
            reponse: {
              include: {
                compte: { select: { pseudo: true } },
              },
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
    const id = 'CKT-' + Math.random().toString(36).substr(2, 5).toUpperCase();
    
    return this.prisma.cocktail.create({
      data: {
        idcocktail: id,
        nomcocktail: data.nomcocktail,
        description: data.description,
        difficulte: data.difficulte,
        alcool: data.alcool,
        duree: data.duree,
        statut: 'brouillon',
        idcompte,
      },
    });
  }

  async addImage(idcocktail: string, urlimage: string, titleimage: string) {
    const result = await this.prisma.$queryRaw`
      SELECT * FROM ajouter_image_cocktail(${idcocktail}, ${urlimage}, ${titleimage})
    `;
    return result;
  }
  
}