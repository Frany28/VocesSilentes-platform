import { decodeCandidate } from './decode-candidate.js';

/**
 * Envía PNG locales únicamente por CDP al detector existente, conservando PTS y liberando recursos propios.
 * @param {object} page Runner privado sin cámara ni API.
 * @param {object} source Fuente verificada por hash.
 * @param {object} candidate Intervalo original anotado.
 * @param {boolean} [multihand] Conserva ambos canales para diagnóstico, sin filtrar ausencias.
 * @returns {Promise<object>} Puntos compatibles o rechazo con número real de frames procesados.
 */
export async function extractDecodedCandidate(page, source, candidate, multihand = false) {
  const decoded = await decodeCandidate(source.file, candidate);
  try {
    await page.evaluate(`(async()=>{
      const module=await import('/src/features/student/recognition/${multihand ? 'decoded-hand-sequence' : 'decoded-sequence'}.js');
      window.decodedSequence=await module.${multihand ? 'createTrackedDecodedSequence' : 'createDecodedSequence'}(${candidate.startMs / 1000},${candidate.endMs / 1000});
    })()`);
    for (let index = 0; index < decoded.times.length; index += 1) {
      const encoded = await decoded.image(index);
      await page.evaluate(
        `window.decodedSequence.append(${JSON.stringify(encoded)},${decoded.times[index]})`,
      );
    }
    return await page.evaluate('window.decodedSequence.finish()');
  } finally {
    try {
      await page.evaluate('window.decodedSequence?.close(); window.decodedSequence=null');
    } finally {
      await decoded.close();
    }
  }
}
