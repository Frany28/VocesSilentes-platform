import { useEffect, useRef, useState } from 'react';
import { reportsApi } from './reports.api.js';
import { useEvidenceSelection } from './use-evidence-selection.js';
import { useReportFields } from './use-report-fields.js';

/**
 * Conserva el envío idempotente y el archivo ante errores; un reintento nunca crea otro reporte.
 * @returns {object} Borrador y submit; cancela solicitudes al salir y protege la recarga con cambios pendientes.
 */
export function useReportDraft() {
  const fields = useReportFields();
  const image = useEvidenceSelection();
  const [error, setError] = useState('');
  const [status, setStatus] = useState('editing');
  const [submitted, setSubmitted] = useState(false);
  const [correctImage, setCorrectImage] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const requestId = useRef(crypto.randomUUID());
  const request = useRef(null);
  const dirty = status !== 'success' && (fields.changed || Boolean(image.selection));
  useEffect(() => () => request.current?.abort(), []);
  const submit = async (event) => {
    event.preventDefault();
    if (request.current || image.validating || image.error || status === 'success') return;
    const payload = fields.validate();
    if (!payload) return;
    const controller = new AbortController();
    request.current = controller;
    setSubmitted(true);
    setCorrectImage(false);
    setError('');
    setStatus('saving');
    try {
      const report = await reportsApi.create(
        { requestId: requestId.current, ...payload },
        controller.signal,
      );
      if (controller.signal.aborted) return;
      setSavedId(report.id);
      if (image.selection) {
        setStatus('uploading');
        await reportsApi.attach(report.id, image.selection.file, controller.signal);
      }
      if (!controller.signal.aborted) {
        setStatus('success');
        image.clear();
      }
    } catch (failure) {
      if (!controller.signal.aborted) {
        setStatus('error');
        setError(failure.message);
        setCorrectImage(
          ['INVALID_IMAGE', 'IMAGE_TOO_LARGE', 'PAYLOAD_TOO_LARGE'].includes(failure.code),
        );
      }
    } finally {
      if (!controller.signal.aborted) request.current = null;
    }
  };
  return {
    ...fields,
    selection: image.selection,
    select: (file) => {
      setError('');
      return image.select(file);
    },
    error: image.error || error,
    status: image.validating ? 'validating' : status,
    savedId,
    submitted,
    submit,
    dirty,
    selectionLocked: submitted && !correctImage,
    invalidSelection: Boolean(image.error),
    pending: image.validating || ['saving', 'uploading'].includes(status),
  };
}
