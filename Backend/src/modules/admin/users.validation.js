import { z } from 'zod';
import { loginSchema, registrationSchema } from '../auth/auth.validation.js';

const identity = registrationSchema.omit({ password: true }).extend({
  lastName: registrationSchema.shape.lastName.nullable(),
  role: z.enum(['USER', 'ADMIN']),
});
export const createUserSchema = identity.extend({
  // Admin permite desde 8 caracteres; conserva los límites y la contraseña exacta de auth.
  password: loginSchema.shape.password.refine((value) => [...value].length >= 8),
  isActive: z.boolean(),
});
export const editUserSchema = identity.required({ firstName: true, email: true, username: true });
export const userIdSchema = z.uuid();
