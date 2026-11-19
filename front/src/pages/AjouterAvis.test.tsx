import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import AjouterAvis from './AjouterAvis';
import { api, connecter, emplacement, erreurApi, rendre } from '../test/utils';

const cocktail = { idcocktail: 'COK-00001', nomcocktail: 'Piña Colada', idcompte: 'CPT-00009', alcool: true, image: [] };

function ouvrir(donnees: unknown = cocktail) {
  api.get.mockResolvedValue({ data: donnees });
  return rendre(<AjouterAvis />, { route: '/cocktail/Pi%C3%B1a%20Colada/avis', path: '/cocktail/:nom/avis', depuis: '/cocktail/Pi%C3%B1a%20Colada' });
}

async function remplir(user: ReturnType<typeof rendre>['user'], titre = 'Excellent', description = 'Frais et parfaitement dosé') {
  if (titre) await user.type(screen.getByLabelText('Titre'), titre);
  if (description) await user.type(screen.getByLabelText('Ton avis'), description);
}

const publier = () => screen.getByRole('button', { name: 'Publier l\'avis' });

describe('AjouterAvis', () => {
  it('affiche le nom du cocktail et charge la recette (avec le token)', async () => {
    connecter();
    ouvrir();
    expect(screen.getByRole('heading', { name: /Laisser un avis sur Piña Colada/ })).toBeInTheDocument();
    await waitFor(() => expect(publier()).toBeEnabled());
    expect(api.get).toHaveBeenCalledWith('/api/cocktail/Pi%C3%B1a%20Colada', { headers: { Authorization: expect.stringMatching(/^Bearer /) } });
  });

  it('publie l’avis avec la note choisie puis revient à la fiche', async () => {
    connecter();
    const { user } = ouvrir();
    await waitFor(() => expect(publier()).toBeEnabled());
    await remplir(user);
    await user.click(screen.getByRole('radio', { name: /4 sur 5/ }));
    expect(screen.getByText('4/5 · Très bon')).toBeInTheDocument();
    await user.click(publier());
    await waitFor(() => expect(emplacement()).toBe('/cocktail/Pi%C3%B1a%20Colada'));
    expect(api.post).toHaveBeenCalledWith(
      '/api/avis/COK-00001',
      { noteavis: 4, titreavis: 'Excellent', descriptionavis: 'Frais et parfaitement dosé' },
      expect.any(Object),
    );
  });

  it('note 5 par défaut', async () => {
    connecter();
    const { user } = ouvrir();
    await waitFor(() => expect(publier()).toBeEnabled());
    expect(screen.getByRole('radio', { name: /5 sur 5/ })).toBeChecked();
    await remplir(user);
    await user.click(publier());
    expect(api.post.mock.calls[0][1]).toMatchObject({ noteavis: 5 });
  });

  it('valide le titre et la description avant tout envoi, sous chaque champ', async () => {
    connecter();
    const { user } = ouvrir();
    await waitFor(() => expect(publier()).toBeEnabled());
    await remplir(user, 'Ok', 'Court');
    await user.click(publier());
    expect(screen.getByLabelText('Titre')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Le titre doit faire au moins 3 caractères')).toBeInTheDocument();
    expect(screen.getByText('La description doit faire au moins 10 caractères')).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('indique combien de caractères il manque à la description', async () => {
    const { user } = ouvrir();
    expect(screen.getByText('Encore 10 caractères minimum')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Ton avis'), 'Frais et b');
    expect(screen.getByText('C\'est parfait.')).toBeInTheDocument();
    await user.clear(screen.getByLabelText('Ton avis'));
    await user.type(screen.getByLabelText('Ton avis'), 'Frais et ');
    expect(screen.getByText('Encore 2 caractères minimum')).toBeInTheDocument();
  });

  it('renvoie vers /login si non connecté', async () => {
    const { user } = ouvrir();
    await waitFor(() => expect(publier()).toBeEnabled());
    await remplir(user);
    await user.click(publier());
    expect(emplacement()).toBe('/login');
    expect(api.post).not.toHaveBeenCalled();
  });

  it('auteur de la recette : pas de formulaire, lien vers la fiche', async () => {
    connecter({ sub: 'CPT-00009' });
    const { user } = ouvrir();
    expect(await screen.findByText('C\'est ta recette')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Publier l\'avis' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Voir la fiche' }));
    expect(emplacement()).toBe('/cocktail/Pi%C3%B1a%20Colada');
  });

  it('affiche la photo de la recette si elle existe', async () => {
    ouvrir({ ...cocktail, image: [{ urlimage: '/public/images/1.webp', titleimage: 'Photo' }] });
    expect(await screen.findByAltText('Photo')).toHaveAttribute('src', '/api/public/images/1.webp');
  });

  it('cocktail sans alcool : volet citron', async () => {
    ouvrir({ ...cocktail, alcool: false });
    await waitFor(() => expect(document.querySelector('.connexion__gauche--citron')).toBeInTheDocument());
  });

  it('cocktail introuvable : message et bouton désactivé', async () => {
    api.get.mockRejectedValue(erreurApi(404));
    rendre(<AjouterAvis />, { route: '/cocktail/X/avis', path: '/cocktail/:nom/avis' });
    expect(await screen.findByRole('alert')).toHaveTextContent('Cocktail introuvable.');
    expect(publier()).toBeDisabled();
  });

  it('désactive le bouton pendant la publication', async () => {
    connecter();
    const { user } = ouvrir();
    await waitFor(() => expect(publier()).toBeEnabled());
    api.post.mockReturnValue(new Promise(() => {}));
    await remplir(user);
    await user.click(publier());
    expect(screen.getByRole('button', { name: 'Publication…' })).toBeDisabled();
  });

  it('affiche l’erreur de l’API (avis déjà laissé)', async () => {
    connecter();
    const { user } = ouvrir();
    await waitFor(() => expect(publier()).toBeEnabled());
    api.post.mockRejectedValue(erreurApi(409, 'Vous avez déjà laissé un avis pour ce cocktail'));
    await remplir(user);
    await user.click(publier());
    expect(await screen.findByRole('alert')).toHaveTextContent('Vous avez déjà laissé un avis pour ce cocktail');
  });

  it('affiche un message générique si l’API ne précise rien', async () => {
    connecter();
    const { user } = ouvrir();
    await waitFor(() => expect(publier()).toBeEnabled());
    api.post.mockRejectedValue(new Error('Network Error'));
    await remplir(user);
    await user.click(publier());
    expect(await screen.findByText('Erreur lors de l\'ajout de l\'avis')).toBeInTheDocument();
  });

  it('Retour revient à la page précédente', async () => {
    const { user } = ouvrir();
    await user.click(screen.getByRole('button', { name: '← Retour' }));
    expect(emplacement()).toBe('/cocktail/Pi%C3%B1a%20Colada');
  });
});
