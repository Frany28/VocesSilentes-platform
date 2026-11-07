import { createAcademicEnvironment } from './academic/environment.js';
import { seedIntroduction } from './learning/seed-introduction.js';

// Credenciales PÚBLICAS exclusivas de la base local efímera; no son secretos ni cuentas compartidas.
const email = 'lectura@example.invalid';
const password = 'Lectura-local-de-prueba-123!';
const environment = await createAcademicEnvironment({ port: 5281 });
try {
  await seedIntroduction(environment.database);
  const account = await environment.authService.register({
    firstName: 'Estudiante',
    lastName: null,
    username: 'lectura_local',
    email,
    password,
  });
  await environment.authService.logout(account.token);
  await environment.ready();
  console.log(`Primera clase local: ${environment.origin}/student/modules`);
  console.log(`Cuenta USER de prueba: ${email}`);
  console.log(`Contraseña pública solo para este entorno: ${password}`);
  console.log('API y PostgreSQL WASM reales en memoria. No lee URLs de DB ni conecta a Supabase.');
  console.log('Contenido en revisión. Ctrl+C descarta la base y cierra los procesos propios.');
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
