import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import MonFrigo from './MonFrigo';
import { api, connecter, emplacement, rendre } from '../test/utils';

const ingredients = [
  { idingredient: 'ING-00001', nomingredient: 'Menthe', categorie: 'autre' },
  { idingredient: 'ING-00002', nomingredient: 'Mangue', categorie: 'fruit' },
  { idingredient: 'ING-00003', nomingredient: 'Rhum', categorie: 'alcool' },
  { idingredient: 'ING-00004', nomingredient: 'Mystère', categorie: 'inconnue' },
];
const composition = [
  { idingredient: 'ING-00002', quantite: 2, unite: 'pièce', ingredient: { nomingredient: 'Mangue', categorie: 'fruit' } },
];
const cocktails = [
  { idcocktail: 'COK-00001', nomcocktail: 'Smoothie mangue', image: [{ urlimage: '/public/images/1.webp' }], avis: [{ noteavis: 4 }, { noteavis: 5 }] },
  { idcocktail: 'COK-00002', nomcocktail: 'Lassi', image: [], avis: [] },
];

function repondre({ frigo = composition, realisables = cocktails } = {}) {
  api.get.mockImplementation((url: string) => {
    if (url === '/api/compte/frigo') return Promise.resolve({ data: { frigo_composition: frigo } });
    if (url === '/api/compte/frigo/cocktails') return Promise.resolve({ data: realisables });
    return Promise.resolve({ data: ingredients });
  });
}

async function ouvrir(options?: Parameters<typeof repondre>[0]) {
  connecter();
  repondre(options);
  const rendu = rendre(<MonFrigo />);
  await waitFor(() => expect(api.get).toHaveBeenCalledTimes(3));
  return rendu;
}

describe('MonFrigo', () => {
  it('renvoie vers /login sans token', () => {
    rendre(<MonFrigo />);
    expect(emplacement()).toBe('/login');
    expect(api.get).not.toHaveBeenCalled();
  });

  it('affiche mes ingrédients et les cocktails réalisables', async () => {
    await ouvrir();
    expect(await screen.findByText('Mangue — 2 pièce')).toBeInTheDocument();
    expect(screen.getByText('Smoothie mangue')).toBeInTheDocument();
    expect(screen.getByText('4.5/5 (2 avis)')).toBeInTheDocument();
    expect(screen.getByText('Aucun avis')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', '/api/public/images/1.webp');
  });

  it('affiche les messages quand le frigo est vide', async () => {
    await ouvrir({ frigo: [], realisables: [] });
    expect(await screen.findByText('Frigo vide !')).toBeInTheDocument();
    expect(screen.getByText('Aucun cocktail réalisable avec vos ingrédients.')).toBeInTheDocument();
  });

  it('cliquer sur un cocktail réalisable ouvre sa fiche', async () => {
    const { user } = await ouvrir();
    await user.click(await screen.findByText('Smoothie mangue'));
    expect(emplacement()).toBe('/cocktail/Smoothie%20mangue');
  });

  it('la recherche exclut les ingrédients déjà dans le frigo', async () => {
    const { user } = await ouvrir();
    await screen.findByText('Mangue — 2 pièce');
    await user.type(screen.getByPlaceholderText('Rechercher un ingrédient...'), 'm');
    expect(screen.getByText('Menthe')).toBeInTheDocument();
    expect(screen.getByText('Mystère')).toBeInTheDocument();
    expect(screen.queryByText('Mangue', { exact: true })).not.toBeInTheDocument();
  });

  it('affiche « Aucun résultat » si rien ne correspond', async () => {
    const { user } = await ouvrir();
    await user.type(screen.getByPlaceholderText('Rechercher un ingrédient...'), 'zzz');
    expect(screen.getByText('Aucun résultat')).toBeInTheDocument();
  });

  it.each([
    ['Menthe', 'ING-00001', 'morceau'],
    ['Rhum', 'ING-00003', 'cl'],
    ['Mystère', 'ING-00004', 'cl'],
  ])('ajoute %s avec l’unité par défaut de sa catégorie', async (nom, id, unite) => {
    const { user } = await ouvrir({ frigo: [] });
    await user.type(screen.getByPlaceholderText('Rechercher un ingrédient...'), nom.slice(0, 3));
    await user.click(screen.getByText(nom));
    expect(api.post).toHaveBeenCalledWith(`/api/compte/frigo/${id}`, { quantite: 1, unite }, expect.any(Object));
    await waitFor(() => expect(window.location.reload).toHaveBeenCalled());
  });

  it('modifie la quantité et l’unité d’un ingrédient', async () => {
    const { user } = await ouvrir();
    await user.click(await screen.findByRole('button', { name: 'Modifier' }));
    const quantite = screen.getByRole('spinbutton');
    await user.clear(quantite);
    await user.type(quantite, '3');
    await user.selectOptions(screen.getByRole('combobox'), 'tranche');
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['pièce', 'tranche', 'g']);
    await user.click(screen.getByRole('button', { name: 'Sauvegarder' }));
    expect(api.post).toHaveBeenCalledWith('/api/compte/frigo/ING-00002', { quantite: 3, unite: 'tranche' }, expect.any(Object));
    await waitFor(() => expect(window.location.reload).toHaveBeenCalled());
  });

  it('annuler la modification revient à l’affichage', async () => {
    const { user } = await ouvrir();
    await user.click(await screen.findByRole('button', { name: 'Modifier' }));
    await user.click(screen.getByRole('button', { name: 'Annuler' }));
    expect(screen.getByText('Mangue — 2 pièce')).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('supprime un ingrédient après confirmation', async () => {
    const { user } = await ouvrir();
    await user.click(await screen.findByRole('button', { name: 'Supprimer' }));
    expect(api.delete).toHaveBeenCalledWith('/api/compte/frigo/ING-00002', expect.any(Object));
    expect(await screen.findByText('Frigo vide !')).toBeInTheDocument();
  });

  it('ne supprime rien si on annule la confirmation', async () => {
    vi.mocked(window.confirm).mockReturnValue(false);
    const { user } = await ouvrir();
    await user.click(await screen.findByRole('button', { name: 'Supprimer' }));
    expect(api.delete).not.toHaveBeenCalled();
  });

  it('Retour mène à /compte', async () => {
    const { user } = await ouvrir();
    await user.click(screen.getByRole('button', { name: '← Retour' }));
    expect(emplacement()).toBe('/compte');
  });
});
