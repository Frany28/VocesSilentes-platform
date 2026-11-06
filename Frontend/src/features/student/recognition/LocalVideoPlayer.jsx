import { useEffect } from 'react';

/**
 * Presenta un objeto local sin URLs remotas ni audio; el procesamiento bloquea cambios de reproducción.
 * @param {{asset: object, replay: object|null, operation: object, onReady: Function,
 * onError: Function}} props Archivo, intervalo a revisar y controlador de extracción.
 * @returns {import('react').ReactElement} Video original y puntos sobrepuestos, sin espejo.
 */
export function LocalVideoPlayer({
  asset,
  replay,
  operation: { videoRef, canvasRef, pending },
  onReady,
  onError,
}) {
  useEffect(() => {
    const video = videoRef.current;
    if (!replay || !video) return;
    const seek = () => {
      video.pause();
      video.currentTime = replay.startMs / 1000;
    };
    if (video.readyState >= 1) seek();
    else video.addEventListener('loadedmetadata', seek, { once: true });
    return () => video.removeEventListener('loadedmetadata', seek);
  }, [replay, videoRef]);
  useEffect(() => {
    const video = videoRef.current;
    if (video) video.src = asset.url;
    return () => {
      video?.pause();
      video?.removeAttribute('src');
      video?.load();
    };
  }, [videoRef, asset.url]);
  return (
    <figure className="flex min-w-0 flex-col gap-3">
      <div className="local-video-viewport" data-processing={pending || undefined}>
        <video
          ref={videoRef}
          src={asset.url}
          muted
          playsInline
          controls={!pending}
          preload="metadata"
          aria-label="Video local autorizado"
          onLoadedMetadata={(event) => onReady(event.currentTarget.duration)}
          onError={() => onError('Este archivo no se puede reproducir. Revisa su formato y códec.')}
        />
        <canvas ref={canvasRef} aria-hidden="true" />
      </div>
      <figcaption className="text-muted model-command">
        {asset.name} · Archivo local; no se envía al servidor.
        {replay &&
          ` Intervalo de la muestra: ${(replay.startMs / 1000).toFixed(2)}–${(
            replay.endMs / 1000
          ).toFixed(2)} s.`}
      </figcaption>
    </figure>
  );
}
