import { z } from 'zod';

/**
 * Valida la URL pública del backend; excluye credenciales, consulta y fragmento.
 * @param {Record<string, unknown>} env Entorno público de Vite.
 * @returns {{apiUrl: string, studentDemo: boolean}} Configuración pública validada, nunca permisos.
 * @throws {Error} Si la URL o el indicador de demostración no son válidos.
 */
export function parsePublicConfig(env) {
  const result = z
    .string()
    .url()
    .refine((value) => {
      if (!URL.canParse(value)) return false;
      const url = new URL(value);
      return (
        ['http:', 'https:'].includes(url.protocol) &&
        !url.username &&
        !url.password &&
        !url.search &&
        !url.hash
      );
    })
    .safeParse(env.VITE_API_URL ?? 'http://localhost:3000/api');
  if (!result.success) throw new Error('Configuración pública inválida: VITE_API_URL');
  const demo = z.enum(['true', 'false']).safeParse(env.VITE_STUDENT_DEMO ?? 'false');
  if (!demo.success) throw new Error('Configuración pública inválida: VITE_STUDENT_DEMO');
  return Object.freeze({
    apiUrl: result.data.replace(/\/+$/, ''),
    studentDemo: demo.data === 'true',
  });
}

export const publicConfig = parsePublicConfig(import.meta.env);
