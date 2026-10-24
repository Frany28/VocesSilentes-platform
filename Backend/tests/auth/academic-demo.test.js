import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAcademicDatabase } from '../../scripts/academic/database.js';
import {
  academicAdmin,
  academicStudent,
  academicPassword,
} from '../../scripts/academic/credentials.js';
import { createAuthService } from '../../src/modules/auth/auth.service.js';
import { createLearningService } from '../../src/modules/learning/learning.service.js';
import { parseEnv } from '../../src/config/env.js';

test('entrega SQL: credenciales académicas autentican y el catálogo reconstruido es consultable', async () => {
  const state = await createAcademicDatabase({ seed: true });
  try {
    const service = await createAuthService(state.database, parseEnv({ NODE_ENV: 'test' }).auth);
    const admin = await service.login({ email: academicAdmin, password: academicPassword });
    const student = await service.login({ email: academicStudent, password: academicPassword });
    assert.equal(admin.user.role, 'ADMIN');
    assert.equal(student.user.role, 'USER');
    assert.equal((await service.authenticate(student.token)).id, student.user.id);
    const snapshot = await createLearningService(state.database).snapshot(student.user.id);
    assert.equal(snapshot.source, 'api');
    assert.equal(snapshot.modules.length, 5);
    assert.ok(snapshot.modules.every((module) => module.lessons.length === 1));
    await service.logout(student.token);
    assert.equal(await service.authenticate(student.token), null);
  } finally {
    await state.close();
  }
});
