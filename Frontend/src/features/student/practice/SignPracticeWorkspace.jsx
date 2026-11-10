import { useContext, useState } from 'react';
import { RecognitionModelContext } from '../recognition/model-context.js';
import { HandIllustration } from '../recognition/HandIllustration.jsx';
import { Link } from 'react-router';
import { CameraPracticeLoader } from '../recognition/CameraPracticeLoader.jsx';
import {
  publishedLetters,
  letterResource,
  illustrationCredit,
} from '../resources/letter-resources.js';
import './sign-practice.css';

/**
 * Reúne las referencias autorizadas y la cámara real en la misma página de práctica.
 * Cambiar de letra desmonta la cámara anterior y conserva el modelo compartido del estudiante.
 * @returns {import('react').ReactElement} Selector de imágenes y práctica local; cámara solo por acción explícita.
 */
export function SignPracticeWorkspace() {
  const { referenceHand } = useContext(RecognitionModelContext);
  const letters = publishedLetters();
  const [letter, setLetter] = useState(letters[0]);
  return (
    <section className="sign-practice education-card" aria-label="Área de práctica de señas">
      <div className="flex flex-col gap-2">
        <p className="text-action [font:var(--type-label)]">VOCALES EN LSV</p>
        <h2 className="[font:var(--type-h3)]">Elige una seña y practica</h2>
        <p className="text-muted">
          Observa la imagen, activa tu cámara y compara la posición de tu mano.
        </p>
      </div>
      <div className="sign-practice-picker" role="group" aria-label="Elegir vocal para practicar">
        {letters.map((value) => (
          <button
            key={value}
            className="sign-practice-choice"
            type="button"
            aria-label={`Practicar vocal ${value}`}
            aria-pressed={letter === value}
            onClick={() => setLetter(value)}
          >
            <HandIllustration
              resource={letterResource(value)}
              letter={value}
              hand={referenceHand}
              showLabel={false}
            />
            <span>Vocal {value}</span>
          </button>
        ))}
      </div>
      <p className="text-muted [font:var(--type-label)]">{illustrationCredit}.</p>
      <CameraPracticeLoader
        key={letter}
        letter={letter}
        onContinue={
          letters.indexOf(letter) < letters.length - 1
            ? () => setLetter(letters[letters.indexOf(letter) + 1])
            : undefined
        }
      />
      <Link
        className="education-back inline-flex min-h-11 items-center"
        to="/student/modules/vowels"
      >
        Ir a la lección de vocales
      </Link>
    </section>
  );
}
