import { Icon } from '../components/ui/Icon.jsx';
import { GalleryControls } from './GalleryControls.jsx';
import { GalleryFeedback } from './GalleryFeedback.jsx';
import { GalleryContent } from './GalleryContent.jsx';

/**
 * Entrada de revisión local; no comparte router ni proveedor de auth ni realiza peticiones API.
 * @returns {import('react').ReactElement} Inventario general respaldado por Figma 75:67.
 */
export function Gallery() {
  return (
    <main className="gallery" data-theme="light">
      <h1>VocesSilentes / UI Kit</h1>
      <p className="gallery-subtitle">Componentes principales · Claro y oscuro</p>
      <p className="gallery-intro">
        MVP de aprendizaje LSV · Variables vinculadas · Auto layout · Textos editables
      </p>
      <GalleryControls />
      <GalleryFeedback />
      <p className="gallery-intro" id="navigation-example">
        Uso: cambia Tema en cada instancia. Los estados representan especificaciones visuales;
        teclado, lectores de pantalla y persistencia se implementarán en la web.
      </p>
      <section className="gallery-section">
        <h2>Iconografía</h2>
        <div className="gallery-icons">
          {['arrow', 'mail', 'book', 'check', 'lock', 'info', 'sun', 'moon'].map((name) => (
            <Icon name={name} size={24} key={name} />
          ))}
        </div>
      </section>
      <GalleryContent />
    </main>
  );
}
