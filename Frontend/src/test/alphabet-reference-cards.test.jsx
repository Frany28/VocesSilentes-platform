import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { AlphabetCards } from '../features/student/curriculum/AlphabetCards.jsx';
import { letterResource } from '../features/student/resources/letter-resources.js';
import provenance from '../assets/lsv-manual/provenance.json';

vi.mock('../lib/config.js', () => ({
  publicConfig: { apiUrl: 'http://localhost:3000/api', studentDemo: false },
}));

test.each(Object.keys(provenance.images))(
  'la lección de %s utiliza la misma ficha VocesSilentes que Practicar sin activar cámara',
  (letter) => {
    const practice = vi.fn();
    render(
      <AlphabetCards
        cards={[
          {
            letter,
            studyHint: 'Observa la referencia.',
            source: {
              file: provenance.source,
              pdfPage: provenance.images[letter].page,
              credit: provenance.credit,
            },
            sourceIllustrationShowsMotionArrow: ['J', 'Ñ', 'Z'].includes(letter),
          },
        ]}
        onPractice={practice}
      />,
    );
    const image = screen.getByRole('img', { name: new RegExp(`referencia de la letra ${letter}`) });
    expect(image).toBeVisible();
    expect(image).toHaveAttribute('src', letterResource(letter).url);
    expect(image.getAttribute('src')).toMatch(/ficha-[a-f0-9]{12}\.webp$/);
    expect(screen.queryByText(/Consultar referencias del material|Yulianny Fuentes/)).toBeNull();
    expect(
      screen.queryByText('Referencia visual pendiente de autorización y revisión LSV.'),
    ).toBeNull();
    expect(practice).not.toHaveBeenCalled();
  },
);
