import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { registered } from './fixture.js';
import { evidenceFixture, newReport, uploadEvidence } from './evidence.fixture.js';

const { fixture, storage } = evidenceFixture();

test('evidencia HTTP: anónimo, CSRF, propiedad, ADMIN vigente y degradación del rol', async () => {
  const owner = await registered(fixture);
  const other = await registered(fixture);
  const admin = await registered(fixture);
  await fixture.database.user.update({ where: { id: admin.user.id }, data: { role: 'ADMIN' } });
  const report = await newReport(owner);
  const base = `/api/reports/${report.id}`;
  for (const path of ['/api/reports', base, `${base}/evidence/access`])
    await request(fixture.app).get(path).expect(401);
  await request(fixture.app).put(`${base}/evidence`).send('fake.jpg').expect(401);
  await owner.agent.put(`${base}/evidence`).send('fake.jpg').expect(403);
  await other.agent.get(base).expect(404);
  await other.agent.get(`${base}/evidence/access`).expect(404);
  assert.equal((await uploadEvidence(other, report.id)).status, 404);
  assert.equal((await uploadEvidence(admin, report.id)).status, 404);
  assert.equal((await owner.agent.get(`${base}/evidence/access`)).status, 404);
  assert.equal((await uploadEvidence(owner, report.id)).status, 204);
  for (const account of [owner, admin]) {
    const result = await account.agent.get(`${base}/evidence/access`).expect(200);
    assert.ok(result.body.data.src.includes('test-token'));
    assert.ok(result.headers['cache-control'].includes('no-store'));
  }
  const read = (await owner.agent.get(base).expect(200)).body.data.report;
  assert.equal(read.evidence.state, 'READY');
  assert.equal(read.evidence.path, undefined);
  assert.equal(read.evidence.src, undefined);
  const own = (await other.agent.get('/api/reports').expect(200)).body.data;
  assert.equal(own.total, 0);
  await fixture.database.user.update({ where: { id: admin.user.id }, data: { role: 'USER' } });
  await admin.agent.get(`${base}/evidence/access`).expect(404);
  assert.equal(storage.uploads, 1);
});

test('reportes: reintento idempotente, una evidencia, sin sobrescritura ni datos de propietario del cliente', async () => {
  const account = await registered(fixture);
  const requestId = randomUUID();
  const first = await newReport(account, requestId);
  assert.equal((await newReport(account, requestId)).id, first.id);
  assert.equal((await uploadEvidence(account, first.id)).status, 204);
  const uploads = storage.uploads;
  assert.equal((await uploadEvidence(account, first.id)).status, 204);
  assert.equal(storage.uploads, uploads);
  await account.agent
    .post('/api/reports')
    .set('X-CSRF-Token', account.csrf)
    .send({
      requestId,
      category: 'TECHNICAL',
      description: 'Distinto',
      authorId: randomUUID(),
    })
    .expect(400);
  await account.agent
    .post('/api/reports')
    .set('X-CSRF-Token', account.csrf)
    .send({
      requestId,
      category: 'OTHER',
      description: 'Distinto',
    })
    .expect(409);
});

test('evidencia HTTP: contenido falso, corrupto y cuerpo excesivo nunca llegan a Storage', async () => {
  const account = await registered(fixture);
  const report = await newReport(account);
  const previous = storage.uploads;
  for (const payload of ['fake.jpg', '<svg/>', 'GIF89a', '%PDF-1.7']) {
    const response = await account.agent
      .put(`/api/reports/${report.id}/evidence`)
      .set('X-CSRF-Token', account.csrf)
      .set('Content-Type', 'image/jpeg')
      .send(Buffer.from(payload));
    assert.equal(response.status, 422);
  }
  assert.equal((await uploadEvidence(account, report.id, Buffer.alloc(5242881))).status, 413);
  assert.equal(storage.uploads, previous);
});
