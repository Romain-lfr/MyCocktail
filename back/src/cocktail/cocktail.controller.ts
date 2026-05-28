import { Controller, Get, Query, Param, Request } from '@nestjs/common';
import { CocktailService } from './cocktail.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { UseGuards } from '@nestjs/common';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt.guard';

@Controller('cocktail')
export class CocktailController {
  constructor(private cocktailService: CocktailService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  findAll(@Query('alcool') alcool?: string, @Request() req?: any) {
    const user = req.user;
    console.log('USER:', user, 'alcool:', alcool);

    // Si pas connecté ou mineur → mocktails uniquement
    if (!user || user.estMineur) {
      return this.cocktailService.findAll(false);
    }

    // Si connecté et majeur → filtre selon le paramètre
    if (alcool === 'true') return this.cocktailService.findAll(true);
    if (alcool === 'false') return this.cocktailService.findAll(false);
    return this.cocktailService.findAll();
  }

  @Get(':nom')
  @UseGuards(OptionalJwtAuthGuard)
  findOne(@Param('nom') nom: string, @Request() req?: any) {
    return this.cocktailService.findByNom(nom, req.user);
  }

}