import { Module } from '@nestjs/common';
import { CompteService } from './compte.service';
import { CompteController } from './compte.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ImageModule } from '../image/image.module';

@Module({
  imports: [PrismaModule, ImageModule],
  providers: [CompteService],
  controllers: [CompteController],
})
export class CompteModule {}
