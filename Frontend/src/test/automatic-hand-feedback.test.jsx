import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { DetectionStatus } from '../features/student/recognition/DetectionStatus.jsx';
import { trackedFixture } from '../../../Backend/tests/fixtures/tracked-hands.js';

test.each(['Left', 'Right'])('muestra %s automáticamente y no ofrece selector de mano', (hand) => {
  const detection = trackedFixture({ hand }).frames.at(-1);
  render(<DetectionStatus camera={{ state: 'live', detection, hand }} />);
  expect(screen.queryByRole('combobox')).toBeNull();
  expect(
    screen.getByText(new RegExp(`Mano ${hand === 'Left' ? 'izquierda' : 'derecha'} detectada`)),
  ).toBeVisible();
});

test('ambas manos se identifican y se pide una sola para el piloto, sin inventar una seña', () => {
  render(
    <DetectionStatus
      camera={{ state: 'live', detection: trackedFixture({ both: true }).frames.at(-1) }}
    />,
  );
  expect(screen.getByText('Manos detectadas: izquierda y derecha.')).toBeVisible();
  expect(screen.getByText('Usa solo una mano para esta práctica')).toBeVisible();
  expect(screen.queryByText(/Seña reconocida/)).toBeNull();
});

test('la modalidad futura de dos manos conserva identificación sin pedir ocultar una mano', () => {
  render(
    <DetectionStatus
      expectedHands={2}
      camera={{ state: 'live', detection: trackedFixture({ both: true }).frames.at(-1) }}
    />,
  );
  expect(screen.queryByText('Usa solo una mano para esta práctica')).toBeNull();
  expect(screen.getByText('Manos detectadas: izquierda y derecha.')).toBeVisible();
});
