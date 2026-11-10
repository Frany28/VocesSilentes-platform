/**
 * Instrucciones del intento en orden. Para letras sin modelo, la práctica es de comparación visual.
 * @param {{letter?: string, supported: boolean}} props Letra objetivo y si tiene reconocimiento experimental.
 * @returns {import('react').ReactElement} Lista ordenada de pasos.
 */
export function CameraSteps({ letter, supported }) {
  const steps = [
    letter ? `Mira la referencia de la ${letter}.` : 'Elige la vocal que quieres practicar.',
    'Activa la cámara y coloca la mano dentro del recuadro.',
    supported
      ? 'Pulsa Capturar intento: tras la cuenta de 3, mantén la seña quieta 3 segundos.'
      : 'Forma la seña y compárala con la referencia. No hay análisis disponible para esta letra y mano.',
    supported
      ? 'Lee la hipótesis experimental y repite si quieres.'
      : 'Detén la cámara cuando termines.',
  ];
  return (
    <ol className="camera-steps" aria-label="Cómo hacer el intento">
      {steps.map((step) => (
        <li key={step}>{step}</li>
      ))}
    </ol>
  );
}
