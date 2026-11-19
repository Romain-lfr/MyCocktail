import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import MesCocktails from './MesCocktails';
import { api, connecter, emplacement, rendre } from '../test/utils';

const cocktails = [
  { idcocktail: 'COK-00001', nomcocktail: 'Piña Colada', statut: 'publi_', alcool: true, difficulte: 'Moyen', duree: 7, image: [{ urlimage: '/public/images/1.webp' }] },
  { idcocktail: 'COK-00002', nomcocktail: 'Mojito', statut: 'brouillon', image: [] },
];

async function ouvrir(data = cocktails) {
  connecter();
  api.get.mockResolvedValue({ data });
  const rendu = rendre(<MesCocktails />);
  if (data.length) await screen.findByText('Mojito');
  return rendu;
}

describe('MesCocktails', () => {
  it('renvoie vers /login sans token', () => {
    rendre(<MesCocktails />);
    expect(emplacement()).toBe('/login');
  });

  it('liste mes cocktails avec leur image', async () => {
    await ouvrir();
    expect(api.get).toHaveBeenCalledWith('/api/compte/mes-cocktails', expect.any(Object));
    expect(screen.getByText('Piña Colada')).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(1);
    expect(screen.getByRole('img')).toHaveAttribute('src', '/api/public/images/1.webp');
  });

  it('affiche le statut de chaque cocktail et le nombre de créations', async () => {
    await ouvrir();
    expect(screen.getByText('Publié')).toHaveClass('etat--publié');
    expect(screen.getByText('Brouillon')).toBeInTheDocument();
    expect(screen.getByText('2 créations, brouillons compris')).toBeInTheDocument();
  });

  it('affiche un message si je n’ai aucun cocktail', async () => {
    await ouvrir([]);
    expect(await screen.findByText('Aucun cocktail créé.')).toBeInTheDocument();
  });

  it('ouvre la fiche (nom encodé) et la page de modification', async () => {
    const { user } = await ouvrir();
    await user.click(screen.getByText('Piña Colada'));
    expect(emplacement()).toBe('/cocktail/Pi%C3%B1a%20Colada');
  });

  it('Modifier mène à la page de modification', async () => {
    const { user } = await ouvrir();
    await user.click(screen.getAllByRole('button', { name: 'Modifier' })[1]);
    expect(emplacement()).toBe('/cocktail/Mojito/modifier');
  });

  it('Ajouter un cocktail mène au formulaire', async () => {
    const { user } = await ouvrir();
    await user.click(screen.getByRole('button', { name: 'Ajouter un cocktail' }));
    expect(emplacement()).toBe('/cocktail/ajouter');
  });

  it('supprime après confirmation et retire la carte sans recharger', async () => {
    const { user } = await ouvrir();
    await user.click(screen.getAllByRole('button', { name: 'Supprimer' })[0]);
    expect(api.delete).toHaveBeenCalledWith('/api/cocktail/COK-00001', expect.any(Object));
    await waitFor(() => expect(screen.queryByText('Piña Colada')).not.toBeInTheDocument());
    expect(screen.getByText('Mojito')).toBeInTheDocument();
    expect(window.location.reload).not.toHaveBeenCalled();
  });

  it('ne supprime rien si on annule la confirmation', async () => {
    vi.mocked(window.confirm).mockReturnValue(false);
    const { user } = await ouvrir();
    await user.click(screen.getAllByRole('button', { name: 'Supprimer' })[0]);
    expect(api.delete).not.toHaveBeenCalled();
  });

  it('renvoie vers /login si le chargement échoue', async () => {
    connecter();
    api.get.mockRejectedValue(new Error('401'));
    rendre(<MesCocktails />);
    await waitFor(() => expect(emplacement()).toBe('/login'));
  });

  it('Retour mène à /compte', async () => {
    const { user } = await ouvrir();
    await user.click(screen.getByRole('button', { name: '← Retour' }));
    expect(emplacement()).toBe('/compte');
  });
});
