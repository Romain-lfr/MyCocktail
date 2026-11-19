import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import MesFavoris from './MesFavoris';
import { api, connecter, emplacement, rendre } from '../test/utils';

const favoris = [
  { cocktail: { idcocktail: 'COK-00001', nomcocktail: 'Mojito', image: [{ urlimage: '/public/images/1.webp' }] } },
  { cocktail: { idcocktail: 'COK-00002', nomcocktail: 'Virgin Mary', image: [] } },
];

async function ouvrir(data = favoris) {
  connecter();
  api.get.mockResolvedValue({ data });
  const rendu = rendre(<MesFavoris />);
  if (data.length) await screen.findByText('Mojito');
  return rendu;
}

describe('MesFavoris', () => {
  it('renvoie vers /login sans token', () => {
    rendre(<MesFavoris />);
    expect(emplacement()).toBe('/login');
  });

  it('liste mes favoris', async () => {
    await ouvrir();
    expect(api.get).toHaveBeenCalledWith('/api/compte/mes-favoris', expect.any(Object));
    expect(screen.getByText('Virgin Mary')).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(1);
  });

  it('compte les favoris (accord au pluriel)', async () => {
    await ouvrir();
    expect(screen.getByText('2 recettes gardées sous le coude')).toBeInTheDocument();
  });

  it('sans favori : message et lien vers l’accueil', async () => {
    const { user } = await ouvrir([]);
    expect(await screen.findByText('Aucun favori.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Découvrir les recettes' }));
    expect(emplacement()).toBe('/');
  });

  it('cliquer sur un favori ouvre sa fiche', async () => {
    const { user } = await ouvrir();
    await user.click(screen.getByText('Virgin Mary'));
    expect(emplacement()).toBe('/cocktail/Virgin%20Mary');
  });

  it('Retirer supprime le favori sans ouvrir la fiche', async () => {
    const { user } = await ouvrir();
    await user.click(screen.getAllByRole('button', { name: 'Retirer' })[0]);
    expect(api.delete).toHaveBeenCalledWith('/api/compte/favori/COK-00001', expect.any(Object));
    await waitFor(() => expect(screen.queryByText('Mojito')).not.toBeInTheDocument());
    expect(screen.getByText('Virgin Mary')).toBeInTheDocument();
    expect(screen.getByText('1 recette gardée sous le coude')).toBeInTheDocument();
    expect(window.location.reload).not.toHaveBeenCalled();
    expect(emplacement()).toBe('/');
  });

  it('renvoie vers /login si le chargement échoue', async () => {
    connecter();
    api.get.mockRejectedValue(new Error('401'));
    rendre(<MesFavoris />);
    await waitFor(() => expect(emplacement()).toBe('/login'));
  });

  it('Retour mène à /compte', async () => {
    const { user } = await ouvrir();
    await user.click(screen.getByRole('button', { name: '← Retour' }));
    expect(emplacement()).toBe('/compte');
  });
});
