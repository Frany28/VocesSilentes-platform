import { curriculumPlan } from '../../src/modules/learning/curriculum-plan.js';
import { alphabetId } from './alphabet-source.js';

const academicDescription =
  'Contenido sintético para probar formularios y persistencia; no es una lección LSV validada.';

/**
 * Proyecta cambios de metadatos; reconoce las pruebas académicas por ID, título y descripción exactos.
 * @param {object[]} modules Filas actuales, sin datos personales.
 * @param {object} source Paquete de alfabeto validado.
 * @returns {object[]} Plan auditable; no publica, borra ni altera avances.
 * @throws {Error} Ante colisiones entre claves e identificadores.
 */
export function planCurriculum(modules, source) {
  const planned = curriculumPlan.map((item) => {
    const id = alphabetId(item.key);
    const current = modules.find((row) => row.id === id || row.contentKey === item.key);
    if (current && (current.id !== id || current.contentKey !== item.key))
      throw new Error('Colisión curricular; revisar los identificadores antes de aplicar');
    return {
      id,
      contentKey: item.key,
      title: item.title,
      description:
        current?.description ??
        (item.order === 1
          ? source.moduleDescription
          : 'Contenido en preparación. Todavía no hay lecciones publicadas.'),
      order: item.order,
      publicationStatus: current?.publicationStatus ?? 'DRAFT',
      action: current ? 'PRESERVE_CONTENT' : 'CREATE_DRAFT',
    };
  });
  const ids = new Set(planned.map((item) => item.id));
  const remaining = modules.filter((item) => !ids.has(item.id)).sort((a, b) => a.order - b.order);
  return [
    ...planned,
    ...remaining.map((item, index) => {
      const suffix = Number(item.id.slice(-12));
      const fixture =
        suffix >= 1 &&
        suffix <= 5 &&
        item.id === `20000000-0000-4000-8000-${String(suffix).padStart(12, '0')}` &&
        item.title === `Práctica académica ${suffix}` &&
        item.description === academicDescription;
      return {
        id: item.id,
        order: planned.length + index + 1,
        ...(fixture ? { publicationStatus: 'DRAFT' } : {}),
        action: fixture ? 'RETIRE_SYNTHETIC_KEEP_PROGRESS' : 'PRESERVE_CONTENT',
      };
    }),
  ];
}
