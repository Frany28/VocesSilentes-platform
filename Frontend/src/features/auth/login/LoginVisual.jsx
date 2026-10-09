import { LoginIllustration } from './LoginIllustration.jsx';
import { Icon } from '../../../components/ui/Icon.jsx';

/**
 * Presenta la ilustración y una muestra estática del contenido previsto, sin módulos simulados.
 * @returns {import('react').ReactElement} Panel de escritorio o mensaje compacto para tablet.
 */
export function LoginVisual() {
  return (
    <>
      <aside
        className="login-visual relative isolate hidden w-150 flex-none flex-col items-center gap-6
          overflow-clip rounded-3xl p-10 min-[1200px]:flex [&>*]:w-full [&>*]:flex-none"
        aria-label="Bienvenida"
      >
        <div className="flex flex-col gap-4">
          <p className="text-info [font:var(--type-label)]">LENGUA DE SEÑAS VENEZOLANA</p>
          <h2 className="text-5xl/[58px] font-extrabold">
            Conecta con
            <br />
            un mundo nuevo.
          </h2>
          <p className="text-base/[26px] text-muted">
            Cada seña es un puente. Empieza a construir el tuyo.
          </p>
        </div>
        <LoginIllustration />
        <div
          className="flex flex-col gap-4 overflow-clip"
          aria-label="Vista previa ilustrativa del contenido previsto"
        >
          <p className="text-info [font:var(--type-label)]">TU PRÓXIMA CONVERSACIÓN EMPIEZA AQUÍ</p>
          <div
            className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4
              shadow-[0_8px_12px_rgb(38_26_77/8%)]"
          >
            <span className="flex rounded-xl bg-accent p-3">
              <Icon name="play" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <strong className="[font:var(--type-button)]">01 · Saludos básicos</strong>
              <p className="text-muted [font:var(--type-label)]">Video y práctica visual</p>
            </div>
            <Icon name="chevron" size={16} />
          </div>
        </div>
        <div className="login-education flex flex-col gap-2 rounded-2xl p-6">
          <h3 className="[font:var(--type-h3)]">Aprende a tu ritmo.</h3>
          <p className="text-muted">Contenido visual, ejercicios y progreso en un solo lugar.</p>
        </div>
      </aside>
      <aside
        className="login-compact relative isolate hidden flex-col gap-2 overflow-clip rounded-3xl p-6
          min-[600px]:flex min-[1200px]:hidden"
        aria-label="Bienvenida"
      >
        <h2 className="[font:var(--type-h3)]">Más señas, menos barreras.</h2>
        <p className="text-muted">Aprende a tu ritmo. Cada seña abre una conversación.</p>
      </aside>
    </>
  );
}
