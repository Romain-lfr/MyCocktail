import { ThrottlerModule } from '@nestjs/throttler';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';

const UNE_MINUTE = 60_000;

/** Limite globale : 100 requêtes par minute et par IP. */
export const LIMITE_GLOBALE = { ttl: UNE_MINUTE, limit: 100 };

/** Connexion / inscription : 5 essais par minute et par IP (anti force brute). */
export const LIMITE_AUTH = { default: { ttl: UNE_MINUTE, limit: 5 } };

export const moduleLimiteRequetes = ThrottlerModule.forRoot([LIMITE_GLOBALE]);

/**
 * En-têtes de sécurité HTTP (helmet) et vraie IP du client derrière le proxy de Render.
 * - `trust proxy` : sans lui, tous les visiteurs auraient l'IP du proxy et partageraient la même limite.
 * - `crossOriginResourcePolicy: cross-origin` : les images de /public sont affichées par le front
 *   sur un autre domaine (romain-lfr.com) ; la valeur par défaut de helmet les bloquerait.
 */
export function configurerSecurite(app: NestExpressApplication) {
  app.set('trust proxy', 1);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
}
