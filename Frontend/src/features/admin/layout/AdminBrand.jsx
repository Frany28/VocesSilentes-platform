import logo from '../../../assets/auth/36e7e.png';

/**
 * Marca compacta del rediseño, con el mismo original y recorte 44 × 34 del Figma.
 * @returns {import('react').ReactElement} Isotipo y nombre accesible.
 */
export function AdminBrand() {
  return (
    <div className="admin-brand">
      <span className="admin-brand-mark">
        <img src={logo} alt="" />
      </span>
      <span>VocesSilentes</span>
    </div>
  );
}
