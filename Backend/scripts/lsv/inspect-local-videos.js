import { spawnSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, join } from 'node:path';
import sharp from 'sharp';

/**
 * Inspecciona MP4 locales con ffprobe/ffmpeg; genera imágenes privadas de contacto con tiempos reales de presentación.
 * @param {string[]} files Archivos autorizados para inspección, sin descargas.
 * @param {string} directory Directorio local excluido de Git.
 * @param {{seconds?: number, crops?: string[]}} [options] Frecuencia de evidencia y recortes de rótulos, no de entrenamiento.
 * @returns {Promise<object[]>} Metadatos y evidencias; no asigna letras, identidades ni permisos.
 * @throws {Error} Archivo, herramientas o decodificación no disponibles.
 */
export async function inspectLocalVideos(files, directory, options = {}) {
  await mkdir(directory, { recursive: true });
  const inventory = [];
  for (const [index, file] of files.entries()) {
    const id = `video_${String(index + 1).padStart(2, '0')}`;
    const folder = join(directory, id);
    await mkdir(folder, { recursive: true });
    const probe = spawnSync(
      'ffprobe',
      ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', file],
      { encoding: 'utf8', windowsHide: true },
    );
    if (probe.status !== 0) throw new Error(`ffprobe no pudo inspeccionar ${id}`);
    const metadata = JSON.parse(probe.stdout);
    const video = metadata.streams.find((stream) => stream.codec_type === 'video');
    const [numerator, denominator] = video.avg_frame_rate.split('/').map(Number);
    const stride = Math.max(1, Math.round((numerator / denominator) * (options.seconds ?? 10)));
    const crop = options.crops?.[index] ? `crop=${options.crops[index]},` : '';
    const decoded = spawnSync(
      'ffmpeg',
      [
        '-hide_banner',
        '-y',
        '-i',
        file,
        '-an',
        '-vf',
        `select='not(mod(n,${stride}))',showinfo,${crop}scale=320:180`,
        '-fps_mode',
        'vfr',
        join(folder, 'frame-%04d.jpg'),
      ],
      { encoding: 'utf8', windowsHide: true, maxBuffer: 16 * 1024 * 1024 },
    );
    if (decoded.status !== 0) throw new Error(`ffmpeg no pudo decodificar ${id}`);
    const times = [...decoded.stderr.matchAll(/pts_time:([\d.]+)/g)].map((match) =>
      Number(match[1]),
    );
    for (let offset = 0; offset < times.length; offset += 24) {
      const entries = times.slice(offset, offset + 24);
      const overlays = [];
      for (const [position, time] of entries.entries()) {
        const left = (position % 4) * 320;
        const top = Math.floor(position / 4) * 204;
        overlays.push({
          input: join(folder, `frame-${String(offset + position + 1).padStart(4, '0')}.jpg`),
          left,
          top,
        });
        overlays.push({
          input:
            Buffer.from(`<svg width="320" height="24"><rect width="320" height="24" fill="white"/>
          <text x="8" y="18" font-size="16">${id} — ${time.toFixed(3)} s</text></svg>`),
          left,
          top: top + 180,
        });
      }
      await sharp({
        create: {
          width: 1280,
          height: Math.ceil(entries.length / 4) * 204,
          channels: 3,
          background: 'white',
        },
      })
        .composite(overlays)
        .png()
        .toFile(join(folder, `contact-${Math.floor(offset / 24) + 1}.png`));
    }
    const entry = {
      id,
      file: resolve(file),
      sha256: createHash('sha256')
        .update(await readFile(file))
        .digest('hex'),
      duration: Number(metadata.format.duration),
      width: video.width,
      height: video.height,
      fps: numerator / denominator,
      inspectionTimes: times,
      contacts: Math.ceil(times.length / 24),
    };
    inventory.push(entry);
    await writeFile(join(folder, 'metadata.json'), JSON.stringify(entry, null, 2));
  }
  await writeFile(join(directory, 'inventory.json'), JSON.stringify(inventory, null, 2));
  return inventory;
}
