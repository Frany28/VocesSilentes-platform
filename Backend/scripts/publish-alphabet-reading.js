import { loadEnv } from '../src/config/load-env.js';
import { createDatabase } from '../src/lib/database.js';
import { publishAlphabetReading } from './learning/publish-alphabet-reading.js';

// Publicar exige --apply y autorización del destino. Nunca modifica los estados de revisión lingüística.
if (process.argv.length !== 3 || process.argv[2] !== '--apply')
  throw new Error('La publicación autorizada requiere --apply');
loadEnv();
const database = await createDatabase(process.env.DATABASE_URL);
if (!database) throw new Error('Falta la configuración privada de la base destino');
try {
  console.log(JSON.stringify(await publishAlphabetReading(database)));
} catch {
  console.error('No se publicó la lectura del alfabeto. Revisa el paquete del destino autorizado.');
  process.exitCode = 1;
} finally {
  await database.$disconnect();
}
