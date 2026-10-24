import { createAcademicEnvironment } from './academic/environment.js';
import { academicAdmin, academicStudent, academicPassword } from './academic/credentials.js';

// Las siguientes credenciales son PÚBLICAS del fixture aislado, jamás credenciales reales.
const environment = await createAcademicEnvironment({ seed: true });
try {
  await environment.ready();
  console.log(`Demostración aislada: ${environment.origin}`);
  console.log(`ADMIN: ${academicAdmin}; USER: ${academicStudent}`);
  console.log(`Contraseña pública exclusiva de este fixture: ${academicPassword}`);
  console.log('PostgreSQL WASM efímero; los cambios se descartan al salir. No conecta a Supabase.');
  console.log(
    'Imágenes: sustituto local de prueba en memoria, NO S3. Ctrl+C cierra los procesos propios.',
  );
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
