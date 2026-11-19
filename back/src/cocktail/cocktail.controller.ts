import { Controller, Get, Post, Put, Delete, Query, Param, Body, Request, UseGuards, UseInterceptors, UploadedFile, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CocktailService } from './cocktail.service';
import { ImageService } from '../image/image.service';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt.guard';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CreateDosageDto } from './dto/create-dosage.dto';
import { CreateUstensileDto } from './dto/create-ustensile.dto';
import { CreateEtapeDto } from './dto/create-etape.dto';
import { CreateCocktailDto } from './dto/create-cocktail.dto';
import { UpdateCocktailDto } from './dto/update-cocktail.dto';


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
    cb(new BadRequestException('Format non supporté (jpg, png ou webp)'), false);
  } else {
    cb(null, true);
  }
}

@Controller('cocktail')
export class CocktailController {
  constructor(
    private cocktailService: CocktailService,
    private imageService: ImageService,
  ) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  findAll(
    @Query('alcool') alcool?: string,
    @Query('recherche') recherche?: string,
    @Query('ingredients') ingredients?: string,
    @Query('ustensiles') ustensiles?: string,
    @Request() req?: any
  ) {
    const user = req.user;
    const ingredientsList = ingredients ? ingredients.split(',') : [];
    const ustensilesList = ustensiles ? ustensiles.split(',') : [];
    if (!user || user.estMineur) return this.cocktailService.findAll(false, recherche, ingredientsList, ustensilesList);
    if (alcool === 'true') return this.cocktailService.findAll(true, recherche, ingredientsList, ustensilesList);
    if (alcool === 'false') return this.cocktailService.findAll(false, recherche, ingredientsList, ustensilesList);
    return this.cocktailService.findAll(undefined, recherche, ingredientsList, ustensilesList);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() body: CreateCocktailDto, @Request() req: any) {
    return this.cocktailService.create(body, req.user.idcompte, req.user.estMineur);
  }

  @Post(':id/image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './public/images',
      filename: nomFichierUpload,
    }),
    limits: { fileSize: TAILLE_MAX_IMAGE },
    fileFilter: filtreImage,
  }))

  async uploadImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Request() req: any) {
    if (!file) throw new BadRequestException('Aucune image reçue');
    try {
      await this.cocktailService.verifierAuteur(id, req.user.idcompte);
    } catch (e) {
      fs.unlinkSync(file.path); // multer a déjà écrit le fichier : on le supprime
      throw e;
    }
    return this.imageService.ajouterImageCocktail(id, file.path, file.originalname);
  }

  @Get('listes/ingredients')
  getIngredients() {
    return this.cocktailService.getIngredients();
  }

  @Get('listes/ustensiles')
  getUstensiles() {
    return this.cocktailService.getUstensiles();
  }

  @Get(':nom')
  @UseGuards(OptionalJwtAuthGuard)
  findOne(@Param('nom') nom: string, @Request() req?: any) {
    return this.cocktailService.findByNom(nom, req.user);
  }

  @Post(':id/etape')
  @UseGuards(JwtAuthGuard)
  addEtape(@Param('id') id: string, @Body() body: CreateEtapeDto, @Request() req: any) {
    return this.cocktailService.addEtape(id, body, req.user.idcompte);
  }

  @Post(':id/dosage')
  @UseGuards(JwtAuthGuard)
  addDosage(@Param('id') id: string, @Body() body: CreateDosageDto, @Request() req: any) {
    return this.cocktailService.addDosage(id, body, req.user.idcompte);
  }

  @Post('etape/ustensile')
  @UseGuards(JwtAuthGuard)
  addUstensile(@Body() body: CreateUstensileDto, @Request() req: any) {
    return this.cocktailService.addUstensile(body, req.user.idcompte);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async modifier(@Param('id') id: string, @Body() body: UpdateCocktailDto, @Request() req: any) {
    try {
      return await this.cocktailService.modifier(id, body, req.user.idcompte, req.user.estMineur);
    } catch (e: any) {
      if (e.message === 'Non autorisé') throw new ForbiddenException();
      if (e.message === 'Cocktail introuvable') throw new NotFoundException();
      throw e;
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async supprimer(@Param('id') id: string, @Request() req: any) {
    try {
      return await this.cocktailService.supprimer(id, req.user.idcompte);
    } catch (e: any) {
      if (e.message === 'Non autorisé') throw new ForbiddenException();
      if (e.message === 'Cocktail introuvable') throw new NotFoundException();
      throw e;
    }
  }

  @Put('etape/:idetape')
  @UseGuards(JwtAuthGuard)
  async modifierEtape(@Param('idetape') idetape: string, @Body() body: { descriptionetape: string }, @Request() req: any) {
    try {
      return await this.cocktailService.modifierEtape(idetape, body.descriptionetape, req.user.idcompte);
    } catch (e: any) {
      if (e.message === 'Non autorisé') throw new ForbiddenException();
      if (e.message === 'Etape introuvable') throw new NotFoundException();
      throw e;
    }
  }

  @Delete('etape/:idetape')
  @UseGuards(JwtAuthGuard)
  async supprimerEtape(@Param('idetape') idetape: string, @Request() req: any) {
    try {
      return await this.cocktailService.supprimerEtape(idetape, req.user.idcompte);
    } catch (e: any) {
      if (e.message === 'Non autorisé') throw new ForbiddenException();
      if (e.message === 'Etape introuvable') throw new NotFoundException();
      throw e;
    }
  }

  @Put(':id/dosage/:idingredient')
  @UseGuards(JwtAuthGuard)
  modifierDosage(
    @Param('id') id: string,
    @Param('idingredient') idingredient: string,
    @Body() body: { quantite: number; unite: string },
    @Request() req: any,
  ) {
    return this.cocktailService.modifierDosage(id, idingredient, body.quantite, body.unite, req.user.idcompte);
  }

  @Delete('etape/:idetape/ustensile/:idustensile')
  @UseGuards(JwtAuthGuard)
  supprimerUstensileEtape(
    @Param('idetape') idetape: string,
    @Param('idustensile') idustensile: string,
    @Request() req: any,
  ) {
    return this.cocktailService.supprimerUstensileEtape(idetape, idustensile, req.user.idcompte);
  }

  @Post('listes/ingredients')
  @UseGuards(JwtAuthGuard)
  ajouterIngredient(@Body() body: { nomingredient: string; categorie: string }) {
    return this.cocktailService.ajouterIngredient(body.nomingredient, body.categorie);
  }

  @Post('listes/ustensiles')
  @UseGuards(JwtAuthGuard)
  ajouterUstensile(@Body() body: { nomustensile: string }) {
    return this.cocktailService.ajouterUstensile(body.nomustensile);
  }
}