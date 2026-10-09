import { useState } from 'react';
import { Badge } from '../components/ui/Badge.jsx';
import { Alert } from '../components/ui/Alert.jsx';
import { Progress } from '../components/ui/Progress.jsx';
import { ThemeSwitch } from '../components/ui/ThemeSwitch.jsx';
import { NavigationItem } from '../components/ui/NavigationItem.jsx';
import { GallerySection } from './GallerySection.jsx';

const statuses = [
  ['Información', 'info', 'Disponible', 'Antes de comenzar', 'Observa la seña antes de practicar.'],
  [
    'Éxito',
    'success',
    'Completado',
    '¡Ejercicio completado!',
    'Tu progreso se guardó correctamente.',
  ],
  ['Aviso', 'warning', 'En progreso', 'Revisa tu conexión', 'Puedes intentarlo de nuevo.'],
  ['Error', 'error', 'Revisar', 'No se pudo guardar', 'Inténtalo otra vez en unos momentos.'],
];

function ThemeExample({ initialDark }) {
  const [dark, setDark] = useState(initialDark);
  return <ThemeSwitch dark={dark} onClick={() => setDark((current) => !current)} />;
}

/**
 * Galería de estados semánticos y controles compartidos; todos los textos son ejemplos de Figma.
 * @returns {import('react').ReactElement} Componentes reales en ambos temas.
 */
export function GalleryFeedback() {
  return (
    <>
      <GallerySection
        title="ThemeToggle"
        states={['Claro', 'Oscuro']}
        width={224}
        render={(state) => <ThemeExample initialDark={state === 'Oscuro'} />}
      />
      <GallerySection
        title="Navigation/Item"
        states={['Normal', 'Hover', 'Activo', 'Foco']}
        width={264}
        render={(state) => (
          <NavigationItem
            href="#navigation-example"
            active={state === 'Activo'}
            className={
              state === 'Hover' ? 'vs-preview-hover' : state === 'Foco' ? 'vs-preview-focus' : ''
            }
          >
            Mis módulos
          </NavigationItem>
        )}
      />
      <GallerySection
        title="Badge"
        states={statuses.map(([label]) => label)}
        width={200}
        render={(state) => {
          const [, tone, label] = statuses.find(([name]) => name === state);
          return <Badge tone={tone}>{label}</Badge>;
        }}
      />
      <GallerySection
        title="Alert"
        states={statuses.map(([label]) => label)}
        width={350}
        render={(state) => {
          const [, tone, , title, message] = statuses.find(([name]) => name === state);
          return (
            <Alert tone={tone} title={title} role="group">
              {message}
            </Alert>
          );
        }}
      />
      <GallerySection
        title="Progress"
        states={['Inicio', 'En progreso', 'Completo']}
        width={304}
        render={(state) => {
          const value = state === 'Completo' ? 100 : state === 'En progreso' ? 60 : 0;
          const text =
            value === 100 ? 'Completado' : value === 60 ? '3 de 5 lecciones' : 'Sin iniciar';
          return (
            <Progress label="Progreso del módulo" value={value} valueText={`${value}% · ${text}`} />
          );
        }}
      />
    </>
  );
}
