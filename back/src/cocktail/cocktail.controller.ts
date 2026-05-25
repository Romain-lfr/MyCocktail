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
    console.log('USER:', user);
    if (user && !user.estMineur) return this.cocktailService.findAll();
    return this.cocktailService.findAll(false);
  }

  @Get(':nom')
  @UseGuards(OptionalJwtAuthGuard)
  findOne(@Param('nom') nom: string, @Request() req?: any) {
    return this.cocktailService.findByNom(nom, req.user);
  }

}