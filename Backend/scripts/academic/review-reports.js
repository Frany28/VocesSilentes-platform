import assert from 'node:assert/strict';
import sharp from 'sharp';
import { resolve } from 'node:path';

/**
 * Envía cinco reportes e imágenes reales mediante UI y revisa resolución/reapertura en Admin.
 * @param {object} context Entorno aislado con sustituto local explícito de Storage, no S3 remoto.
 * @param {object} student Cuenta creada por el formulario en esta ejecución.
 * @returns {Promise<object[]>} Reportes SQL confirmados; imágenes guardadas solo en el fixture local.
 */
export async function reviewAcademicReports(context, student) {
  const { page, database, password, output, storage, results, adminEmail } = context;
  const file = resolve(output, 'evidencia-academica.png');
  await sharp({ create: { width: 120, height: 80, channels: 3, background: '#6045c5' } })
    .png()
    .toFile(file);
  await page.login(student.email, password);
  const reports = [];
  for (let n = 1; n <= 5; n += 1) {
    await page.navigate('/student/reports/new');
    await page.wait('document.querySelector("#report-description")');
    await page.fill({
      'Título del problema *': `Formulario académico ${n}`,
      'Tipo de error *': n % 2 ? 'TECHNICAL' : 'CONTENT',
      'Descripción del problema *':
        'Reporte de integración enviado desde el formulario con una imagen local real.',
    });
    await page.file('input[type=file]', file);
    await page.wait(
      'document.querySelector(".report-evidence-drop img")?.complete && !document.querySelector("form[aria-busy=true]")',
    );
    await page.click('Enviar reporte');
    await page.wait('document.querySelector(".report-success")');
    const report = await database.report.findFirst({
      where: { authorId: student.id, description: { startsWith: `Formulario académico ${n}\n` } },
      include: { evidence: true },
    });
    assert.equal(report.evidence.state, 'READY');
    assert.ok(storage.objects.get(report.evidence.path).bytes.length > 0);
    reports.push(report);
  }
  assert.equal(storage.objects.size, 5);
  await page.login(adminEmail, password);
  await page.navigate('/admin/reports');
  await page.wait('document.querySelectorAll(".admin-report-card").length===5');
  const id = reports[0].id;
  await page.navigate(`/admin/reports/${id}`);
  await page.wait('document.querySelector(".admin-evidence-thumbnail img")?.naturalWidth>0');
  await page.click('Ver imagen');
  await page.wait('document.querySelector("dialog[open] img")?.naturalWidth>0');
  await page.capture('reporte-evidencia-real-local');
  await page.evaluate('document.querySelector("dialog[open] button[aria-label]").click()');
  await page.fill({
    'Comentario interno (opcional)': 'Revisado desde el formulario de administración.',
  });
  await page.click('Marcar como resuelto');
  await page.wait('document.querySelector("dialog[open]")');
  await page.click('Confirmar resolución');
  await page.wait(
    'Array.from(document.querySelectorAll("button")).some(n=>n.textContent.trim()==="Reabrir reporte")',
  );
  assert.equal((await database.report.findUnique({ where: { id } })).status, 'RESOLVED');
  await page.navigate(`/admin/reports/${id}`);
  await page.wait(
    'Array.from(document.querySelectorAll("button")).some(n=>n.textContent.trim()==="Reabrir reporte")',
  );
  await page.click('Reabrir reporte');
  await page.wait('document.querySelector("dialog[open]")');
  await page.click('Confirmar reapertura');
  await page.wait(
    'Array.from(document.querySelectorAll("button")).some(n=>n.textContent.trim()==="Marcar como resuelto")',
  );
  const reopened = await database.report.findUnique({ where: { id } });
  assert.equal(reopened.status, 'PENDING');
  assert.equal(reopened.resolvedById, null);
  assert.equal(reopened.internalComment, 'Revisado desde el formulario de administración.');
  results.reports = {
    createdThroughForm: 5,
    localImages: 5,
    storage: 'explicit-in-memory-test-adapter-not-S3',
    resolvedAndReopened: id,
    ids: reports.map((report) => report.id),
  };
  console.log(
    'Formularios: cinco reportes con imágenes locales, visor, resolución y reapertura comprobados',
  );
  return reports;
}
