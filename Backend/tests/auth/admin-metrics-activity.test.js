import { test } from 'node:test';
import assert from 'node:assert/strict';
import { authFixture } from './fixture.js';
import { seedMetrics } from './metrics.fixture.js';
import { readAdminMetrics } from '../../src/modules/admin/metrics.service.js';

const fixture = authFixture();
test('actividad: ventanas exactas [inicio,fin), personas únicas y atribución al actor, incluso en cuentas deshabilitadas', async () => {
  const data = await seedMetrics(fixture);
  const query = { period: 'custom', from: '2026-10-01', to: '2026-10-31' };
  const now = new Date('2026-11-05T16:00:00Z');
  const event = await fixture.database.auditLog.create({
    data: {
      actorId: data.quiet.id,
      entityId: data.student.user.id,
      operation: 'USER_UPDATED',
      createdAt: new Date('2026-10-02T03:59:59.999Z'),
    },
  });
  for (const [date, expected7, expected30] of [
    ['2026-10-02T03:59:59.999Z', 1, 3],
    ['2026-10-02T04:00:00Z', 1, 4],
    ['2026-10-25T03:59:59.999Z', 1, 4],
    ['2026-10-25T04:00:00Z', 2, 4],
    ['2026-11-01T04:00:00Z', 1, 3],
  ]) {
    await fixture.database.auditLog.update({
      where: { id: event.id },
      data: { createdAt: new Date(date) },
    });
    const result = await readAdminMetrics(fixture.database, query, now);
    assert.equal(result.activity.active7, expected7, date);
    assert.equal(result.activity.active30, expected30, date);
    assert.equal(result.activity.daily.find((day) => day.day === '2026-10-20').users, 1);
    assert.equal(result.disabledUsers, 1);
  }
  const auditBefore = await fixture.database.auditLog.count();
  const sessionsBefore = await fixture.database.session.count();
  await readAdminMetrics(fixture.database, query, now);
  assert.equal(await fixture.database.auditLog.count(), auditBefore);
  assert.equal(await fixture.database.session.count(), sessionsBefore);
});
