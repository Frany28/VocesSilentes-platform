import { Link } from 'react-router';
import { AppLayout } from '../components/layout/AppLayout.jsx';
import { SystemPage } from '../features/system/SystemPage.jsx';

/**
 * Define las rutas mínimas; permite BrowserRouter y MemoryRouter en pruebas.
 * @returns {import('react-router').RouteObject[]} Contrato inicial del router.
 */
export function createRoutes() {
  return [
    {
      element: <AppLayout />,
      children: [
        { path: '/', element: <SystemPage /> },
        {
          path: '*',
          element: (
            <p>
              Ruta no encontrada. <Link to="/">Volver al inicio</Link>
            </p>
          ),
        },
      ],
    },
  ];
}
