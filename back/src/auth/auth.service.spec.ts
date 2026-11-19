import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

const creerPrismaMock = () => ({
  compte: { findFirst: jest.fn(), findUnique: jest.fn() },
  $queryRaw: jest.fn(),
});

// Date de naissance d'une personne qui a `ans` ans aujourd'hui
const neIlYa = (ans: number) => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - ans);
  return d;
};

describe('AuthService', () => {
  let service: AuthService;
  let prisma: ReturnType<typeof creerPrismaMock>;
  const jwt = { sign: jest.fn().mockReturnValue('token-de-test') };
  let hash: string;

  beforeAll(async () => {
    hash = await bcrypt.hash('MotDePasse123', 4); // coût faible : tests rapides
  });

  beforeEach(async () => {
    prisma = creerPrismaMock();
    jwt.sign.mockClear();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  const compte = (ans: number) => ({
    idcompte: 'CPT-00001',
    pseudo: 'romain',
    role: 'user',
    mdpcompte: hash,
    datenaissance: neIlYa(ans),
  });

  describe('login', () => {
    it('renvoie le même message si le compte n’existe pas', async () => {
      prisma.compte.findFirst.mockResolvedValue(null);
      await expect(service.login('inconnu', 'MotDePasse123')).rejects.toThrow(
        new UnauthorizedException('Identifiants incorrects'),
      );
    });

    it('renvoie le même message si le mot de passe est faux', async () => {
      prisma.compte.findFirst.mockResolvedValue(compte(30));
      await expect(service.login('romain', 'mauvais')).rejects.toThrow(
        new UnauthorizedException('Identifiants incorrects'),
      );
    });

    it('cherche le pseudo sans tenir compte de la casse', async () => {
      prisma.compte.findFirst.mockResolvedValue(compte(30));
      await service.login('Romain', 'MotDePasse123');
      const conditions = prisma.compte.findFirst.mock.calls[0][0].where.OR;
      expect(conditions[0].pseudo).toEqual({
        equals: 'Romain',
        mode: 'insensitive',
      });
      expect(conditions[1].mailcompte).toBe('romain');
    });

    it('marque un compte de 16 ans comme mineur', async () => {
      prisma.compte.findFirst.mockResolvedValue(compte(16));
      const res = await service.login('romain', 'MotDePasse123');
      expect(res).toEqual({ access_token: 'token-de-test', estMineur: true });
      expect(jwt.sign.mock.calls[0][0]).toMatchObject({
        sub: 'CPT-00001',
        estMineur: true,
      });
    });

    it('marque un compte de 30 ans comme majeur', async () => {
      prisma.compte.findFirst.mockResolvedValue(compte(30));
      const res = await service.login('romain', 'MotDePasse123');
      expect(res.estMineur).toBe(false);
    });
  });

  describe('register', () => {
    it('refuse un pseudo déjà utilisé', async () => {
      prisma.compte.findUnique.mockResolvedValueOnce({ idcompte: 'CPT-00001' });
      await expect(
        service.register(
          'romain',
          'r@mycocktail.com',
          'MotDePasse123',
          '2000-01-01',
        ),
      ).rejects.toThrow(new ConflictException('Ce pseudo est déjà utilisé'));
    });

    it('refuse un email déjà utilisé', async () => {
      prisma.compte.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ idcompte: 'CPT-00001' });
      await expect(
        service.register(
          'nouveau',
          'R@MyCocktail.com',
          'MotDePasse123',
          '2000-01-01',
        ),
      ).rejects.toThrow(new ConflictException('Cet email est déjà utilisé'));
      expect(prisma.compte.findUnique.mock.calls[1][0].where.mailcompte).toBe(
        'r@mycocktail.com',
      );
    });

    it('inscrit le compte via inscrire_compte', async () => {
      prisma.compte.findUnique.mockResolvedValue(null);
      prisma.$queryRaw.mockResolvedValue([{ idcompte: 'CPT-00002' }]);
      await service.register(
        'nouveau',
        'n@mycocktail.com',
        'MotDePasse123',
        '2000-01-01',
      );
      expect(prisma.$queryRaw).toHaveBeenCalled();
    });
  });
});
