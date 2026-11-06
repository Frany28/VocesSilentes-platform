import { useState } from 'react';
import { Select } from '../../../components/ui/Select.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { Button } from '../../../components/ui/Button.jsx';

/**
 * Envía filtros explícitos al backend; no filtra colecciones parciales ni estima métricas en el navegador.
 * @param {{apply: Function, refresh: Function, loading: boolean}} props Acciones del hook y carga real.
 * @returns {import('react').ReactElement} Período predefinido o fechas inclusivas en Caracas.
 */
export function MetricsFilters({ apply, refresh, loading }) {
  const [period, setPeriod] = useState('30');
  const [error, setError] = useState('');
  const submit = (event) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const from = values.get('from');
    const to = values.get('to');
    if (period === 'custom' && from > to) {
      setError('La fecha inicial debe ser anterior o igual a la final.');
      return;
    }
    setError('');
    apply(period === 'custom' ? { period, from, to } : { period });
  };
  return <section className="admin-panel admin-metrics-controls" aria-label="Filtros de métricas">
    <form onSubmit={submit} className="admin-metrics-filter">
      <Select label="Período" name="period" value={period} onChange={(event) => setPeriod(event.target.value)}>
        <option value="7">Últimos 7 días</option><option value="30">Últimos 30 días</option>
        <option value="90">Últimos 90 días</option><option value="custom">Personalizado</option>
      </Select>
      {period === 'custom' && <>
        <Input label="Desde" name="from" type="date" required density="compact" />
        <Input label="Hasta" name="to" type="date" required density="compact" />
      </>}
      <Button type="submit" density="compact" icon={null} disabled={loading}>Aplicar período</Button>
      <Button type="button" density="compact" variant="secondary" icon={null}
        disabled={loading} onClick={refresh}>Actualizar</Button>
    </form>
    {error && <p role="alert">{error}</p>}
    <p className="admin-muted">Fechas en Venezuela (America/Caracas), máximo 366 días.
      El período filtra actividad y progreso. Las cuentas, el catálogo y los reportes muestran totales actuales.</p>
  </section>;
}
