import { Link } from 'react-router';

/**
 * Describe exportación y entrenamiento local del piloto, conservando recursos de licencia del detector.
 * @returns {import('react').ReactElement} Ayuda sin peticiones ni activación de cámara.
 */
export function ModelLabInstructions() {
  return (
    <section className="education-card flex flex-col gap-3">
      <h2 className="[font:var(--type-h3)]">Entrenar con las muestras revisadas</h2>
      <p>
        Guarda los archivos exportados en una carpeta local y ejecuta desde la raíz del proyecto:
      </p>
      <code className="model-command">
        pnpm lsv:train .local/muestras.json --output .local/modelo-lsv --labels A,E,I,O,U,NONE
      </code>
      <p>
        Se generan lsv-model.json y evaluation.json con resultados de prueba independiente. El
        modelo sigue siendo experimental. Puedes indicar varios archivos de muestras al comando.
      </p>
      <Link
        className="education-back inline-flex min-h-11 items-center"
        to="/student/practice/camera"
      >
        Probar el modelo entrenado con mi cámara
      </Link>
      <a
        className="education-back inline-flex min-h-11 items-center"
        href="/licenses/mediapipe-Apache-2.0.txt"
      >
        Licencia del detector de manos MediaPipe
      </a>
    </section>
  );
}
