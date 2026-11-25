// Genera los MP3 de la microclase con Kokoro, localmente y sin alterar el guion.
// Instala kokoro-onnx==0.6.1, imageio-ffmpeg==0.6.0 y mutagen==1.47.0 en Python.
// Modelo empleado: onnx-community/Kokoro-82M-v1.0-ONNX, revisión 4685882,
// archivo onnx/model_quantized.onnx. Estilos: voices-v1.0.bin de
// https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.1
// Uso: node Frontend/scripts/generate-microclass-audio.mjs <modelo.onnx> <voces.bin>
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';
import { URL, fileURLToPath } from 'node:url';
import {
  microclassScenes,
  quizHint,
  quizLetter,
  vowelLetters,
} from '../src/features/student/microclass/microclass-script.js';
import { audioKey, spokenText } from '../src/features/student/microclass/audio-key.js';

const [model, voices] = process.argv.slice(2);
if (!model || !voices) throw new Error('Indica el modelo .onnx y el archivo de voces .bin');

const root = fileURLToPath(new URL('..', import.meta.url));
const helper = fileURLToPath(new URL('./synthesize-microclass-audio.py', import.meta.url));
const output = join(root, 'public/media/microclass');
const manifestPath = join(root, 'src/features/student/microclass/microclass-audio.json');
const phrases = {};
const add = (text, maxSeconds) => {
  phrases[audioKey(text)] = { text: spokenText(text), maxSeconds };
};
for (const scene of microclassScenes) {
  for (const cue of scene.cues) {
    // Las demostraciones individuales avanzan al terminar este tiempo fijo.
    add(cue.text, scene.type === 'vowel' ? cue.seconds : undefined);
    if (cue.revealText) add(cue.revealText);
  }
}
for (const letter of vowelLetters) if (letter !== quizLetter) add(quizHint(letter));

const work = mkdtempSync(join(tmpdir(), 'microclass-audio-'));
try {
  const synthesis = spawnSync('python', [helper, model, voices, work], {
    input: JSON.stringify(phrases),
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'inherit'],
  });
  if (synthesis.error) throw synthesis.error;
  if (synthesis.status !== 0)
    throw new Error('Falló la síntesis. Se conservaron los clips previos.');
  const manifest = JSON.parse(synthesis.stdout);
  mkdirSync(output, { recursive: true });
  for (const key of Object.keys(phrases)) {
    copyFileSync(join(work, `${key}.mp3`), join(output, `${key}.mp3`));
  }
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  process.stdout.write(`Audios generados: ${Object.keys(manifest.clips).length}\n`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
