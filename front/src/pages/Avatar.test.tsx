import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import Avatar from './Avatar';
import { imageIntrouvable } from '../test/utils';

describe('Avatar', () => {
  it('sans photo : affiche les initiales, masquées aux lecteurs d’écran', () => {
    const { container } = render(<Avatar className="profil__avatar" pseudo="jean_dupont" />);
    const avatar = container.querySelector('.profil__avatar')!;
    expect(avatar).toHaveTextContent('JD');
    expect(avatar).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('img')).not.toBeInTheDocument();
  });

  it('pseudo vide : affiche « ? »', () => {
    const { container } = render(<Avatar className="profil__avatar" pseudo="" />);
    expect(container.querySelector('.profil__avatar')).toHaveTextContent('?');
  });

  it('avec photo : affiche l’image via le proxy /api', () => {
    const { container } = render(<Avatar className="profil__avatar" pseudo="romain" photo="/public/images/p.webp" />);
    const img = container.querySelector('img')!;
    expect(img).toHaveAttribute('src', '/api/public/images/p.webp');
    expect(img).toHaveClass('profil__avatar', 'avatar__photo');
  });

  it('photo introuvable : revient aux initiales', () => {
    const { container } = render(<Avatar className="profil__avatar" pseudo="romain" photo="/public/images/absente.webp" />);
    imageIntrouvable(container.querySelector('img')!);
    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(container.querySelector('.profil__avatar')).toHaveTextContent('R');
  });
});
