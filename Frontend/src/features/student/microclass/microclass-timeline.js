/**
 * Aplana escenas en una línea de tiempo con inicios acumulados.
 * @param {import('./microclass-script.js').MicroclassScene[]} scenes Guion ordenado.
 * @returns {{cues: object[], scenes: object[], total: number}} Frases con escena/posición y escenas con inicio.
 */
export function buildTimeline(scenes) {
  const cues = [];
  let clock = 0;
  const timed = scenes.map((scene, sceneIndex) => {
    const start = clock;
    const first = cues.length;
    scene.cues.forEach((cue, cueIndex) => {
      cues.push({ ...cue, scene, sceneIndex, cueIndex, start: clock });
      clock += cue.seconds;
    });
    return { ...scene, start, first, seconds: clock - start };
  });
  return { cues, scenes: timed, total: clock };
}

/**
 * Formatea segundos como m:ss para la barra de tiempo y los capítulos.
 * @param {number} seconds Segundos transcurridos.
 * @returns {string} Tiempo legible.
 */
export function formatTime(seconds) {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}
