import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { LSV_LABELS } from '../../../shared/lsv/labels.js';
import { syntheticVideoRecording } from '../../../Backend/tests/fixtures/lsv-video-synthetic.js';
import { renderVideoLab, annotateSoftwareVideo, readDownloadedJson } from './video-lab-fixture.jsx';

const extract = vi.hoisted(() => vi.fn());
vi.mock('../features/student/recognition/extract-video-sequence.js', () => ({
  extractVideoSequence: extract,
}));

test('importa una consonante temporal como pendiente y no la aprueba por tener geometría válida', async () => {
  const view = renderVideoLab();
  await annotateSoftwareVideo();
  const select = screen.getByLabelText('Etiqueta de la muestra');
  expect([...select.options].map((option) => option.value)).toEqual(LSV_LABELS);
  await userEvent.selectOptions(select, 'Ñ');
  expect(screen.getByText(/Registra la ejecución temporal completa/)).toHaveTextContent('Ñ');
  extract.mockResolvedValue({ frames: syntheticVideoRecording().frames, decodedFrames: 20 });
  await userEvent.click(screen.getByRole('button', { name: 'Extraer muestra del intervalo' }));
  await screen.findByRole('region', { name: 'Vista previa de la muestra' });
  await userEvent.click(screen.getByRole('button', { name: 'Añadir muestra pendiente' }));
  await userEvent.click(screen.getByRole('button', { name: 'Exportar muestras (.json)' }));
  const data = await readDownloadedJson(view.downloaded());
  expect(data.samples[0].label).toBe('Ñ');
  expect(data.samples[0].reviewStatus).toBe('PENDING_LSV_REVIEW');
  expect(data.samples[0].consent).toBe(true);
  expect(data.samples[0]).not.toHaveProperty('reviewEvidence');
  expect(
    screen.getByRole('checkbox', { name: /movimiento completo y la variante LSV/ }),
  ).not.toBeChecked();
  expect(screen.getByRole('button', { name: 'Confirmar revisión LSV' })).toBeDisabled();
});
