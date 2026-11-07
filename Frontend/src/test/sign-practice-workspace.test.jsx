import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { expect, test, vi } from 'vitest';
import { SignPracticeWorkspace } from '../features/student/practice/SignPracticeWorkspace.jsx';
import { RecognitionModelProvider } from '../features/student/recognition/RecognitionModelProvider.jsx';
import { cameraFixture } from './camera-fixture.js';

const factory = vi.hoisted(() => vi.fn());
vi.mock('../features/student/recognition/hand-engine.js', () => ({ createHandEngine: factory }));

function setup() {
  const fixture = cameraFixture();
  factory.mockResolvedValue(fixture.engine);
  const transport = vi.fn().mockResolvedValue(new Response('', { status: 404 }));
  vi.stubGlobal('fetch', transport);
  render(
    <MemoryRouter>
      <RecognitionModelProvider>
        <SignPracticeWorkspace />
      </RecognitionModelProvider>
    </MemoryRouter>,
  );
  return { fixture, transport };
}

test('práctica muestra cinco referencias autorizadas y actualiza la imagen sin pedir cámara ni guardar avances', async () => {
  const { fixture, transport } = setup();
  const picker = screen.getByRole('group', { name: 'Elegir vocal para practicar' });
  expect(within(picker).getAllByRole('button')).toHaveLength(5);
  expect(picker.querySelectorAll('img')).toHaveLength(5);
  expect(within(picker).getByRole('button', { name: 'Practicar vocal A' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await screen.findByRole('img', { name: /referencia de la letra A/ });
  await userEvent.click(within(picker).getByRole('button', { name: 'Practicar vocal U' }));
  expect(await screen.findByRole('img', { name: /referencia de la letra U/ })).toBeVisible();
  expect(within(picker).getByRole('button', { name: 'Practicar vocal U' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  expect(screen.queryByRole('img', { name: /referencia de la letra A/ })).toBeNull();
  expect(fixture.getUserMedia).not.toHaveBeenCalled();
  expect(
    transport.mock.calls.every(([url, options]) => url.startsWith('/models/') && !options?.method),
  ).toBe(true);
});

test('cambiar la vocal detiene el vídeo anterior y exige activar de nuevo la cámara', async () => {
  const { fixture } = setup();
  await userEvent.click(await screen.findByRole('button', { name: 'Activar cámara' }));
  await screen.findByRole('button', { name: 'Detener cámara' });
  await userEvent.click(screen.getByRole('button', { name: 'Practicar vocal E' }));
  await waitFor(() => expect(fixture.track.stop).toHaveBeenCalledTimes(1));
  expect(fixture.engine.close).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('button', { name: 'Activar cámara' })).toBeEnabled();
  expect(fixture.getUserMedia).toHaveBeenCalledTimes(1);
});
