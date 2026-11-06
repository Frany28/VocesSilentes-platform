import { Button } from '../../../components/ui/Button.jsx';
import { Alert } from '../../../components/ui/Alert.jsx';
import { useModelTraining } from './use-model-training.js';

/**
 * Permite crear el modelo propio en el navegador, con evaluación separada y resultados etiquetados como experimentales.
 * @param {{samples: object[], experimental?: boolean}} props Muestras y flujo explícito.
 * @returns {import('react').ReactElement} Entrenamiento real, artefactos y métricas; no crea muestras ni pesos simulados.
 */
export function ModelTraining({ samples, experimental = false }) {
  const operation = useModelTraining();
  return (
    <section
      className="education-card flex flex-col gap-4"
      aria-label="Entrenar nuestro modelo LSV"
    >
      <h2 className="[font:var(--type-h3)]">Entrenar nuestro modelo</h2>
      <p>
        {experimental
          ? 'Prototipos de etiquetas confirmadas manualmente, incluida NONE. Sin revisión experta, particiones ni métricas.'
          : 'Se requieren etiquetas revisadas, incluida NONE, en los tres grupos con personas distintas.'}
      </p>
      <div className="camera-actions">
        <Button
          disabled={!samples.length}
          loading={operation.pending}
          loadingLabel="Entrenando en tu dispositivo…"
          onClick={() => operation.train(samples, experimental)}
        >
          Entrenar modelo experimental
        </Button>
        {operation.pending && (
          <Button variant="secondary" icon={null} onClick={operation.cancel}>
            Cancelar entrenamiento
          </Button>
        )}
      </div>
      {operation.error && (
        <Alert tone="error" title="El modelo aún no se puede entrenar">
          {operation.error}
        </Alert>
      )}
      {operation.result && (
        <>
          {experimental ? (
            <Alert tone="info" title="Modelo EXPERIMENTAL local creado">
              {operation.result.report.samples} ejecuciones reales. Sin evaluación independiente.
              Umbrales de abstención heurísticos, sin calibrar. No modifica el progreso académico.
            </Alert>
          ) : (
            <Alert tone="info" title="Modelo experimental creado">
              Prueba independiente: {operation.result.report.correct} de{' '}
              {operation.result.report.total} muestras clasificadas correctamente;{' '}
              {operation.result.report.abstained} abstenciones. Estos resultados describen este lote
              de prueba, no garantizan precisión con otros estudiantes ni autorizan calificación
              académica.
            </Alert>
          )}
          <p>Etiquetas aprendidas: {operation.result.model.labels.join(', ')}.</p>
          <div className="camera-actions">
            <Button onClick={operation.apply} disabled={operation.applied}>
              {operation.applied
                ? 'Modelo listo para practicar'
                : 'Usar este modelo para practicar'}
            </Button>
            <Button variant="secondary" icon={null} onClick={operation.downloadModel}>
              Descargar modelo
            </Button>
            <Button variant="secondary" icon={null} onClick={operation.downloadReport}>
              {experimental ? 'Descargar resumen experimental' : 'Descargar evaluación'}
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
