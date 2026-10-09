import { SelectionControl } from './SelectionControl.jsx';

/**
 * Radio nativo; name establece su grupo y las flechas cambian la selección.
 * @param {object} props Contenido, ref y atributos del control.
 * @returns {import('react').ReactElement} Opción de Figma.
 */
export function Radio(props) {
  return <SelectionControl {...props} type="radio" />;
}
