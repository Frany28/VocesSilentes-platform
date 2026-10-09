/**
 * Construye los escenarios originales de Figma sin asociarlos al usuario ni persistirlos.
 * Las disponibilidades son fixtures de diseño; no constituyen una política de prerrequisitos.
 * @param {AbortSignal} signal Cancelación del consumidor.
 * @param {string} scenario Estado de desarrollo.
 * @returns {Promise<object>} Instantánea explícitamente demostrativa.
 * @throws {Error} Fallo de conexión simulado, solo al elegir error.
 */
export async function readDemoSnapshot(signal, scenario) {
  signal.throwIfAborted();
  if (scenario === 'loading') {
    await new Promise((resolve, reject) => {
      signal.addEventListener('abort', () => reject(signal.reason), { once: true });
    });
  }
  if (scenario === 'error') throw new Error('Escenario de conexión de demostración');
  if (scenario === 'empty') return { source: 'demo', modules: [] };
  const completed = scenario === 'completed' ? 5 : scenario === 'first' ? 0 : 3;
  const lessons = (id, count) =>
    Array.from({ length: 5 }, (_, index) => ({
      id: `${id}-${index + 1}`,
      publicationStatus: 'PUBLISHED',
      status:
        index < count ? 'COMPLETED' : index === count && count > 0 ? 'IN_PROGRESS' : 'NOT_STARTED',
    }));
  return {
    source: 'demo',
    modules: [
      {
        id: 'saludos',
        title: 'Saludos y presentaciones',
        displayTitle: 'Saludos y\npresentaciones',
        description: 'Aprende a saludar y presentarte con confianza.',
        access: 'available',
        lessons: lessons('saludos', completed),
        illustration: 'secondary',
        nextLesson: {
          title: completed ? 'Cómo presentarme' : 'Saludos básicos',
          position: completed ? 4 : 1,
        },
      },
      {
        id: 'personas',
        title: 'Personas y relaciones',
        displayTitle: 'Personas y\nrelaciones',
        description: 'Reconoce señas para hablar de quienes te rodean.',
        access: scenario === 'completed' ? 'available' : 'locked',
        lessons: lessons('personas', 0),
        lockReason: 'Completa Saludos y presentaciones',
        illustration: 'tertiary',
        nextLesson: { title: 'Personas y relaciones', position: 1 },
      },
      {
        id: 'vida',
        title: 'Vida cotidiana',
        displayTitle: 'Vida\ncotidiana',
        description: 'Expresa ideas sencillas de tu día a día.',
        access: 'locked',
        lessons: lessons('vida', 0),
        illustration: 'accent',
        lockReason: 'Completa Personas y relaciones',
      },
    ],
  };
}
