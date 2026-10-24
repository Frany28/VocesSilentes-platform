import { z } from 'zod';
import { registrationSchema, loginSchema } from '../auth/auth.validation.js';

export const profileSchema = registrationSchema.omit({ password: true }).extend({
  lastName: registrationSchema.shape.lastName.nullable(),
});
export const passwordSchema = z
  .strictObject({
    currentPassword: loginSchema.shape.password,
    newPassword: registrationSchema.shape.password,
  })
  .refine((input) => input.currentPassword !== input.newPassword);
export const photoQuerySchema = z.strictObject({
  zoom: z.coerce.number().int().min(100).max(135).default(100),
});
