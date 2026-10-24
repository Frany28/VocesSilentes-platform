import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';

import { authFixture, registered } from './fixture.js';

const objects = new Map();
const photoStorage = {
  async upload(path, bytes) {
    objects.set(path, bytes);
  },
  async remove(path) {
    objects.delete(path);
  },
  async read(path) {
    return objects.get(path);
  },
};
const fixture = authFixture({ photoStorage });

test('foto: un fallo SQL revierte carga o borrado sin perder la referencia y los bytes anteriores', async () => {
  const user = await registered(fixture);
  const input = await sharp({
    create: { width: 10, height: 10, channels: 3, background: '#336699' },
  })
    .png()
    .toBuffer();
  await fixture.db.exec(`CREATE FUNCTION reject_photo_audit() RETURNS trigger LANGUAGE plpgsql AS
    $$ BEGIN RAISE EXCEPTION 'isolated audit failure'; END $$;
    CREATE TRIGGER reject_photo_audit BEFORE INSERT ON vocessilentes."AuditLog"
    FOR EACH ROW EXECUTE FUNCTION reject_photo_audit();`);
  try {
    await user.agent
      .put('/api/account/photo')
      .set('X-CSRF-Token', user.csrf)
      .set('Content-Type', 'application/octet-stream')
      .send(input)
      .expect(500);
    assert.equal(objects.size, 0);
    assert.equal(
      (await fixture.database.user.findUnique({ where: { id: user.user.id } })).profileImagePath,
      null,
    );
  } finally {
    await fixture.db.exec('DROP TRIGGER reject_photo_audit ON vocessilentes."AuditLog"');
  }
  const saved = await user.agent
    .put('/api/account/photo')
    .set('X-CSRF-Token', user.csrf)
    .set('Content-Type', 'application/octet-stream')
    .send(input)
    .expect(200);
  const path = saved.body.data.user.profileImagePath;
  await fixture.db.exec(`CREATE TRIGGER reject_photo_audit BEFORE INSERT ON vocessilentes."AuditLog"
    FOR EACH ROW EXECUTE FUNCTION reject_photo_audit();`);
  try {
    await user.agent.delete('/api/account/photo').set('X-CSRF-Token', user.csrf).expect(500);
    assert.ok(objects.has(path));
    assert.equal(
      (await fixture.database.user.findUnique({ where: { id: user.user.id } })).profileImagePath,
      path,
    );
  } finally {
    await fixture.db.exec('DROP TRIGGER reject_photo_audit ON vocessilentes."AuditLog"');
  }
});
