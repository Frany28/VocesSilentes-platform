/**
 * Presenta cobertura y bloqueos en texto legible sin atribuir precisión lingüística a la geometría.
 * @param {object} report Reporte técnico y de elegibilidad.
 * @param {object[]} details Resumen de cada candidato, sin landmarks.
 * @returns {string} Texto local de diagnóstico.
 */
export function candidateSummary(report, details) {
  return [
    `Videos: ${report.sources.length}`,
    `Candidatos: ${report.totalCandidates}`,
    `Geometría válida: ${report.validGeometry}`,
    `Rechazados técnicamente: ${report.rejectedGeometry}`,
    `Listos para entrenar: ${report.trainingReady}`,
    'Geometría válida no significa seña correcta ni permiso confirmado.',
    'NONE representa posturas/señas ajenas a las vocales objetivo, no LSV incorrecta.',
    ...report.technicalCoverage.map(
      (item) =>
        `${item.label}: ${item.valid} candidatos técnicamente válidos; ${item.rejected} rechazos.`,
    ),
    'Métricas de reconocimiento: no calculadas por el preparador; consultar training-diagnosis.json.',
    ...report.required,
    ...details.map(
      (item) =>
        `${item.id}: ${item.technicalStatus}; ${item.technicalReason ?? ''}; ${item.blocked.join(', ')}`,
    ),
  ].join('\n');
}
