import { expect, test } from 'vitest';
import {
  introductionExperienceSteps,
  isIntroductionLesson,
} from '../features/student/curriculum/introduction-lesson.js';
import { curriculumSnapshot } from './student-curriculum-fixture.jsx';
import { introductionSource, prepareIntroduction } from './introduction-experience.fixture.js';

test('la lección real se reconoce por contenido y conserva teoría y evaluaciones de la API', () => {
  const snapshot = prepareIntroduction(curriculumSnapshot());
  const lesson = snapshot.modules[0].lessons[0];
  expect(isIntroductionLesson(lesson)).toBe(true);
  const steps = introductionExperienceSteps(lesson);
  expect(steps.map((step) => step.type)).toEqual([
    'introduction-welcome',
    'introduction-concept',
    'introduction-concept',
    'introduction-applications',
    'question',
  ]);
  expect(
    steps.filter((step) => step.type === 'introduction-concept').map((step) => step.section.body),
  ).toEqual([introductionSource.sections[1].body, introductionSource.sections[2].body]);
});
