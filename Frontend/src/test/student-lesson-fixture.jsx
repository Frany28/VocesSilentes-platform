import { vi } from 'vitest';
import { jsonResponse, user } from './auth-fixture.jsx';

export const moduleId = 'a1000001-0000-4000-8000-000000000001';
export const lessonId = 'a1000001-0000-4000-8000-000000000002';
export const nextId = 'a1000001-0000-4000-8000-000000000003';
export const lessonPath = `/student/modules/${moduleId}/lessons/${lessonId}`;
export const lessonTitle = '¿Qué es la Lengua de Señas Venezolana?';

/**
 * Prepara un catálogo API simulado con títulos repetidos; los IDs distinguen las lecturas.
 * @returns {object} Snapshot editable exclusivo de las pruebas de transporte frontend.
 */
export function lessonSnapshot() {
  const lessons = [
    {
      id: lessonId,
      title: lessonTitle,
      description:
        'Objetivo: Conocer la LSV.\n\nBorrador educativo inicial.\n\nPrimera explicación.',
    },
    { id: nextId, title: lessonTitle, description: 'Texto anterior sin objetivo separado.' },
  ].map((lesson) => ({
    ...lesson,
    status: 'NOT_STARTED',
    publicationStatus: 'PUBLISHED',
    exercises: [],
  }));
  return {
    source: 'api',
    modules: [
      {
        id: moduleId,
        title: 'Descubriendo la LSV y mis primeras señas',
        description: 'Módulo inicial en revisión',
        access: 'available',
        illustration: 'secondary',
        lessons,
        nextLesson: { ...lessons[0], position: 1 },
      },
    ],
  };
}

/**
 * Simula exclusivamente sesión y GET learning; cualquier otra petición revela una escritura accidental.
 * @param {Function} [read] Respuesta del catálogo o promesa diferida.
 * @returns {Function} Fetch controlado; no prueba conectividad real del backend.
 */
export function mockLessonApi(read = () => jsonResponse({ data: lessonSnapshot() })) {
  const fetchMock = vi.fn((url, options) => {
    if ((options.method ?? 'GET') !== 'GET')
      throw new Error('Escritura no autorizada en la prueba de lectura');
    if (url.endsWith('/me')) return Promise.resolve(jsonResponse({ data: { user } }));
    if (url.endsWith('/learning')) return Promise.resolve(read(options));
    throw new Error('Ruta inesperada');
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}
