import { test } from 'node:test';
import assert from 'node:assert/strict';
import { metricsPeriod } from '../src/modules/admin/metrics-period.js';

test('períodos usan el día de Caracas aun después de medianoche UTC; aceptan 366 días y rechazan futuros', () => {
  const now = new Date('2026-11-06T02:00:00Z');
  const week = metricsPeriod({ period: '7' }, now);
  assert.equal(week.startDay, '2026-10-30');
  assert.equal(week.endDay, '2026-11-05');
  assert.equal(week.days.length, 7);
  assert.equal(
    metricsPeriod({ period: 'custom', from: '2024-01-01', to: '2024-12-31' }, now).days.length,
    366,
  );
  for (const query of [
    { period: 'custom', from: '2026-11-05', to: '2026-11-06' },
    { period: 'custom', from: '2026-02-30', to: '2026-03-01' },
    { period: 'custom', from: '2024-01-01', to: '2025-01-01' },
    { period: 'custom', from: '2026-11-05', to: '2026-11-04' },
    { period: '30', from: '2026-11-01' },
    { period: 'custom' },
    { period: '7', role: 'USER' },
  ])
    assert.throws(() => metricsPeriod(query, now));
});
