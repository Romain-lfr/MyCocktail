// Préparation commune à tous les tests du front (chargé par vite.config.ts)
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import axios from 'axios';

// axios est remplacé par un faux : aucun appel réseau, chaque test dit ce que l'API renvoie
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    isAxiosError: (e: unknown) => !!(e as { isAxiosError?: boolean })?.isAxiosError,
  },
}));

beforeEach(() => {
  const api = vi.mocked(axios);
  // Réponses par défaut : listes vides / objet vide (chaque test les surcharge au besoin)
  api.get.mockResolvedValue({ data: [] });
  api.post.mockResolvedValue({ data: {} });
  api.put.mockResolvedValue({ data: {} });
  api.delete.mockResolvedValue({ data: {} });

  // Fonctions du navigateur absentes de jsdom
  vi.stubGlobal('confirm', vi.fn(() => true));
  vi.stubGlobal('alert', vi.fn());
  vi.stubGlobal('prompt', vi.fn(() => null));
  vi.stubGlobal('location', { ...window.location, href: 'http://localhost/', reload: vi.fn() });
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
  vi.resetAllMocks();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
