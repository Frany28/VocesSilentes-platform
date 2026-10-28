import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Select } from '../components/ui/Select.jsx';

test('Select conserva identidad, ref, descripciones externas y error como Input', () => {
  const ref = { current: null };
  const view = render(
    <>
      <p id="external">Contexto del formulario</p>
      <Select
        id="category"
        ref={ref}
        label="Categoría"
        help="Elige un tipo"
        aria-describedby="external"
      >
        <option>Contenido</option>
      </Select>
    </>,
  );
  const select = screen.getByRole('combobox', { name: 'Categoría' });
  expect(ref.current).toBe(select);
  expect(select).toHaveAttribute('id', 'category');
  expect(select).toHaveAccessibleDescription('Contexto del formulario Elige un tipo');
  view.rerender(
    <>
      <p id="external">Contexto del formulario</p>
      <Select
        id="category"
        label="Categoría"
        help="Elige un tipo"
        error="Corrige el tipo"
        aria-describedby="external"
      >
        <option>Contenido</option>
      </Select>
    </>,
  );
  expect(select).toHaveAccessibleDescription('Contexto del formulario Corrige el tipo');
  expect(select).toHaveAttribute('aria-invalid', 'true');
  view.rerender(
    <Select label="Categoría" aria-invalid="true">
      <option>Contenido</option>
    </Select>,
  );
  expect(select).toHaveAttribute('aria-invalid', 'true');
});
