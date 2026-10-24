import { z } from 'zod';

export const reportIdSchema = z.uuid();
export const reportStatusSchema = z
  .object({
    status: z.enum(['PENDING', 'RESOLVED']),
    internalComment: z.string().trim().max(2000).default(''),
  })
  .strict();
export const createReportSchema = z
  .object({
    requestId: z.uuid(),
    description: z.string().trim().min(1).max(4000),
    category: z.enum(['CONTENT', 'TECHNICAL', 'OTHER']),
  })
  .strict();

export const reportPageSchema = z
  .object({
    page: z.coerce.number().int().min(1).max(100000).default(1),
    q: z.string().trim().max(200).default(''),
    status: z.enum(['', 'PENDING', 'RESOLVED']).default(''),
  })
  .strict();
