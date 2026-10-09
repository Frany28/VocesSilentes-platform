import { Input } from '../../../components/ui/Input.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { moduleProgress } from '../data/module-progress.js';

/**
 * Búsqueda y filtros presentes en Figma; conteos del catálogo, no de la consulta actual.
 * @param {{modules: object[], query: string, filter: string, onQuery: Function, onFilter: Function}} props Estado local.
 * @returns {import('react').ReactElement} Controles de filtrado por teclado y nombre.
 */
export function ModuleFilters({ modules, query, filter, onQuery, onFilter }) {
  const filters = [
    ['all', 'Todos'],
    ['progress', 'En progreso'],
    ['locked', 'Bloqueados'],
  ];
  return (
    <div className="flex flex-col gap-6">
      <Input
        appearance="plain"
        className="student-search"
        label="Buscar módulo"
        type="search"
        value={query}
        onChange={(event) => onQuery(event.target.value)}
        placeholder="Busca un módulo por su nombre"
        autoComplete="off"
        maxLength={200}
      />
      <div className="flex flex-wrap gap-3" role="group" aria-label="Filtrar módulos">
        {filters.map(([value, label]) => (
          <Button
            key={value}
            variant={filter === value ? 'primary' : 'secondary'}
            icon={null}
            className="w-44! [--size-control:48px] max-[600px]:w-[calc((100%_-_12px)/2)]!"
            aria-pressed={filter === value}
            onClick={() => onFilter(value)}
          >
            {label} ·{' '}
            {value === 'all'
              ? modules.length
              : modules.filter((module) => moduleProgress(module).state === value).length}
          </Button>
        ))}
      </div>
    </div>
  );
}
