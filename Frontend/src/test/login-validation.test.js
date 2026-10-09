import { expect, test } from 'vitest';
import { validateLogin } from '../features/auth/login/login-validation.js';
import { retryAfterSeconds } from '../lib/retry-after.js';
import { safeReturnPath } from '../features/auth/return-path.js';

test('login valida obligatorios, formato ASCII y longitudes reales sin imponer la política de registro', () => {
  expect(validateLogin({ email: '', password: '' })).toEqual({
    email: 'Introduce tu correo electrónico.',
    password: 'Introduce tu contraseña.',
  });
  for (const email of [
    'ana@correo',
    'a@@example.com',
    'á@example.com',
    'a'.repeat(255) + '@example.com',
  ]) {
    expect(validateLogin({ email, password: 'a' })).toHaveProperty('email');
  }
  expect(validateLogin({ email: ' Person@example.com ', password: ' ' })).toEqual({});
  expect(validateLogin({ email: 'person@example.com', password: '😀'.repeat(128) })).toEqual({});
  expect(validateLogin({ email: 'person@example.com', password: '😀'.repeat(129) })).toHaveProperty(
    'password',
  );
});

test('Retry-After conserva segundos y fechas HTTP; nunca inventa tiempos para cabeceras inválidas', () => {
  const now = Date.parse('2026-10-09T12:00:00Z');
  expect(retryAfterSeconds('60', now)).toBe(60);
  expect(retryAfterSeconds('Fri, 09 Oct 2026 12:01:00 GMT', now)).toBe(60);
  expect(retryAfterSeconds('Fri, 09 Oct 2026 11:59:00 GMT', now)).toBe(0);
  for (const value of [null, '', 'invalid', '-1', '1.5', '999999999999999999999']) {
    expect(retryAfterSeconds(value, now)).toBeUndefined();
  }
});

test('destino por rol respeta solamente retornos publicados y autorizados', () => {
  expect(safeReturnPath(undefined, 'USER')).toBe('/account');
  expect(safeReturnPath(undefined, 'ADMIN')).toBe('/admin');
  expect(safeReturnPath('/account', 'ADMIN')).toBe('/account');
  expect(safeReturnPath('/admin', 'USER')).toBe('/account');
  for (const target of ['//evil.invalid', '/admin?next=x', '/account/../admin', '/register', {}]) {
    expect(safeReturnPath(target, 'ADMIN')).toBe('/admin');
  }
});
