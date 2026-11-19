import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  const valeurInitiale = process.env.JWT_SECRET;

  afterEach(() => {
    process.env.JWT_SECRET = valeurInitiale;
  });

  it('refuse de démarrer sans JWT_SECRET', () => {
    delete process.env.JWT_SECRET;
    expect(() => new JwtStrategy()).toThrow('JWT_SECRET manquant');
  });

  it('transforme le contenu du token en utilisateur (req.user)', async () => {
    process.env.JWT_SECRET = 'secret-de-test';
    const strategy = new JwtStrategy();
    const user = await strategy.validate({
      sub: 'CPT-00001',
      pseudo: 'romain',
      role: 'user',
      estMineur: false,
      iat: 123,
    });
    expect(user).toEqual({
      idcompte: 'CPT-00001',
      pseudo: 'romain',
      role: 'user',
      estMineur: false,
    });
  });
});
