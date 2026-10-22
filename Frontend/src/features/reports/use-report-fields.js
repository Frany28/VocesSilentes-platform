import { useState } from 'react';

/**
 * Campos/validación de Figma; título y ubicación se conservan en description del contrato existente.
 * @returns {object} Borrador, errores visibles y validate que devuelve el payload o null.
 */
export function useReportFields() {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [errors, setErrors] = useState({});
  const validate = () => {
    const next = {};
    if (!title.trim()) next.title = 'Completa este campo.';
    if (!category) next.category = 'Completa este campo.';
    if (!description.trim()) next.description = 'Describe el problema para poder revisarlo.';
    const text = [
      title.trim(),
      location.trim() && `Ubicación: ${location.trim()}`,
      description.trim(),
    ]
      .filter(Boolean)
      .join('\n\n');
    if (text.length > 4000) next.description = 'El reporte completo admite hasta 4000 caracteres.';
    setErrors(next);
    return Object.keys(next).length ? null : { description: text, category };
  };
  return {
    title,
    setTitle,
    location,
    setLocation,
    description,
    setDescription,
    category,
    setCategory,
    errors,
    validate,
    changed: Boolean(title || location || description || category),
  };
}
