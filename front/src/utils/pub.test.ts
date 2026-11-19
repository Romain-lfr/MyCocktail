import { afterEach, describe, expect, it, vi } from 'vitest';

// pub.ts lit VITE_ADSENSE_CLIENT au chargement : on recharge le module après chaque stubEnv
async function chargerPub(client?: string) {
  vi.resetModules();
  if (client) vi.stubEnv('VITE_ADSENSE_CLIENT', client);
  return import('./pub');
}

describe('pubAutorisee', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('refuse toujours la pub à un mineur', async () => {
    localStorage.setItem('estMineur', 'true');
    const { pubAutorisee } = await chargerPub('ca-pub-123');
    expect(pubAutorisee('slot')).toBe(false);
  });

  it('réserve l’emplacement en développement', async () => {
    const { pubAutorisee } = await chargerPub();
    expect(pubAutorisee()).toBe(true);
  });

  it('lit l’identifiant AdSense du .env', async () => {
    const { CLIENT_ADSENSE } = await chargerPub('ca-pub-123');
    expect(CLIENT_ADSENSE).toBe('ca-pub-123');
  });
});
