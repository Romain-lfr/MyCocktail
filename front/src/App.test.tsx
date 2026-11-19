import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';
import { api } from './test/utils';

// App utilise BrowserRouter : on remet le vrai window.location et on choisit l'URL
function ouvrir(url: string) {
  vi.unstubAllGlobals();
  window.history.pushState({}, '', url);
  return render(<App />);
}

describe('App (routes)', () => {
  it.each([
    ['/login', { role: 'heading', name: 'Connexion' }],
    ['/register', { role: 'heading', name: 'Créer un compte' }],
    ['/recherche?q=moj', { role: 'heading', name: 'Résultats pour « moj »' }],
    ['/cocktail/Mojito/avis', { role: 'heading', name: /Laisser un avis sur Mojito/ }],
  ])('%s affiche la bonne page', async (url, { role, name }) => {
    ouvrir(url);
    expect(await screen.findByRole(role, { name })).toBeInTheDocument();
  });

  it.each(['/', '/login', '/register', '/compte/frigo', '/cocktail/Mojito'])(
    '%s : un seul header, celui de la charte',
    async (url) => {
      if (url.startsWith('/cocktail/')) api.get.mockResolvedValue({ data: null }); // cocktail introuvable
      ouvrir(url);
      await screen.findByRole('navigation', { name: 'Navigation principale' });
      expect(document.querySelectorAll('header')).toHaveLength(1);
      expect(document.querySelector('header')).toHaveClass('header');
      expect(document.querySelectorAll('footer.footer')).toHaveLength(1);
    },
  );

  it('/ affiche l’accueil', async () => {
    ouvrir('/');
    expect(await screen.findByRole('heading', { name: 'Qu\'est-ce qu\'on a dans le frigo ?' })).toBeInTheDocument();
  });

  it('/cocktail/ajouter n’est pas pris pour une fiche cocktail nommée « ajouter »', async () => {
    ouvrir('/cocktail/ajouter');
    expect(await screen.findByRole('heading', { name: /Ajouter un cocktail/ })).toBeInTheDocument();
    expect(api.get).not.toHaveBeenCalledWith('/api/cocktail/ajouter', expect.anything());
  });

  it.each(['/compte', '/compte/cocktails', '/compte/favoris', '/compte/avis', '/compte/modifier', '/compte/frigo'])(
    '%s renvoie vers /login sans être connecté',
    async (url) => {
      ouvrir(url);
      await vi.waitFor(() => expect(window.location.pathname).toBe('/login'));
    },
  );
});
