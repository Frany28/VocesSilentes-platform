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
      <h2 className="[font:var(--type-h3)]">Vocales · aprende y practica con cámara</h2>
      <p>
        Consulta las referencias de A, E, I, O y U y prueba el reconocimiento con nuestro modelo de
        ejemplos reales.
      </p>
      <Link
        className="education-back inline-flex min-h-11 items-center"
        to="/student/modules/vowels-camera"
      >
        Practicar vocales con cámara
      </Link>
    </section>
  );
}
