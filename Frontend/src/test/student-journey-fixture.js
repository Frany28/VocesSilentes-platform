import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Recorre únicamente acciones visibles hasta la primera actividad; no altera estado ni almacenamiento.
 * @returns {Promise<void>} Pregunta lista para interacción con teclado o puntero.
 */
export async function reachQuestion() {
  await screen.findByRole('button', { name: 'Continuar' });
  for (let index = 0; index < 20; index += 1) {
    if (screen.queryByRole('button', { name: 'Comprobar respuesta' })) return;
    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));
  }
  throw new Error('No se alcanzó una pregunta disponible');
}

/**
 * Recorre una lección sin preguntas disponibles, manteniendo todos sus pasos visibles.
 * @returns {Promise<void>} Resumen teórico; no comprueba respuestas ni registra lectura.
 */
export async function reachReadingSummary() {
  await screen.findByRole('button', { name: 'Continuar' });
  for (let index = 0; index < 30; index += 1) {
    if (screen.queryByRole('region', { name: 'Resumen de la lección' })) return;
    const next =
      screen.queryByRole('button', { name: 'Continuar' }) ??
      screen.getByRole('button', { name: 'Ver mi resumen' });
    await userEvent.click(next);
  }
  throw new Error('No se alcanzó el resumen de lectura');
}
