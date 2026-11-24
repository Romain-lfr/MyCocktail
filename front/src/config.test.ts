import { afterEach, describe, expect, it, vi } from 'vitest';

async function chargerConfig() {
  vi.resetModules();
  return (await import('./config')).API_URL;
}

describe('API_URL', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('vaut /api sans VITE_API_URL (proxy Vite en dev)', async () => {
    vi.stubEnv('VITE_API_URL', undefined);
    expect(await chargerConfig()).toBe('/api');
  });

  it('reprend VITE_API_URL quand elle est définie (API Render en prod)', async () => {
    vi.stubEnv('VITE_API_URL', 'https://myxo-api.onrender.com');
    expect(await chargerConfig()).toBe('https://myxo-api.onrender.com');
  });
});
