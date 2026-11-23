import { useEffect, useRef, useState } from 'react';
import { Button } from '../../../components/ui/Button.jsx';
import { CameraPracticeLoader } from '../recognition/CameraPracticeLoader.jsx';

/**
 * Puente entre reconocer y señar: abre la práctica con cámara de la vocal recién reconocida dentro
 * de la misma actividad, sin cambiar de página. La cámara sigue requiriendo activación explícita.
 * @param {{letter: string, memory?: boolean, eyebrow: string, title: string, description: string,
 * onAttempt?: Function, actions: import('react').ReactNode}} props Vocal, textos y acciones de salida.
 * @returns {import('react').ReactElement} Workspace de cámara integrado en la actividad.
 */
export function VowelSignBridge({
  letter,
  memory = false,
  eyebrow,
  title,
  description,
  onAttempt,
  actions,
}) {
  const heading = useRef(null);
  const [revealed, setRevealed] = useState(!memory);
  useEffect(() => heading.current?.focus(), []);
  return (
    <section className="vowel-sign-bridge" aria-labelledby={`bridge-${letter}`}>
      <header className="vowel-bridge-heading">
        <div>
          <p className="journey-eyebrow text-action">{eyebrow}</p>
          <h3 id={`bridge-${letter}`} ref={heading} tabIndex={-1}>
            {title}
          </h3>
          <p>{description}</p>
        </div>
        <div className="vowel-bridge-actions">{actions}</div>
      </header>
      <CameraPracticeLoader
        key={letter}
        letter={letter}
        memory={memory}
        variant="workspace"
        referenceVisible={revealed}
        onRevealReference={() => setRevealed(true)}
        onAttempt={onAttempt}
      />
    </section>
  );
}

/**
 * @param {{onClick: Function, children: import('react').ReactNode, primary?: boolean}} props Acción.
 * @returns {import('react').ReactElement} Botón compacto para la cabecera del puente.
 */
export function BridgeAction({ onClick, children, primary = false }) {
  return (
    <Button
      variant={primary ? 'primary' : 'secondary'}
      icon={primary ? undefined : null}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
