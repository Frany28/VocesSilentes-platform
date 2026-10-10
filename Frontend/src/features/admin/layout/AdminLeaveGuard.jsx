import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAdmin } from '../data/admin-context.js';
import { AdminConfirmation } from '../components/AdminConfirmation.jsx';
/**
 * Intercepta navegación de enlaces/botones del panel para proteger formularios pendientes.
 * @param {{children: import('react').ReactNode}} props Panel administrativo.
 * @returns {import('react').ReactElement} Contenedor y confirmación para descartar borrador.
 */
export function AdminLeaveGuard({ children }) {
  const { draft } = useAdmin();
  const [destination, setDestination] = useState(null);
  const navigate = useNavigate();
  const intercept = (event) => {
    const control = event.target.closest('[data-admin-to],a[href]');
    const to = control?.dataset.adminTo ?? control?.getAttribute('href');
    if (!to?.startsWith('/admin') || (!draft.dirty && !draft.pending)) return;
    event.preventDefault();
    event.stopPropagation();
    if (!draft.pending) setDestination(to);
  };
  return (
    <div className="admin-leave-guard" onClickCapture={intercept}>
      {children}
      {destination && (
        <AdminConfirmation
          title="¿Descartar los cambios?"
          confirm="Descartar cambios"
          onCancel={() => setDestination(null)}
          onConfirm={() => {
            const to = destination;
            setDestination(null);
            navigate(to);
          }}
        >
          Los datos que no has guardado se perderán al cambiar de pantalla.
        </AdminConfirmation>
      )}
    </div>
  );
}
