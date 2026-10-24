import assert from 'node:assert/strict';

/**
 * Recorre todas las páginas de bitácora y coteja los eventos esperados con PostgreSQL.
 * @param {object} context Entorno aislado autenticado como ADMIN.
 * @returns {Promise<void>} Historial consistente con los formularios ejecutados.
 */
export async function reviewAcademicAudit(context) {
  const { page, database, results } = context;
  const events = await database.auditLog.findMany();
  await page.navigate('/admin/audit');
  const pages = Math.ceil(events.length / 5);
  const labels = new Set();
  for (let n = 1; n <= pages; n += 1) {
    await page.wait(`document.querySelector('[aria-label="Página ${n} de ${pages}"]')`);
    for (const label of await page.evaluate(
      'Array.from(document.querySelectorAll("main article h2")).map(n=>n.textContent)',
    ))
      labels.add(label);
    if (n < pages) await page.click('Siguiente');
  }
  for (const label of [
    'Creación de usuario',
    'Modificación de usuario',
    'Eliminación lógica de usuario',
    'Creación de reporte',
    'Imagen adjunta confirmada',
    'Resolución de reporte',
    'Reapertura de reporte',
    'Avance de lectura',
    'Actividad de práctica declarada',
  ])
    assert.ok(labels.has(label), label);
  assert.ok(events.every((event) => event.actorId && event.createdAt && event.entityId));
  results.audit = {
    count: events.length,
    pages,
    operations: [...new Set(events.map((event) => event.operation))],
    verifiedThroughInterface: true,
  };
  console.log('Bitácora: eventos reales de los formularios consultados en la interfaz ADMIN');
}
