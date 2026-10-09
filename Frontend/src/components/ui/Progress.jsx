import { useId } from 'react';

/**
 * Progreso determinado; normaliza porcentajes a 0–100 y anuncia label/valueText.
 * @param {object} props Atributos del contenedor y ref.
 * @param {number} props.value Porcentaje real; no finito se representa como cero.
 * @param {import('react').ReactNode} props.label Etiqueta accesible y visible.
 * @param {string} props.valueText Descripción visible, independiente de reglas de negocio.
 * @param {string} [props.className] Clases del contenedor.
 * @returns {import('react').ReactElement} Progreso sin animaciones añadidas.
 */
export function Progress({ value, label, valueText, className = '', ...attributes }) {
  const labelId = useId();
  const percent = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
  return (
    <div {...attributes} className={`vs-ui vs-progress ${className}`}>
      <p id={labelId}>{label}</p>
      <div
        className="vs-progress-track"
        role="progressbar"
        aria-labelledby={labelId}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={valueText}
        data-complete={percent === 100 || undefined}
      >
        <span style={{ width: `${percent}%` }} />
      </div>
      <p className="vs-progress-caption">{valueText}</p>
    </div>
  );
}
