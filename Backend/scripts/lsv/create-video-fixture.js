import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Crea un WebM de formas geométricas con MediaRecorder; no contiene personas, señas ni datos de entrenamiento.
 * @param {object} page Driver de Chrome aislado.
 * @param {string} output Carpeta local de evidencia de pruebas.
 * @returns {Promise<string>} Archivo sintético para verificar decodificación y rechazo de ausencia de manos.
 */
export async function createVideoFixture(page, output) {
  const base64 = await page.evaluate(`(async()=>{
    const canvas=document.createElement('canvas');canvas.width=320;canvas.height=240;
    const context=canvas.getContext('2d');const stream=canvas.captureStream(24);
    const recorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp8'});
    const chunks=[];recorder.ondataavailable=event=>chunks.push(event.data);
    const stopped=new Promise((resolve,reject)=>{recorder.onstop=resolve;recorder.onerror=reject;});
    let frame;const draw=time=>{context.fillStyle='#222222';context.fillRect(0,0,320,240);
      context.fillStyle='#eeeeee';context.fillRect(20+(time/20)%220,60,40,40);
      frame=requestAnimationFrame(draw);};draw(0);recorder.start();
    await new Promise(done=>setTimeout(done,3000));recorder.stop();await stopped;
    cancelAnimationFrame(frame);stream.getTracks().forEach(track=>track.stop());
    const bytes=new Uint8Array(await new Blob(chunks,{type:'video/webm'}).arrayBuffer());
    return btoa(Array.from(bytes,byte=>String.fromCharCode(byte)).join(''));
  })()`);
  const path = join(output, 'synthetic-no-hands.webm');
  await writeFile(path, Buffer.from(base64, 'base64'));
  return path;
}
