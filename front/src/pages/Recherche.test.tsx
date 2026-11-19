import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import Recherche from './Recherche';
import { api, connecter, emplacement, rendre } from '../test/utils';

// Réponses selon l'URL appelée
function repondre({ cocktails = [] as unknown[], comptes = [] as unknown[], erreurComptes = false } = {}) {
  api.get.mockImplementation((url: string) => {
    if (url.startsWith('/api/compte/recherche/')) {
      return erreurComptes ? Promise.reject(new Error('panne')) : Promise.resolve({ data: comptes });
    }
    return Promise.resolve({ data: cocktails });
  });
}

describe('Recherche', () => {
  it('ne fait aucune requête sans terme', () => {
    rendre(<Recherche />, { route: '/recherche' });
    expect(api.get).not.toHaveBeenCalled();
    expect(screen.getByText('Aucun cocktail trouvé.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Rechercher' })).toBeInTheDocument();
  });

  it('visiteur : ne cherche que des cocktails sans alcool', async () => {
    repondre();
    rendre(<Recherche />, { route: '/recherche?q=moj' });
    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(2));
    expect(api.get).toHaveBeenCalledWith('/api/cocktail?alcool=false&recherche=moj', { headers: {} });
  });

  it('mineur connecté : ne cherche que des cocktails sans alcool', async () => {
    connecter({ estMineur: true });
    repondre();
    rendre(<Recherche />, { route: '/recherche?q=moj' });
    await waitFor(() => expect(api.get).toHaveBeenCalled());
    expect(api.get.mock.calls[0][0]).toBe('/api/cocktail?alcool=false&recherche=moj');
  });

  it('majeur connecté : cherche dans tous les cocktails, avec le token', async () => {
    connecter();
    repondre();
    rendre(<Recherche />, { route: '/recherche?q=pi%C3%B1a' });
    await waitFor(() => expect(api.get).toHaveBeenCalled());
    expect(api.get.mock.calls[0][0]).toBe('/api/cocktail?recherche=pi%C3%B1a');
    expect(api.get.mock.calls[0][1]).toEqual({ headers: { Authorization: expect.stringMatching(/^Bearer /) } });
    expect(api.get).toHaveBeenCalledWith('/api/compte/recherche/pi%C3%B1a');
  });

  it('affiche les cocktails et les comptes trouvés', async () => {
    repondre({
      cocktails: [{ idcocktail: 'COK-00001', nomcocktail: 'Mojito', image: [{ urlimage: '/public/images/1.webp' }] }],
      comptes: [{ idcompte: 'CPT-00002', pseudo: 'mojitoLover', dateinscription: '2024-01-15T00:00:00.000Z' }],
    });
    rendre(<Recherche />, { route: '/recherche?q=moj' });
    expect(await screen.findByText('Mojito')).toBeInTheDocument();
    expect(await screen.findByText('mojitoLover')).toBeInTheDocument();
    expect(screen.getByText('Membre depuis janvier 2024')).toBeInTheDocument();
    expect(document.querySelector('.compte-trouve__avatar')).toHaveTextContent('ML');
    expect(screen.getByRole('heading', { name: 'Résultats pour « moj »' })).toBeInTheDocument();
    expect(screen.getByText('1 cocktail · 1 compte')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', '/api/public/images/1.webp');
  });

  it('cliquer sur un cocktail ouvre sa fiche', async () => {
    repondre({ cocktails: [{ idcocktail: 'COK-00001', nomcocktail: 'Sex on the Beach', image: [] }] });
    const { user } = rendre(<Recherche />, { route: '/recherche?q=sex' });
    await user.click(await screen.findByRole('button', { name: 'Sex on the Beach' }));
    expect(emplacement()).toBe('/cocktail/Sex%20on%20the%20Beach');
  });

  it('reste utilisable si la recherche de comptes échoue', async () => {
    const erreur = vi.spyOn(console, 'error').mockImplementation(() => {});
    repondre({ cocktails: [{ idcocktail: 'COK-00001', nomcocktail: 'Mojito', image: [] }], erreurComptes: true });
    rendre(<Recherche />, { route: '/recherche?q=moj' });
    expect(await screen.findByText('Mojito')).toBeInTheDocument();
    expect(screen.getByText('Aucun compte trouvé.')).toBeInTheDocument();
    await waitFor(() => expect(erreur).toHaveBeenCalled());
  });

  it('relance une recherche depuis la page', async () => {
    repondre();
    const { user } = rendre(<Recherche />, { route: '/recherche?q=moj' });
    const champ = screen.getByRole('searchbox', { name: 'Nouvelle recherche' });
    expect(champ).toHaveValue('moj');
    await user.clear(champ);
    await user.type(champ, 'piña colada');
    await user.click(screen.getByRole('button', { name: 'Chercher' }));
    expect(emplacement()).toBe('/recherche?q=pi%C3%B1a%20colada');
  });

  it('n’envoie rien avec une recherche vide', async () => {
    repondre();
    const { user } = rendre(<Recherche />, { route: '/recherche?q=moj' });
    await user.clear(screen.getByRole('searchbox', { name: 'Nouvelle recherche' }));
    await user.click(screen.getByRole('button', { name: 'Chercher' }));
    expect(emplacement()).toBe('/recherche?q=moj');
  });

  it('sans résultat : propose de voir toutes les recettes', async () => {
    repondre();
    const { user } = rendre(<Recherche />, { route: '/recherche?q=zzz' });
    expect(await screen.findByText('0 cocktail · 0 compte')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Voir toutes les recettes' }));
    expect(emplacement()).toBe('/');
  });
});
