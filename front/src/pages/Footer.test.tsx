import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import Footer from './Footer';
import { connecter, emplacement, rendre } from '../test/utils';

const bloc = (nom: string) => within(screen.getByRole('navigation', { name: nom }));

describe('Footer', () => {
  it('visiteur : liens pour explorer, se connecter ou créer un compte', () => {
    rendre(<Footer />);
    expect(bloc('Explorer').getByRole('link', { name: 'Avec alcool' })).toHaveAttribute('href', '/?alcool=true');
    expect(bloc('Mon espace').getByRole('link', { name: 'Connexion' })).toHaveAttribute('href', '/login');
    expect(bloc('Mon espace').getByRole('link', { name: 'Créer un compte' })).toHaveAttribute('href', '/register');
    expect(screen.queryByRole('link', { name: 'Mon frigo' })).not.toBeInTheDocument();
  });

  it('connecté : liens vers son espace', () => {
    connecter();
    rendre(<Footer />);
    const espace = bloc('Mon espace');
    for (const [nom, href] of [
      ['Mon frigo', '/compte/frigo'], ['Mes cocktails', '/compte/cocktails'], ['Mes favoris', '/compte/favoris'],
      ['Mes avis', '/compte/avis'], ['Ajouter un cocktail', '/cocktail/ajouter'],
    ]) {
      expect(espace.getByRole('link', { name: nom })).toHaveAttribute('href', href);
    }
    expect(espace.queryByRole('link', { name: 'Connexion' })).not.toBeInTheDocument();
  });

  it('mineur : pas de lien « Avec alcool »', () => {
    connecter({ estMineur: true });
    rendre(<Footer />);
    expect(bloc('Explorer').queryByRole('link', { name: 'Avec alcool' })).not.toBeInTheDocument();
    expect(bloc('Explorer').getByRole('link', { name: 'Sans alcool' })).toBeInTheDocument();
  });

  it('affiche l’année, la mention légale sur l’alcool, et le logo ramène à l’accueil', async () => {
    const { user } = rendre(<Footer />, { route: '/compte' });
    expect(screen.getByText(`© ${new Date().getFullYear()} Myxo`)).toBeInTheDocument();
    expect(screen.getByText(/à consommer avec modération/)).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Myxo, accueil' }));
    expect(emplacement()).toBe('/');
  });
});
