import { Controller, Get, Post, Query, Param, Body, Request, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
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

@Controller('cocktail')
export class CocktailController {
  constructor(
    private cocktailService: CocktailService,
    private imageService: ImageService,
  ) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  findAll(@Query('alcool') alcool?: string, @Request() req?: any) {
    const user = req.user;
    if (!user || user.estMineur) return this.cocktailService.findAll(false);
    if (alcool === 'true') return this.cocktailService.findAll(true);
    if (alcool === 'false') return this.cocktailService.findAll(false);
    return this.cocktailService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() body: CreateCocktailDto, @Request() req: any) {
    return this.cocktailService.create(body, req.user.idcompte);
  }

  @Post(':id/image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './public/images',
      filename: (req, file, cb) => {
        cb(null, Date.now() + extname(file.originalname));
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
        cb(new Error('Format non supporté'), false);
      } else {
        cb(null, true);
      }
    },
  }))
  async uploadImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.imageService.ajouterImageCocktail(id, file.path, file.originalname);
  }

  @Get(':nom')
  @UseGuards(OptionalJwtAuthGuard)
  findOne(@Param('nom') nom: string, @Request() req?: any) {
    return this.cocktailService.findByNom(nom, req.user);
  }

  @Post(':id/etape')
  @UseGuards(JwtAuthGuard)
  addEtape(@Param('id') id: string, @Body() body: CreateEtapeDto) {
    return this.cocktailService.addEtape(id, body);
  }

  @Get('listes/ingredients')
  getIngredients() {
    return this.cocktailService.getIngredients();
  }

  @Get('listes/ustensiles')
  getUstensiles() {
    return this.cocktailService.getUstensiles();
  }

  @Post(':id/dosage')
  @UseGuards(JwtAuthGuard)
  addDosage(@Param('id') id: string, @Body() body: CreateDosageDto) {
    return this.cocktailService.addDosage(id, body);
  }

  @Post('etape/ustensile')
  @UseGuards(JwtAuthGuard)
  addUstensile(@Body() body: CreateUstensileDto) {
    return this.cocktailService.addUstensile(body);
  }
}