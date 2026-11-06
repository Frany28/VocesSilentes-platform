import { useId, useState } from 'react';

/**
 * Permite inspeccionar observaciones reales sin reconstruir imágenes ni interpretar letras automáticamente.
 * @param {{sample: object}} props Muestra validada con 21 puntos por observación.
 * @returns {import('react').ReactElement} Vista de puntos y control de fotograma accesible por teclado.
 */
export function SamplePreview({ sample }) {
  const [position, setPosition] = useState(0);
  const id = useId();
  const frame = sample.frames[position];
  return (
    <div className="sample-preview flex min-w-0 flex-col gap-2">
      <svg
        viewBox={`0 0 ${frame.width} ${frame.height}`}
        role="img"
        aria-label={`21 puntos observados, mano ${frame.hand === 'Right' ? 'derecha' : 'izquierda'}`}
      >
        {frame.points.map(([x, y], index) => (
          <circle key={index} cx={x * frame.width} cy={y * frame.height} r={frame.width / 100} />
        ))}
      </svg>
      <label htmlFor={id}>
        Observación {position + 1} de {sample.frames.length}
      </label>
      <input
        id={id}
        type="range"
        min="0"
        max={sample.frames.length - 1}
        value={position}
        onChange={(event) => setPosition(Number(event.target.value))}
      />
      <p className="text-muted">
        Tiempo relativo: {(frame.t / 1000).toFixed(3)} s. Los puntos no confirman la etiqueta.
      </p>
    </div>
  );
}
