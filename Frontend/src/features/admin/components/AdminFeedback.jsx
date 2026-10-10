import { Alert } from '../../../components/ui/Alert.jsx';
import { Button } from '../../../components/ui/Button.jsx';

/**
 * Estados de carga, vacío y error; conserva la distinción entre demo y respuesta real.
 * @param {{status: string, noun?: string, error?: object, retry?: Function}} props Estado y recuperación.
 * @returns {import('react').ReactElement} Mensaje y acción accesibles.
 */
export function AdminFeedback({ status, noun = 'usuarios', error, retry }) {
  const title =
    status === 'loading'
      ? `Preparando ${noun}…`
      : status === 'error'
        ? `No pudimos cargar ${noun}`
        : 'No encontramos resultados';
  return (
    <section className="admin-panel admin-feedback" aria-busy={status === 'loading'}>
      <Alert tone={status === 'error' ? 'error' : 'info'} title={title}>
        {status === 'loading'
          ? 'Estamos recuperando la información.'
          : status === 'error'
            ? error?.message || 'Comprueba tu conexión y vuelve a intentarlo.'
            : 'Prueba con otro término o vuelve a ver la lista completa.'}
      </Alert>
      {status !== 'loading' && retry && (
        <Button icon={null} onClick={retry}>
          {status === 'error' ? 'Reintentar' : 'Ver todos'}
        </Button>
      )}
    </section>
  );
}
