/**
 * Sustituto explícito de Storage SOLO para demostración/integración aislada; no es un servidor S3.
 * @returns {object} Imágenes reales en memoria y lectura data URL; jamás usar en runtime productivo.
 */
export function createAcademicStorageFixture() {
  const objects = new Map();
  return {
    objects,
    async upload(path, image) {
      if (objects.has(path)) throw new Error('Academic object already exists');
      objects.set(path, { bytes: image.bytes, mimeType: image.mimeType });
    },
    async remove(path) {
      objects.delete(path);
    },
    async sign(path) {
      const object = objects.get(path);
      if (!object) throw new Error('Academic image missing');
      return {
        src: `data:${object.mimeType};base64,${object.bytes.toString('base64')}`,
        expiresAt: new Date(Date.now() + 120000).toISOString(),
      };
    },
  };
}
