import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { authFixture, registered } from './fixture.js';
import { newReport } from './evidence.fixture.js';

const fixture = authFixture();
const change = (actor, id, body) =>
  actor.agent.patch(`/api/reports/${id}/status`).set('X-CSRF-Token', actor.csrf).send(body);

test('cinco reportes HTTP: listado, resolución, privacidad, reapertura y eventos atómicos', async () => {
  const student = await registered(fixture);
  const admin = await registered(fixture);
  await fixture.database.user.update({ where: { id: admin.user.id }, data: { role: 'ADMIN' } });
  const reports = [];
  for (let n = 0; n < 5; n += 1) reports.push(await newReport(student));
  const page = (await admin.agent.get('/api/reports').expect(200)).body.data;
  assert.equal(page.total, 5);
  assert.equal(new Set(page.reports.map((row) => row.id)).size, 5);
  const id = reports[0].id;
  const input = { status: 'RESOLVED', internalComment: 'Nota interna académica' };
  await request(fixture.app).patch(`/api/reports/${id}/status`).send(input).expect(401);
  await change(student, id, input).expect(403);
  await admin.agent.patch(`/api/reports/${id}/status`).send(input).expect(403);
  const resolved = (await change(admin, id, input).expect(200)).body.data.report;
  assert.equal(resolved.status, 'RESOLVED');
  assert.equal(resolved.internalComment, input.internalComment);
  assert.ok(resolved.resolvedBy);
  assert.equal(
    (await fixture.database.report.findUnique({ where: { id } })).resolvedById,
    admin.user.id,
  );
  assert.equal(
    'internalComment' in (await student.agent.get(`/api/reports/${id}`)).body.data.report,
    false,
  );
  await change(admin, id, input).expect(200);
  await change(admin, id, { ...input, internalComment: 'Otra nota' }).expect(409);
  await change(admin, id, { status: 'PENDING', internalComment: input.internalComment }).expect(
    200,
  );
  const current = (await admin.agent.get(`/api/reports/${id}`).expect(200)).body.data.report;
  assert.equal(current.status, 'PENDING');
  assert.equal(current.resolvedAt, null);
  const logs = await fixture.database.auditLog.findMany({
    where: { entityId: id },
    orderBy: { createdAt: 'asc' },
  });
  assert.deepEqual(
    logs.map((row) => row.operation),
    ['REPORT_CREATED', 'REPORT_RESOLVED', 'REPORT_REOPENED'],
  );
  await change(admin, id, { status: 'RESOLVED', actorId: student.user.id }).expect(400);
  await change(admin, randomUUID(), input).expect(404);
  await admin.agent.delete(`/api/reports/${id}`).set('X-CSRF-Token', admin.csrf).expect(404);
});

test('fallo SQL en bitácora revierte la resolución y la creación del reporte', async () => {
  const student = await registered(fixture);
  const admin = await registered(fixture);
  await fixture.database.user.update({ where: { id: admin.user.id }, data: { role: 'ADMIN' } });
  const report = await newReport(student);
  const count = await fixture.database.report.count();
  await fixture.db.exec(`ALTER TABLE vocessilentes."AuditLog"
    ADD CONSTRAINT academic_audit_failure CHECK ("entityType" <> 'Report') NOT VALID`);
  try {
    await change(admin, report.id, { status: 'RESOLVED' }).expect(500);
    await student.agent
      .post('/api/reports')
      .set('X-CSRF-Token', student.csrf)
      .send({ requestId: randomUUID(), category: 'OTHER', description: 'No persistir' })
      .expect(500);
    assert.equal(await fixture.database.report.count(), count);
    assert.equal(
      (await fixture.database.report.findUnique({ where: { id: report.id } })).status,
      'PENDING',
    );
  } finally {
    await fixture.db.exec(
      'ALTER TABLE vocessilentes."AuditLog" DROP CONSTRAINT academic_audit_failure',
    );
  }
});
