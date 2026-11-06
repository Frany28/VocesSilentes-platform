import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { webcrypto } from 'node:crypto';
import { StrictMode } from 'react';
import { VideoLabHarness } from './video-lab-harness.jsx';

/**
 * Monta importador real con un contenedor binario mínimo ficticio; solo se simula decodificación y extracción.
 * @returns {object} Vista de software y última descarga, sin contenido LSV ni cámara real.
 */
export function renderVideoLab() {
  vi.stubGlobal('crypto', webcrypto);
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {});
  let blob;
  URL.createObjectURL = vi.fn((value) => {
    blob = value;
    return 'blob:video-software-test';
  });
  URL.revokeObjectURL = vi.fn();
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  return {
    ...render(
      <StrictMode>
        <VideoLabHarness />
      </StrictMode>,
    ),
    downloaded: () => blob,
  };
}

/**
 * Selecciona un archivo local ficticio y completa datos declarados exclusivamente para probar la interfaz.
 * @returns {Promise<HTMLVideoElement>} Reproductor con duración simulada y formulario preparado.
 */
export async function annotateSoftwareVideo() {
  const bytes = Uint8Array.from([0x1a, 0x45, 0xdf, 0xa3]);
  const file = new File([bytes], 'software-fixture.webm', { type: 'video/webm' });
  file.arrayBuffer = async () => bytes.buffer;
  await userEvent.upload(screen.getByLabelText('Video local MP4 o WebM'), file);
  const video = await screen.findByLabelText('Video local autorizado');
  if (!video.getAttribute('src')) throw new Error('El video perdió su URL en StrictMode');
  Object.defineProperty(video, 'duration', { configurable: true, value: 5 });
  fireEvent.loadedMetadata(video);
  for (const [label, value] of Object.entries({
    'Inicio (segundos)': '0',
    'Fin (segundos)': '2',
    'Código de participante': 'software_person',
    'Procedencia y crédito del video': 'Software fixture',
    'Referencia de autorización': 'Software test only',
    'Código de ejecución': 'software_take_01',
  }))
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  await userEvent.click(screen.getByRole('checkbox', { name: /Cuento con el consentimiento/ }));
  await userEvent.click(screen.getByRole('checkbox', { name: /Declaro que este archivo/ }));
  return video;
}

/**
 * Lee la descarga local mediante la API FileReader de jsdom.
 * @param {Blob} blob Archivo exportado por la aplicación.
 * @returns {Promise<object>} JSON efectivamente descargado.
 */
export async function readDownloadedJson(blob) {
  const reader = new FileReader();
  const result = new Promise((resolve) => {
    reader.onload = () => resolve(JSON.parse(reader.result));
  });
  reader.readAsText(blob);
  return result;
}
