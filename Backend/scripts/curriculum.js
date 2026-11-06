import { loadEnv } from '../src/config/load-env.js';
import { createDatabase } from '../src/lib/database.js';
import { readAlphabetSource } from './learning/alphabet-source.js';
import { planCurriculum } from './learning/curriculum-plan.js';
import { installCurriculum } from './learning/install-curriculum.js';

// Por defecto solo inspecciona. --apply exige autorización previa de la base destino y migración revisada.
loadEnv();
const args = process.argv.slice(2);
if (args.some((item) => item !== '--apply')) throw new Error('Argumento no admitido');
const database = await createDatabase(process.env.DATABASE_URL);
if (!database) throw new Error('Configura DATABASE_URL privada; no se imprimen credenciales');
try {
  if (args.includes('--apply')) {
    const plan = await installCurriculum(database);
    console.log(JSON.stringify({ applied: true, publishedAutomatically: false, plan }, null, 2));
  } else {
    const source = await readAlphabetSource();
    const review = await database.$transaction(async (tx) => {
      await tx.$executeRaw`SET TRANSACTION ISOLATION LEVEL REPEATABLE READ, READ ONLY`;
      const modules = await tx.$queryRaw`
        SELECT id, title, description, "order", "publicationStatus",
          to_jsonb(m)->>'contentKey' AS "contentKey"
        FROM vocessilentes."Module" m ORDER BY "order"`;
      const columns = await tx.$queryRaw`
        SELECT table_name, column_name FROM information_schema.columns
        WHERE table_schema = 'vocessilentes' AND
          (table_name, column_name) IN (('Module','contentKey'),('Lesson','content'),('Exercise','definition'))`;
      return { migrationRequired: columns.length !== 3, plan: planCurriculum(modules, source) };
    });
    console.log(JSON.stringify({ readOnly: true, ...review }, null, 2));
  }
} catch {
  console.error('No se completó la operación curricular. Revisa el esquema y el plan autorizado.');
  process.exitCode = 1;
} finally {
  await database.$disconnect();
}
