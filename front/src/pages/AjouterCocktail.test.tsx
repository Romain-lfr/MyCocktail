import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import AjouterCocktail from './AjouterCocktail';
import { api, connecter, emplacement, erreurApi, rendre } from '../test/utils';

const ingredients = [
  { idingredient: 'ING-00001', nomingredient: 'Menthe', categorie: 'autre' },
  { idingredient: 'ING-00002', nomingredient: 'Mangue', categorie: 'fruit' },
  { idingredient: 'ING-00003', nomingredient: 'Rhum', categorie: 'alcool' },
  { idingredient: 'ING-00004', nomingredient: 'Sirop', categorie: 'sirop' },
];
const ustensiles = [{ idustensile: 'UST-00001', nomustensile: 'Shaker' }];

type U = ReturnType<typeof rendre>['user'];

function repondre() {
  api.get.mockImplementation((url: string) =>
    Promise.resolve({ data: url.endsWith('/ingredients') ? ingredients : ustensiles }),
  );
  api.post.mockImplementation((url: string) => {
    if (url === '/api/cocktail') return Promise.resolve({ data: { idcocktail: 'COK-00010' } });
    if (url.endsWith('/etape')) return Promise.resolve({ data: { idetape: 'ETP-00010' } });
    return Promise.resolve({ data: {} });
  });
}

function ouvrir() {
  repondre();
  return rendre(<AjouterCocktail />, { route: '/cocktail/ajouter', depuis: '/compte/cocktails' });
}

async function remplirInfos(user: U, { nom = 'Mojito maison', description = 'Menthe, citron et beaucoup de glace' } = {}) {
  if (nom) await user.type(screen.getByPlaceholderText('Nom du cocktail'), nom);
  if (description) await user.type(screen.getByPlaceholderText('Description'), description);
}

// Passe l'étape 1 et arrive sur l'écran des étapes
async function allerAuxEtapes(user: U) {
  await remplirInfos(user);
  await user.click(screen.getByRole('button', { name: 'Suivant → Ajouter les étapes' }));
  await screen.findByRole('heading', { name: /Étapes du cocktail/ });
}

async function ajouterEtape(user: U, description = 'Piler la menthe') {
  await user.click(screen.getByRole('button', { name: '+ Ajouter une étape' }));
  const champs = screen.getAllByPlaceholderText("Description de l'étape");
  if (description) await user.type(champs[champs.length - 1], description);
}

describe('AjouterCocktail', () => {
  describe('étape 1 : informations', () => {
    it('valide les champs avant d’appeler l’API', async () => {
      connecter();
      const { user } = ouvrir();
      await remplirInfos(user, { nom: 'M', description: 'Court' });
      await user.clear(screen.getByRole('spinbutton'));
      await user.click(screen.getByRole('button', { name: 'Suivant → Ajouter les étapes' }));
      expect(screen.getByText('Le nom doit faire au moins 2 caractères')).toBeInTheDocument();
      expect(screen.getByText('La description doit faire au moins 10 caractères')).toBeInTheDocument();
      expect(screen.getByText('La durée doit être positive')).toBeInTheDocument();
      expect(api.post).not.toHaveBeenCalled();
    });

    it('renvoie vers /login si non connecté', async () => {
      const { user } = ouvrir();
      await remplirInfos(user);
      await user.click(screen.getByRole('button', { name: 'Suivant → Ajouter les étapes' }));
      expect(emplacement()).toBe('/login');
    });

    it('crée le cocktail avec les valeurs saisies puis passe aux étapes', async () => {
      connecter();
      const { user } = ouvrir();
      await remplirInfos(user);
      await user.selectOptions(screen.getByRole('combobox'), 'Difficile');
      await user.click(screen.getByRole('checkbox'));
      await user.clear(screen.getByRole('spinbutton'));
      await user.type(screen.getByRole('spinbutton'), '8');
      await user.click(screen.getByRole('button', { name: 'Suivant → Ajouter les étapes' }));

      expect(api.post).toHaveBeenCalledWith(
        '/api/cocktail',
        { nomcocktail: 'Mojito maison', description: 'Menthe, citron et beaucoup de glace', difficulte: 'Difficile', alcool: true, duree: 8 },
        expect.any(Object),
      );
      expect(await screen.findByRole('heading', { name: /Étapes du cocktail/ })).toBeInTheDocument();
    });

    it('envoie l’image choisie', async () => {
      connecter();
      const { user } = ouvrir();
      await remplirInfos(user);
      const fichier = new File(['img'], 'mojito.png', { type: 'image/png' });
      await user.upload(document.querySelector('input[type="file"]') as HTMLInputElement, fichier);
      await user.click(screen.getByRole('button', { name: 'Suivant → Ajouter les étapes' }));
      await screen.findByRole('heading', { name: /Étapes du cocktail/ });

      const envoi = api.post.mock.calls.find((c) => c[0] === '/api/cocktail/COK-00010/image')!;
      expect((envoi[1] as FormData).get('image')).toBe(fichier);
      expect(envoi[2]).toMatchObject({ headers: { 'Content-Type': 'multipart/form-data' } });
    });

    it('affiche l’erreur de l’API et reste sur l’étape 1', async () => {
      connecter();
      const { user } = ouvrir();
      api.post.mockRejectedValue(erreurApi(403, 'Les mineurs ne peuvent pas créer de cocktails alcoolisés'));
      await remplirInfos(user);
      await user.click(screen.getByRole('button', { name: 'Suivant → Ajouter les étapes' }));
      expect(await screen.findByText('Les mineurs ne peuvent pas créer de cocktails alcoolisés')).toBeInTheDocument();
    });

    it('message générique si l’API ne précise rien', async () => {
      connecter();
      const { user } = ouvrir();
      api.post.mockRejectedValue(new Error('Network Error'));
      await remplirInfos(user);
      await user.click(screen.getByRole('button', { name: 'Suivant → Ajouter les étapes' }));
      expect(await screen.findByText('Erreur lors de l\'ajout des étapes')).toBeInTheDocument();
    });

    it('Retour revient à la page précédente', async () => {
      const { user } = ouvrir();
      await user.click(screen.getByRole('button', { name: '← Retour' }));
      expect(emplacement()).toBe('/compte/cocktails');
    });
  });

  describe('étape 2 : étapes, ingrédients, ustensiles', () => {
    it.each([
      ['Menthe', 'morceau', ['morceau', 'feuille', 'pincée', 'g']],
      ['Mangue', 'pièce', ['pièce', 'tranche', 'g']],
      ['Sirop', 'cl', ['cl', 'ml', 'l']],
    ])('ajoute %s avec l’unité par défaut %s et les bonnes unités', async (nom, unite, unites) => {
      connecter();
      const { user } = ouvrir();
      await allerAuxEtapes(user);
      await ajouterEtape(user);
      await user.type(screen.getByPlaceholderText('Rechercher un ingrédient...'), nom.slice(0, 3));
      await user.click(screen.getByText(nom));
      expect(screen.getByPlaceholderText('Rechercher un ingrédient...')).toHaveValue('');
      const select = screen.getByDisplayValue(unite) as HTMLSelectElement;
      expect(Array.from(select.options).map((o) => o.value)).toEqual(unites);
    });

    it('crée tout dans l’ordre : étape, dosages, ustensiles, puis ouvre la fiche', async () => {
      connecter();
      const { user } = ouvrir();
      await allerAuxEtapes(user);
      await ajouterEtape(user, 'Piler la menthe');
      await user.type(screen.getByPlaceholderText('Rechercher un ingrédient...'), 'men');
      await user.click(screen.getByText('Menthe'));
      const quantite = screen.getByRole('spinbutton');
      await user.clear(quantite);
      await user.type(quantite, '6');
      await user.selectOptions(screen.getByDisplayValue('morceau'), 'feuille');
      await user.type(screen.getByPlaceholderText('Rechercher un ustensile...'), 'sha');
      await user.click(screen.getByText('Shaker'));
      await user.click(screen.getByRole('button', { name: '✅ Terminer' }));

      await waitFor(() => expect(emplacement()).toBe('/cocktail/Mojito%20maison'));
      const appels = api.post.mock.calls.slice(1).map((c) => [c[0], c[1]]);
      expect(appels).toEqual([
        ['/api/cocktail/COK-00010/etape', { numeroetape: 1, descriptionetape: 'Piler la menthe' }],
        ['/api/cocktail/COK-00010/dosage', { idingredient: 'ING-00001', quantite: 6, unite: 'feuille', idetape: 'ETP-00010' }],
        ['/api/cocktail/etape/ustensile', { idetape: 'ETP-00010', idustensile: 'UST-00001' }],
      ]);
    });

    it('retire un ingrédient et un ustensile', async () => {
      connecter();
      const { user } = ouvrir();
      await allerAuxEtapes(user);
      await ajouterEtape(user);
      await user.type(screen.getByPlaceholderText('Rechercher un ingrédient...'), 'men');
      await user.click(screen.getByText('Menthe'));
      await user.type(screen.getByPlaceholderText('Rechercher un ustensile...'), 'sha');
      await user.click(screen.getByText('Shaker'));
      const croix = screen.getAllByRole('button', { name: '✕' });
      await user.click(croix[1]);
      await user.click(croix[0]);
      expect(screen.queryByText('Menthe')).not.toBeInTheDocument();
      expect(screen.queryByText('Shaker')).not.toBeInTheDocument();
    });

    it('supprimer une étape renumérote les suivantes', async () => {
      connecter();
      const { user } = ouvrir();
      await allerAuxEtapes(user);
      await ajouterEtape(user, 'Première étape');
      await ajouterEtape(user, 'Deuxième étape');
      await ajouterEtape(user, 'Troisième étape');
      await user.click(screen.getAllByRole('button', { name: /Supprimer l'étape/ })[0]);
      expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(['Étape 1', 'Étape 2']);
      expect(screen.getByDisplayValue('Deuxième étape')).toBeInTheDocument();
      expect(screen.queryByDisplayValue('Première étape')).not.toBeInTheDocument();
    });

    it('crée un nouvel ingrédient s’il n’existe pas', async () => {
      connecter();
      const { user } = ouvrir();
      await allerAuxEtapes(user);
      await ajouterEtape(user);
      api.post.mockResolvedValueOnce({ data: { idingredient: 'ING-00099', nomingredient: 'Basilic', categorie: 'fruit' } });
      await user.type(screen.getByPlaceholderText('Rechercher un ingrédient...'), 'Basilic');
      expect(screen.getByText('Aucun résultat pour "Basilic"')).toBeInTheDocument();
      await user.selectOptions(screen.getByDisplayValue('autre'), 'fruit');
      await user.click(screen.getByRole('button', { name: '+ Ajouter "Basilic"' }));
      expect(api.post).toHaveBeenCalledWith('/api/cocktail/listes/ingredients', { nomingredient: 'Basilic', categorie: 'fruit' }, expect.any(Object));
      expect(await screen.findByText('Basilic')).toBeInTheDocument();
      expect(screen.getByDisplayValue('pièce')).toBeInTheDocument();
    });

    it('crée un nouvel ustensile s’il n’existe pas', async () => {
      connecter();
      const { user } = ouvrir();
      await allerAuxEtapes(user);
      await ajouterEtape(user);
      api.post.mockResolvedValueOnce({ data: { idustensile: 'UST-00099', nomustensile: 'Pilon' } });
      await user.type(screen.getByPlaceholderText('Rechercher un ustensile...'), 'Pilon');
      await user.click(screen.getByRole('button', { name: '+ Ajouter "Pilon"' }));
      expect(api.post).toHaveBeenCalledWith('/api/cocktail/listes/ustensiles', { nomustensile: 'Pilon' }, expect.any(Object));
      expect(await screen.findByText('Pilon')).toBeInTheDocument();
    });

    it('refuse une étape de moins de 5 caractères', async () => {
      connecter();
      const { user } = ouvrir();
      await allerAuxEtapes(user);
      await ajouterEtape(user, 'Pil');
      await user.click(screen.getByRole('button', { name: '✅ Terminer' }));
      expect(screen.getByText('L\'étape 1 doit avoir une description d\'au moins 5 caractères')).toBeInTheDocument();
      expect(api.post).toHaveBeenCalledTimes(1); // seulement la création du cocktail
    });

    it('bloque un ingrédient alcoolisé pour un mineur', async () => {
      connecter({ estMineur: true });
      const { user } = ouvrir();
      await allerAuxEtapes(user);
      await ajouterEtape(user);
      await user.type(screen.getByPlaceholderText('Rechercher un ingrédient...'), 'rhu');
      await user.click(screen.getByText('Rhum'));
      await user.click(screen.getByRole('button', { name: '✅ Terminer' }));
      expect(screen.getByText('Impossible d\'ajouter des ingrédients alcoolisés en tant que mineur')).toBeInTheDocument();
      expect(api.post).toHaveBeenCalledTimes(1);
    });

    it('affiche l’erreur de l’API pendant l’enregistrement des étapes', async () => {
      connecter();
      const { user } = ouvrir();
      await allerAuxEtapes(user);
      await ajouterEtape(user);
      api.post.mockRejectedValueOnce(erreurApi(403, 'Non autorisé'));
      await user.click(screen.getByRole('button', { name: '✅ Terminer' }));
      expect(await screen.findByText('Non autorisé')).toBeInTheDocument();
      expect(emplacement()).toBe('/cocktail/ajouter');
    });

    it('message générique si l’enregistrement échoue sans détail', async () => {
      connecter();
      const { user } = ouvrir();
      await allerAuxEtapes(user);
      await ajouterEtape(user);
      api.post.mockRejectedValueOnce(new Error('Network Error'));
      await user.click(screen.getByRole('button', { name: '✅ Terminer' }));
      expect(await screen.findByText('Erreur lors de l\'ajout des étapes')).toBeInTheDocument();
    });

    it('renvoie vers /login si le token disparaît avant l’enregistrement', async () => {
      connecter();
      const { user } = ouvrir();
      await allerAuxEtapes(user);
      await ajouterEtape(user);
      localStorage.removeItem('token');
      await user.click(screen.getByRole('button', { name: '✅ Terminer' }));
      expect(emplacement()).toBe('/login');
    });
  });
});
