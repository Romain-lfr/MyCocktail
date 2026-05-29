import { Module } from '@nestjs/common';
import { CocktailService } from './cocktail.service';
import { CocktailController } from './cocktail.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ImageModule } from '../image/image.module';

@Module({
  imports: [PrismaModule, ImageModule],
  providers: [CocktailService],
  controllers: [CocktailController],
})
export class CocktailModule {}