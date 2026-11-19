import { JwtAuthGuard } from './jwt.guard';
import { OptionalJwtAuthGuard } from './optional-jwt.guard';

describe('Guards JWT', () => {
  it('JwtAuthGuard peut être instancié', () => {
    expect(new JwtAuthGuard()).toBeDefined();
  });

  describe('OptionalJwtAuthGuard', () => {
    const guard = new OptionalJwtAuthGuard();

    it('laisse passer l’utilisateur connecté', () => {
      const user = { idcompte: 'CPT-00001' };
      expect(guard.handleRequest(null, user)).toBe(user);
    });

    it('laisse passer un visiteur sans token (user = null) au lieu de renvoyer 401', () => {
      expect(guard.handleRequest(null, false)).toBeNull();
    });

    it('ignore un token invalide et traite la requête comme anonyme', () => {
      expect(
        guard.handleRequest(new Error('jwt expired'), undefined),
      ).toBeNull();
    });
  });
});
