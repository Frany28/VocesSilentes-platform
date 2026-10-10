import { useAdmin } from '../data/admin-context.js';
/**
 * Permite revisar estados de demostración solo en desarrollo, sin simular respuestas del servidor.
 * @returns {import('react').ReactElement} Herramienta explícita de previsualización.
 */
export function AdminPreview() {
  const { preview, setPreview } = useAdmin();
  return (
    <details className="admin-preview">
      <summary>Previsualización de estados de demostración</summary>
      <label>
        Estado visual{' '}
        <select value={preview} onChange={(event) => setPreview(event.target.value)}>
          <option value="ready">Normal</option>
          <option value="loading">Cargando</option>
          <option value="empty">Vacío</option>
          <option value="error">Error de demostración</option>
        </select>
      </label>
    </details>
  );
}
