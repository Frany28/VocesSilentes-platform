import { createAcademicEnvironment } from './academic/environment.js';
import { alphabetModuleId } from './learning/alphabet-source.js';
import { seedAlphabet } from './learning/seed-alphabet.js';

// Cuenta y contraseña PÚBLICAS, exclusivas de la base efímera local. Nunca se conectan a Supabase.
const environment = await createAcademicEnvironment({
  port: 5282,
  previewModuleId: alphabetModuleId,
});
try {
  await seedAlphabet(environment.database);
  const account = await environment.authService.register({
    firstName: 'Estudiante local',
    lastName: null,
    username: 'alfabeto_local',
    email: 'alfabeto@example.invalid',
    password: 'Alfabeto local de prueba 123!',
  });
  await environment.authService.logout(account.token);
  await environment.ready();
  console.log(`Revisión local del alfabeto: ${environment.origin}/student/modules`);
  console.log(
    'USER de prueba: alfabeto@example.invalid; contraseña pública: Alfabeto local de prueba 123!',
  );
  console.log(
    '7 lecciones, 27 tarjetas y 34 preguntas en DRAFT. 27 preguntas visuales pendientes.',
  );
  console.log(
    'PostgreSQL WASM efímero y evaluación backend real; sin Supabase, cámara ni publicación.',
  );
  console.log('Ctrl+C descarta la base y cierra únicamente los procesos propios.');
  let closing = false;
  const close = async () => {
    if (closing) return;
    closing = true;
    await environment.close();
  };
  process.on('SIGINT', close);
  process.on('SIGTERM', close);
} catch (error) {
  await environment.close();
  throw error;
}
