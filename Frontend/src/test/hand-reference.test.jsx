import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { ManualReference } from '../features/student/recognition/ManualReference.jsx';
import { letterResource } from '../features/student/resources/letter-resources.js';
import { handReferencePolicy } from '../features/student/resources/hand-reference-policy.js';

test.each(['A', 'E', 'I', 'O', 'U'])(
  'referencia izquierda de %s separa rótulo y mano y conserva el archivo original',
  (letter) => {
    const { container } = render(<ManualReference letter={letter} hand="Left" />);
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', letterResource(letter).url);
    expect(image.style.clipPath).toContain('polygon');
    expect(image.parentElement).toHaveAttribute('data-mirrored', 'true');
    expect(container.querySelector('.manual-hand-letter')).toHaveTextContent(letter);
    expect(container.querySelector('.manual-hand-letter').style.transform).toBe('');
    expect(screen.getByText(/equivalencia lingüística pendiente/)).toBeVisible();
  },
);

test('movimientos direccionales y rótulos superpuestos requieren una referencia específica', () => {
  for (const letter of ['J', 'Ñ', 'Z'])
    expect(handReferencePolicy(letter).mode).toBe('DIRECTIONAL_REFERENCE_REQUIRED');
  for (const letter of ['G', 'Q', 'R'])
    expect(handReferencePolicy(letter).mode).toBe('HAND_ONLY_RESOURCE_REQUIRED');
  const { container } = render(<ManualReference letter="J" hand="Left" />);
  expect(container.querySelector('[data-mirrored]')).toBeNull();
  expect(screen.getByText(/Original sin adaptar: incluye movimiento direccional/)).toBeVisible();
});
