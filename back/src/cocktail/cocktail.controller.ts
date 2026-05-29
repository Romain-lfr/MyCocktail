import { Controller, Get, Post, Query, Param, Body, Request, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CocktailService } from './cocktail.service';
import { ImageService } from '../image/image.service';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt.guard';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
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
}