import { readFile } from 'node:fs/promises';

export const introductionModuleId = 'a1000001-0000-4000-8000-000000000001';
export const introductionLessonId = 'a1000001-0000-4000-8000-000000000002';

/**
 * Inserta únicamente el módulo y su lectura en la base efímera del procedimiento local.
 * @param {object} database Prisma conectado a PostgreSQL WASM aislado, nunca a una URL externa.
 * @returns {Promise<object>} Módulo creado con su lección; no crea ejercicios ni progreso.
 * @throws {Error} Si falla la lectura o hay conflicto de IDs/orden; no actualiza registros existentes.
 */
export async function seedIntroduction(database) {
  const description = await readFile(
    new URL('../../content/lsv-introduction.txt', import.meta.url),
    'utf8',
  );
  return database.module.create({
    data: {
      id: introductionModuleId,
      title: 'Descubriendo la LSV y mis primeras señas',
      description: 'Módulo 1 · Introducción a la LSV. Contenido educativo inicial en revisión.',
      order: 1,
      publicationStatus: 'PUBLISHED',
      lessons: {
        create: {
          id: introductionLessonId,
          title: '¿Qué es la Lengua de Señas Venezolana?',
          description,
          order: 1,
          publicationStatus: 'PUBLISHED',
        },
      },
    },
    include: { lessons: true },
  });
}
