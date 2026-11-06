import { validateVideoInterval } from '../../../shared/lsv/video-source.js';

/**
 * Procesa intervalos anotados de archivos seleccionados por CDP, reutilizando el mismo detector y validación del laboratorio.
 * @param {object} page Navegador local de diagnóstico, sin sesión ni servicios académicos.
 * @param {object[]} sources Archivos inspeccionados con rutas privadas.
 * @param {object[]} candidates Anotaciones explícitas; las etiquetas desconocidas permanecen null.
 * @param {Function} progress Notifica resultados sin bytes ni coordenadas.
 * @returns {Promise<object[]>} Cuarentena técnica con puntos reales o razón de rechazo; sin aprobación automática.
 */
export async function extractLocalCandidates(page, sources, candidates, progress) {
  const output = [];
  const fingerprints = new Set();
  for (const source of sources) {
    await page.file('#source', source.file);
    await page.wait('document.querySelector("video").readyState>=2');
    for (const candidate of candidates.filter((item) => item.videoId === source.id)) {
      const record = {
        ...candidate,
        frames: [],
        decodedFrames: 0,
        reviewStatus: 'PENDING_LSV_REVIEW',
        reviewerId: null,
        participantId: candidate.participantId ?? null,
      };
      try {
        validateVideoInterval(candidate.startMs / 1000, candidate.endMs / 1000, source.duration);
        const overlap = output.some(
          (item) =>
            item.videoId === source.id &&
            item.startMs < candidate.endMs &&
            candidate.startMs < item.endMs,
        );
        if (overlap)
          throw new Error('Intervalo repetido o solapado; no se considera otra ejecución.');
        const result = await page.evaluate(`(async()=>{
          const {extractVideoSequence}=await import('/src/features/student/recognition/extract-video-sequence.js');
          try {return await extractVideoSequence({video:document.querySelector('video'),
            canvas:document.querySelector('canvas'),start:${candidate.startMs / 1000},end:${candidate.endMs / 1000},
            signal:new AbortController().signal,onProgress:()=>{}});}
          catch(error){return {error:error.message};}})()`);
        if (result.error) throw new Error(result.error);
        const fingerprint = JSON.stringify(result.frames.map((frame) => frame.points));
        if (fingerprints.has(fingerprint)) throw new Error('Geometría duplicada de otra muestra.');
        fingerprints.add(fingerprint);
        Object.assign(record, result, { technicalStatus: 'VALID_GEOMETRY' });
      } catch (error) {
        record.technicalStatus = 'REJECTED';
        record.technicalReason = error.message;
      }
      output.push(record);
      progress({
        id: record.id,
        status: record.technicalStatus,
        observations: record.frames.length,
      });
    }
  }
  return output;
}
