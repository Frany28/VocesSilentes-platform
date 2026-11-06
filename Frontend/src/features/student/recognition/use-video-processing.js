import { useEffect, useRef, useState } from 'react';
import { extractVideoSequence } from './extract-video-sequence.js';
import { validateRecording } from '../../../../../shared/lsv/recording.js';
import {
  validateVideoInterval,
  validateVideoSource,
} from '../../../../../shared/lsv/video-source.js';

/**
 * Ejecuta extracción local por acción explícita y conserva un borrador pendiente, cancelable al salir u ocultar.
 * @returns {object} Refs del visor, progreso, borrador, procesamiento y descarte sin persistencia.
 */
export function useVideoProcessing() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const active = useRef(null);
  const [pending, setPending] = useState(false);
  const [preview, setPreview] = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  useEffect(() => {
    const cancel = () => {
      active.current?.abort();
    };
    const hide = () => {
      if (document.hidden) cancel();
    };
    document.addEventListener('visibilitychange', hide);
    window.addEventListener('pagehide', cancel);
    return () => {
      active.current?.abort();
      active.current = null;
      document.removeEventListener('visibilitychange', hide);
      window.removeEventListener('pagehide', cancel);
    };
  }, []);
  const clear = () => {
    setPreview(null);
    setError('');
  };
  const cancel = () => {
    active.current?.abort();
    setError('Procesamiento cancelado. No se guardó ninguna muestra.');
  };
  const process = async (metadata, source) => {
    if (active.current) return;
    clear();
    setProgress(0);
    const controller = new AbortController();
    active.current = controller;
    setPending(true);
    try {
      const video = videoRef.current;
      validateVideoInterval(source.startMs / 1000, source.endMs / 1000, video.duration);
      // Comprueba declaraciones antes de cargar MediaPipe; todavía no hay fotogramas ni puntos extraídos.
      validateVideoSource(source);
      if (
        metadata.consent !== true ||
        typeof metadata.participantId !== 'string' ||
        !/^[a-z0-9_-]{1,64}$/.test(metadata.participantId) ||
        !['train', 'validation', 'test'].includes(metadata.partition) ||
        !['A', 'E', 'I', 'O', 'U', 'NONE'].includes(metadata.label)
      )
        throw new Error('Completa participante, etiqueta del piloto y consentimiento.');
      const result = await extractVideoSequence({
        video,
        canvas: canvasRef.current,
        start: source.startMs / 1000,
        end: source.endMs / 1000,
        signal: controller.signal,
        onProgress: (value) => {
          if (active.current === controller) setProgress(value);
        },
      });
      if (active.current !== controller) return;
      controller.signal.throwIfAborted();
      const sample = validateRecording({
        ...metadata,
        version: 1,
        id: crypto.randomUUID(),
        sessionId: crypto.randomUUID(),
        source,
        frames: result.frames,
        reviewStatus: 'PENDING_LSV_REVIEW',
        reviewerId: null,
      });
      setPreview({ sample, decodedFrames: result.decodedFrames });
      setProgress(100);
    } catch (failure) {
      if (active.current === controller)
        setError(
          controller.signal.aborted
            ? 'Procesamiento cancelado. No se guardó ninguna muestra.'
            : failure.message,
        );
    } finally {
      if (active.current === controller) {
        active.current = null;
        setPending(false);
      }
    }
  };
  return { videoRef, canvasRef, pending, preview, progress, error, process, clear, cancel };
}
