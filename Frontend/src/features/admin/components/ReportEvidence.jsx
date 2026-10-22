import { useState } from 'react';
import { Button } from '../../../components/ui/Button.jsx';
import { Dialog } from '../../../components/ui/Dialog.jsx';
import { EvidenceImage } from './EvidenceImage.jsx';

/**
 * Evidencia de solo lectura; su ausencia no se sustituye por una imagen de ejemplo.
 * @param {{evidence?: object, loading?: boolean, error?: object, onRenew?: Function}} props Acceso autorizado renovable.
 * @returns {import('react').ReactElement} Tarjeta, estado sin imagen y visor ampliado con foco/Escape.
 */
export function ReportEvidence({ evidence, loading = false, error, onRenew }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="admin-evidence-section">
      <h3>Imagen de evidencia</h3>
      {!evidence || (!evidence.src && evidence.state !== 'READY') ? (
        <div className="admin-evidence-empty">Sin imagen adjunta</div>
      ) : (
        <>
          <div className="admin-evidence-card">
            <div className="admin-evidence-thumbnail">
              <EvidenceImage
                key={evidence.src}
                src={evidence.src}
                alt={evidence.description || 'Imagen adjunta al reporte'}
                loading={loading}
                error={error}
                onRenew={onRenew}
              />
            </div>
            <strong>{evidence.name}</strong>
            {evidence.details && <p className="admin-demo-note">{evidence.details}</p>}
            <Button
              density="compact"
              variant="secondary"
              icon={null}
              disabled={loading || Boolean(error)}
              onClick={() => setOpen(true)}
            >
              Ver imagen
            </Button>
          </div>
          {open && (
            <Dialog
              title="Imagen de evidencia"
              onClose={() => setOpen(false)}
              className="admin-evidence-viewer"
            >
              <EvidenceImage
                key={evidence.src}
                src={evidence.src}
                alt={evidence.description || 'Imagen adjunta al reporte'}
                loading={loading}
                error={error}
                onRenew={onRenew}
              />
              <p>
                {evidence.name}
                {evidence.details ? ` · ${evidence.details}` : ''}
              </p>
              <p className="admin-demo-note">Archivo adjunto al reporte · Solo lectura</p>
            </Dialog>
          )}
        </>
      )}
    </section>
  );
}
