import { spawnSync } from 'node:child_process';

/**
 * Crea un recorte técnico original, reflejado o compuesto en la carpeta local elegida, sin entrenarlo.
 * @param {string} file Video original autorizado para el experimento local.
 * @param {object} source Intervalo startMs/endMs.
 * @param {string} output Archivo nuevo de evidencia.
 * @param {string} mode ORIGINAL, MIRROR o COMPOSITE; estos dos últimos nunca son grabaciones nuevas auténticas.
 * @returns {void} Escribe el recorte técnico.
 * @throws {Error} Fallo de FFmpeg; no registra argumentos privados.
 */
export function createHandClip(file, source, output, mode) {
  const filter =
    mode === 'COMPOSITE'
      ? [
          '-filter_complex',
          '[0:v]split=2[a][b];[b]hflip[c];[a][c]hstack=inputs=2[out]',
          '-map',
          '[out]',
        ]
      : ['-vf', mode === 'MIRROR' ? 'hflip' : 'null'];
  const result = spawnSync(
    'ffmpeg',
    [
      '-hide_banner',
      '-loglevel',
      'error',
      '-ss',
      String(source.startMs / 1000),
      '-i',
      file,
      '-t',
      String((source.endMs - source.startMs) / 1000),
      ...filter,
      '-pix_fmt',
      'yuv420p',
      '-an',
      output,
    ],
    { encoding: 'utf8', windowsHide: true },
  );
  if (result.status !== 0) throw new Error('No se pudo preparar el recorte técnico con FFmpeg');
}
