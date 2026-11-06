import { useState } from 'react';
import { Link } from 'react-router';
import { Select } from '../../../components/ui/Select.jsx';
import { StudentPageHeader } from '../components/StudentPageHeader.jsx';
import { CameraExercise } from '../recognition/CameraExercise.jsx';
import '../lesson/lesson.css';

/**
 * Integra referencias y reconocimiento real en aprendizaje; elegir la vocal no influye en la clasificación.
 * @returns {import('react').ReactElement} Actividad accesible bajo sesión USER, sin calificación automática.
 */
export function StudentVowelPractice() {
  const [letter, setLetter] = useState('A');
  return (
    <div className="flex min-w-0 flex-col gap-6">
      <StudentPageHeader
        title="Aprende y practica las vocales"
        description="Observa la referencia, carga el modelo de vocales y realiza tu intento frente a la cámara."
      />
      <Link
        className="education-back inline-flex min-h-11 items-center"
        to="/student/modules/vowels"
      >
        Abrir módulo de aprendizaje: explicación y práctica paso a paso
      </Link>
      <section className="education-card flex flex-col gap-3">
        <Select
          label="Vocal de referencia"
          value={letter}
          onChange={(event) => setLetter(event.target.value)}
        >
          {['A', 'E', 'I', 'O', 'U'].map((vowel) => (
            <option key={vowel} value={vowel}>
              {vowel}
            </option>
          ))}
        </Select>
        <p>
          La vocal elegida sirve para estudiar la referencia. La predicción depende de los puntos
          capturados. Se necesita una sola mano visible durante tres segundos. Puedes repetir o
          recibir una abstención.
        </p>
      </section>
      <div className="education-card">
        <CameraExercise key={letter} letter={letter} />
      </div>
      <Link className="education-back inline-flex min-h-11 items-center" to="/student/modules">
        Volver a mis módulos
      </Link>
    </div>
  );
}
