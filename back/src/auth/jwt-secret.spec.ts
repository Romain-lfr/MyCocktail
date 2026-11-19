import { getJwtSecret } from './jwt-secret';

describe('getJwtSecret', () => {
  const valeurInitiale = process.env.JWT_SECRET;

  afterEach(() => {
    process.env.JWT_SECRET = valeurInitiale;
  });

  it('renvoie le secret défini dans l’environnement', () => {
    process.env.JWT_SECRET = 'secret-de-test';
    expect(getJwtSecret()).toBe('secret-de-test');
  });

  it('lève une erreur si JWT_SECRET est absent', () => {
    delete process.env.JWT_SECRET;
    expect(() => getJwtSecret()).toThrow('JWT_SECRET manquant');
  });

  it('lève une erreur si JWT_SECRET est vide', () => {
    process.env.JWT_SECRET = '';
    expect(() => getJwtSecret()).toThrow('JWT_SECRET manquant');
  });
});
