import { alphabetId, alphabetModuleId, readAlphabetSource } from './alphabet-source.js';

/**
 * Habilita las siete lecturas del paquete existente por autorización editorial, sin aprobar LSV ni ejercicios.
 * @param {object} database Prisma del destino autorizado; no crea contenido ni escribe avances.
 * @returns {Promise<object>} Identificadores publicados y cantidad de cambios; repetir no altera contenido.
 * @throws {Error} Ante un paquete incompleto o diferente del conjunto preparado; revierte la operación.
 */
export async function publishAlphabetReading(database) {
  const source = await readAlphabetSource();
  return database.$transaction(
    async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(611050001)`;
      await tx.$executeRaw`SELECT id FROM vocessilentes."Module" WHERE id = ${alphabetModuleId}::uuid FOR UPDATE`;
      const module = await tx.module.findUnique({
        where: { id: alphabetModuleId },
        include: { lessons: { select: { id: true, content: true } } },
      });
      const ids = source.lessons.map((item) => alphabetId(item.id));
      if (
        !module ||
        module.contentKey !== source.moduleKey ||
        module.lessons.length !== ids.length ||
        module.lessons.some(
          (item) =>
            !ids.includes(item.id) ||
            !item.content?.sections?.length ||
            !item.content?.objectives?.length,
        )
      )
        throw new Error('Paquete de lectura incompleto o incompatible; no se publicó contenido');
      const description =
        'Lee siete lecciones sobre el alfabeto manual LSV y registra tu avance. ' +
        'Teoría educativa pendiente de revisión LSV; imágenes y evaluaciones todavía no disponibles.';
      if (module.publicationStatus !== 'PUBLISHED' || module.description !== description)
        await tx.module.update({
          where: { id: module.id },
          data: { publicationStatus: 'PUBLISHED', description },
        });
      const changed = await tx.lesson.updateMany({
        where: { id: { in: ids }, moduleId: module.id, publicationStatus: 'DRAFT' },
        data: { publicationStatus: 'PUBLISHED' },
      });
      return {
        moduleId: module.id,
        lessonIds: ids,
        changedLessons: changed.count,
        publicationStatus: 'PUBLISHED',
        exercisesModified: false,
        linguisticApprovalGranted: false,
      };
    },
    { timeout: 20000 },
  );
}
