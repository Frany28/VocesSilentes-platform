import { z } from 'zod';

const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .email()
  .regex(/^[!-~]+$/);
// Las contraseñas no admiten espacios en blanco (decisión del 7 de noviembre de 2026, también en login).
const password = z
  .string()
  .refine((value) => [...value].length <= 128 && Buffer.byteLength(value) <= 512)
  .refine((value) => !/\s/u.test(value));
export const registrationSchema = z.strictObject({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100).optional(),
  email,
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_]{3,50}$/),
  password: password.refine((value) => [...value].length >= 15),
});
export const loginSchema = z.strictObject({ email, password: password.min(1) });
