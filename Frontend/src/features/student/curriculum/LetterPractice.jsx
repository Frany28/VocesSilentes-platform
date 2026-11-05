import { useState } from 'react';
import { Button } from '../../../components/ui/Button.jsx';
import { AlphabetCards } from './AlphabetCards.jsx';
import { CameraPracticeLoader } from '../recognition/CameraPracticeLoader.jsx';

/**
 * Cambia del grupo de letras a una práctica de cámara individual, sin interrumpir el recorrido ni dar aciertos.
 * @param {{cards: object[]}} props Referencias del paso actual.
 * @returns {import('react').ReactElement} Tarjetas o cámara para una letra elegida explícitamente.
 */
export function LetterPractice({ cards }) {
  const [letter, setLetter] = useState(null);
  if (!letter) return <AlphabetCards cards={cards} onPractice={setLetter} />;
  return (
    <div className="education-card flex w-full flex-col gap-4">
      <Button variant="secondary" icon={null} onClick={() => setLetter(null)}>
        Volver a las letras
      </Button>
      <CameraPracticeLoader key={letter} letter={letter} />
    </div>
  );
}
