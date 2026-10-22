import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { registered } from './fixture.js';
import { evidenceFixture, newReport, uploadEvidence } from './evidence.fixture.js';

const { fixture, storage, objects } = evidenceFixture();

test('evidencia: carga fallida limpia el objeto, conserva el reporte y permite reintento', async () => {
  const owner = await registered(fixture);
  const report = await newReport(owner);
  storage.failUpload = true;
  const response = await uploadEvidence(owner, report.id);
  assert.equal(response.status, 503);
  assert.equal(response.body.error.code, 'EVIDENCE_UPLOAD_FAILED');
  assert.equal(objects.size, 0);
  assert.equal(await fixture.database.reportEvidence.count(), 0);
  assert.equal((await owner.agent.get(`/api/reports/${report.id}`)).status, 200);
  storage.failUpload = false;
  assert.equal((await uploadEvidence(owner, report.id)).status, 204);
});

test('evidencia: fallo de compensación conserva ruta durable; cleanup recupera tras reinicio', async () => {
  const owner = await registered(fixture);
  const report = await newReport(owner);
  storage.failUpload = true;
  storage.failRemove = true;
  assert.equal((await uploadEvidence(owner, report.id)).status, 503);
  const reservation = await fixture.database.reportEvidence.findUnique({
    where: { reportId: report.id },
  });
  assert.equal(reservation.state, 'DELETING');
  assert.equal((await uploadEvidence(owner, report.id)).status, 409);
  storage.failUpload = false;
  storage.failRemove = false;
  assert.equal(await fixture.reportsService.cleanup(), 1);
  assert.equal(
    await fixture.database.reportEvidence.findUnique({ where: { reportId: report.id } }),
    null,
  );
  assert.equal(objects.has(reservation.path), false);
  assert.equal((await uploadEvidence(owner, report.id)).status, 204);
});

test('evidencia: purga PENDING antiguo, conserva PENDING activo y READY', async () => {
  const owner = await registered(fixture);
  const reports = [await newReport(owner), await newReport(owner)];
  for (const [index, report] of reports.entries()) {
    const id = randomUUID();
    await fixture.database.reportEvidence.create({
      data: {
        id,
        reportId: report.id,
        ownerId: owner.user.id,
        path: `${owner.user.id}/${report.id}/${id}`,
        mimeType: 'image/png',
        size: 12,
        digest: 'a'.repeat(64),
        createdAt: new Date(Date.now() - (index ? 0 : 1000000)),
      },
    });
  }
  const readyBefore = await fixture.database.reportEvidence.count({ where: { state: 'READY' } });
  assert.equal(await fixture.reportsService.cleanup(), 1);
  assert.equal(
    await fixture.database.reportEvidence.count({ where: { state: 'READY' } }),
    readyBefore,
  );
  assert.ok(
    await fixture.database.reportEvidence.findUnique({ where: { reportId: reports[1].id } }),
  );
});
