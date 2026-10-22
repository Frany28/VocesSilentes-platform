import { useNavigate } from 'react-router';
import { Button } from '../../../components/ui/Button.jsx';

/**
 * Reutiliza el botón del sistema para acciones de navegación del panel.
 * @param {{to: string, children: import('react').ReactNode, variant?: string, arrow?: boolean}} props Destino local.
 * @returns {import('react').ReactElement} Botón conectado al router.
 */
export function AdminAction({ to, children, variant = 'secondary', arrow = false }) {
  const navigate = useNavigate();
  return (
    <Button
      density="compact"
      data-admin-to={to}
      variant={variant}
      icon={arrow ? undefined : null}
      onClick={() => navigate(to)}
    >
      {children}
    </Button>
  );
}
