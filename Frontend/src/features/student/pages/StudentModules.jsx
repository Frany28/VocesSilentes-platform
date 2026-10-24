import { useState } from 'react';
import { useOutletContext } from 'react-router';
import { Button } from '../../../components/ui/Button.jsx';
import { useStudent } from '../data/use-student.js';
import { filterModules, moduleProgress } from '../data/module-progress.js';
import { StudentPageHeader } from '../components/StudentPageHeader.jsx';
import { StudentHero } from '../components/StudentHero.jsx';
import { ProgressSummary } from '../components/ProgressSummary.jsx';
import { ModuleFilters } from '../components/ModuleFilters.jsx';
import { ModuleCard } from '../components/ModuleCard.jsx';
import { StudentNote } from '../components/StudentNote.jsx';
import { DataFeedback } from '../components/DataFeedback.jsx';
import { StudentLoading } from '../components/StudentLoading.jsx';

/**
 * Catálogo filtrable; diferencia falta de integración, catálogo vacío y consulta sin resultados.
 * @returns {import('react').ReactElement} Mis módulos y estados de lectura.
 */
export function StudentModules() {
  const { status, snapshot, retry } = useStudent();
  const { onOpen } = useOutletContext();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const modules = snapshot?.modules || [];
  const results = filterModules(modules, query, filter);
  const demo = snapshot?.source === 'demo';
  return (
    <div className="flex flex-col gap-6">
      <StudentPageHeader catalog status={status} demo={demo} />
      {status === 'loading' ? (
        <StudentLoading catalog />
      ) : status === 'error' ? (
        <DataFeedback kind="error" catalog onRetry={retry} />
      ) : snapshot.source === 'unavailable' ? (
        <DataFeedback kind="unavailable" />
      ) : !modules.length ? (
        <DataFeedback kind="empty" catalog />
      ) : (
        <>
          <div className="student-overview-grid grid items-start">
            <StudentHero module={modules[0]} catalog onOpen={onOpen} />
            <div className="student-summary-slot">
              <ProgressSummary module={modules[0]} />
            </div>
          </div>
          <ModuleFilters
            modules={modules}
            query={query}
            filter={filter}
            onQuery={setQuery}
            onFilter={setFilter}
          />
          {results.length ? (
            <section className="flex flex-col gap-6" aria-labelledby="student-level">
              <div className="flex flex-col gap-2">
                <h2 id="student-level" className="[font:var(--type-h3)]">
                  01 / Primeras conversaciones
                </h2>
                <p className="text-muted" role="status" aria-live="polite">
                  {results.length} módulos ·{' '}
                  {results.filter((module) => moduleProgress(module).state === 'progress').length}{' '}
                  en progreso · Aprende en orden, sin prisa.
                </p>
              </div>
              <div className="student-catalog grid items-start gap-4">
                {results.map((module) => (
                  <ModuleCard key={module.id} module={module} illustrated onOpen={onOpen} />
                ))}
              </div>
            </section>
          ) : (
            <>
              <DataFeedback kind="no-results" catalog />
              <Button
                variant="secondary"
                className="w-auto! self-start"
                onClick={() => {
                  setQuery('');
                  setFilter('all');
                }}
              >
                Ver todos los módulos
              </Button>
            </>
          )}
          <StudentNote catalog demo={snapshot.source === 'demo'} />
        </>
      )}
    </div>
  );
}
