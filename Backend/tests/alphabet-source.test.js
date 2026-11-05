import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readAlphabetSource, alphabetId } from '../scripts/learning/alphabet-source.js';
import { alphabetPackageSchema } from '../scripts/learning/alphabet.schema.js';
import { publicExercise } from '../src/modules/learning/choice.public.js';

test('el JSON privado conserva relaciones, claves y materiales pendientes antes de la carga', async () => {
  const source = await readAlphabetSource();
  assert.equal(source.lessons.length, 7);
  assert.equal(source.letterCards.length, 27);
  assert.equal(source.exercises.length, 34);
  assert.equal(
    source.letterCards.filter((card) => card.sourceIllustrationShowsMotionArrow).length,
    3,
  );
  const badKey = structuredClone(source);
  badKey.exercises[0].correctOptionId = 'no-existe';
  assert.equal(alphabetPackageSchema.safeParse(badKey).success, false);
  const badRef = structuredClone(source);
  badRef.exercises[0].mediaRef = 'recurso-inexistente';
  assert.equal(alphabetPackageSchema.safeParse(badRef).success, false);
  const duplicate = structuredClone(source);
  duplicate.lessons[1].id = duplicate.lessons[0].id;
  assert.equal(alphabetPackageSchema.safeParse(duplicate).success, false);
  const unapproved = structuredClone(source);
  unapproved.letterCards[0].image = '/imagen-sin-permiso.png';
  assert.equal(alphabetPackageSchema.safeParse(unapproved).success, false);
  assert.equal(alphabetId('m1-l01'), alphabetId('m1-l01'));
  assert.notEqual(alphabetId('m1-l01'), alphabetId('m1-l02'));
});

test('la proyección exige revisión fuera de preview y oculta opciones si los tipos no coinciden', async () => {
  const source = await readAlphabetSource();
  const definition = source.exercises.find((item) => item.type === 'MULTIPLE_CHOICE_TEXT');
  const exercise = {
    id: alphabetId(definition.id),
    instructions: definition.prompt,
    type: definition.type,
    definition,
    progress: [],
  };
  assert.equal(publicExercise(exercise, false).availability, 'PENDING_REVIEW');
  assert.deepEqual(publicExercise(exercise, false).options, []);
  const approved = {
    ...exercise,
    definition: { ...definition, state: 'PUBLISHED', validationStatus: 'APPROVED_LSV' },
  };
  assert.equal(publicExercise(approved, false).availability, 'READY');
  const mismatched = { ...approved, type: 'MULTIPLE_CHOICE_IMAGE' };
  assert.equal(publicExercise(mismatched, true).availability, 'PENDING_REVIEW');
  assert.deepEqual(publicExercise(mismatched, true).options, []);
});
