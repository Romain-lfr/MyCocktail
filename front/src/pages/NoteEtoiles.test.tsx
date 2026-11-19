import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NoteEtoiles from './NoteEtoiles';

describe('NoteEtoiles', () => {
  it('coche la note reçue, remplit les étoiles jusqu’à elle et affiche son libellé', () => {
    const { container } = render(<NoteEtoiles valeur={3} onChange={() => {}} />);
    expect(screen.getByRole('group', { name: 'Ta note' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /3 sur 5 — Correct/ })).toBeChecked();
    expect(container.querySelectorAll('.etoiles__etoile--pleine')).toHaveLength(3);
    expect(screen.getByText('3/5 · Correct')).toBeInTheDocument();
  });

  it('prévient du changement de note au clic', async () => {
    const onChange = vi.fn();
    render(<NoteEtoiles valeur={5} onChange={onChange} legende="Note" />);
    await userEvent.click(screen.getByRole('radio', { name: /2 sur 5 — Bof/ }));
    expect(onChange).toHaveBeenCalledWith(2);
    expect(screen.getByRole('group', { name: 'Note' })).toBeInTheDocument();
  });

  it('deux groupes sur la même page restent indépendants (nom distinct)', () => {
    render(<><NoteEtoiles valeur={1} onChange={() => {}} nom="a" /><NoteEtoiles valeur={4} onChange={() => {}} nom="b" /></>);
    expect(screen.getAllByRole('radio', { checked: true })).toHaveLength(2);
  });
});
