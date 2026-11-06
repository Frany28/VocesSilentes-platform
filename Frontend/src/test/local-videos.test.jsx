import { act, renderHook } from '@testing-library/react';
import { webcrypto } from 'node:crypto';
import { expect, test, vi } from 'vitest';
import { useLocalVideos } from '../features/student/recognition/use-local-videos.js';

function file(name = 'software-fixture.webm') {
  return {
    name,
    type: 'video/webm',
    size: 4,
    arrayBuffer: async () => Uint8Array.from([0x1a, 0x45, 0xdf, 0xa3]).buffer,
  };
}

test('archivos locales: identifica por SHA, reutiliza objetos duplicados y libera todas las URLs al salir', async () => {
  vi.stubGlobal('crypto', webcrypto);
  const fetch = vi.fn();
  vi.stubGlobal('fetch', fetch);
  URL.createObjectURL = vi.fn(() => 'blob:local-test');
  URL.revokeObjectURL = vi.fn();
  const hook = renderHook(useLocalVideos);
  await act(() => hook.result.current.select(file()));
  const asset = hook.result.current.asset;
  expect(asset.sha256).toMatch(/^[a-f0-9]{64}$/);
  await act(() => hook.result.current.select(file('same-content.webm')));
  expect(hook.result.current.asset).toBe(asset);
  expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
  expect(fetch).not.toHaveBeenCalled();
  hook.unmount();
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:local-test');
});

test('archivos locales: rechaza enlaces, tamaño y cabeceras falsas; ignora lecturas tardías después de salir', async () => {
  vi.stubGlobal('crypto', webcrypto);
  URL.createObjectURL = vi.fn();
  const hook = renderHook(useLocalVideos);
  for (const input of [
    file('https://youtu.be/example'),
    { ...file(), size: 129 * 1024 * 1024 },
    { ...file(), arrayBuffer: async () => new Uint8Array(12).buffer },
  ]) {
    await act(() => hook.result.current.select(input));
    expect(hook.result.current.asset).toBeNull();
    expect(hook.result.current.error).not.toBe('');
  }
  let resolve;
  let pending;
  act(() => {
    pending = hook.result.current.select({
      ...file(),
      arrayBuffer: () =>
        new Promise((done) => {
          resolve = done;
        }),
    });
  });
  hook.unmount();
  resolve(await file().arrayBuffer());
  await pending;
  expect(URL.createObjectURL).not.toHaveBeenCalled();
});
