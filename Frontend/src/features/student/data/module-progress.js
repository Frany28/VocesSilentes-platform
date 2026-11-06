/**
 * Deriva progreso sobre el conjunto publicado; cero lecciones nunca implica completado.
 * @param {object} module Módulo con lecciones y acceso explícito del adaptador.
 * @returns {object} Conteos, porcentaje y estado semántico de la tarjeta.
 */
export function moduleProgress(module) {
  const lessons = module.lessons.filter(
    (lesson) => lesson.publicationStatus === 'PUBLISHED' || module.preview === true,
  );
  const completed = lessons.filter((lesson) => lesson.status === 'COMPLETED').length;
  const total = lessons.length;
  const percent = total ? Math.round((100 * completed) / total) : 0;
  const started = lessons.some((lesson) => lesson.status !== 'NOT_STARTED');
  const state =
    module.access === 'upcoming' || total === 0
      ? 'upcoming'
      : module.access === 'locked'
        ? 'locked'
        : total > 0 && completed === total
          ? 'completed'
          : started
            ? 'progress'
            : 'available';
  return { total, completed, percent, state };
}

/**
 * Etiqueta curricular derivada del orden persistido; no inventa un nivel si falta ese dato.
 * @param {object} module Metadatos del catálogo.
 * @returns {string} Número de módulo o etiqueta general.
 */
export function moduleLabel(module) {
  return Number.isInteger(module.order)
    ? `MÓDULO ${String(module.order).padStart(2, '0')} · LSV`
    : 'MÓDULO LSV';
}

/**
 * Filtra por título sin distinguir mayúsculas/acentos y por estado derivado.
 * @param {object[]} modules Catálogo confirmado.
 * @param {string} query Consulta del campo de búsqueda.
 * @param {string} filter Estado o all.
 * @returns {object[]} Resultados, sin modificar el catálogo original.
 */
export function filterModules(modules, query, filter) {
  const normalize = (text) =>
    text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('es');
  const search = normalize(query.trim());
  return modules.filter(
    (module) =>
      normalize(module.title).includes(search) &&
      (filter === 'all' || moduleProgress(module).state === filter),
  );
}
