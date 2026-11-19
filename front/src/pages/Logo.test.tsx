import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import Logo, { GlasseU, GlasseY } from './Logo';

describe('Logo', () => {
  it('affiche « M », le verre et « Cocktails »', () => {
    const { container } = render(<Logo />);
    expect(container.textContent).toBe('MCocktails');
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it.each([
    ['GlasseY', GlasseY],
    ['GlasseU', GlasseU],
  ])('%s est décoratif (aria-hidden) et accepte une classe', (_nom, Verre) => {
    const { container } = render(<Verre className="test" />);
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveClass('test');
  });

  it.each([
    ['GlasseY', GlasseY],
    ['GlasseU', GlasseU],
  ])('%s n’a aucune couleur en dur : uniquement des tokens surchargeables', (_nom, Verre) => {
    const { container } = render(<Verre />);
    expect(container.innerHTML).not.toMatch(/#[0-9a-f]{3,6}\b/i);
    expect(container.innerHTML).toMatch(/var\(--verre-/);
  });
});
