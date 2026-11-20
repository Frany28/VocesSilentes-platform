import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { alphabetId } from '../../../Backend/scripts/learning/alphabet-source.js';
import demoModel from '../../public/models/lsv-vowels-demo-v1.json';
import {
  alphabetLessonIds,
  validateLessonVideo,
  videosForLesson,
} from '../features/student/resources/lesson-videos.js';
import {
  letterResource,
  publishedLetters,
} from '../features/student/resources/letter-resources.js';
import { LessonVideo } from '../features/student/resources/LessonVideo.jsx';
import { demoLetters } from '../features/student/recognition/recognition-support.js';
import provenance from '../assets/lsv-manual/provenance.json';

vi.mock('../lib/config.js', async (original) => ({
  ...(await original()),
  publicConfig: { apiUrl: 'http://localhost:3000/api', studentDemo: false },
}));

const video = {
  id: 'vocales-notebooklm',
  lessonKey: 'm1-l02',
  title: 'Las vocales explicadas',
  src: '/media/lessons/vocales-notebooklm.mp4',
  captions: '/media/lessons/vocales-notebooklm.vtt',
  transcript: 'Transcripción completa de prueba con suficiente longitud para el contrato.',
  origin: 'NOTEBOOKLM',
  rights: 'AUTHORIZED',
  pedagogicalReview: 'APPROVED',
  lsvReview: 'PENDING_LSV_REVIEW',
  status: 'PUBLISHED',
};

test('los UUID de lección del registro coinciden con los que genera el backend', () => {
  for (const [key, id] of Object.entries(alphabetLessonIds)) expect(id).toBe(alphabetId(key));
});

test('las 27 fichas VocesSilentes autorizadas llegan a producción con su revisión LSV pendiente', () => {
  expect(publishedLetters()).toEqual(Object.keys(provenance.images));
  expect(publishedLetters()).toHaveLength(27);
  for (const [letter, entry] of Object.entries(provenance.images)) {
    const resource = letterResource(letter);
    expect(resource).toMatchObject({
      status: 'published',
      page: entry.page,
      linguisticReview: 'PENDING_LSV_REVIEW',
    });
    expect(resource.url).toContain(entry.file);
  }
  expect(letterResource('CH')).toEqual({ letter: 'CH', status: 'missing' });
});

test('la lista de letras con reconocimiento coincide con el modelo de demostración publicado', () => {
  expect(demoModel.labels.filter((label) => label !== 'NONE')).toEqual(demoLetters);
});

test('un video publicado se asocia a su lección; borradores y lecciones ajenas no se muestran', () => {
  const lesson = alphabetLessonIds['m1-l02'];
  expect(videosForLesson(lesson)).toEqual([]);
  expect(videosForLesson(lesson, [video])).toHaveLength(1);
  expect(videosForLesson(alphabetLessonIds['m1-l03'], [video])).toEqual([]);
  expect(videosForLesson(lesson, [{ ...video, status: 'DRAFT' }])).toEqual([]);
  expect(videosForLesson(lesson, [{ ...video, rights: 'PENDING' }])).toEqual([]);
});

test('un video sin subtítulos, con transcripción vacía o externo se rechaza', () => {
  expect(() => validateLessonVideo({ ...video, captions: undefined })).toThrow();
  expect(() => validateLessonVideo({ ...video, transcript: '' })).toThrow();
  expect(() => validateLessonVideo({ ...video, src: 'https://example.com/video.mp4' })).toThrow();
});

test('el reproductor ofrece subtítulos por defecto, transcripción y aviso de IA sin reproducirse solo', () => {
  const { container } = render(<LessonVideo video={video} />);
  const element = container.querySelector('video');
  expect(element).toHaveAttribute('controls');
  expect(element).not.toHaveAttribute('autoplay');
  const track = container.querySelector('track');
  expect(track).toHaveAttribute('kind', 'captions');
  expect(track).toHaveAttribute('srclang', 'es');
  expect(track).toHaveAttribute('default');
  expect(screen.getByText(/generado con IA \(NotebookLM\)/)).toBeVisible();
  expect(screen.getByText(/no son demostraciones verificadas de LSV/)).toBeVisible();
  expect(screen.getByText('Transcripción del video')).toBeVisible();
});
