import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';
import { expect, test, vi } from 'vitest';
import manifest from '../features/student/microclass/microclass-audio.json';
import { audioKey } from '../features/student/microclass/audio-key.js';
import { hasAudio } from '../features/student/microclass/audio-narration.js';
import { microclassScenes, quizHint } from '../features/student/microclass/microclass-script.js';
import { VowelMicroclass } from '../features/student/microclass/VowelMicroclass.jsx';

// jsdom no reproduce audio: se registra qué archivo se intenta reproducir.
function stubAudio() {
  const sources = [];
  const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function play() {
    sources.push(this.src);
    return Promise.resolve();
  });
  const pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  return { sources, play, pause };
}

test('cada subtítulo, revelación y pista tiene su audio generado en public/media/microclass', () => {
  const texts = microclassScenes.flatMap((scene) =>
    scene.cues.flatMap((cue) => [cue.text, cue.revealText].filter(Boolean)),
  );
  texts.push(...['A', 'I', 'O', 'U'].map(quizHint));
  for (const text of texts) expect(hasAudio(text), text).toBe(true);
  // Vitest se ejecuta desde Frontend/.
  for (const key of Object.keys(manifest.clips))
    expect(existsSync(join(cwd(), 'public/media/microclass', `${key}.mp3`)), key).toBe(true);
  expect(manifest.license).toBe('Apache-2.0');
});

test('no suena nada antes de comenzar; luego reproduce el audio de la frase y lo detiene al pausar', async () => {
  const audio = stubAudio();
  render(<VowelMicroclass />);
  expect(audio.play).not.toHaveBeenCalled();
  expect(screen.queryByText(/Con audio/)).toBeNull();
  await userEvent.click(screen.getByRole('button', { name: 'Comenzar la microclase' }));
  const first = microclassScenes[0].cues[0].text;
  expect(audio.sources.at(-1).endsWith(`/media/microclass/${audioKey(first)}.mp3`)).toBe(true);
  await userEvent.click(screen.getByRole('button', { name: 'Frase siguiente' }));
  const second = microclassScenes[0].cues[1].text;
  expect(audio.sources.at(-1).endsWith(`/media/microclass/${audioKey(second)}.mp3`)).toBe(true);
  audio.pause.mockClear();
  await userEvent.click(screen.getByRole('button', { name: 'Pausar microclase' }));
  expect(audio.pause).toHaveBeenCalled();
});

test('silenciar detiene el audio y desactiva el volumen; salir de la clase lo detiene', async () => {
  const audio = stubAudio();
  const view = render(<VowelMicroclass />);
  await userEvent.click(screen.getByRole('button', { name: 'Comenzar la microclase' }));
  expect(screen.getByRole('slider', { name: 'Volumen de la narración' })).toBeEnabled();
  audio.pause.mockClear();
  await userEvent.click(screen.getByRole('button', { name: 'Silenciar' }));
  expect(audio.pause).toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Activar sonido' })).toBeVisible();
  expect(screen.getByRole('slider', { name: 'Volumen de la narración' })).toBeDisabled();
  await userEvent.click(screen.getByRole('button', { name: 'Activar sonido' }));
  audio.pause.mockClear();
  view.unmount();
  expect(audio.pause).toHaveBeenCalled();
});
