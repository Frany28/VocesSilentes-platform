import lightLogo from '../../../assets/auth/36e7e.png';
import darkLogo from '../../../assets/auth/0ad79.png';

/**
 * Sitúa los SVG de las órbitas y los recortes de los isotipos en sus slots originales.
 * @returns {import('react').ReactElement} Ilustración decorativa con capas de movimiento independientes.
 */
export function LoginIllustration() {
  return (
    <div
      className="login-illustration relative flex items-center justify-center"
      aria-hidden="true"
    >
      <span
        className="login-orbit login-orbit-outer absolute bg-center bg-no-repeat
          [background-image:var(--login-orbit-outer)]"
      />
      <span
        className="login-orbit login-orbit-inner absolute bg-center bg-no-repeat
          [background-image:var(--login-orbit-inner)]"
      />
      <div className="login-emblem flex items-center justify-center rounded-full">
        <div className="login-emblem-light">
          <img src={lightLogo} alt="" />
        </div>
        <div className="login-emblem-dark">
          <img src={darkLogo} alt="" />
        </div>
      </div>
      <span
        className="login-float login-float-hello absolute rounded-2xl bg-surface px-4 py-3
          [font:var(--type-button)] whitespace-nowrap shadow-[0_8px_20px_rgb(20_15_51/10%)]"
      >
        Hola, un nuevo comienzo
      </span>
      <span
        className="login-float login-float-pace absolute rounded-2xl bg-tertiary
          px-4 py-3 [font:var(--type-button)] whitespace-nowrap shadow-[0_8px_20px_rgb(20_15_51/10%)]"
      >
        LSV · A tu ritmo
      </span>
    </div>
  );
}
