import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { sequenceFeatures } from '../../shared/lsv/sequence.js';
import { mirrorFrames } from '../../shared/lsv/handedness.js';

// Descarga únicamente una fila MIT para geometría. No la incorpora al dataset ni asigna etiquetas LSV.
const directory = '.local/lsv-external-hands';
const cardUrl = 'https://huggingface.co/datasets/luciayen/CASL-W60-Landmarks/raw/main/README.md';
const rowsUrl =
  'https://datasets-server.huggingface.co/rows?' +
  'dataset=luciayen%2FCASL-W60-Landmarks&config=default&split=train&offset=0&length=1';

async function read(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Fuente externa no disponible: ${response.status}`);
  return response.text();
}

try {
  const card = await read(cardUrl);
  if (!card.includes('license: mit')) throw new Error('Revisar licencia antes de descargar');
  const bytes = await read(rowsUrl);
  const row = JSON.parse(bytes).rows[0].row;
  if (row.landmarks.length !== 64 || row.landmarks.some((frame) => frame.length !== 225))
    throw new Error('El vector externo cambió de formato');
  await mkdir(directory, { recursive: true });
  await writeFile(`${directory}/CASL-card.txt`, card);
  await writeFile(`${directory}/CASL-one-row.json`, bytes);
  const diagnostics = {};
  for (const [hand, start] of [
    ['Left', 99],
    ['Right', 162],
  ]) {
    const frames = row.landmarks
      .filter((_, i) => i % 2 === 0)
      .map((values, i) => ({
        t: i * 100,
        hand,
        width: 1000,
        height: 1000,
        points: Array.from({ length: 21 }, (_, j) =>
          values.slice(start + j * 3, start + j * 3 + 3),
        ),
      }));
    const features = sequenceFeatures(frames);
    const reflected = sequenceFeatures(mirrorFrames(frames));
    const error = Math.max(
      ...features.flatMap((f, i) =>
        f.map((v, j) => Math.abs(reflected[i][j] - (j % 3 === 0 ? -v : v))),
      ),
    );
    diagnostics[hand] = {
      frames: frames.length,
      points: 21,
      features: features[0].length,
      mirrorFeatureMaxError: error,
      finite: features.flat().every(Number.isFinite),
    };
  }
  const result = {
    source: rowsUrl,
    card: cardUrl,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    generatedAt: new Date().toISOString(),
    downloadedRows: 1,
    licenseDeclaration: 'MIT (dataset card)',
    diagnostics,
    coordinateConvention:
      'Preprocessed coordinates; technical geometry check only, not raw-camera validation',
    usedForLsvTraining: false,
    independentLsvEvaluation: false,
  };
  await writeFile(`${directory}/technical-check.json`, JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
