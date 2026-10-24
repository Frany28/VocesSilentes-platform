import { z } from 'zod';
import { loginSchema, registrationSchema } from '../auth/auth.validation.js';

const identity = registrationSchema.omit({ password: true }).extend({
  lastName: registrationSchema.shape.lastName.nullable(),
  role: z.enum(['USER', 'ADMIN']),
});
export const createUserSchema = identity.extend({
  // Admin permite desde 8 caracteres; conserva los límites y la contraseña exacta de auth.
  password: loginSchema.shape.password
    .refine((value) => [...value].length >= 8)
    .regex(/\p{Lu}/u)
    .regex(/[\p{P}\p{S}]/u),
  isActive: z.boolean(),
});
export const editUserSchema = identity.required({ firstName: true, email: true, username: true });
export const userIdSchema = z.uuid();
export const userStateSchema = z.strictObject({ isActive: z.boolean() });
export const paginationSchema = z.strictObject({
  page: z.coerce.number().int().min(1).max(1000000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export const listUsersSchema = paginationSchema.extend({
  q: z.string().trim().max(100).default(''),
  role: z.enum(['USER', 'ADMIN']).optional(),
});
