import { Button } from '../../../components/ui/Button.jsx';
/**
 * Pagina la colección filtrada, con botones limitados a páginas disponibles.
 * @param {{list: object}} props Estado de useAdminList.
 * @returns {import('react').ReactElement} Controles y recuento accesibles.
 */
export function AdminPagination({ list }) {
  const size = list.pageSize ?? 3;
  return (
    <div className="admin-pagination">
      <p aria-live="polite">
        Mostrando {list.total ? (list.page - 1) * size + 1 : 0}–
        {Math.min(list.page * size, list.total)} de {list.total}
      </p>
      <div className="admin-pagination-controls">
        <Button
          density="compact"
          variant="secondary"
          icon={null}
          disabled={list.page <= 1}
          onClick={() => list.go(list.page - 1)}
        >
          Anterior
        </Button>
        <span aria-label={`Página ${list.page} de ${list.pages}`}>
          {list.page} / {list.pages}
        </span>
        <Button
          density="compact"
          variant="secondary"
          icon={null}
          disabled={list.page >= list.pages}
          onClick={() => list.go(list.page + 1)}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
