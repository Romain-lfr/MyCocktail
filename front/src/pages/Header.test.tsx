import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import Header from './Header';
import { connecter, emplacement, rendre } from '../test/utils';

describe('Header (pages)', () => {
  it('visiteur : liens Connexion et Inscription, pas de frigo', () => {
    rendre(<Header />);
    expect(screen.getByRole('link', { name: 'Connexion' })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: 'Inscription' })).toHaveAttribute('href', '/register');
    expect(screen.queryByRole('link', { name: 'Mon frigo' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Avec alcool' })).toBeInTheDocument();
  });

  it('connecté : Mon compte, Mon frigo et Déconnexion', () => {
    connecter();
    rendre(<Header />);
    expect(screen.getByRole('link', { name: 'Mon compte' })).toHaveAttribute('href', '/compte');
    expect(screen.getByRole('link', { name: 'Mon frigo' })).toHaveAttribute('href', '/compte/frigo');
    expect(screen.queryByRole('link', { name: 'Connexion' })).not.toBeInTheDocument();
  });

  it('cache le lien « Avec alcool » à un mineur', () => {
    connecter({ estMineur: true });
    rendre(<Header />);
    expect(screen.queryByRole('link', { name: 'Avec alcool' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sans alcool' })).toBeInTheDocument();
  });

  it('la déconnexion vide le token et renvoie vers /login', async () => {
    connecter();
    const { user } = rendre(<Header />);
    await user.click(screen.getByRole('button', { name: 'Déconnexion' }));
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('estMineur')).toBeNull();
    expect(emplacement()).toBe('/login');
  });

  it('la recherche envoie vers /recherche avec le terme encodé', async () => {
    const { user } = rendre(<Header />);
    await user.type(screen.getByRole('searchbox', { name: 'Rechercher un cocktail' }), '  piña colada {Enter}');
    expect(emplacement()).toBe('/recherche?q=pi%C3%B1a%20colada');
  });

  it('ignore une recherche vide', async () => {
    const { user } = rendre(<Header />, { route: '/' });
    await user.type(screen.getByRole('searchbox'), '   {Enter}');
    expect(emplacement()).toBe('/');
  });

  it.each([
    ['/?alcool=false', 'Sans alcool'],
    ['/?alcool=true', 'Avec alcool'],
  ])('sur %s, le lien « %s » est marqué comme page courante', (route, lien) => {
    rendre(<Header />, { route });
    expect(screen.getByRole('link', { name: lien })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Tous' })).not.toHaveAttribute('aria-current', 'page');
  });

  it('sur l’accueil sans filtre, « Tous » est la page courante', () => {
    rendre(<Header />, { route: '/' });
    expect(screen.getByRole('link', { name: 'Tous' })).toHaveAttribute('aria-current', 'page');
  });

  describe('hauteur du header (footer toujours sous l’écran)', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
      vi.restoreAllMocks();
      document.documentElement.style.removeProperty('--hauteur-header');
    });

    it('expose la hauteur réelle du header dans --hauteur-header', () => {
      vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(68);
      rendre(<Header />);
      expect(document.documentElement.style.getPropertyValue('--hauteur-header')).toBe('68px');
    });

    it('remesure quand le header change de taille, et arrête au démontage', () => {
      const observe = vi.fn();
      const disconnect = vi.fn();
      let rappel: () => void = () => {};
      vi.stubGlobal('ResizeObserver', class {
        constructor(cb: () => void) { rappel = cb; }
        observe = observe;
        disconnect = disconnect;
      });
      const hauteur = vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(68);
      const { unmount } = rendre(<Header />);
      expect(observe).toHaveBeenCalledWith(screen.getByRole('banner'));

      hauteur.mockReturnValue(248); // passage en mise en page mobile (plusieurs lignes)
      rappel();
      expect(document.documentElement.style.getPropertyValue('--hauteur-header')).toBe('248px');

      unmount();
      expect(disconnect).toHaveBeenCalled();
    });
  });
});
