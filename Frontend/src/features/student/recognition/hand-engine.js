import simdLoader from '@mediapipe/tasks-vision/vision_wasm_internal.js?url';
import simdBinary from '@mediapipe/tasks-vision/vision_wasm_internal.wasm?url';
import plainLoader from '@mediapipe/tasks-vision/vision_wasm_nosimd_internal.js?url';
import plainBinary from '@mediapipe/tasks-vision/vision_wasm_nosimd_internal.wasm?url';
import modelUrl from '../../../assets/vision/hand-landmarker-float16-v1.task?url';

const modelHash = 'fbc2a30080c3c557093b5ddfc334698132eb341044ccee322ccf8bcf3607cde1';

/**
 * Carga MediaPipe al activar cámara o procesar un video autorizado; comprueba la identidad del modelo oficial.
 * @param {AbortSignal} signal Cancelación durante descarga y creación.
 * @returns {Promise<object>} Detector y dibujo de landmarks reales, sin clasificar letras ni enviar frames.
 * @throws {Error} Descarga, integridad o inicialización no disponibles.
 */
export async function createHandEngine(signal) {
  const sdk = await import('@mediapipe/tasks-vision');
  signal.throwIfAborted();
  const response = await fetch(modelUrl, { signal });
  if (!response.ok) throw new Error('HAND_MODEL_UNAVAILABLE');
  const bytes = await response.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const hash = [...new Uint8Array(digest)]
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('');
  if (hash !== modelHash) throw new Error('HAND_MODEL_INTEGRITY');
  signal.throwIfAborted();
  const simd = await sdk.FilesetResolver.isSimdSupported();
  const detector = await sdk.HandLandmarker.createFromOptions(
    {
      wasmLoaderPath: simd ? simdLoader : plainLoader,
      wasmBinaryPath: simd ? simdBinary : plainBinary,
    },
    {
      baseOptions: { modelAssetBuffer: new Uint8Array(bytes), delegate: 'CPU' },
      runningMode: 'VIDEO',
      numHands: 2,
    },
  );
  if (signal.aborted) {
    detector.close();
    signal.throwIfAborted();
  }
  return {
    detect: (video, now) => detector.detectForVideo(video, now),
    draw(canvas, result) {
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
      const drawing = new sdk.DrawingUtils(context);
      const color = getComputedStyle(canvas).getPropertyValue('--action-primary').trim();
      for (const hand of result.landmarks) {
        drawing.drawConnectors(hand, sdk.HandLandmarker.HAND_CONNECTIONS, { color, lineWidth: 3 });
        drawing.drawLandmarks(hand, { color: '#ffffff', fillColor: color, radius: 3 });
      }
    },
    close: () => detector.close(),
  };
}
