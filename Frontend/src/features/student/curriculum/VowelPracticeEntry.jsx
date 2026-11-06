import { Link } from 'react-router';

/**
 * Da acceso a la actividad de vocales sin inventar módulos publicados ni registros de progreso.
 * @returns {import('react').ReactElement} Entrada educativa con cámara y modelo real.
 */
export function VowelPracticeEntry() {
  return (
    <section
      className="education-card flex flex-col gap-3"
      aria-label="Actividad de aprendizaje de vocales"
    >
      <p className="text-muted [font:var(--type-label)]">PRÁCTICA OPCIONAL</p>
      <h2 className="[font:var(--type-h3)]">Las cinco vocales: A, E, I, O y U</h2>
      <p>
        Puedes usar la cámara con el modelo educativo de vocales. Esta actividad no registra
        lecciones completadas ni califica tu ejecución; la validación LSV sigue pendiente.
      </p>
      <Link
        className="education-back inline-flex min-h-11 items-center"
        to="/student/modules/vowels"
      >
        Consultar la lección publicada de vocales
      </Link>
      <Link
        className="education-back inline-flex min-h-11 items-center"
        to="/student/modules/vowels-camera"
      >
        Practicar vocales con cámara
      </Link>
    </section>
  );
}
