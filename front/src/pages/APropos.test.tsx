import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import APropos from './APropos';
import { api, rendre } from '../test/utils';

const URL_CONTRIBUTEURS = 'https://api.github.com/repos/Romain-lfr/Myxo/contributors';
const contributeur = (login: string, type = 'User') => ({
  login, type, avatar_url: `https://avatars.example/${login}.png`, html_url: `https://github.com/${login}`,
});

describe('APropos', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('présente Myxo, son badge Bêta et mène aux recettes', async () => {
    rendre(<APropos />);
    expect(screen.getByRole('heading', { level: 1, name: /Le bar à la maison/ })).toBeInTheDocument();
    expect(screen.getByTitle('Le site est en cours de développement')).toHaveTextContent('Bêta');
    expect(screen.getByText(/créer et explorer des recettes de cocktails et de mocktails/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Découvrir les recettes' })).toHaveAttribute('href', '/');
    await screen.findByText(/Pas encore d'autres contributeurs/);
  });

  it('explique le fonctionnement en trois étapes', async () => {
    rendre(<APropos />);
    const etapes = within(screen.getByRole('region', { name: 'Comment ça marche' })).getAllByRole('listitem');
    expect(etapes.map((e) => within(e).getByRole('heading').textContent)).toEqual([
      'Remplis ton frigo', 'Myxo trouve quoi servir', 'Secoue, note, partage',
    ]);
    await screen.findByText(/Pas encore d'autres contributeurs/);
  });

  it('affiche « build dev » en local, et les 7 premiers caractères du commit déployé', async () => {
    const { unmount } = rendre(<APropos />);
    expect(screen.getByText('build dev')).toBeInTheDocument();
    await screen.findByText(/Pas encore d'autres contributeurs/);
    unmount();

    vi.stubEnv('VITE_BUILD', '0dd30bf9c1e2a7b4');
    rendre(<APropos />);
    expect(screen.getByText('build 0dd30bf')).toBeInTheDocument();
    await screen.findByText(/Pas encore d'autres contributeurs/);
  });

  it('propose les nouveautés, le contact par e-mail et le code source', async () => {
    rendre(<APropos />);
    expect(screen.getByRole('link', { name: /Nouveautés/ })).toHaveAttribute('href', 'https://github.com/Romain-lfr/Myxo/commits/main');
    const contact = screen.getByRole('link', { name: /Contacter l'équipe/ });
    expect(contact).toHaveAttribute('href', 'mailto:lefranc.romain@outlook.fr');
    expect(contact).not.toHaveAttribute('target');
    const code = screen.getByRole('link', { name: /Code source/ });
    expect(code).toHaveAttribute('href', 'https://github.com/Romain-lfr/Myxo');
    expect(code).toHaveAttribute('target', '_blank');
    expect(code).toHaveAttribute('rel', 'noopener noreferrer');
    expect(code).toHaveAccessibleName(/nouvel onglet/);
    await screen.findByText(/Pas encore d'autres contributeurs/);
  });

  it('présente l’équipe et les contributeurs sur la carte d’ouverture', async () => {
    rendre(<APropos />);
    const equipe = screen.getByRole('complementary', { name: 'Équipe' });
    expect(within(equipe).getByRole('region', { name: 'Contributeurs' })).toBeInTheDocument();
    expect(within(equipe).getByText('Romain')).toBeInTheDocument();
    expect(within(equipe).getByText('@Romain-lfr')).toBeInTheDocument();
    expect(within(equipe).getByText('Fondateur et développeur')).toBeInTheDocument();
    const profil = within(equipe).getByRole('link', { name: /Romain.*@Romain-lfr/ });
    expect(profil).toHaveAttribute('href', 'https://github.com/Romain-lfr');
    expect(profil).toHaveAttribute('target', '_blank');
    expect(profil).toHaveAttribute('rel', 'noopener noreferrer');
    await screen.findByText(/Pas encore d'autres contributeurs/);
  });

  it('liste les contributeurs GitHub, sans les membres de l’équipe ni les robots', async () => {
    api.get.mockResolvedValue({
      data: [contributeur('Romain-lfr'), contributeur('Klaynight-dev'), contributeur('dependabot[bot]', 'Bot'), contributeur('LeFouTrolleur')],
    });
    rendre(<APropos />);
    const section = screen.getByRole('region', { name: 'Contributeurs' });
    expect(await within(section).findByRole('link', { name: 'Klaynight-dev' })).toHaveAttribute('href', 'https://github.com/Klaynight-dev');
    expect(within(section).getByRole('link', { name: 'LeFouTrolleur' })).toBeInTheDocument();
    expect(within(section).queryByRole('link', { name: 'Romain-lfr' })).not.toBeInTheDocument();
    expect(within(section).queryByRole('link', { name: /dependabot/ })).not.toBeInTheDocument();
    expect(within(section).getByText('Merci à tous ceux qui ont contribué au code.')).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith(URL_CONTRIBUTEURS);
  });

  it('reste affichable si GitHub ne répond pas, et invite à contribuer', async () => {
    api.get.mockRejectedValue(new Error('réseau'));
    rendre(<APropos />);
    expect(await screen.findByText(/Pas encore d'autres contributeurs/)).toBeInTheDocument();
    const contribuer = screen.getByRole('link', { name: /Contribuer sur GitHub/ });
    expect(contribuer).toHaveAttribute('href', 'https://github.com/Romain-lfr/Myxo');
    expect(contribuer).toHaveAttribute('target', '_blank');
  });
});
