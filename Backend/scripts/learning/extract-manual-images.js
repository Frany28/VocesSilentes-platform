import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// Extracción documental determinista, sin generación ni modificación de configuraciones de manos.
const output = new URL('../../../.local/manual-lsv-review/original-crops/', import.meta.url);
await mkdir(output, { recursive: true });
const pages = [
  {
    page: 5,
    letters: Array.from('ABCDEFGHIJKL'),
    columns: [35, 278, 519],
    rows: [165, 418, 677, 918],
    bottom: 1170,
  },
  {
    page: 6,
    letters: Array.from('MNÑOPQRSTUVWXYZ'),
    columns: [36, 277, 518],
    rows: [14, 270, 505, 741, 987],
    bottom: 1214,
  },
];
const images = {};
for (const section of pages) {
  const path = new URL(
    `../../../.local/manual-lsv-review/page-${section.page}.png`,
    import.meta.url,
  );
  const source = await readFile(path);
  const metadata = await sharp(source).metadata();
  if (metadata.width !== 794) throw new Error('Las páginas deben renderizarse con ancho de 794 px');
  for (const [index, letter] of section.letters.entries()) {
    const column = index % 3;
    const row = Math.floor(index / 3);
    const top = section.rows[row];
    const left = section.columns[column];
    const width = letter === 'Z' ? 243 : column === 2 ? 256 : section.columns[column + 1] - left;
    const height = Math.min(section.rows[row + 1] ?? section.bottom, metadata.height) - top;
    const name = letter === 'Ñ' ? 'enye' : letter.toLowerCase();
    await sharp(source)
      .extract({ left, top, width, height })
      .webp({ quality: 94 })
      .toFile(fileURLToPath(new URL(`${name}.webp`, output)));
    images[letter] = { file: `${name}.webp`, page: section.page };
  }
}
await writeFile(
  new URL('provenance.json', output),
  JSON.stringify(
    {
      source: 'manual-lsv.pdf',
      sourceSha256: '9b03921e8719cd341c44b8ccad730e52a9db46da29eb8f5058f5b63a7d033139',
      credit:
        'Diseño e ilustración: Yulianny Fuentes. Manual básico de Lengua de Señas Venezolana, julio de 2022.',
      reuseBasis: 'Uso educativo indicado y autorizado por el usuario el 5 de noviembre de 2026.',
      rightsStatus: 'USER_ASSERTED_EDUCATIONAL_USE',
      validationStatus: 'PENDING_LSV_REVIEW',
      images,
    },
    null,
    2,
  ),
);
console.log(
  '27 referencias del documento extraídas; pendientes de revisión lingüística, sin modelo LSV entrenado.',
);
