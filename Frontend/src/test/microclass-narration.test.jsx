import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import {
  narrationStatus,
  speak,
  stopSpeech,
} from '../features/student/microclass/speech-narration.js';
import { VowelMicroclass } from '../features/student/microclass/VowelMicroclass.jsx';

function engine(voices) {
  const value = {
    getVoices: () => voices,
    speak: vi.fn(),
    cancel: vi.fn(),
    resume: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
  vi.stubGlobal('speechSynthesis', value);
  vi.stubGlobal(
    'SpeechSynthesisUtterance',
    class {
      constructor(text) {
        this.text = text;
      }
    },
  );
  return value;
}

test('con las voces aún sin cargar (Chrome) narra igualmente en español', () => {
  const synth = engine([]);
  expect(narrationStatus()).toBe('loading');
  expect(speak('Esta es la vocal A.', () => {})).toBe(true);
  const utterance = synth.speak.mock.calls[0][0];
  expect(utterance.lang).toBe('es-ES');
  expect(utterance.voice).toBeUndefined();
  stopSpeech();
});

test('usa la voz en español disponible, prefiriendo variantes latinoamericanas', () => {
  const mexican = { lang: 'es-MX', name: 'México' };
  const synth = engine([
    { lang: 'en-US', name: 'Inglés' },
    { lang: 'es-ES', name: 'España' },
    mexican,
  ]);
  expect(narrationStatus()).toBe('ready');
  speak('Esta es la vocal E.', () => {});
  expect(synth.speak.mock.calls[0][0].voice).toBe(mexican);
});

test('sin voz en español no narra en otro idioma y avisa que sigue con subtítulos', () => {
  const synth = engine([{ lang: 'en-US', name: 'Inglés' }]);
  expect(narrationStatus()).toBe('none');
  expect(speak('Esta es la vocal I.', () => {})).toBe(false);
  expect(synth.speak).not.toHaveBeenCalled();
  render(<VowelMicroclass />);
  expect(screen.getByText(/no tiene una voz en español instalada/)).toBeVisible();
});

test('con voz disponible anuncia que la microclase tiene audio', () => {
  engine([{ lang: 'es-VE', name: 'Venezuela' }]);
  render(<VowelMicroclass />);
  expect(screen.getByText(/Con audio: narración en español/)).toBeVisible();
});
