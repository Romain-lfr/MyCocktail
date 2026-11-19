import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import Home from './Home';
import { api, connecter, emplacement, rendre } from '../test/utils';

type C = {
  idcocktail: string; nomcocktail: string; description: string; difficulte: string;
  alcool: boolean; duree: number; datecreation: string;
  image: { urlimage: string; titleimage: string }[]; avis: { noteavis: number }[];
};

const cocktail = (id: number, extra: Partial<C> = {}): C => ({
  idcocktail: `COK-0000${id}`,
  nomcocktail: `Cocktail ${id}`,
  description: `Description du cocktail ${id}`,
  difficulte: 'Facile',
  alcool: false,
  duree: 5,
  datecreation: `2024-01-0${id}T00:00:00.000Z`,
  image: [],
  avis: [],
  ...extra,
});

const ingredients = [
  { idingredient: 'ING-00001', nomingredient: 'Menthe' },
  { idingredient: 'ING-00002', nomingredient: 'Mangue' },
  { idingredient: 'ING-00003', nomingredient: 'Citron vert' },
];
const ustensiles = [{ idustensile: 'UST-00001', nomustensile: 'Shaker' }];

// Réponses de l'API selon l'URL
function repondre({ cocktails = [] as C[], favoris = [] as { idcocktail: string }[], erreur = false } = {}) {
  api.get.mockImplementation((url: string) => {
    if (url === '/api/cocktail/listes/ingredients') return Promise.resolve({ data: ingredients });
    if (url === '/api/cocktail/listes/ustensiles') return Promise.resolve({ data: ustensiles });
    if (url === '/api/compte/mes-favoris') return Promise.resolve({ data: favoris });
    if (erreur) return Promise.reject(new Error('panne'));
    return Promise.resolve({ data: cocktails });
  });
}

// URL de l'appel qui charge les cocktails
const urlCocktails = () =>
  api.get.mock.calls.map((c) => c[0] as string).filter((u) => u.startsWith('/api/cocktail') && !u.includes('listes')).at(-1);

// Noms des recettes de la liste (hors recette mise en avant), dans l'ordre affiché
const nomsListe = () =>
  Array.from(document.querySelectorAll('.recette__nom')).map((b) => b.textContent);

describe('Home', () => {
  describe('chargement selon le profil', () => {
    it('visiteur : seulement les cocktails sans alcool', async () => {
      repondre();
      rendre(<Home />);
      await waitFor(() => expect(urlCocktails()).toBe('/api/cocktail?alcool=false'));
    });

    it('majeur sans filtre : tous les cocktails, avec le token', async () => {
      connecter();
      repondre();
      rendre(<Home />);
      await waitFor(() => expect(urlCocktails()).toBe('/api/cocktail'));
      const appel = api.get.mock.calls.find((c) => c[0] === '/api/cocktail')!;
      expect(appel[1]).toEqual({ headers: { Authorization: expect.stringMatching(/^Bearer /) } });
    });

    it('majeur sur ?alcool=true : seulement les cocktails alcoolisés', async () => {
      connecter();
      repondre();
      rendre(<Home />, { route: '/?alcool=true' });
      await waitFor(() => expect(urlCocktails()).toBe('/api/cocktail?alcool=true'));
    });

    it('mineur sur ?alcool=true : forcé en sans alcool', async () => {
      connecter({ estMineur: true });
      repondre();
      rendre(<Home />, { route: '/?alcool=true' });
      await waitFor(() => expect(urlCocktails()).toBe('/api/cocktail?alcool=false'));
    });

    it('visiteur sur ?alcool=true : renvoyé vers /login', async () => {
      repondre();
      rendre(<Home />, { route: '/?alcool=true', path: '/' });
      await waitFor(() => expect(emplacement()).toBe('/login'));
      expect(urlCocktails()).toBeUndefined();
    });

    it('ne charge rien quand l’URL contient ?q=', () => {
      repondre();
      rendre(<Home />, { route: '/?q=moj' });
      expect(urlCocktails()).toBeUndefined();
    });

    it('token refusé : déconnecte et renvoie vers /login', async () => {
      connecter();
      repondre({ erreur: true });
      rendre(<Home />);
      await waitFor(() => expect(emplacement()).toBe('/login'));
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('erreur pour un visiteur : reste sur la page', async () => {
      repondre({ erreur: true });
      rendre(<Home />);
      await waitFor(() => expect(urlCocktails()).toBeDefined());
      expect(emplacement()).toBe('/');
      expect(screen.getByText(/Aucune recette ne correspond/)).toBeInTheDocument();
    });
  });

  describe('affichage', () => {
    it('met en avant le mieux noté et le retire de la liste', async () => {
      repondre({
        cocktails: [
          cocktail(1, { avis: [{ noteavis: 3 }] }),
          cocktail(2, { avis: [{ noteavis: 5 }, { noteavis: 4 }], nomcocktail: 'Star' }),
          cocktail(3),
        ],
      });
      rendre(<Home />);
      const vedette = await screen.findByText('Le mieux noté');
      expect(within(vedette.closest('button')!).getByText('Star')).toBeInTheDocument();
      expect(within(vedette.closest('button')!).getByText('4,5/5 (2 avis)')).toBeInTheDocument();
      expect(nomsListe()).toEqual(['Cocktail 3', 'Cocktail 1']);
    });

    it('sans avis, met en avant la dernière recette', async () => {
      repondre({ cocktails: [cocktail(1), cocktail(2)] });
      rendre(<Home />);
      const vedette = await screen.findByText('Dernière recette');
      expect(within(vedette.closest('button')!).getByText('Cocktail 2')).toBeInTheDocument();
    });

    it('cliquer sur la recette mise en avant ouvre sa fiche', async () => {
      repondre({ cocktails: [cocktail(1, { nomcocktail: 'Piña Colada' })] });
      const { user } = rendre(<Home />);
      await user.click(await screen.findByText('Dernière recette'));
      expect(emplacement()).toBe('/cocktail/Pi%C3%B1a%20Colada');
    });

    it('cliquer sur une recette de la liste ouvre sa fiche', async () => {
      repondre({ cocktails: [cocktail(1), cocktail(2)] });
      const { user } = rendre(<Home />);
      await user.click(await screen.findByRole('button', { name: 'Cocktail 1' }));
      expect(emplacement()).toBe('/cocktail/Cocktail%201');
    });

    it('cliquer n’importe où sur une carte ouvre sa fiche, sauf sur le bouton favori', async () => {
      connecter();
      repondre({ cocktails: [cocktail(1), cocktail(2)] });
      const { user } = rendre(<Home />);
      await user.click(await screen.findByRole('button', { name: 'Ajouter aux favoris' }));
      expect(emplacement()).toBe('/');
      await user.click(screen.getByText('Description du cocktail 1'));
      expect(emplacement()).toBe('/cocktail/Cocktail%201');
    });

    it('compte les recettes et précise le filtre', async () => {
      connecter();
      repondre({ cocktails: [cocktail(1), cocktail(2)] });
      rendre(<Home />, { route: '/?alcool=false' });
      expect(await screen.findByText('2 recettes sans alcool')).toBeInTheDocument();
    });

    it('accorde « recette » au singulier', async () => {
      connecter();
      repondre({ cocktails: [cocktail(1, { alcool: true })] });
      rendre(<Home />, { route: '/?alcool=true' });
      expect(await screen.findByText('1 recette avec alcool')).toBeInTheDocument();
    });

    it('affiche l’image ou, à défaut, un verre selon l’alcool', async () => {
      repondre({
        cocktails: [
          cocktail(9, { avis: [{ noteavis: 5 }] }), // vedette
          cocktail(1, { image: [{ urlimage: '/public/images/1.webp', titleimage: 'Photo 1' }] }),
          cocktail(2, { alcool: true }),
          cocktail(3, { alcool: false }),
        ],
      });
      rendre(<Home />);
      expect(await screen.findByAltText('Photo 1')).toHaveAttribute('src', '/api/public/images/1.webp');
      expect(document.querySelector('.recette__visuel--alcool')).toBeInTheDocument();
      expect(document.querySelector('.recettes .recette__visuel--moktail')).toBeInTheDocument();
      expect(screen.getAllByText('Alcool').length).toBeGreaterThan(0);
    });

    it('affiche l’image de la recette mise en avant', async () => {
      repondre({ cocktails: [cocktail(1, { image: [{ urlimage: '/public/images/v.webp', titleimage: '' }] })] });
      rendre(<Home />);
      await screen.findByText('Dernière recette');
      expect(document.querySelector('img.vedette__visuel')).toHaveAttribute('src', '/api/public/images/v.webp');
    });

    it('intercale des emplacements publicitaires toutes les 2 recettes', async () => {
      repondre({ cocktails: [1, 2, 3, 4, 5, 6].map((i) => cocktail(i)) });
      rendre(<Home />);
      await screen.findByText('Dernière recette');
      // 5 recettes dans la liste → pubs après la 2e et la 4e
      expect(screen.getAllByText(/Emplacement publicitaire/)).toHaveLength(2);
    });

    it('pas de pub pour un mineur', async () => {
      connecter({ estMineur: true });
      repondre({ cocktails: [1, 2, 3, 4, 5, 6].map((i) => cocktail(i)) });
      rendre(<Home />);
      await screen.findByText('Dernière recette');
      expect(screen.queryByText(/Emplacement publicitaire/)).not.toBeInTheDocument();
    });
  });

  describe('favoris', () => {
    it('visiteur : renvoyé vers /login', async () => {
      repondre({ cocktails: [cocktail(1), cocktail(2)] });
      const { user } = rendre(<Home />);
      await user.click(await screen.findByRole('button', { name: 'Ajouter aux favoris' }));
      expect(emplacement()).toBe('/login');
    });

    it('ajoute puis retire un favori', async () => {
      connecter();
      repondre({ cocktails: [cocktail(1), cocktail(2)] });
      const { user } = rendre(<Home />);
      await user.click(await screen.findByRole('button', { name: 'Ajouter aux favoris' }));
      expect(api.post).toHaveBeenCalledWith('/api/compte/favori/COK-00001', {}, expect.any(Object));

      const bouton = await screen.findByRole('button', { name: 'Dans mes favoris' });
      expect(bouton).toHaveAttribute('aria-pressed', 'true');
      await user.click(bouton);
      expect(api.delete).toHaveBeenCalledWith('/api/compte/favori/COK-00001', expect.any(Object));
      expect(await screen.findByRole('button', { name: 'Ajouter aux favoris' })).toBeInTheDocument();
    });

    it('marque les favoris déjà enregistrés', async () => {
      connecter();
      repondre({ cocktails: [cocktail(1), cocktail(2)], favoris: [{ idcocktail: 'COK-00001' }] });
      rendre(<Home />);
      expect(await screen.findByRole('button', { name: 'Dans mes favoris' })).toBeInTheDocument();
    });
  });

  describe('filtres et tri', () => {
    const quatre = () => [
      cocktail(1, { difficulte: 'Difficile', duree: 20, avis: [{ noteavis: 2 }] }),
      cocktail(2, { difficulte: 'Facile', duree: 3, avis: [{ noteavis: 4 }] }),
      cocktail(3, { difficulte: 'Moyen', duree: 10, avis: [{ noteavis: 3 }] }),
      cocktail(4, { difficulte: 'Facile', duree: 8, avis: [{ noteavis: 5 }] }), // vedette
    ];

    it('filtre par difficulté et désactive le filtre au 2e clic', async () => {
      repondre({ cocktails: quatre() });
      const { user } = rendre(<Home />);
      await screen.findByText('Le mieux noté');
      const facile = screen.getByRole('button', { name: 'Facile' });
      await user.click(facile);
      expect(facile).toHaveAttribute('aria-pressed', 'true');
      expect(nomsListe()).toEqual(['Cocktail 2']);
      await user.click(facile);
      expect(nomsListe()).toHaveLength(3);
    });

    it.each([
      ['date_asc', ['Cocktail 1', 'Cocktail 2', 'Cocktail 3']],
      ['date_desc', ['Cocktail 3', 'Cocktail 2', 'Cocktail 1']],
      ['note_desc', ['Cocktail 2', 'Cocktail 3', 'Cocktail 1']],
      ['note_asc', ['Cocktail 1', 'Cocktail 3', 'Cocktail 2']],
      ['duree_asc', ['Cocktail 2', 'Cocktail 3', 'Cocktail 1']],
      ['duree_desc', ['Cocktail 1', 'Cocktail 3', 'Cocktail 2']],
      ['diff_asc', ['Cocktail 2', 'Cocktail 3', 'Cocktail 1']],
      ['diff_desc', ['Cocktail 1', 'Cocktail 3', 'Cocktail 2']],
    ])('trie par %s', async (tri, ordre) => {
      repondre({ cocktails: quatre() });
      const { user } = rendre(<Home />);
      await screen.findByText('Le mieux noté');
      await user.selectOptions(screen.getByRole('combobox', { name: 'Trier par' }), tri);
      expect(nomsListe()).toEqual(ordre);
      expect(sessionStorage.getItem('tri')).toBe(tri);
    });

    it('retrouve le tri enregistré dans la session', async () => {
      sessionStorage.setItem('tri', 'duree_asc');
      repondre({ cocktails: quatre() });
      rendre(<Home />);
      await screen.findByText('Le mieux noté');
      expect(nomsListe()).toEqual(['Cocktail 2', 'Cocktail 3', 'Cocktail 1']);
    });

    it('« Affiner » filtre par durée et par note', async () => {
      repondre({ cocktails: quatre() });
      const { user } = rendre(<Home />);
      await screen.findByText('Le mieux noté');
      const affiner = screen.getByRole('button', { name: 'Affiner' });
      await user.click(affiner);
      expect(affiner).toHaveAttribute('aria-expanded', 'true');

      await user.type(screen.getByLabelText('Durée min (min)'), '5');
      await user.type(screen.getByLabelText('Durée max (min)'), '15');
      expect(nomsListe()).toEqual(['Cocktail 3']);

      await user.clear(screen.getByLabelText('Durée min (min)'));
      await user.clear(screen.getByLabelText('Durée max (min)'));
      await user.selectOptions(screen.getByLabelText('Note min'), '3');
      await user.selectOptions(screen.getByLabelText('Note max'), '4');
      // reste Cocktail 2 (4/5, mis en avant) et Cocktail 3 (3/5, dans la liste)
      expect(within(document.querySelector('.vedette') as HTMLElement).getByText('Cocktail 2')).toBeInTheDocument();
      expect(nomsListe()).toEqual(['Cocktail 3']);
    });

    it('signale un max inférieur au min', async () => {
      repondre({ cocktails: quatre() });
      const { user } = rendre(<Home />);
      await screen.findByText('Le mieux noté');
      await user.click(screen.getByRole('button', { name: 'Affiner' }));
      await user.type(screen.getByLabelText('Durée min (min)'), '10');
      await user.type(screen.getByLabelText('Durée max (min)'), '5');
      await user.selectOptions(screen.getByLabelText('Note min'), '4');
      await user.selectOptions(screen.getByLabelText('Note max'), '2');
      expect(screen.getAllByText('Le max doit dépasser le min')).toHaveLength(2);
    });

    it('affiche un état vide et « Réinitialiser » remet tout à zéro', async () => {
      repondre({ cocktails: quatre() });
      const { user } = rendre(<Home />);
      await screen.findByText('Le mieux noté');
      await user.click(screen.getByRole('button', { name: 'Affiner' }));
      await user.type(screen.getByLabelText('Durée min (min)'), '99');
      expect(screen.getByText(/Aucune recette ne correspond/)).toBeInTheDocument();

      const boutons = screen.getAllByRole('button', { name: 'Réinitialiser' });
      await user.click(boutons[boutons.length - 1]);
      expect(nomsListe()).toHaveLength(3);
      expect(screen.getByLabelText('Durée min (min)')).toHaveValue(null);
      expect(sessionStorage.getItem('filtreDureeMin')).toBe('0');
    });

    it('affiche les filtres actifs et les retire un par un', async () => {
      sessionStorage.setItem('filtreDifficulte', 'Moyen');
      sessionStorage.setItem('filtreDureeMin', '5');
      sessionStorage.setItem('filtreDureeMax', '15');
      sessionStorage.setItem('filtreNoteMin', '1');
      sessionStorage.setItem('filtreNoteMax', '4');
      sessionStorage.setItem('filtreUstensiles', JSON.stringify(['UST-00001']));
      repondre({ cocktails: quatre() });
      const { user } = rendre(<Home />);
      const actifs = await screen.findByRole('group', { name: 'Filtres actifs' });
      for (const libelle of ['Moyen', '≥ 5 min', '≤ 15 min', 'Note ≥ 1', 'Note ≤ 4']) {
        expect(within(actifs).getByText(libelle)).toBeInTheDocument();
      }
      expect(await within(actifs).findByText('Shaker')).toBeInTheDocument();

      await user.click(within(actifs).getByRole('button', { name: 'Retirer le filtre Moyen' }));
      expect(screen.getByRole('button', { name: 'Moyen' })).toHaveAttribute('aria-pressed', 'false');
      for (const libelle of ['≥ 5 min', '≤ 15 min', 'Note ≥ 1', 'Note ≤ 4', 'Shaker']) {
        await user.click(within(actifs).getByRole('button', { name: `Retirer le filtre ${libelle}` }));
      }
      expect(screen.queryByRole('group', { name: 'Filtres actifs' })).not.toBeInTheDocument();
      expect(sessionStorage.getItem('filtreUstensiles')).toBe('[]');
    });

    it('« Effacer les filtres » garde les ingrédients du frigo et le tri', async () => {
      sessionStorage.setItem('filtreDifficulte', 'Facile');
      sessionStorage.setItem('tri', 'duree_asc');
      sessionStorage.setItem('filtreIngredients', JSON.stringify(['ING-00001']));
      repondre({ cocktails: quatre() });
      const { user } = rendre(<Home />);
      await user.click(await screen.findByRole('button', { name: 'Effacer les filtres' }));
      expect(screen.queryByRole('group', { name: 'Filtres actifs' })).not.toBeInTheDocument();
      expect(nomsListe()).toEqual(['Cocktail 2', 'Cocktail 3', 'Cocktail 1']);
      expect(screen.getByRole('button', { name: 'Retirer Menthe' })).toBeInTheDocument();
    });

    it('« Réinitialiser » dans le panneau Affiner', async () => {
      sessionStorage.setItem('filtreDifficulte', 'Moyen');
      repondre({ cocktails: quatre() });
      const { user } = rendre(<Home />);
      await screen.findByText('Le mieux noté');
      expect(nomsListe()).toEqual([]);
      await user.click(screen.getByRole('button', { name: 'Affiner' }));
      await user.click(screen.getAllByRole('button', { name: 'Réinitialiser' })[0]);
      expect(nomsListe()).toHaveLength(3);
    });
  });

  describe('sélecteur d’ingrédients (frigo) et d’ustensiles', () => {
    it('propose les ingrédients qui correspondent et filtre l’API', async () => {
      repondre({ cocktails: [cocktail(1)] });
      const { user } = rendre(<Home />);
      const champ = screen.getByRole('textbox', { name: 'Ajouter un ingrédient' });
      await user.type(champ, 'm');
      expect(screen.getByRole('button', { name: 'Menthe' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Mangue' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Citron vert' })).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Menthe' }));
      expect(champ).toHaveValue('');
      expect(screen.getByRole('button', { name: 'Retirer Menthe' })).toBeInTheDocument();
      await waitFor(() => expect(urlCocktails()).toBe('/api/cocktail?alcool=false&ingredients=ING-00001'));
      expect(JSON.parse(sessionStorage.getItem('filtreIngredients')!)).toEqual(['ING-00001']);
    });

    it('Entrée ajoute la première proposition, et un ingrédient choisi n’est plus proposé', async () => {
      repondre();
      const { user } = rendre(<Home />);
      const champ = screen.getByRole('textbox', { name: 'Ajouter un ingrédient' });
      await user.type(champ, 'm{Enter}');
      expect(screen.getByRole('button', { name: 'Retirer Menthe' })).toBeInTheDocument();
      await user.type(champ, 'm');
      expect(screen.queryByRole('button', { name: 'Menthe' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Mangue' })).toBeInTheDocument();
    });

    it('Entrée sans proposition ne fait rien', async () => {
      repondre();
      const { user } = rendre(<Home />);
      await user.type(screen.getByRole('textbox', { name: 'Ajouter un ingrédient' }), 'zzz{Enter}');
      expect(screen.queryByRole('button', { name: /^Retirer/ })).not.toBeInTheDocument();
    });

    it('× retire un ingrédient choisi', async () => {
      sessionStorage.setItem('filtreIngredients', JSON.stringify(['ING-00001', 'ING-00002']));
      repondre();
      const { user } = rendre(<Home />);
      await user.click(await screen.findByRole('button', { name: 'Retirer Menthe' }));
      expect(screen.queryByRole('button', { name: 'Retirer Menthe' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Retirer Mangue' })).toBeInTheDocument();
    });

    it('propose des idées d’ingrédients en un clic tant que le frigo est vide', async () => {
      repondre();
      const { user } = rendre(<Home />);
      await user.click(await screen.findByRole('button', { name: 'Ajouter Citron vert' }));
      expect(screen.getByRole('button', { name: 'Retirer Citron vert' })).toBeInTheDocument();
      await waitFor(() => expect(urlCocktails()).toBe('/api/cocktail?alcool=false&ingredients=ING-00003'));
      expect(screen.queryByText('Pour commencer :')).not.toBeInTheDocument();
    });

    it('filtre par ustensile depuis « Affiner »', async () => {
      repondre();
      const { user } = rendre(<Home />);
      await user.click(screen.getByRole('button', { name: 'Affiner' }));
      await user.type(screen.getByRole('textbox', { name: 'Ajouter un ustensile' }), 'sha');
      await user.click(screen.getByRole('button', { name: 'Shaker' }));
      await waitFor(() => expect(urlCocktails()).toBe('/api/cocktail?alcool=false&ustensiles=UST-00001'));
    });
  });
});
