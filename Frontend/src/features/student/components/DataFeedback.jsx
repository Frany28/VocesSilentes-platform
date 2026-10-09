import { Icon } from '../../../components/ui/Icon.jsx';
import { Button } from '../../../components/ui/Button.jsx';

/**
 * Presenta carga, fallo y vacíos con mensajes y acciones explícitas.
 * @param {{kind: string, catalog?: boolean, onRetry?: Function}} props Estado y reintento del origen actual.
 * @returns {import('react').ReactElement} Resultado accesible de lectura.
 */
export function DataFeedback({ kind, catalog = false, onRetry }) {
  const loading = kind === 'loading';
  const error = kind === 'error';
  const unavailable = kind === 'unavailable';
  const title = loading
    ? `Preparando ${catalog ? 'tus módulos' : 'tu aprendizaje'}…`
    : error
      ? `No pudimos cargar ${catalog ? 'tus módulos' : 'los datos'}`
      : unavailable
        ? 'Tu área de aprendizaje estará disponible pronto'
        : kind === 'empty'
          ? 'Todavía no hay módulos'
          : 'No encontramos ese módulo';
  const description = loading
    ? 'Estamos recuperando tu ruta de aprendizaje.'
    : error
      ? 'Comprueba tu conexión y vuelve a intentarlo.'
      : unavailable
        ? 'Los módulos todavía no están disponibles. Tu sesión sigue activa.'
        : kind === 'empty'
          ? 'El catálogo no tiene módulos publicados por ahora.'
          : 'Prueba con otro nombre o vuelve a ver todos los módulos.';
  return (
    <section
      className="flex flex-col items-center gap-4 rounded-3xl bg-surface px-6 py-12 text-center"
      role={error ? 'alert' : 'status'}
      aria-live={error ? 'assertive' : 'polite'}
      aria-busy={loading}
    >
      <Icon
        name={loading ? 'student-loading' : error ? 'student-error' : 'student-empty'}
        size={32}
      />
      <h2 className="[font:var(--type-h3)]">{title}</h2>
      <p className="text-muted">{description}</p>
      {error && (
        <Button className="w-55! [--size-control:48px]" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </section>
  );
}
