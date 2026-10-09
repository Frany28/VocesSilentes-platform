/**
 * Deriva progreso sobre el conjunto publicado; cero lecciones nunca implica completado.
 * @param {object} module Módulo con lecciones y acceso explícito del adaptador.
 * @returns {object} Conteos, porcentaje y estado semántico de la tarjeta.
 */
export function moduleProgress(module) {
  const lessons = module.lessons.filter((lesson) => lesson.publicationStatus === 'PUBLISHED');
  const completed = lessons.filter((lesson) => lesson.status === 'COMPLETED').length;
  const total = lessons.length;
  const percent = total ? Math.round((100 * completed) / total) : 0;
  const started = lessons.some((lesson) => lesson.status !== 'NOT_STARTED');
  const state =
    module.access === 'locked'
      ? 'locked'
      : total > 0 && completed === total
        ? 'completed'
        : started
          ? 'progress'
          : 'available';
  return { total, completed, percent, state };
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
