import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CocktailModule } from './cocktail/cocktail.module';
import { CompteModule } from './compte/compte.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/public',
    }),
    PrismaModule,
    AuthModule,
    CocktailModule,
    CompteModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}