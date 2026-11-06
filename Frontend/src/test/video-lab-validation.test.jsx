import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { renderVideoLab, annotateSoftwareVideo } from './video-lab-fixture.jsx';

const extract = vi.hoisted(() => vi.fn());
vi.mock('../features/student/recognition/extract-video-sequence.js', () => ({
  extractVideoSequence: extract,
}));

test('marcadores usan el tiempo del video y los intervalos inválidos fallan antes de MediaPipe', async () => {
  renderVideoLab();
  const video = await annotateSoftwareVideo();
  video.currentTime = 1.2;
  await userEvent.click(screen.getByRole('button', { name: 'Marcar inicio aquí' }));
  expect(screen.getByLabelText('Inicio (segundos)')).toHaveValue(1.2);
  await userEvent.click(screen.getByRole('button', { name: 'Extraer muestra del intervalo' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('entre 1,5 y 6 segundos');
  expect(extract).not.toHaveBeenCalled();
  expect(screen.getByText('Muestras en memoria: 0')).toBeVisible();
});

test('cambiar persona o autorización requiere una nueva declaración y un error de códec permite sustituir el archivo', async () => {
  renderVideoLab();
  const video = await annotateSoftwareVideo();
  const button = screen.getByRole('button', { name: 'Extraer muestra del intervalo' });
  expect(button).toBeEnabled();
  await userEvent.type(screen.getByLabelText('Código de participante'), '_other');
  expect(screen.getByRole('checkbox', { name: /Cuento con el consentimiento/ })).not.toBeChecked();
  expect(button).toBeDisabled();
  await userEvent.click(screen.getByRole('checkbox', { name: /Cuento con el consentimiento/ }));
  await userEvent.type(screen.getByLabelText('Referencia de autorización'), ' edited');
  expect(screen.getByRole('checkbox', { name: /Declaro que este archivo/ })).not.toBeChecked();
  fireEvent.error(video);
  expect(screen.getByRole('alert')).toHaveTextContent(/formato y códec/);
  expect(screen.getByLabelText('Video local MP4 o WebM')).toBeEnabled();
  expect(button).toBeDisabled();
  expect(extract).not.toHaveBeenCalled();
});
