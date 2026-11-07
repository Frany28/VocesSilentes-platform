// Genera la narración de la microclase con Piper (síntesis de voz libre, sin conexión) y ffmpeg.
// Uso: node Frontend/scripts/generate-microclass-audio.mjs --piper <piper.exe> --model <voz.onnx>
// Voz usada en la publicación: es_MX-claude-high (rhasspy/piper-voices, licencia Apache-2.0).
// Escribe un .mp3 por frase en public/media/microclass/ y el índice src/.../microclass-audio.json.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';
import { URL, fileURLToPath } from 'node:url';
import {
  microclassScenes,
  quizHint,
  vowelLetters,
  quizLetter,
} from '../src/features/student/microclass/microclass-script.js';
import { audioKey, spokenText } from '../src/features/student/microclass/audio-key.js';

const argument = (name) => process.argv[process.argv.indexOf(name) + 1];
const piper = argument('--piper');
const model = argument('--model');
if (!process.argv.includes('--piper') || !process.argv.includes('--model'))
  throw new Error('Indica --piper <ruta a piper.exe> y --model <ruta a la voz .onnx>');

const root = fileURLToPath(new URL('..', import.meta.url));
const output = join(root, 'public/media/microclass');
const manifestPath = join(root, 'src/features/student/microclass/microclass-audio.json');
const texts = new Set();
for (const scene of microclassScenes)
  for (const cue of scene.cues) {
    texts.add(cue.text);
    if (cue.revealText) texts.add(cue.revealText);
  }
for (const letter of vowelLetters) if (letter !== quizLetter) texts.add(quizHint(letter));

mkdirSync(output, { recursive: true });
for (const file of readdirSync(output)) if (file.endsWith('.mp3')) rmSync(join(output, file));
const work = mkdtempSync(join(tmpdir(), 'microclass-audio-'));
const clips = {};
for (const text of texts) {
  const key = audioKey(text);
  const wav = join(work, `${key}.wav`);
  const synth = spawnSync(
    piper,
    ['--model', model, '--length_scale', '1.08', '--output_file', wav],
    {
      input: spokenText(text),
      encoding: 'utf8',
    },
  );
  if (synth.status !== 0) throw new Error(`Piper falló con: ${text}\n${synth.stderr}`);
  const mp3 = join(output, `${key}.mp3`);
  const encode = spawnSync('ffmpeg', [
    '-hide_banner',
    '-loglevel',
    'error',
    '-y',
    '-i',
    wav,
    '-af',
    'loudnorm=I=-16:TP=-1.5',
    '-ac',
    '1',
    '-ar',
    '44100',
    '-b:a',
    '64k',
    mp3,
  ]);
  if (encode.status !== 0) throw new Error(`ffmpeg falló con: ${text}`);
  const probe = spawnSync(
    'ffprobe',
    ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp3],
    {
      encoding: 'utf8',
    },
  );
  clips[key] = { seconds: Math.round(Number(probe.stdout.trim()) * 100) / 100 };
}
rmSync(work, { recursive: true, force: true });
writeFileSync(
  manifestPath,
  `${JSON.stringify({ voice: 'piper:es_MX-claude-high', license: 'Apache-2.0', clips }, null, 2)}\n`,
);
process.stdout.write(`Audios generados: ${Object.keys(clips).length}\n`);
