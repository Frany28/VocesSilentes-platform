import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router';
import { AdminReports } from '../features/admin/pages/AdminReports.jsx';
import { AdminReportDetail } from '../features/admin/pages/AdminReportDetail.jsx';
import { AdminSidebar } from '../features/admin/layout/AdminSidebar.jsx';
import { AdminAvatar } from '../features/admin/components/AdminAvatar.jsx';
import { report } from './admin-report-fixture.js';
import attachment from '../assets/auth/36e7e.png';
import '../styles/global.css';
import '../features/admin/styles/admin.css';

let root;

/**
 * Monta solo una prueba visual explícita para servicios aún no publicados; jamás se importa desde app/router.
 * @param {string} screen Estado de presentación que revisa el driver de Chrome.
 * @param {'light'|'dark'} theme Tema del marco de prueba.
 * @returns {void} Sustituye el contenido del contenedor de pruebas, sin tráfico de API ni persistencia.
 */
export function mountAdminVisualFixture(screen, theme) {
  const host = document.querySelector('#root');
  root ??= createRoot(host);
  document.documentElement.dataset.theme = theme;
  const sample = { ...report, evidence: {
    src: screen === 'report-image-error' ? '/missing-evidence.png' : attachment,
    name: 'adjunto-de-prueba.png', details: 'PNG · Recurso local de prueba',
  } };
  const reports = [sample, { ...sample, id: 'second', reference: 'REP-002', status: 'RESOLVED' },
    { ...sample, id: 'third', reference: 'REP-003', title: 'Un título largo para verificar el ajuste de texto' }];
  const state = screen.replace('reports-', '');
  root.render(<MemoryRouter key={screen}>
    <div className="admin-shell">
      <AdminSidebar onLogout={() => {}} />
      <div className="admin-content">
        <div className="admin-topbar"><p className="admin-breadcrumb">Administración / Reportes</p>
          <AdminAvatar user={{ firstName: 'Admin', lastName: 'Prueba' }} /></div>
        <main>
          {screen.startsWith('reports-') ? <AdminReports reports={state === 'empty' ? [] : reports}
            status={state === 'empty' ? 'ready' : state} error={{ message: 'Error de lectura de prueba' }} /> :
            <AdminReportDetail report={screen === 'report-empty' ? { ...report } : sample} />}
        </main>
        <footer>Prueba de presentación · Datos sintéticos · Sin servicio de reportes</footer>
      </div>
    </div>
  </MemoryRouter>);
}
