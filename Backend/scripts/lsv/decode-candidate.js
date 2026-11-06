import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';

/**
 * Decodifica todos los frames de un intervalo sin depender de la velocidad de reproducción de Chrome.
 * @param {string} file Video local verificado por el preparador.
 * @param {object} candidate Límites originales en milisegundos.
 * @returns {Promise<object>} Tiempos PTS originales, lectura de PNG sin pérdida y cierre de temporales propios.
 * @throws {Error} FFmpeg ausente, fallo de decodificación o tiempos incompatibles.
 */
export async function decodeCandidate(file, candidate) {
  const directory = await mkdtemp(join(tmpdir(), 'vs-lsv-decoded-'));
  const close = async () => {
    const target = resolve(directory);
    if (!target.startsWith(resolve(tmpdir()) + sep) || !target.includes('vs-lsv-decoded-'))
      throw new Error('Directorio temporal inesperado.');
    await rm(target, { recursive: true, force: true });
  };
  try {
    const start = candidate.startMs / 1000;
    const end = candidate.endMs / 1000;
    const result = spawnSync(
      'ffmpeg',
      [
        '-hide_banner',
        '-t',
        String(end + 0.1),
        '-i',
        file,
        '-an',
        '-vf',
        `select='between(t,${start},${end})',showinfo`,
        '-fps_mode',
        'vfr',
        join(directory, 'frame-%04d.png'),
      ],
      { encoding: 'utf8', windowsHide: true, maxBuffer: 16 * 1024 * 1024 },
    );
    if (result.status !== 0) throw new Error('FFmpeg no pudo decodificar el intervalo local.');
    const times = [...result.stderr.matchAll(/pts_time:([\d.]+)/g)].map((match) =>
      Number(match[1]),
    );
    if (
      !times.length ||
      times.length > 1800 ||
      times.some(
        (time, index) => time < start || time > end || (index > 0 && time <= times[index - 1]),
      )
    )
      throw new Error('FFmpeg devolvió tiempos ausentes o incompatibles.');
    return {
      times,
      image: async (index) =>
        (
          await readFile(join(directory, `frame-${String(index + 1).padStart(4, '0')}.png`))
        ).toString('base64'),
      close,
    };
  } catch (error) {
    await close();
    throw error;
  }
}
