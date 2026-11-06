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
      <p className="text-muted [font:var(--type-label)]">MÓDULO DE APRENDIZAJE</p>
      <h2 className="[font:var(--type-h3)]">Las cinco vocales: A, E, I, O y U</h2>
      <p>
        Aprende cada vocal con su explicación e ilustración, practícala con la cámara y termina con
        un repaso. Puedes avanzar a tu ritmo y retomar donde te quedaste.
      </p>
      <Link
        className="education-back inline-flex min-h-11 items-center"
        to="/student/modules/vowels"
      >
        Comenzar módulo de vocales
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
