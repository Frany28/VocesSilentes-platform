import { useEffect, useRef, useState } from 'react';
import { validateModel } from '../../../../../shared/lsv/classifier.js';
import { RecognitionModelContext } from './model-context.js';
import { assertModelUsage } from './model-usage.js';
import { useDemoLoader } from './use-demo-loader.js';

/**
 * Conserva el modelo experimental solo en memoria durante la sesión Student, sin duplicar progreso académico.
 * @param {{children: import('react').ReactNode}} props Experiencias del mismo usuario.
 * @returns {import('react').ReactElement} Modelo importable una vez y reutilizable entre letras/lecciones.
 */
export function RecognitionModelProvider({ children }) {
  const [referenceHand, setReferenceHand] = useState('Right');
  const [model, setModel] = useState(null);
  const generation = useRef(0);
  useEffect(
    () => () => {
      generation.current += 1;
    },
    [],
  );
  const importModel = async (file) => {
    const ticket = ++generation.current;
    if (file.size > 8 * 1024 * 1024) throw new Error('MODEL_TOO_LARGE');
    const parsed = validateModel(JSON.parse(await file.text()));
    assertModelUsage(parsed);
    if (generation.current === ticket) setModel(parsed);
  };
  const demo = useDemoLoader(importModel);
  return (
    <RecognitionModelContext.Provider
      value={{ model, importModel, ...demo, referenceHand, setReferenceHand }}
    >
      {children}
    </RecognitionModelContext.Provider>
  );
}
