import { z } from 'zod';

const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .email()
  .regex(/^[!-~]+$/);
const password = z
  .string()
  .refine((value) => [...value].length <= 128 && Buffer.byteLength(value) <= 512);
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
