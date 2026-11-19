import { LSV_LABELS } from './labels.js';

const ratio = (numerator, denominator) => (denominator ? numerator / denominator : null);

/**
 * Resume predicciones observadas, contando UNSURE como error/abstención y nunca como un NONE correcto.
 * @param {{expected: string, predicted: string}[]} rows Predicciones sobre muestras independientes.
 * @param {string[]} labels Clases fijadas antes de evaluar, incluida NONE.
 * @returns {object} Accuracy, precision/recall/F1 macro y por clase, matriz densa y falsos positivos de NONE.
 * @throws {Error} Clases desconocidas o predicciones fuera del experimento.
 */
export function classificationMetrics(rows, labels) {
  if (
    !labels.length ||
    new Set(labels).size !== labels.length ||
    labels.some((label) => !LSV_LABELS.includes(label)) ||
    rows.some(
      (row) => !labels.includes(row.expected) || ![...labels, 'UNSURE'].includes(row.predicted),
    )
  )
    throw new Error('Las métricas requieren etiquetas y predicciones del mismo experimento.');
  const confusionMatrix = Object.fromEntries(
    labels.map((label) => [
      label,
      Object.fromEntries([...labels, 'UNSURE'].map((prediction) => [prediction, 0])),
    ]),
  );
  for (const row of rows) confusionMatrix[row.expected][row.predicted] += 1;
  const perLetter = Object.fromEntries(
    labels.map((label) => {
      const support = rows.filter((row) => row.expected === label).length;
      const predicted = rows.filter((row) => row.predicted === label).length;
      const tp = confusionMatrix[label][label];
      return [
        label,
        {
          support,
          predicted,
          truePositives: tp,
          falsePositives: predicted - tp,
          falseNegatives: support - tp,
          precision: ratio(tp, predicted),
          recall: ratio(tp, support),
          f1: support ? (2 * tp) / (predicted + support) : null,
        },
      ];
    }),
  );
  const macro = (key) =>
    Object.values(perLetter).reduce((sum, item) => sum + (item[key] ?? 0), 0) / labels.length;
  const correct = rows.filter((row) => row.expected === row.predicted).length;
  const none = rows.filter((row) => row.expected === 'NONE');
  const noneFalsePositives = none.filter(
    (row) => !['NONE', 'UNSURE'].includes(row.predicted),
  ).length;
  return {
    total: rows.length,
    correct,
    errors: rows.length - correct,
    abstained: rows.filter((row) => row.predicted === 'UNSURE').length,
    accuracy: ratio(correct, rows.length),
    macroPrecision: rows.length ? macro('precision') : null,
    macroRecall: rows.length ? macro('recall') : null,
    macroF1: rows.length ? macro('f1') : null,
    macroPolicy: 'ALL_SELECTED_LABELS_UNDEFINED_AS_ZERO',
    perLetter,
    confusionMatrix,
    noneTestSamples: none.length,
    noneFalsePositives,
    noneFalsePositiveRate: ratio(noneFalsePositives, none.length),
  };
}
