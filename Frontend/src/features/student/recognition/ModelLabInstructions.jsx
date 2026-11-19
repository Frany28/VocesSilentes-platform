import { Link } from 'react-router';

/**
 * Describe exportación y entrenamiento documentado, conservando la demostración y la licencia del detector.
 * @returns {import('react').ReactElement} Ayuda sin peticiones ni activación de cámara.
 */
export function ModelLabInstructions() {
  return (
    <section className="education-card flex flex-col gap-3">
      <h2 className="[font:var(--type-h3)]">Guardar y volver a entrenar</h2>
      <p>En desarrollo local, exporta las muestras provisionales confirmadas y usa:</p>
      <code className="model-command">
        pnpm lsv:train:experimental .local/muestras.json --output .local/lsv-experimental
      </code>
      <p>
        Genera lsv-experimental-model.json y experimental-summary.json, sin métricas ni particiones.
        También puedes entrenar, descargar y activar el modelo directamente aquí.
      </p>
      <h3>Flujo con revisión y evaluación independiente</h3>
      <p>
        Guarda los archivos exportados en una carpeta local y ejecuta desde la raíz del proyecto:
      </p>
      <code className="model-command">
        pnpm lsv:train .local/muestras.json --output .local/modelo-lsv
      </code>
      <p>
        Se generan lsv-model.json y evaluation.json con resultados de prueba independiente. El
        modelo sigue siendo experimental. Sin --labels exige las 27 letras y NONE. Puedes indicar
        varios archivos o un subconjunto explícito con --labels A,E,I,O,U,NONE.
      </p>
      <p>
        Antes de entrenar, documenta consentimiento y permiso para este uso, fuente/variante y
        revisión LSV por ejecución. Separa participantes entre los tres grupos. Revisa cobertura con
        pnpm lsv:readiness .local/muestras.json. NONE debe ser negativo para todas las letras
        elegidas.
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
