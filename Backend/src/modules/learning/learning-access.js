import { curriculumPlan } from './curriculum-plan.js';

/**
 * Lee publicaciones y metadatos de borradores del plan; las lecciones siguen protegidas por separado.
 * @param {string | undefined} previewModuleId UUID permitido únicamente por el entorno local aislado.
 * @returns {object} Filtro Prisma; nunca se deriva de query, body o rol del navegador.
 */
export function accessibleModules(previewModuleId) {
  return {
    OR: [
      { publicationStatus: 'PUBLISHED' },
      { publicationStatus: 'DRAFT', contentKey: { in: curriculumPlan.map((item) => item.key) } },
      ...(previewModuleId ? [{ id: previewModuleId }] : []),
    ],
  };
}

/**
 * Exige publicación de lección y padre salvo el único módulo de revisión local autorizado.
 * @param {string | undefined} previewModuleId UUID de vista previa inyectado por servidor local.
 * @returns {object} Filtro de lectura y mutaciones educativo.
 */
export function accessibleLessons(previewModuleId) {
  return {
    OR: [
      { publicationStatus: 'PUBLISHED', module: { publicationStatus: 'PUBLISHED' } },
      ...(previewModuleId ? [{ moduleId: previewModuleId }] : []),
    ],
  };
}
