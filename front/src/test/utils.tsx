// Outils partagés par les tests du front
import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import axios from 'axios';
import { vi } from 'vitest';

export const api = vi.mocked(axios);

// Affiche l'URL courante : permet de vérifier les redirections (navigate)
function Emplacement() {
  const l = useLocation();
  return <div data-testid="emplacement">{l.pathname + l.search}</div>;
}

/**
 * Affiche un composant dans un routeur en mémoire.
 * `route` = URL de départ, `path` = motif de la route (ex. "/cocktail/:nom"),
 * `depuis` = page précédente dans l'historique (pour tester navigate(-1)).
 */
export function rendre(ui: ReactElement, { route = '/', path = '*', depuis }: { route?: string; path?: string; depuis?: string } = {}) {
  const user = userEvent.setup();
  const resultat = render(
    <MemoryRouter initialEntries={depuis ? [depuis, route] : [route]} initialIndex={depuis ? 1 : 0}>
      <Routes>
        <Route path={path} element={ui} />
        <Route path="*" element={null} />
      </Routes>
      <Emplacement />
    </MemoryRouter>,
  );
  return { user, ...resultat };
}

/** URL courante affichée par <Emplacement /> */
export const emplacement = () => document.querySelector('[data-testid="emplacement"]')!.textContent;

/** Faux JWT (seul le contenu compte pour le front, la signature n'est pas vérifiée) */
export function fauxToken(contenu: Record<string, unknown> = { sub: 'CPT-00001' }) {
  const base64url = btoa(JSON.stringify(contenu)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `entete.${base64url}.signature`;
}

/** Simule un utilisateur connecté */
export function connecter({ sub = 'CPT-00001', estMineur = false } = {}) {
  localStorage.setItem('token', fauxToken({ sub, estMineur }));
  localStorage.setItem('estMineur', String(estMineur));
}

/** Erreur axios telle que la renvoie l'API */
export function erreurApi(status: number, message?: string) {
  return { isAxiosError: true, response: { status, data: message ? { message } : {} } };
}
