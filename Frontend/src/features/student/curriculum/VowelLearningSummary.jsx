import { Link } from 'react-router';
import { Button } from '../../../components/ui/Button.jsx';
import { ManualReference } from '../recognition/ManualReference.jsx';
import { vowelGuides } from './vowel-lesson.js';

/**
 * Reúne el repaso del contenido consultado sin presentar calificaciones ni prácticas no realizadas.
 * @param {{onReview: Function}} props Vuelta al comienzo del recorrido.
 * @returns {import('react').ReactElement} Repaso de las cinco vocales y acceso a práctica libre.
 */
export function VowelLearningSummary({ onReview }) {
  return (
    <section
      className="journey-copy education-card flex min-w-0 flex-col gap-4"
      aria-label="Repaso de vocales"
    >
      <p className="journey-eyebrow text-muted">Repasa lo aprendido</p>
      <h2>Las cinco vocales, de un vistazo</h2>
      {vowelGuides.map((guide) => (
        <details key={guide.letter} className="model-settings">
          <summary>Repasar la vocal {guide.letter}</summary>
          <ManualReference letter={guide.letter} compact />
          <p>{guide.description}</p>
          <p>{guide.focus}</p>
        </details>
      ))}
      <p className="text-muted">
        Llegaste al final del recorrido de lectura. Esto no certifica dominio de LSV ni confirma que
        hayas realizado capturas. Las predicciones no modifican tus notas.
      </p>
      <Button onClick={onReview}>Repasar desde el inicio</Button>
      <Link
        className="education-back inline-flex min-h-11 items-center"
        to="/student/modules/vowels-camera"
      >
        Práctica libre de vocales con cámara
      </Link>
    </section>
  );
}
