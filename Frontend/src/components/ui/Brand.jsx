import lightLogo from '../../assets/auth/36e7e.png';
import darkLogo from '../../assets/auth/0ad79.png';

/**
 * Comparte marca e isotipos originales entre Auth y Student, con los recortes de Foundations.
 * @param {{compact?: boolean, smallDark?: boolean}} props Isotipo de tablet o marca completa.
 * @returns {import('react').ReactElement} Marca con nombre accesible y recursos por tema.
 */
export function Brand({ compact = false, smallDark = false }) {
  return (
    <div
      className="vs-brand"
      role="img"
      aria-label="VocesSilentes"
      data-size={smallDark ? 'small' : 'full'}
    >
      {compact ? (
        <>
          <div className="vs-brand-compact-light" aria-hidden="true">
            <img src={lightLogo} alt="" />
          </div>
          <div className="vs-brand-compact-dark" aria-hidden="true">
            <img src={darkLogo} alt="" />
          </div>
        </>
      ) : (
        <>
          <div className="vs-brand-light" aria-hidden="true">
            <div className="vs-brand-hands">
              <img src={lightLogo} alt="" />
            </div>
            <div className="vs-brand-word">
              <img src={lightLogo} alt="" />
            </div>
            <span>MÁS SEÑAS, MENOS BARRERAS</span>
          </div>
          <div className="vs-brand-dark" aria-hidden="true">
            <div className="vs-brand-isotype">
              <img src={darkLogo} alt="" />
            </div>
            <span>VocesSilentes</span>
          </div>
        </>
      )}
    </div>
  );
}
