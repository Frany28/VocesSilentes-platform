import { z } from 'zod';
import { HttpError } from '../../errors/http-error.js';

export const METRICS_TIME_ZONE = 'America/Caracas';
const dayMs = 86400000;
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(Number(date)) && date.toISOString().slice(0, 10) === value;
});
const schema = z.object({ period: z.enum(['7', '30', '90', 'custom']).default('30'),
  from: day.optional(), to: day.optional() }).strict();
const shift = (value, amount) => new Date(Date.parse(value) + amount * dayMs).toISOString().slice(0, 10);

/**
 * Valida hasta 366 días de calendario; los límites de instantes se resuelven en PostgreSQL con zona IANA.
 * @param {object} input Query HTTP sin campos arbitrarios.
 * @param {Date} [now] Reloj único de la instantánea, inyectable en pruebas.
 * @returns {object} Fechas inclusivas y días del gráfico en America/Caracas.
 * @throws {Error} Fechas imposibles, futuras, invertidas o combinaciones ambiguas.
 */
export function metricsPeriod(input = {}, now = new Date()) {
  const query = schema.parse(input);
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: METRICS_TIME_ZONE,
    year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const part = (type) => parts.find((item) => item.type === type).value;
  const today = `${part('year')}-${part('month')}-${part('day')}`;
  const custom = query.period === 'custom';
  if (custom ? !query.from || !query.to : query.from || query.to)
    throw new HttpError(400, 'INVALID_PERIOD', 'Indica ambas fechas solo en un período personalizado.');
  const endDay = custom ? query.to : today;
  const startDay = custom ? query.from : shift(today, 1 - Number(query.period));
  const days = (Date.parse(endDay) - Date.parse(startDay)) / dayMs + 1;
  if (days < 1 || days > 366 || endDay > today)
    throw new HttpError(400, 'INVALID_PERIOD', 'Elige hasta 366 días, sin fechas futuras.');
  return { period: query.period, startDay, endDay, timeZone: METRICS_TIME_ZONE,
    days: Array.from({ length: days }, (_, index) => shift(startDay, index)) };
}
