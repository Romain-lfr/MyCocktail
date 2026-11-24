import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import Register from './Register';
import { api, connecter, emplacement, erreurApi, rendre } from '../test/utils';

type Champs = { pseudo?: string; mail?: string; mdp?: string; confirm?: string; date?: string };
const valides: Required<Champs> = {
  pseudo: 'romain',
  mail: 'romain@myxo.com',
  mdp: 'Romain1234',
  confirm: 'Romain1234',
  date: '2000-05-12',
};

async function remplirEtEnvoyer(user: ReturnType<typeof rendre>['user'], champs: Champs = {}) {
  const c = { ...valides, ...champs };
  if (c.pseudo) await user.type(screen.getByLabelText('Pseudo'), c.pseudo);
  if (c.mail) await user.type(screen.getByLabelText('E-mail'), c.mail);
  if (c.mdp) await user.type(screen.getByLabelText('Mot de passe'), c.mdp);
  if (c.confirm) await user.type(screen.getByLabelText('Confirmer le mot de passe'), c.confirm);
  if (c.date) await user.type(screen.getByLabelText('Date de naissance'), c.date);
  await user.click(screen.getByRole('button', { name: 'Créer mon compte' }));
}

describe('Register', () => {
  it('inscrit puis renvoie vers la connexion', async () => {
    const { user } = rendre(<Register />, { route: '/register' });
    await remplirEtEnvoyer(user);
    expect(api.post).toHaveBeenCalledWith('/api/auth/register', {
      pseudo: 'romain',
      mail: 'romain@myxo.com',
      mdp: 'Romain1234',
      dateNaissance: '2000-05-12',
    });
    await waitFor(() => expect(emplacement()).toBe('/login'));
  });

  it('renvoie vers l’accueil si déjà connecté', () => {
    connecter();
    rendre(<Register />, { route: '/register' });
    expect(emplacement()).toBe('/');
  });

  it.each([
    [{ pseudo: 'ro' }, 'Le pseudo doit faire au moins 3 caractères', 'Pseudo'],
    [{ mail: 'pas-un-mail' }, 'Email invalide', 'E-mail'],
    [{ mdp: 'Court1', confirm: 'Court1' }, 'Le mot de passe doit faire au moins 8 caractères', 'Mot de passe'],
    [{ mdp: 'romain1234', confirm: 'romain1234' }, 'Le mot de passe doit contenir au moins une majuscule', 'Mot de passe'],
    [{ mdp: 'RomainRomain', confirm: 'RomainRomain' }, 'Le mot de passe doit contenir au moins un chiffre', 'Mot de passe'],
    [{ confirm: 'Romain12345' }, 'Les mots de passe ne correspondent pas', 'Confirmer le mot de passe'],
    [{ date: '' }, 'La date de naissance est obligatoire', 'Date de naissance'],
    [{ date: '2999-01-01' }, 'La date de naissance doit être dans le passé', 'Date de naissance'],
  ])('refuse %o : « %s » sans appeler l’API, sous le bon champ', async (champs, message, label) => {
    const { user } = rendre(<Register />, { route: '/register' });
    await remplirEtEnvoyer(user, champs);
    const champ = screen.getByLabelText(label);
    expect(champ).toHaveAttribute('aria-invalid', 'true');
    expect(champ).toHaveAccessibleDescription(message);
    expect(api.post).not.toHaveBeenCalled();
  });

  it('affiche le message renvoyé par l’API (ex. pseudo déjà pris)', async () => {
    api.post.mockRejectedValue(erreurApi(409, 'Ce pseudo est déjà utilisé'));
    const { user } = rendre(<Register />, { route: '/register' });
    await remplirEtEnvoyer(user);
    expect(await screen.findByRole('alert')).toHaveTextContent('Ce pseudo est déjà utilisé');
    expect(emplacement()).toBe('/register');
  });

  it('affiche un message générique si l’API ne précise rien', async () => {
    api.post.mockRejectedValue(new Error('Network Error'));
    const { user } = rendre(<Register />, { route: '/register' });
    await remplirEtEnvoyer(user);
    expect(await screen.findByText('Erreur lors de la création du compte')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Créer mon compte' })).toBeEnabled();
  });

  it('désactive le bouton pendant l’envoi', async () => {
    api.post.mockReturnValue(new Promise(() => {}));
    const { user } = rendre(<Register />, { route: '/register' });
    await remplirEtEnvoyer(user);
    expect(screen.getByRole('button', { name: 'Création…' })).toBeDisabled();
  });

  it('coche les règles du mot de passe au fil de la saisie', async () => {
    const { user } = rendre(<Register />, { route: '/register' });
    const regles = within(screen.getByRole('list', { name: 'Règles du mot de passe' }));
    expect(regles.getByText(/8 caractères minimum/).closest('li')).not.toHaveClass('regles__ok');

    await user.type(screen.getByLabelText('Mot de passe'), 'Romain');
    expect(regles.getByText(/Une majuscule/).closest('li')).toHaveClass('regles__ok');
    expect(regles.getByText(/Un chiffre/).closest('li')).not.toHaveClass('regles__ok');

    await user.type(screen.getByLabelText('Mot de passe'), '1234');
    expect(regles.getAllByText(/: respectée/)).toHaveLength(3);
  });

  it('« Afficher » révèle les deux champs de mot de passe', async () => {
    const { user } = rendre(<Register />, { route: '/register' });
    expect(screen.getByLabelText('Mot de passe')).toHaveAttribute('type', 'password');
    await user.click(screen.getByRole('button', { name: 'Afficher' }));
    expect(screen.getByLabelText('Mot de passe')).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText('Confirmer le mot de passe')).toHaveAttribute('type', 'text');
    await user.click(screen.getByRole('button', { name: 'Masquer' }));
    expect(screen.getByLabelText('Mot de passe')).toHaveAttribute('type', 'password');
  });

  it('propose un lien vers la connexion', () => {
    rendre(<Register />, { route: '/register' });
    expect(screen.getByRole('link', { name: 'Se connecter' })).toHaveAttribute('href', '/login');
  });
});
