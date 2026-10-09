import { SelectionControl } from './SelectionControl.jsx';

/**
 * Checkbox nativo; admite checked/defaultChecked, disabled, ref y onChange.
 * @param {object} props Contenido y atributos del control.
 * @returns {import('react').ReactElement} Casilla de Figma.
 */
export function Checkbox(props) {
  return <SelectionControl {...props} type="checkbox" />;
}
