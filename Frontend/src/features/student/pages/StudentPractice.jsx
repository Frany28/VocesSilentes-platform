import { useState } from 'react';
import { publicConfig } from '../../../lib/config.js';
import { Button } from '../../../components/ui/Button.jsx';
import { StudentPageHeader } from '../components/StudentPageHeader.jsx';
import { LearningPractice } from '../practice/LearningPractice.jsx';
import { PracticeInstructions } from '../practice/PracticeInstructions.jsx';
import { SignPracticeWorkspace } from '../practice/SignPracticeWorkspace.jsx';

/**
 * Prioriza la actividad real de vocales; conserva los registros manuales como acciones separadas.
 * @returns {import('react').ReactElement} Acceso a cámara, referencias y lectura, sin resultados simulados.
 */
export function StudentPractice() {
  const [instructions, setInstructions] = useState(false);
  return (
    <div className="flex flex-col gap-6">
      <StudentPageHeader
        title="Practicar"
        description="Elige una vocal, observa su referencia y practica con la cámara."
      />
      <SignPracticeWorkspace />
      <Button variant="secondary" icon={null} onClick={() => setInstructions(true)}>
        Ver instrucciones
      </Button>
      {!publicConfig.studentDemo && (
        <details className="education-card">
          <summary className="min-h-11 cursor-pointer [font:var(--type-subtitle)]">
            Registro de lecturas
          </summary>
          <LearningPractice />
        </details>
      )}
      {instructions && <PracticeInstructions onClose={() => setInstructions(false)} />}
    </div>
  );
}
