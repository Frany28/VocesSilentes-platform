import { FINGER_NAMES } from './landmarks.js';
import { imageDirection } from './features.js';
import { T, band, ramp } from './thresholds.js';

const pairKey = {
  'index-middle': 'indexMiddle',
  'middle-ring': 'middleRing',
  'ring-pinky': 'ringPinky',
};

/**
 * Convierte rasgos métricos en grados de cumplimiento (0–1) de propiedades articulatorias.
 * Cada propiedad es interpretable y se puede explicar al estudiante.
 * @param {object} f Rasgos de handFeatures.
 * @returns {object} Descriptores difusos por dedo, pulgar, pares y orientación.
 */
export function describeHand(f) {
  const fingers = Object.fromEntries(
    FINGER_NAMES.map((name) => {
      const x = f.fingers[name];
      const extended = Math.min(
        ramp(x.curl, T.extendedCurl),
        ramp(x.straightness, T.extendedStraight),
      );
      const closed = Math.min(ramp(x.curl, T.closedCurl), ramp(x.straightness, T.closedStraight));
      const curved = Math.min(band(x.straightness, T.curvedStraight), band(x.curl, T.curvedCurl));
      const hooked = Math.min(ramp(x.rise, T.hookRise), ramp(x.straightness, T.hookStraight));
      const draped = Math.min(ramp(x.straightness, T.drapedStraight), ramp(x.rise, T.drapedRise));
      const others = FINGER_NAMES.filter((other) => other !== name);
      // Cuánto sobresale la punta de este dedo respecto a la de los demás (X frente a E/S).
      const lead = ramp(x.rise - Math.max(...others.map((other) => f.fingers[other].rise)), T.lead);
      return [
        name,
        {
          extended,
          closed,
          curved,
          hooked,
          draped,
          lead,
          bent: 1 - extended,
          direction: imageDirection(x.direction),
        },
      ];
    }),
  );
  const th = f.thumb;
  const across = Math.min(
    ramp(th.indexLateral - th.lateral, T.thumbAcrossMargin),
    ramp(th.bend, T.thumbFolded),
  );
  const outside = ramp(th.lateral - th.indexLateral, T.thumbOutside);
  const thumb = {
    across,
    // A: junto al índice, por fuera, recto y alto.
    alongside: Math.min(outside, ramp(th.along, T.thumbHigh), ramp(th.bend, T.thumbStraight)),
    // L, Y, C: separado del índice.
    out: Math.min(ramp(th.toIndexMcp, T.thumbAway), outside),
    tucked: 1 - ramp(th.toIndexMcp, T.thumbAway),
    touches: Object.fromEntries(
      FINGER_NAMES.map((name) => [name, ramp(f.contacts[name], T.contact)]),
    ),
    apart: Object.fromEntries(
      FINGER_NAMES.map((name) => [name, ramp(f.contacts[name], T.noContact)]),
    ),
    // K: punta del pulgar apoyada en el medio, entre índice y medio.
    onMiddle: ramp(th.toMiddlePip, T.contact),
    // S: el pulgar envuelve por delante de los dedos; E: queda bajo las puntas.
    overFingers: ramp(th.overFingers, T.thumbOverFingers),
    underFingers: ramp(-th.overFingers, T.thumbOverFingers),
    direction: imageDirection(th.direction),
  };
  const pairs = Object.fromEntries(
    Object.entries(pairKey).map(([pair, key]) => [
      pair,
      {
        spread: ramp(f.spread[key], T.spread),
        together: Math.min(ramp(f.spread[key], T.together), ramp(f.tipGaps[key], T.tipsTogether)),
      },
    ]),
  );
  pairs['index-middle'].crossed = ramp(f.crossing.indexMiddle, T.crossed);
  const hand = imageDirection(f.orientation.hand);
  const orientation = {
    handUp: ramp(hand.up, T.pointing),
    handSide: ramp(hand.side, T.pointing),
    handDown: ramp(hand.down, T.pointing),
    palmToward: ramp(f.orientation.palmTowardCamera, T.palmToward),
    palmAway: ramp(-f.orientation.palmTowardCamera, T.palmToward),
  };
  return { fingers, thumb, pairs, orientation };
}

/**
 * Dirección cualitativa de un dedo, con grado de cumplimiento.
 * @param {object} d Descriptores.
 * @param {string} finger Nombre del dedo.
 * @param {'up'|'down'|'side'} where Dirección esperada en la imagen.
 * @returns {number} Grado entre 0 y 1.
 */
export function fingerPoints(d, finger, where) {
  return ramp(d.fingers[finger].direction[where], T.pointing);
}
