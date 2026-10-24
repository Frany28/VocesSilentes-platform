import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import request from 'supertest';
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

test('foto: valida bytes y recorte real, persiste, autoriza lectura y borra del almacenamiento', async () => {
  const user = await registered(fixture);
  const other = await registered(fixture);
  const input = await sharp({
    create: { width: 700, height: 300, channels: 3, background: '#146ccc' },
  })
    .png()
    .toBuffer();
  const upload = (bytes, zoom = '135') =>
    user.agent
      .put(`/api/account/photo?zoom=${zoom}`)
      .set('X-CSRF-Token', user.csrf)
      .set('Content-Type', 'application/octet-stream')
      .send(bytes);
  await upload(Buffer.from('<svg></svg>')).expect(422);
  await upload(input, '200').expect(400);
  assert.equal(objects.size, 0);
  const { body } = await upload(input).expect(200);
  const path = body.data.user.profileImagePath;
  assert.ok(path.startsWith(`${user.user.id}/`));
  const metadata = await sharp(objects.get(path)).metadata();
  assert.equal(metadata.width, 512);
  assert.equal(metadata.height, 512);
  assert.equal(metadata.format, 'webp');
  assert.equal(metadata.exif, undefined);
  const me = await user.agent.get('/api/auth/me').expect(200);
  assert.equal(me.body.data.user.profileImagePath, path);
  const read = `/api/account/photos/${user.user.id}/image`;
  await request(fixture.app).get(read).expect(401);
  await other.agent.get(read).expect(403);
  await user.agent
    .get(read)
    .expect('Content-Type', /image\/webp/)
    .expect(200);
  await fixture.database.user.update({ where: { id: other.user.id }, data: { role: 'ADMIN' } });
  await other.agent.get(read).expect(200);
  await user.agent.delete('/api/account/photo').set('X-CSRF-Token', user.csrf).expect(200);
  assert.equal(objects.size, 0);
  await user.agent.get(read).expect(404);
  assert.equal(
    (await fixture.database.user.findUnique({ where: { id: user.user.id } })).profileImagePath,
    null,
  );
});
