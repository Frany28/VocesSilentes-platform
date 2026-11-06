import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { syntheticVideoRecording } from '../../../Backend/tests/fixtures/lsv-video-synthetic.js';
import { renderVideoLab, annotateSoftwareVideo, readDownloadedJson } from './video-lab-fixture.jsx';
import { validateRecording } from '../../../shared/lsv/recording.js';

const extract = vi.hoisted(() => vi.fn());
vi.mock('../features/student/recognition/extract-video-sequence.js', () => ({
  extractVideoSequence: extract,
}));

test('importación: anotación → extracción → inspección → lote pendiente → revisión → exportación compatible', async () => {
  const fetch = vi.fn();
  vi.stubGlobal('fetch', fetch);
  const view = renderVideoLab();
  expect(extract).not.toHaveBeenCalled();
  const sample = syntheticVideoRecording();
  extract.mockResolvedValue({ frames: sample.frames, decodedFrames: 20 });
  await annotateSoftwareVideo();
  await userEvent.click(screen.getByRole('button', { name: 'Extraer muestra del intervalo' }));
  const preview = await screen.findByRole('region', { name: 'Vista previa de la muestra' });
  const slider = within(preview).getByRole('slider');
  slider.focus();
  expect(slider).toHaveFocus();
  await userEvent.click(screen.getByRole('button', { name: 'Añadir muestra pendiente' }));
  expect(screen.getByText('Muestras en memoria: 1')).toBeVisible();
  const confirm = screen.getByRole('button', { name: 'Confirmar revisión LSV' });
  expect(confirm).toBeDisabled();
  await userEvent.type(screen.getByLabelText('Código de quien revisa LSV'), 'software_reviewer');
  expect(confirm).toBeDisabled();
  await userEvent.click(screen.getByRole('button', { name: 'Exportar muestras (.json)' }));
  const pending = await readDownloadedJson(view.downloaded());
  expect(validateRecording(pending.samples[0]).reviewStatus).toBe('PENDING_LSV_REVIEW');
  expect(pending.samples[0].source.origin).toBe('Software fixture');
  expect(pending.samples[0].source.startMs).toBe(0);
  expect(pending.samples[0].source.endMs).toBe(2000);
  expect(pending.samples[0].source.sha256).toMatch(/^[a-f0-9]{64}$/);
  expect(pending.samples[0].source).not.toHaveProperty('url');
  screen.getByRole('checkbox', { name: /Una persona competente en LSV revisó/ }).focus();
  await userEvent.keyboard('[Space]');
  await userEvent.click(confirm);
  await userEvent.click(screen.getByRole('button', { name: 'Exportar muestras (.json)' }));
  const reviewed = await readDownloadedJson(view.downloaded());
  expect(validateRecording(reviewed.samples[0]).reviewStatus).toBe('APPROVED_LSV');
  expect(reviewed.samples[0].frames).toEqual(sample.frames);
  expect(fetch).not.toHaveBeenCalled();
  expect(screen.queryByText('Respuesta correcta')).toBeNull();
});

test('una extracción repetida no crea otra muestra y puede descartarse sin modificar el lote', async () => {
  renderVideoLab();
  extract.mockResolvedValue({ frames: syntheticVideoRecording().frames, decodedFrames: 20 });
  await annotateSoftwareVideo();
  for (let attempt = 0; attempt < 2; attempt += 1) {
    await userEvent.click(screen.getByRole('button', { name: 'Extraer muestra del intervalo' }));
    await screen.findByRole('region', { name: 'Vista previa de la muestra' });
    await userEvent.click(screen.getByRole('button', { name: 'Añadir muestra pendiente' }));
  }
  expect(screen.getByText('Muestras en memoria: 1')).toBeVisible();
  expect(screen.getByRole('alert')).toHaveTextContent(/repetidas|ejecución|solapa/);
  await userEvent.click(screen.getByRole('button', { name: 'Descartar extracción' }));
  expect(screen.queryByRole('region', { name: 'Vista previa de la muestra' })).toBeNull();
  await userEvent.click(screen.getByRole('button', { name: 'Descartar muestra' }));
  expect(screen.getByText('Muestras en memoria: 0')).toBeVisible();
});
