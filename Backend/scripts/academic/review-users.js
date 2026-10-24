import assert from 'node:assert/strict';

/**
 * Crea cinco cuentas por el formulario ADMIN y comprueba listado, edición y borrado lógico reales.
 * @param {object} context Navegador y Prisma aislados; credenciales sintéticas de esta ejecución.
 * @returns {Promise<object[]>} Usuarios persistidos, independientes del seed académico.
 */
export async function reviewAcademicUsers(context) {
  const { page, database, password, results } = context;
  const users = [];
  for (let n = 1; n <= 5; n += 1) {
    await page.navigate('/admin/users/new');
    await page.wait('document.querySelector("dialog[open] input[name=firstName]")');
    await page.fill({
      Nombre: `Integración ${n}`,
      'Nombre de usuario': `academic_ui_${n}`,
      Correo: `academic_ui_${n}@example.invalid`,
      Contraseña: password,
    });
    await page.click('Crear usuario');
    await page.wait(
      'location.pathname.endsWith("/created") && document.querySelector(".admin-panel h2")',
    );
    const user = await database.user.findUnique({ where: { username: `academic_ui_${n}` } });
    assert.ok(user?.id);
    users.push(user);
  }
  await page.navigate('/admin/users');
  await page.wait('document.querySelector(".admin-user-row")');
  await page.fill({ 'Buscar usuarios': 'academic_ui_' });
  await page.wait(
    'document.querySelector(".admin-pagination")?.textContent.replace(/\\s/g, "").includes("de5")',
  );
  await page.wait(`document.querySelector('[aria-label="Página 1 de 2"]')`);
  const readIds = () =>
    page.evaluate(
      `Array.from(document.querySelectorAll('.admin-user-row a')).map(a=>a.getAttribute('href').split('/').pop())`,
    );
  const first = await readIds();
  await page.click('Siguiente');
  await page.wait(`document.querySelector('[aria-label="Página 2 de 2"]')`);
  const listed = new Set([...first, ...(await readIds())]);
  assert.equal(listed.size, 5);
  assert.ok(users.every((user) => listed.has(user.id)));
  await page.navigate(`/admin/users/${users[0].id}/edit`);
  await page.wait('document.querySelector("dialog[open] input[name=firstName]")');
  await page.fill({ Nombre: 'Integración modificada' });
  await page.click('Guardar cambios');
  await page.wait(
    'Array.from(document.querySelectorAll("h2")).some(n=>n.textContent==="Integración modificada")',
  );
  assert.equal(
    (await database.user.findUnique({ where: { id: users[0].id } })).firstName,
    'Integración modificada',
  );
  await page.navigate(`/admin/users/${users[4].id}`);
  await page.wait('document.querySelector("main summary")');
  await page.click('Otras acciones de cuenta');
  await page.click('Eliminar cuenta');
  await page.wait('document.querySelector("dialog[open]")');
  await page.click('Confirmar eliminación');
  await page.wait(
    'location.pathname==="/admin/users" && document.querySelector(".admin-user-row")',
  );
  const deleted = await database.user.findUnique({ where: { id: users[4].id } });
  assert.equal(deleted.isDeleted, true);
  assert.ok(deleted.deletedAt);
  results.users = {
    createdThroughForm: 5,
    listed: listed.size,
    edited: users[0].id,
    logicallyDeleted: deleted.id,
    ids: users.map((user) => user.id),
  };
  console.log(
    'Formularios: cinco usuarios, listado paginado, edición y eliminación lógica comprobados',
  );
  return users;
}
