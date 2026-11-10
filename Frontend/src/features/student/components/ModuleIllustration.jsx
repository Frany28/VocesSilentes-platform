import alphabet from '../../../assets/module-previews/alfabeto-dactilologico.webp';
import numbers from '../../../assets/module-previews/numeros-cantidades.webp';
import emotions from '../../../assets/module-previews/expresiones-emociones.webp';
import greetings from '../../../assets/module-previews/saludos-presentacion.webp';
import family from '../../../assets/module-previews/familia-personas.webp';
import colors from '../../../assets/module-previews/colores-objetos.webp';

const previews = {
  'modulo-01-alfabeto-manual-lsv': alphabet,
  'lsv-02-numeros': numbers,
  'lsv-03-colores': colors,
  'lsv-04-cortesia': greetings,
  'lsv-05-familia': family,
  'lsv-07-emociones': emotions,
};

/**
 * Muestra la portada proporcionada por el usuario según la clave curricular estable.
 * @param {{contentKey?: string}} props Clave del módulo; sin portada conserva el recurso genérico.
 * @returns {import('react').ReactElement} Portada decorativa completa, sin recortar su texto.
 */
export function ModuleIllustration({ contentKey }) {
  const source = previews[contentKey];
  if (source) {
    return (
      <img
        src={source}
        alt=""
        width="1448"
        height="1086"
        loading="lazy"
        decoding="async"
        className="block h-auto w-full"
      />
    );
  }
  return (
    <div className="student-module-art relative w-full" aria-hidden="true">
      <span className="student-circle-large" />
      <span className="student-circle-small" />
      <span className="student-hand" />
    </div>
  );
}
