import { Brand } from '../../../components/ui/Brand.jsx';
import { ThemeAction } from '../../../components/ui/ThemeAction.jsx';
import { IconAction } from '../../../components/ui/IconAction.jsx';

/**
 * Cabecera común de aprendizaje y cuenta, con regreso de icono y tema de destino.
 * @param {{page: string, account: boolean}} props Contexto de la ruta.
 * @returns {import('react').ReactElement} Barra de 44 px adaptable a móvil.
 */
export function StudentTopbar({ page, account }) {
  const title = { modules: 'Mis módulos', practice: 'Practicar', progress: 'Mi progreso' }[page];
  return (
    <header className="student-topbar">
      {account ? (
        <IconAction to="/student" icon="back" label="Volver al aprendizaje" />
      ) : (
        <>
          <div className="min-[600px]:hidden">
            <Brand />
          </div>
          <p className="hidden text-muted [font:var(--type-label)] min-[600px]:block">
            Mi aprendizaje{title ? ` / ${title}` : ''}
          </p>
        </>
      )}
      <ThemeAction />
    </header>
  );
}
