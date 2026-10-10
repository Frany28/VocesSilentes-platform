import { expect, test } from 'vitest';
import { registrationSchema } from '../../../Backend/src/modules/auth/auth.validation.js';
import { validateRegistration } from '../features/auth/registration/registration-validation.js';

test('registro coincide con el contrato real del backend en normalización y límites', () => {
  const base = {
    firstName: 'Persona',
    username: 'persona',
    email: 'person@example.com',
    password: ' A password with spaces 😀 ',
  };
  const cases = [
    {},
    { firstName: '' },
    { firstName: '   ' },
    { firstName: 'a'.repeat(100) },
    { firstName: 'a'.repeat(101) },
    { firstName: '😀'.repeat(100) },
    { firstName: '😀'.repeat(101) },
    { lastName: ' a ' },
    { lastName: 'a'.repeat(100) },
    { lastName: 'a'.repeat(101) },
    { lastName: '😀'.repeat(100) },
    { lastName: '😀'.repeat(101) },
    { username: '' },
    { username: 'ab' },
    { username: 'a_b' },
    { username: 'a'.repeat(50) },
    { username: 'a'.repeat(51) },
    { username: 'Ána' },
    { username: 'ana-1' },
    { username: ' ANA_1 ' },
    { email: '' },
    { email: 'ana@correo' },
    { email: 'á@example.com' },
    { email: `${'a'.repeat(242)}@example.com` },
    { email: `${'a'.repeat(243)}@example.com` },
    { email: ' PERSON@example.com ' },
    { password: '' },
    { password: 'a'.repeat(14) },
    { password: 'a'.repeat(15) },
    { password: 'a'.repeat(128) },
    { password: 'a'.repeat(129) },
    { password: '😀'.repeat(14) },
    { password: '😀'.repeat(15) },
    { password: '😀'.repeat(128) },
    { password: '😀'.repeat(129) },
    { password: ' '.repeat(15) },
  ];
  for (const change of cases) {
    const input = { ...base, ...change };
    const label = Object.entries(change)
      .map(([field, value]) => `${field}:${value.length}`)
      .join(',');
    expect(Object.keys(validateRegistration(input)).length === 0, label).toBe(
      registrationSchema.safeParse(input).success,
    );
  }
});

test('registro permite omitir un apellido vacío, sin modificar la contraseña', () => {
  const input = {
    firstName: 'Persona',
    lastName: '   ',
    username: 'persona',
    email: 'person@example.com',
    password: ' 15 characters 😀 ',
  };
  expect(validateRegistration(input)).toEqual({});
  expect(input.password).toBe(' 15 characters 😀 ');
  const { lastName, ...payload } = input;
  expect(lastName.trim()).toBe('');
  expect(registrationSchema.safeParse(payload).success).toBe(true);
});
