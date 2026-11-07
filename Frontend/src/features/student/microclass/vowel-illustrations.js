import provenance from '../../../assets/lsv-manual/provenance.json';
import a from '../../../assets/lsv-manual/a.webp';
import e from '../../../assets/lsv-manual/e.webp';
import i from '../../../assets/lsv-manual/i.webp';
import o from '../../../assets/lsv-manual/o.webp';
import u from '../../../assets/lsv-manual/u.webp';

// Excepción deliberada a manualReference(): solo estas cinco ilustraciones entran en el build de
// producción, porque la usuaria confirmó autorización de uso el 6 de noviembre de 2026.
// Las demás letras siguen reservadas a la revisión de desarrollo. Ver docs/vowel-microclass.md.
const urls = { A: a, E: e, I: i, O: o, U: u };

/**
 * Devuelve la ilustración original del manual para una vocal de la microclase.
 * @param {'A'|'E'|'I'|'O'|'U'} letter Vocal que se estudia.
 * @returns {{url: string, page: number}} URL con hash de Vite y página del manual.
 */
export function vowelIllustration(letter) {
  return { url: urls[letter], page: provenance.images[letter].page };
}

export const illustrationCredit = 'Ilustraciones: Yulianny Fuentes, Manual básico de LSV (2022)';
