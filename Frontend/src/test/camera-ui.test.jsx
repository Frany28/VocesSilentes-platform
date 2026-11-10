import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { expect, test, vi } from 'vitest';
import { CameraExercise } from '../features/student/recognition/CameraExercise.jsx';
import { RecognitionModelProvider } from '../features/student/recognition/RecognitionModelProvider.jsx';
import { cameraFixture } from './camera-fixture.js';

const factory = vi.hoisted(() => vi.fn());
vi.mock('../features/student/recognition/hand-engine.js', () => ({ createHandEngine: factory }));

function renderCamera() {
  // Sin modelo publicado en la prueba: la carga automática falla de forma controlada.
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 404 })));
  return render(
    <MemoryRouter>
      <RecognitionModelProvider>
        <CameraExercise letter="A" />
      </RecognitionModelProvider>
    </MemoryRouter>,
  );
}

test('el visor no solicita cámara al entrar; activa solo por botón y nunca muestra detección como acierto', async () => {
  const fixture = cameraFixture();
  factory.mockResolvedValue(fixture.engine);
  const view = renderCamera();
  expect(fixture.getUserMedia).not.toHaveBeenCalled();
  expect(factory).not.toHaveBeenCalled();
  expect(
    screen.getByRole('img', { name: /Ilustración de referencia de la letra A/ }),
  ).toBeVisible();
  expect(await screen.findByText(/La ayuda automática no está disponible/)).toBeVisible();
  expect(screen.getByText(/Puedes practicar con la referencia/)).toBeVisible();
  // El estudiante no importa modelos ni los carga a mano: solo puede reintentar tras un fallo.
  expect(screen.queryByText('Cargar un modelo entrenado')).toBeNull();
  expect(screen.getByRole('button', { name: 'Reintentar' })).toBeEnabled();
  await userEvent.click(screen.getByRole('button', { name: 'Activar cámara' }));
  await screen.findByRole('button', { name: 'Detener cámara' });
  expect(fixture.getUserMedia).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole('button', { name: 'Analizar intento' })).toBeNull();
  expect(screen.queryByText('Respuesta correcta')).toBeNull();
  view.unmount();
  expect(fixture.track.stop).toHaveBeenCalledTimes(1);
  expect(fixture.engine.close).toHaveBeenCalledTimes(1);
});

test('permiso denegado presenta un error público y permite reintentar sin importar el detector', async () => {
  const fixture = cameraFixture();
  factory.mockClear();
  fixture.getUserMedia.mockRejectedValue(new DOMException('Detalle privado', 'NotAllowedError'));
  renderCamera();
  await userEvent.click(screen.getByRole('button', { name: 'Activar cámara' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('El permiso de cámara fue denegado');
  expect(screen.queryByText('Detalle privado')).toBeNull();
  expect(screen.getByRole('button', { name: 'Activar cámara' })).toBeEnabled();
  expect(factory).not.toHaveBeenCalled();
});

test('ocultar la pestaña cierra pistas/tarea, y regresar no reactiva la cámara automáticamente', async () => {
  const fixture = cameraFixture();
  factory.mockResolvedValue(fixture.engine);
  renderCamera();
  await userEvent.click(screen.getByRole('button', { name: 'Activar cámara' }));
  await screen.findByRole('button', { name: 'Detener cámara' });
  await act(async () => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
    delete document.hidden;
  });
  await waitFor(() => expect(fixture.track.stop).toHaveBeenCalledTimes(1));
  expect(fixture.engine.close).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('button', { name: 'Activar cámara' })).toBeEnabled();
  expect(fixture.getUserMedia).toHaveBeenCalledTimes(1);
});
