'use client';

import { useId, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

export interface PhotoUploadProps {
  kind: 'gallery' | 'reference' | 'swatch';
  id: string;
  label: string;
  /** Gallery takes several at once; reference and swatch take one. */
  multiple?: boolean;
}

type UploadError = 'invalid' | 'notFound' | 'tooLarge' | 'format' | 'full' | 'locked' | 'network';

/**
 * Sends each file as the raw request body to /api/ops/media (no multipart),
 * one at a time, then refreshes the page. Staff-only tool: needs JavaScript.
 */
export function PhotoUpload({ kind, id, label, multiple = false }: PhotoUploadProps) {
  const t = useTranslations('ops.photos');
  const router = useRouter();
  const inputId = useId();
  const input = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    setError(null);
    const list = Array.from(files);
    let done = 0;
    try {
      for (const file of list) {
        setStatus(t('uploading', { done, total: list.length }));
        let code: UploadError | null = null;
        try {
          const response = await fetch(`/api/ops/media?kind=${kind}&id=${encodeURIComponent(id)}`, {
            method: 'POST',
            headers: { 'Content-Type': file.type || 'application/octet-stream' },
            body: file,
          });
          if (!response.ok) {
            const body = (await response.json().catch(() => ({}))) as { error?: UploadError };
            code = body.error ?? 'invalid';
          }
        } catch {
          code = 'network';
        }
        if (code) {
          setError(t(`error.${code}`, { name: file.name }));
          break;
        }
        done += 1;
      }
    } finally {
      setStatus(done > 0 ? t('uploaded', { count: done }) : null);
      setBusy(false);
      if (input.current) input.current.value = '';
      if (done > 0) router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <input
        ref={input}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={multiple}
        disabled={busy}
        className="sr-only ops-upload-input"
        onChange={(e) => void upload(e.target.files)}
      />
      <label htmlFor={inputId} className="btn btn-secondary btn-sm ops-upload" aria-disabled={busy}>
        {label}
      </label>
      {status && (
        <p className="field-message" role="status">
          {status}
        </p>
      )}
      {error && (
        <p className="field-message-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
