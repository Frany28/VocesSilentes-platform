import { test } from 'node:test';
import assert from 'node:assert/strict';
import { authFixture, registered } from './fixture.js';

const fixture = authFixture();
test('cambio de contraseña: el límite devuelve JSON coherente y no altera credenciales tras intentos fallidos', async () => {
  const user = await registered(fixture);
  const before = await fixture.database.user.findUnique({ where: { id: user.user.id } });
  for (let index = 0; index < 10; index++) {
    await user.agent
      .put('/api/account/password')
      .set('X-CSRF-Token', user.csrf)
      .send({
        currentPassword: 'Incorrecta de prueba',
        newPassword: 'Nueva contraseña de prueba 2026!',
      })
      .expect(400);
  }
  const limited = await user.agent
    .put('/api/account/password')
    .set('X-CSRF-Token', user.csrf)
    .send({ currentPassword: user.input.password, newPassword: 'Nueva contraseña de prueba 2026!' })
    .expect(429);
  assert.equal(limited.body.error.code, 'ACCOUNT_RATE_LIMIT');
  assert.equal(
    (await fixture.database.user.findUnique({ where: { id: user.user.id } })).passwordHash,
    before.passwordHash,
  );
});

test('cambio de contraseña: fallo de bitácora revierte hash y revocación de otras sesiones', async () => {
  const user = await registered(fixture);
  await fixture.service.login(user.input);
  const before = await fixture.database.user.findUnique({ where: { id: user.user.id } });
  await fixture.db.exec(`CREATE FUNCTION reject_password_audit() RETURNS trigger LANGUAGE plpgsql AS
    $$ BEGIN RAISE EXCEPTION 'isolated audit failure'; END $$;
    CREATE TRIGGER reject_password_audit BEFORE INSERT ON vocessilentes."AuditLog"
    FOR EACH ROW EXECUTE FUNCTION reject_password_audit();`);
  try {
    await user.agent
      .put('/api/account/password')
      .set('X-CSRF-Token', user.csrf)
      .send({
        currentPassword: user.input.password,
        newPassword: 'Nueva contraseña de prueba 2026!',
      })
      .expect(500);
    assert.equal(
      (await fixture.database.user.findUnique({ where: { id: user.user.id } })).passwordHash,
      before.passwordHash,
    );
    assert.equal(
      await fixture.database.session.count({ where: { userId: user.user.id, revokedAt: null } }),
      2,
    );
  } finally {
    await fixture.db.exec('DROP TRIGGER reject_password_audit ON vocessilentes."AuditLog"');
  }
});
