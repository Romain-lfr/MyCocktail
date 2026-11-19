// Types de l'utilisateur authentifié, tel que la stratégie JWT le place dans req.user.

/** Contenu du JWT signé à la connexion (auth.service). */
export interface PayloadJwt {
  sub: string;
  pseudo: string;
  role: string;
  estMineur: boolean;
  iat?: number; // ajoutés par jsonwebtoken à la signature
  exp?: number;
}

/** Ce que JwtStrategy.validate renvoie, et donc ce que contient req.user. */
export interface UtilisateurConnecte {
  idcompte: string;
  pseudo: string;
  role: string;
  estMineur: boolean;
}

/** Requête d'une route protégée par JwtAuthGuard : l'utilisateur est toujours présent. */
export interface RequeteAuth {
  user: UtilisateurConnecte;
}

/** Requête d'une route protégée par OptionalJwtAuthGuard : visiteur possible (user null). */
export interface RequeteAuthOptionnelle {
  user?: UtilisateurConnecte | null;
}
