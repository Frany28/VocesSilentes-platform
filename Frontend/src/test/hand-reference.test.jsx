import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { ManualReference } from '../features/student/recognition/ManualReference.jsx';
import { letterResource } from '../features/student/resources/letter-resources.js';
import { handReferencePolicy } from '../features/student/resources/hand-reference-policy.js';

test.each(['A', 'E', 'I', 'O', 'U'])(
  'referencia izquierda de %s refleja la imagen y mantiene legible el rótulo HTML',
  (letter) => {
    const { container } = render(<ManualReference letter={letter} hand="Left" />);
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', letterResource(letter).url);
    expect(image.style.clipPath).toBe('');
    expect(image.parentElement).toHaveAttribute('data-mirrored', 'true');
    expect(container.querySelector('.manual-hand-letter')).toHaveTextContent(letter);
    expect(container.querySelector('.manual-hand-letter').style.transform).toBe('');
    expect(screen.getByText(/equivalencia lingüística pendiente/)).toBeVisible();
  },
);

test('las fichas con flechas direccionales requieren una referencia izquierda específica', () => {
  for (const letter of ['J', 'Ñ', 'Z'])
    expect(handReferencePolicy(letter).mode).toBe('DIRECTIONAL_REFERENCE_REQUIRED');
  for (const letter of ['G', 'Q', 'R'])
    expect(handReferencePolicy(letter).mode).toBe('STATIC_MIRROR_PREVIEW');
  const { container } = render(<ManualReference letter="J" hand="Left" />);
  expect(container.querySelector('[data-mirrored]')).toBeNull();
  expect(screen.getByText(/Original sin adaptar: incluye movimiento direccional/)).toBeVisible();
});
