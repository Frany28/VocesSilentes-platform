/**
 * Instrucciones del intento en orden. Para letras sin modelo, la práctica es de comparación visual.
 * @param {{letter?: string, supported: boolean}} props Letra objetivo y si tiene reconocimiento experimental.
 * @returns {import('react').ReactElement} Lista ordenada de pasos.
 */
export function CameraSteps({ letter, supported }) {
  const steps = [
    letter
      ? `Observa la posición de los dedos en la ${letter}.`
      : 'Forma una de las cinco vocales: A, E, I, O o U.',
    'Coloca una mano dentro del recuadro.',
    supported
      ? 'Mantén la seña quieta: el intento se captura solo.'
      : 'Forma la seña y compárala con la referencia.',
  ];
  return (
    <ol className="camera-steps" aria-label="Cómo hacer el intento">
      {steps.map((step) => (
        <li key={step}>{step}</li>
      ))}
    </ol>
  );
}
