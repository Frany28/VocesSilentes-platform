import assert from 'node:assert/strict';

/**
 * Prepara contenido de prueba y registra lectura/práctica desde la interfaz, sin evaluar señas.
 * @param {object} context Prisma y navegador del entorno aislado.
 * @param {object} student Usuario creado mediante formulario.
 * @returns {Promise<void>} Comprueba persistencia después de recargar; lanza si difiere el estado SQL.
 */
export async function reviewAcademicLearning(context, student) {
  const { database, page, password, results } = context;
  const module = await database.module.create({
    data: {
      title: 'Lectura de integración',
      description: 'Contenido sintético académico, no material LSV validado.',
      order: 0,
      publicationStatus: 'PUBLISHED',
      lessons: {
        create: {
          title: 'Lectura para comprobar persistencia',
          description: 'Registra tu lectura y actividad manual.',
          order: 0,
          publicationStatus: 'PUBLISHED',
          exercises: {
            create: {
              order: 0,
              expectedSignKey: 'academic-ui-only',
              instructions: 'Actividad manual de prueba; no activar cámara.',
            },
          },
        },
      },
    },
    include: { lessons: { include: { exercises: true } } },
  });
  await page.login(student.email, password);
  await page.navigate('/student/practice');
  await page.wait('document.querySelector(".practice-camera button")');
  await page.click('Registrar inicio de lectura');
  await page.wait(
    'document.querySelector(".practice-camera").textContent.includes("Avance de lectura: En curso")',
  );
  await page.click('Marcar lectura completada');
  await page.wait(
    'document.querySelector(".practice-camera").textContent.includes("Avance de lectura: Completado")',
  );
  await page.click('Registrar inicio de práctica');
  await page.wait(
    'document.querySelector(".practice-camera").textContent.includes("Actividad declarada: En curso")',
  );
  await page.click('Registrar práctica realizada');
  await page.wait(
    'document.querySelector(".practice-camera").textContent.includes("Actividad declarada: Completado")',
  );
  await page.navigate('/student/practice');
  await page.wait(
    'document.querySelector(".practice-camera")?.textContent.includes("Actividad declarada: Completado")',
  );
  const lesson = module.lessons[0];
  const read = await database.lessonProgress.findUnique({
    where: {
      userId_lessonId: {
        userId: student.id,
        lessonId: lesson.id,
      },
    },
  });
  const exercise = await database.exerciseProgress.findUnique({
    where: {
      userId_exerciseId: {
        userId: student.id,
        exerciseId: lesson.exercises[0].id,
      },
    },
  });
  assert.equal(read.status, 'COMPLETED');
  assert.equal(exercise.status, 'COMPLETED');
  assert.ok(read.completedAt >= read.startedAt);
  results.learning = {
    source: 'api',
    lessonProgress: read.id,
    exerciseProgress: exercise.id,
    savedAfterReload: true,
    recognition: false,
    contentProvisionedAsTestFixture: true,
  };
  console.log(
    'Formulario educativo: lectura y práctica manual persistidas y consultadas tras recarga',
  );
}
