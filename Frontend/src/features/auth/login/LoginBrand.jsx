import lightLogo from '../../../assets/auth/36e7e.png';
import darkLogo from '../../../assets/auth/0ad79.png';

/**
 * Conserva los recortes originales de la marca clara y el isotipo oscuro de Foundations.
 * @returns {import('react').ReactElement} Marca con nombre accesible y recursos por tema.
 */
export function LoginBrand() {
  return (
    <div className="login-brand" role="img" aria-label="VocesSilentes">
      <div className="login-brand-light" aria-hidden="true">
        <div className="login-brand-hands">
          <img src={lightLogo} alt="" />
        </div>
        <div className="login-brand-word">
          <img src={lightLogo} alt="" />
        </div>
        <span>MÁS SEÑAS, MENOS BARRERAS</span>
      </div>
      <div className="login-brand-dark" aria-hidden="true">
        <div className="login-brand-isotype">
          <img src={darkLogo} alt="" />
        </div>
        <span>VocesSilentes</span>
      </div>
    </div>
  );
}
