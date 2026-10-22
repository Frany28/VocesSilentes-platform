import { Button } from '../../../components/ui/Button.jsx';

/**
 * Distingue carga real, fallo, vacío, búsqueda sin resultados y página inexistente.
 * @param {{status: string, noun?: string, error?: object, retry?: Function}} props Lectura y recuperación manual.
 * @returns {import('react').ReactElement} Mensaje accesible y esqueleto sin temporizadores simulados.
 */
export function AdminFeedback({ status, noun = 'usuarios', error, retry }) {
  const collection = noun === 'reportes' ? 'reportes' : 'cuentas';
  const subject = noun === 'reportes' ? 'Los reportes' : 'Las cuentas';
  const messages = {
    loading: [`Cargando ${noun}…`, 'Estamos recuperando la información.'],
    error: [
      'No pudimos cargar la información',
      error?.message || 'Comprueba tu conexión y vuelve a intentarlo.',
    ],
    'no-data': [
      `Todavía no hay ${collection}`,
      `${subject} aparecerán aquí cuando estén disponibles.`,
    ],
    'empty-page': [
      'No hay cuentas en esta página',
      'Vuelve a la primera página para consultar las cuentas disponibles.',
    ],
  };
  const [title, description] = messages[status] ?? [
    'No encontramos resultados',
    'Prueba con otro término o ajusta los filtros.',
  ];
  return (
    <section className="admin-feedback admin-panel" aria-busy={status === 'loading'}>
      <h2 role={status === 'error' ? 'alert' : 'status'}>{title}</h2>
      <p>{description}</p>
      {status === 'loading' && (
        <div className="admin-skeleton" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      )}
      {status !== 'loading' && retry && (
        <Button density="compact" variant="secondary" icon={null} onClick={retry}>
          {status === 'error'
            ? 'Reintentar'
            : status === 'empty-page'
              ? 'Primera página'
              : 'Ver todos'}
        </Button>
      )}
    </section>
  );
}
