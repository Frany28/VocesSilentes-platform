import { useState } from 'react';
import { Button } from '../../../components/ui/Button.jsx';
import { AdminDialog } from './AdminDialog.jsx';
import { EvidenceImage } from './EvidenceImage.jsx';

/**
 * Evidencia de solo lectura; su ausencia no se sustituye por una imagen de ejemplo.
 * @param {{evidence?: {src: string, name: string, description?: string, details?: string}}} props Archivo autorizado.
 * @returns {import('react').ReactElement} Tarjeta, estado sin imagen y visor ampliado con foco/Escape.
 */
export function ReportEvidence({ evidence }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="admin-evidence-section">
      <h3>Imagen de evidencia</h3>
      {!evidence?.src ? (
        <div className="admin-evidence-empty">Sin imagen adjunta</div>
      ) : (
        <>
          <div className="admin-evidence-card">
            <div className="admin-evidence-thumbnail">
              <EvidenceImage
                key={evidence.src}
                src={evidence.src}
                alt={evidence.description || 'Imagen adjunta al reporte'}
              />
            </div>
            <strong>{evidence.name}</strong>
            {evidence.details && <p className="admin-demo-note">{evidence.details}</p>}
            <Button variant="secondary" icon={null} onClick={() => setOpen(true)}>
              Ver imagen
            </Button>
          </div>
          {open && (
            <AdminDialog
              title="Imagen de evidencia"
              onClose={() => setOpen(false)}
              className="admin-evidence-viewer"
            >
              <EvidenceImage
                key={evidence.src}
                src={evidence.src}
                alt={evidence.description || 'Imagen adjunta al reporte'}
              />
              <p>
                {evidence.name}
                {evidence.details ? ` · ${evidence.details}` : ''}
              </p>
              <p className="admin-demo-note">Archivo adjunto al reporte · Solo lectura</p>
            </AdminDialog>
          )}
        </>
      )}
    </section>
  );
}
