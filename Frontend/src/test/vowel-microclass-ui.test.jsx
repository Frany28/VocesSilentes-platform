import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { VowelMicroclass } from '../features/student/microclass/VowelMicroclass.jsx';

function stubSpeech() {
  const engine = {
    getVoices: () => [{ lang: 'es-MX', name: 'Voz de prueba' }],
    speak: vi.fn(),
    cancel: vi.fn(),
  };
  vi.stubGlobal('speechSynthesis', engine);
  vi.stubGlobal(
    'SpeechSynthesisUtterance',
    class {
      constructor(text) {
        this.text = text;
      }
    },
  );
  return engine;
}

test('no narra hasta pulsar comenzar y muestra cada frase como subtítulo', async () => {
  const engine = stubSpeech();
  const fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  render(<VowelMicroclass />);
  expect(engine.speak).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole('button', { name: 'Comenzar la microclase' }));
  expect(
    screen.getByText(/es la lengua de la comunidad sorda de Venezuela/, {
      selector: '.mc-captions',
    }),
  ).toBeVisible();
  expect(engine.speak.mock.calls.at(-1)[0].text).toMatch(/^La Lengua de Señas Venezolana/);
  await userEvent.click(screen.getByRole('button', { name: 'Frase siguiente' }));
  expect(
    screen.getByText(/^Aprenderla te permite comunicarte/, { selector: '.mc-captions' }),
  ).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: 'Pausar microclase' }));
  expect(engine.cancel).toHaveBeenCalled();
  expect(fetchMock).not.toHaveBeenCalled();
});

test('cada vocal muestra la ilustración original con su crédito', async () => {
  vi.stubGlobal('speechSynthesis', undefined);
  render(<VowelMicroclass />);
  await userEvent.click(screen.getByRole('button', { name: /^Vocal U, / }));
  expect(screen.getByRole('img', { name: /mano realizando la vocal U/ })).toBeVisible();
  expect(screen.getByText(/Manual básico de LSV \(2022\), p\. 6/)).toBeVisible();
});

test('la pregunta oculta la letra, da una pista y confirma la respuesta correcta', async () => {
  vi.stubGlobal('speechSynthesis', undefined);
  render(<VowelMicroclass />);
  await userEvent.click(screen.getByRole('button', { name: /^Pregunta: ¿qué vocal es\?, / }));
  expect(screen.getByRole('img', { name: /una vocal por identificar/ })).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: 'A' }));
  expect(screen.getByText(/^Todavía no es la A/, { selector: '.mc-captions' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'A' })).toBeDisabled();
  await userEvent.click(screen.getByRole('button', { name: 'E' }));
  expect(screen.getByText(/^¡Correcto! Es la E/, { selector: '.mc-captions' })).toBeVisible();
  expect(screen.getByRole('status')).toHaveTextContent('Es la E.');
});

test('detiene la narración al salir de la microclase', async () => {
  const engine = stubSpeech();
  const view = render(<VowelMicroclass />);
  await userEvent.click(screen.getByRole('button', { name: 'Comenzar la microclase' }));
  engine.cancel.mockClear();
  view.unmount();
  expect(engine.cancel).toHaveBeenCalled();
});
