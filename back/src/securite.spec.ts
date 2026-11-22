import { Controller, Get } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { ThrottlerGuard } from '@nestjs/throttler';
import request from 'supertest';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import {
  configurerSecurite,
  LIMITE_GLOBALE,
  moduleLimiteRequetes,
} from './securite';

@Controller('ping')
class PingController {
  @Get()
  ping() {
    return 'pong';
  }
}

describe('Sécurité HTTP (helmet, limite de requêtes)', () => {
  let app: NestExpressApplication;
  const authService = { login: jest.fn(), register: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      imports: [moduleLimiteRequetes],
      controllers: [AuthController, PingController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: APP_GUARD, useClass: ThrottlerGuard },
      ],
    }).compile();
    app = module.createNestApplication<NestExpressApplication>();
    configurerSecurite(app);
    await app.init();
  });

  afterEach(() => app.close());

  const depuis = (ip: string) => ({ 'X-Forwarded-For': ip });

  it.each(['login', 'register'])(
    'bloque la 6e tentative de /auth/%s en une minute (429, anti force brute)',
    async (route) => {
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post(`/auth/${route}`)
          .set(depuis('1.1.1.1'))
          .send({})
          .expect(201);
      }
      await request(app.getHttpServer())
        .post(`/auth/${route}`)
        .set(depuis('1.1.1.1'))
        .send({})
        .expect(429);
      expect(authService[route as 'login' | 'register']).toHaveBeenCalledTimes(
        5,
      );
    },
  );

  it('compte les essais par IP réelle du client derrière le proxy (trust proxy)', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app.getHttpServer())
        .post('/auth/login')
        .set(depuis('1.1.1.1'))
        .send({})
        .expect(201);
    }
    await request(app.getHttpServer())
      .post('/auth/login')
      .set(depuis('2.2.2.2'))
      .send({})
      .expect(201);
  });

  it(`limite les autres routes à ${LIMITE_GLOBALE.limit} requêtes par minute et par IP`, async () => {
    for (let i = 0; i < LIMITE_GLOBALE.limit; i++) {
      await request(app.getHttpServer())
        .get('/ping')
        .set(depuis('3.3.3.3'))
        .expect(200);
    }
    await request(app.getHttpServer())
      .get('/ping')
      .set(depuis('3.3.3.3'))
      .expect(429);
  });

  it('ajoute les en-têtes de sécurité et laisse les images s’afficher sur un autre domaine', async () => {
    const res = await request(app.getHttpServer()).get('/ping').expect(200);
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['strict-transport-security']).toBeDefined();
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['cross-origin-resource-policy']).toBe('cross-origin');
  });
});
