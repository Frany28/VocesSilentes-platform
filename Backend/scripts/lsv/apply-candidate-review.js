/**
 * Aplica declaraciones humanas a puntos ya extraídos, vinculándolas al mismo hash, intervalo y ejecución.
 * @param {object} quarantine Cuarentena local generada por MediaPipe.
 * @param {object} manifest Revisión manual actualizada; nunca se deducen identidades de rostros.
 * @returns {object[]} Candidatos con metadatos revisados, manteniendo exactamente las observaciones técnicas originales.
 * @throws {Error} Cambios de archivo/recorte o registros ausentes; exige volver a extraer.
 */
export function applyCandidateReview(quarantine, manifest) {
  if (quarantine.type !== 'QUARANTINE_NOT_TRAINING_DATA' || !Array.isArray(quarantine.candidates))
    throw new Error('Se necesita la cuarentena técnica original.');
  if (quarantine.candidates.length !== manifest.candidates.length)
    throw new Error('Cambió la selección de ejecuciones; vuelve a preparar el conjunto.');
  for (const source of manifest.sources) {
    if (quarantine.sources.find((item) => item.id === source.id)?.sha256 !== source.sha256)
      throw new Error('Cambió el archivo de origen; vuelve a extraer sus observaciones.');
  }
  return quarantine.candidates.map((record) => {
    const annotation = manifest.candidates.find((item) => item.id === record.id);
    if (
      !annotation ||
      ['videoId', 'startMs', 'endMs', 'executionId', 'observedSignant'].some(
        (field) => annotation[field] !== record[field],
      )
    )
      throw new Error('Cambió la ejecución o su recorte; vuelve a extraerla antes de revisar.');
    const track = manifest.observedSignants?.find((item) => item.id === record.observedSignant);
    return {
      ...record,
      label: annotation.label,
      labelEvidence: annotation.labelEvidence,
      participantId: annotation.participantId ?? track?.confirmedParticipantId ?? null,
      reviewStatus:
        annotation.reviewStatus === 'APPROVED_LSV' ? 'APPROVED_LSV' : 'PENDING_LSV_REVIEW',
      reviewerId: annotation.reviewerId ?? null,
    };
  });
}
