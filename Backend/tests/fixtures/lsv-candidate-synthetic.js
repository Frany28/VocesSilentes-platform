import { syntheticVideoRecording } from './lsv-video-synthetic.js';

/**
 * Datos ficticios para probar políticas sin afirmar permisos, personas ni señas reales.
 * @returns {object} Candidato numérico y manifiesto identificados como software.
 */
export function syntheticCandidateSet() {
  const sample = syntheticVideoRecording();
  const source = {
    id: 'fixture_video',
    file: 'videos/fixture.mp4',
    sha256: sample.source.sha256,
    origin: 'Software fixture only',
    duration: 5,
  };
  const candidate = {
    ...sample,
    videoId: source.id,
    startMs: 0,
    endMs: 2000,
    executionId: 'fixture_take',
    observedSignant: 'fixture_track',
    technicalStatus: 'VALID_GEOMETRY',
    labelEvidence: 'SOFTWARE_FIXTURE_NOT_LSV',
    reviewStatus: 'PENDING_LSV_REVIEW',
    reviewerId: null,
  };
  const manifest = {
    version: 1,
    sources: [source],
    candidates: [candidate],
    permission: {
      reference: 'SOFTWARE_TEST_ONLY',
      status: 'VERIFIED_FOR_TRAINING',
      evidenceReference: 'Software fixture, not real permission',
      holder: 'Software fixture',
      trainingScopeConfirmed: true,
      sourceIds: [source.id],
      scopes: ['FRAME_EXTRACTION', 'MEDIAPIPE', 'AI_TRAINING'],
    },
    participantIndependenceConfirmed: true,
    observedSignants: [
      {
        id: 'fixture_track',
        videoId: source.id,
        correspondenceConfirmed: true,
        confirmedParticipantId: sample.participantId,
      },
    ],
    participants: [
      {
        id: sample.participantId,
        confirmed: true,
        consent: true,
        partition: sample.partition,
        partitionConfirmed: true,
      },
    ],
  };
  return { candidate, source, manifest };
}
