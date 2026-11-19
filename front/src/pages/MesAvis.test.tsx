import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import MesAvis from './MesAvis';
import { api, connecter, emplacement, erreurApi, rendre } from '../test/utils';

const avis = [
  {
    idavis: 'AVS-00001',
    noteavis: 4,
    titreavis: 'Très bon',
    descriptionavis: 'Frais et bien dosé',
    dateavis: '2024-03-01T00:00:00.000Z',
    cocktail: { nomcocktail: 'Piña Colada' },
  },
  {
    idavis: 'AVS-00002',
    noteavis: 2,
    titreavis: 'Bof',
    descriptionavis: 'Trop sucré à mon goût',
    dateavis: '2024-03-02T00:00:00.000Z',
    cocktail: { nomcocktail: 'Mojito' },
  },
];

async function ouvrir(data = avis) {
  connecter();
  api.get.mockResolvedValue({ data });
  const rendu = rendre(<MesAvis />);
  if (data.length) await screen.findByText('Très bon');
  return rendu;
}

describe('MesAvis', () => {
  it('renvoie vers /login sans token', () => {
    rendre(<MesAvis />);
    expect(emplacement()).toBe('/login');
  });

  it('liste mes avis', async () => {
    await ouvrir();
    expect(api.get).toHaveBeenCalledWith('/api/compte/mes-avis', expect.any(Object));
    expect(screen.getByText('Frais et bien dosé')).toBeInTheDocument();
    expect(screen.getByText('Bof')).toBeInTheDocument();
    expect(screen.getByText('2 avis · 3,0/5 de moyenne')).toBeInTheDocument();
  });

  it('sans avis : message et lien vers les recettes', async () => {
    const { user } = await ouvrir([]);
    expect(await screen.findByText('Aucun avis posté.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Découvrir les recettes' }));
    expect(emplacement()).toBe('/');
  });

  it('le nom du cocktail ouvre sa fiche', async () => {
    const { user } = await ouvrir();
    await user.click(screen.getByRole('button', { name: 'Piña Colada' }));
    expect(emplacement()).toBe('/cocktail/Pi%C3%B1a%20Colada');
  });

  it('modifie un avis et met la liste à jour', async () => {
    const { user } = await ouvrir();
    await user.click(screen.getAllByRole('button', { name: 'Modifier' })[0]);

    expect(screen.getByRole('radio', { name: /4 sur 5/ })).toBeChecked();
    const titre = screen.getByLabelText('Titre');
    await user.clear(titre);
    await user.type(titre, 'Excellent');
    await user.click(screen.getByRole('radio', { name: /5 sur 5/ }));
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(api.put).toHaveBeenCalledWith(
      '/api/avis/AVS-00001',
      { noteavis: 5, titreavis: 'Excellent', descriptionavis: 'Frais et bien dosé' },
      expect.any(Object),
    );
    expect(await screen.findByText('Excellent')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Enregistrer' })).not.toBeInTheDocument();
    expect(screen.getByText('2 avis · 3,5/5 de moyenne')).toBeInTheDocument();
  });

  it('valide la modification avant tout appel', async () => {
    const { user } = await ouvrir();
    await user.click(screen.getAllByRole('button', { name: 'Modifier' })[0]);
    await user.clear(screen.getByLabelText('Titre'));
    await user.type(screen.getByLabelText('Titre'), 'Ok');
    await user.clear(screen.getByLabelText('Ton avis'));
    await user.type(screen.getByLabelText('Ton avis'), 'Court');
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));
    expect(screen.getByLabelText('Titre')).toHaveAccessibleDescription('Le titre doit faire au moins 3 caractères');
    expect(screen.getByLabelText('Ton avis')).toHaveAccessibleDescription('La description doit faire au moins 10 caractères');
    expect(api.put).not.toHaveBeenCalled();
  });

  it.each([
    [erreurApi(403, 'Non autorisé'), 'Non autorisé'],
    [new Error('Network Error'), 'Erreur lors de la modification de l\'avis'],
  ])('affiche l’erreur de l’API et reste en modification (%#)', async (erreur, texte) => {
    const { user } = await ouvrir();
    api.put.mockRejectedValue(erreur);
    await user.click(screen.getAllByRole('button', { name: 'Modifier' })[0]);
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(texte);
    expect(screen.getByLabelText('Titre')).toBeInTheDocument();
  });

  it('annuler la modification ne change rien', async () => {
    const { user } = await ouvrir();
    await user.click(screen.getAllByRole('button', { name: 'Modifier' })[0]);
    await user.type(screen.getByLabelText('Ton avis'), ' !!!');
    await user.click(screen.getByRole('button', { name: 'Annuler' }));
    expect(api.put).not.toHaveBeenCalled();
    expect(screen.getByText('Frais et bien dosé')).toBeInTheDocument();
  });

  it('supprime un avis après confirmation', async () => {
    const { user } = await ouvrir();
    await user.click(screen.getAllByRole('button', { name: 'Supprimer' })[1]);
    expect(api.delete).toHaveBeenCalledWith('/api/avis/AVS-00002', expect.any(Object));
    await waitFor(() => expect(screen.queryByText('Bof')).not.toBeInTheDocument());
    expect(screen.getByText('Très bon')).toBeInTheDocument();
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
    rendre(<MesAvis />);
    await waitFor(() => expect(emplacement()).toBe('/login'));
  });

  it('Retour mène à /compte', async () => {
    const { user } = await ouvrir();
    await user.click(screen.getByRole('button', { name: '← Retour' }));
    expect(emplacement()).toBe('/compte');
  });
});
