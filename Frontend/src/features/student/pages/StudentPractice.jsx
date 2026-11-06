import { useState } from 'react';
import { publicConfig } from '../../../lib/config.js';
import { Button } from '../../../components/ui/Button.jsx';
import { StudentPageHeader } from '../components/StudentPageHeader.jsx';
import { LearningPractice } from '../practice/LearningPractice.jsx';
import { PracticeGuide } from '../practice/PracticeGuide.jsx';
import { PracticeInstructions } from '../practice/PracticeInstructions.jsx';
import { VowelPracticeEntry } from '../curriculum/VowelPracticeEntry.jsx';

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
        description="Conecta lo que aprendes con lo que tus manos expresan."
      />
      <VowelPracticeEntry />
      <Button variant="secondary" icon={null} onClick={() => setInstructions(true)}>
        Ver instrucciones
      </Button>
      {!publicConfig.studentDemo ? <LearningPractice /> : <PracticeGuide demo={false} />}
      {instructions && <PracticeInstructions onClose={() => setInstructions(false)} />}
    </div>
  );
}
