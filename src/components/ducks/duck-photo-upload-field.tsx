'use client';

import { useEffect, useRef, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import {
  ACCEPT_IMAGE,
  PHOTO_INPUT_MAX_BYTES,
  duckImagePublicUrl,
  duckPhotoPath,
  extFromMime,
  formatImageUploadError,
  imagesBucketPathFromPublicUrl,
  imagesStorage,
  uniqueImageFilename,
  validateImageFileForUpload,
} from '@/lib/photo-storage';
import { compressImageForUpload } from '@/lib/image-compress';
import toast from 'react-hot-toast';

export function DuckPhotoUploadField({
  supabase,
  userId,
  duckId,
  currentUrl,
  onUploaded,
  onRemoved,
}: {
  supabase: SupabaseClient;
  userId: string;
  duckId: string;
  currentUrl: string | null;
  onUploaded: (publicUrl: string) => void;
  /** Called after DB + storage clear so parent can sync state / refresh. */
  onRemoved?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<'upload' | 'remove' | null>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl);

  useEffect(() => {
    setPreview(currentUrl);
  }, [currentUrl]);

  const handleRemovePhoto = async () => {
    if (!preview) return;
    if (!window.confirm('Remove this passport photo? It will disappear from your public duck page.')) return;

    setPending('remove');
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user || auth.user.id !== userId) {
      toast.error('You must be signed in as this duck’s owner.');
      setPending(null);
      return;
    }

    const path = imagesBucketPathFromPublicUrl(preview);
    if (path) {
      const { error: rmErr } = await imagesStorage(supabase).remove([path]);
      if (rmErr) {
        toast.error(rmErr.message || 'Could not delete file from storage');
        setPending(null);
        return;
      }
    }

    const { error: dbErr } = await supabase.from('ducks').update({ photo_url: null }).eq('id', duckId);
    if (dbErr) {
      toast.error(dbErr.message || 'Could not update duck');
      setPending(null);
      return;
    }

    setPreview(null);
    onRemoved?.();
    toast.success('Photo removed');
    setPending(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleFile = async (file: File | null) => {
    if (!file) return;
    const validationError = validateImageFileForUpload(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setPending('upload');
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user || auth.user.id !== userId) {
      toast.error('You must be signed in as this duck’s owner to upload a photo.');
      setPending(null);
      return;
    }

    const previousUrl = currentUrl;
    let uploadFile: File;
    try {
      uploadFile = await compressImageForUpload(file);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not process image');
      setPending(null);
      return;
    }

    const ext = extFromMime(uploadFile.type);
    const path = duckPhotoPath(userId, duckId, uniqueImageFilename(ext));

    const { error: upErr } = await imagesStorage(supabase).upload(path, uploadFile, {
      cacheControl: '3600',
      upsert: false,
      contentType: uploadFile.type,
    });

    if (upErr) {
      toast.error(formatImageUploadError(upErr.message));
      setPending(null);
      return;
    }

    const publicUrl = duckImagePublicUrl(supabase, path);
    if (!publicUrl?.trim()) {
      toast.error('Could not resolve photo URL — check Supabase project URL in env.');
      setPending(null);
      return;
    }

    const { error: dbErr } = await supabase.from('ducks').update({ photo_url: publicUrl }).eq('id', duckId);

    if (dbErr) {
      toast.error(dbErr.message || 'Could not save photo URL');
      setPending(null);
      return;
    }

    const oldPath = imagesBucketPathFromPublicUrl(previousUrl);
    const newPath = imagesBucketPathFromPublicUrl(publicUrl);
    if (oldPath && newPath && oldPath !== newPath) {
      await imagesStorage(supabase).remove([oldPath]);
    }

    setPreview(publicUrl);
    onUploaded(publicUrl);
    toast.success('Photo saved');
    setPending(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-700">Duck photo</p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="relative aspect-square h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-inner ring-1 ring-slate-200/60">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={preview}
              src={preview}
              alt=""
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <span className="text-4xl text-slate-300" aria-hidden>
              🦆
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT_IMAGE}
            className="block w-full max-w-sm text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-amber-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-amber-900 hover:file:bg-amber-200"
            disabled={pending !== null}
            onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
          />
            <p className="text-xs text-slate-500">
              One passport photo per duck · JPEG, PNG, or WebP · up to{' '}
              {Math.round(PHOTO_INPUT_MAX_BYTES / (1024 * 1024))} MB before resize
            </p>
        </div>
      </div>
      {preview ? (
        <div className="pt-1">
          <button
            type="button"
            disabled={pending !== null}
            onClick={() => void handleRemovePhoto()}
            className="text-sm font-medium text-rose-700 underline-offset-2 hover:text-rose-800 hover:underline disabled:opacity-50"
          >
            Remove photo
          </button>
        </div>
      ) : null}
      {pending && (
        <Button type="button" size="sm" disabled variant="subtle">
          {pending === 'remove' ? 'Removing…' : 'Uploading…'}
        </Button>
      )}
    </div>
  );
}
