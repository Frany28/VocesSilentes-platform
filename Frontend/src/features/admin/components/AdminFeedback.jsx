import { Button } from '../../../components/ui/Button.jsx';

/**
 * Distingue carga real, fallo, vacío inicial y búsqueda sin resultados, con recuperación manual.
 * @param {{status: string, noun?: string, error?: object, retry?: Function}} props Estado de lectura.
 * @returns {import('react').ReactElement} Mensaje accesible y esqueleto sin temporizadores simulados.
 */
export function AdminFeedback({ status, noun = 'usuarios', error, retry }) {
  const title =
    status === 'loading'
      ? `Cargando ${noun}…`
      : status === 'error'
        ? 'No pudimos cargar la información'
        : status === 'no-data'
          ? 'Todavía no hay cuentas'
          : 'No encontramos resultados';
  return (
    <section className="admin-feedback admin-panel" aria-busy={status === 'loading'}>
      <h2 role={status === 'error' ? 'alert' : 'status'}>{title}</h2>
      <p>
        {status === 'loading'
          ? 'Estamos recuperando la información.'
          : status === 'error'
            ? error?.message || 'Comprueba tu conexión y vuelve a intentarlo.'
            : status === 'no-data'
              ? 'Las cuentas aparecerán aquí cuando estén disponibles.'
              : 'Prueba con otro término o ajusta los filtros.'}
      </p>
      {status === 'loading' && (
        <div className="admin-skeleton" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      )}
      {status !== 'loading' && retry && (
        <Button variant="secondary" icon={null} onClick={retry}>
          {status === 'error' ? 'Reintentar' : 'Ver todos'}
        </Button>
      )}
    </section>
  );
}
