import { Alert } from '../../../components/ui/Alert.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Progress } from '../../../components/ui/Progress.jsx';
import { moduleProgress } from '../data/module-progress.js';
import { useLearningProgress } from '../data/use-learning-progress.js';
import { JourneyControls } from './JourneyControls.jsx';
import { vowelActivities, vowelLetters } from './vowel-lesson.js';
import { mixedReview } from './vowel-rounds.js';

/**
 * Cierre de la lección con evidencia separada de lectura, comprensión y cámara. La única escritura
 * académica sigue siendo el guardado manual de lectura que ya ofrece el backend.
 * @param {object} props Contexto real y progreso formativo local.
 * @param {object} props.lesson Lección real del catálogo.
 * @param {object} props.module Módulo real del catálogo.
 * @param {object} props.progress Evidencia formativa local.
 * @param {boolean} props.remembered Si se pudo conservar el progreso local.
 * @param {Function} [props.onBack] Regreso al paso anterior.
 * @param {Function} props.onReview Reinicio del recorrido.
 * @param {Function} props.onGoTo Acceso a una vocal concreta.
 * @param {Function} props.onContinue Salida a la siguiente lección o catálogo.
 * @param {string} [props.nextTitle] Siguiente lección disponible.
 * @returns {import('react').ReactElement} Resumen de las cinco vocales y navegación de repaso.
 */
export function VowelLessonSummary({
  lesson,
  module,
  progress,
  remembered,
  onBack,
  onReview,
  onGoTo,
  onContinue,
  nextTitle,
}) {
  const operation = useLearningProgress();
  const registered = lesson.status === 'COMPLETED' || operation.saved;
  const reading = moduleProgress(module);
  const advance = async () => {
    if (registered) return onContinue();
    const saved = await operation.submit('lessons', lesson.id, 'COMPLETED');
    if (saved) onContinue();
  };
  const answers = (letter) =>
    vowelActivities.filter(
      (activity) => progress.activities[activity.id]?.answers?.[letter]?.correct,
    ).length;
  const attempted = (mode, letter) => progress.camera[mode].attempts[letter]?.total ?? 0;
  const matches = ['guided', 'memory'].reduce(
    (total, mode) =>
      total +
      vowelLetters.reduce(
        (sum, letter) => sum + (progress.camera[mode].attempts[letter]?.matches ?? 0),
        0,
      ),
    0,
  );
  const uncertain = ['guided', 'memory'].reduce(
    (total, mode) =>
      total +
      vowelLetters.reduce(
        (sum, letter) => sum + (progress.camera[mode].attempts[letter]?.uncertain ?? 0),
        0,
      ),
    0,
  );
  return (
    <>
      <div className="journey-stage" data-step="summary">
        <section className="education-card vowel-summary" aria-labelledby="vowel-summary-title">
          <header className="vowel-section-heading">
            <p className="journey-eyebrow text-action">TU REPASO</p>
            <h2 id="vowel-summary-title">Tus cinco vocales, de un vistazo</h2>
            <p>
              Este resumen muestra lo que realmente consultaste y practicaste. Los intentos de
              cámara son evidencia experimental, no una certificación de dominio de LSV.
            </p>
          </header>
          <div className="vowel-summary-metrics">
            <Progress
              label="Contenido visualizado"
              value={(progress.viewed.length / vowelLetters.length) * 100}
              valueText={`${progress.viewed.length} de 5 vocales consultadas`}
            />
            <Progress
              label="Actividades formativas"
              value={
                (vowelActivities.filter((activity) =>
                  vowelLetters.every(
                    (letter) => progress.activities[activity.id]?.answers?.[letter]?.correct,
                  ),
                ).length /
                  vowelActivities.length) *
                100
              }
              valueText={`${vowelActivities.filter((activity) => vowelLetters.every((letter) => progress.activities[activity.id]?.answers?.[letter]?.correct)).length} de 3 actividades completadas`}
            />
            <Progress
              label="Repaso combinado"
              value={((progress.mixed?.length ?? 0) / mixedReview.length) * 100}
              valueText={`${progress.mixed?.length ?? 0} de ${mixedReview.length} retos atendidos`}
            />
            <div className="vowel-model-totals">
              <span>
                <b>{matches}</b> predicciones coincidentes
              </span>
              <span>
                <b>{uncertain}</b> resultados inciertos o diferentes
              </span>
            </div>
          </div>
          <div className="vowel-summary-table" role="table" aria-label="Estado por vocal">
            <div role="row" className="vowel-summary-row vowel-summary-head">
              <span role="columnheader">Vocal</span>
              <span role="columnheader">Contenido</span>
              <span role="columnheader">Comprensión</span>
              <span role="columnheader">Guiada</span>
              <span role="columnheader">Memoria</span>
              <span role="columnheader">Repasar</span>
            </div>
            {vowelLetters.map((letter) => (
              <div role="row" className="vowel-summary-row" key={letter}>
                <b role="cell">{letter}</b>
                <span role="cell">{progress.viewed.includes(letter) ? 'Visto' : 'Pendiente'}</span>
                <span role="cell">{answers(letter)} de 3</span>
                <span role="cell">{attempted('guided', letter)} intentos</span>
                <span role="cell">{attempted('memory', letter)} intentos</span>
                <span role="cell">
                  <button type="button" onClick={() => onGoTo(`vowel-${letter}`)}>
                    Volver a {letter}
                  </button>
                </span>
              </div>
            ))}
          </div>
          {!remembered && (
            <Alert tone="warning" title="El progreso formativo no se pudo guardar">
              Puedes continuar, pero este navegador no conservará las actividades y los intentos al
              recargar.
            </Alert>
          )}
          {operation.error && (
            <Alert tone="error" title="No se pudo guardar la lectura">
              {operation.error} Vuelve a intentarlo.
            </Alert>
          )}
          {registered && (
            <p className="summary-saved">Lectura registrada en tu progreso académico.</p>
          )}
          <p className="text-muted">
            El progreso del módulo sigue en {reading.percent}%. Guardar registra la lectura de la
            lección; no convierte predicciones experimentales en aciertos académicos.
          </p>
          <Button variant="secondary" icon={null} onClick={onReview}>
            Repasar desde el inicio
          </Button>
        </section>
      </div>
      <JourneyControls
        onBack={onBack}
        onContinue={advance}
        pending={operation.pending}
        loadingLabel="Guardando…"
        label={
          registered
            ? nextTitle
              ? 'Siguiente lección'
              : 'Volver a mis módulos'
            : nextTitle
              ? 'Guardar y continuar'
              : 'Guardar y terminar'
        }
      />
    </>
  );
}
