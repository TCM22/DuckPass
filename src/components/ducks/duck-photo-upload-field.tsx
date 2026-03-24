'use client';

import { useRef, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import {
  ACCEPT_IMAGE,
  PHOTO_INPUT_MAX_BYTES,
  duckPhotoPath,
  extFromMime,
  imagesStorage,
  uniqueImageFilename,
} from '@/lib/photo-storage';
import { compressImageForUpload } from '@/lib/image-compress';
import { recordMyPhotoUsage } from '@/lib/record-photo-usage';
import toast from 'react-hot-toast';

export function DuckPhotoUploadField({
  supabase,
  userId,
  duckId,
  currentUrl,
  onUploaded,
}: {
  supabase: SupabaseClient;
  userId: string;
  duckId: string;
  currentUrl: string | null;
  onUploaded: (publicUrl: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file.');
      return;
    }
    if (file.size > PHOTO_INPUT_MAX_BYTES) {
      toast.error(`Image must be ${Math.round(PHOTO_INPUT_MAX_BYTES / (1024 * 1024))} MB or smaller.`);
      return;
    }

    setUploading(true);
    let uploadFile: File;
    try {
      uploadFile = await compressImageForUpload(file);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not process image');
      setUploading(false);
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
      toast.error(upErr.message || 'Upload failed');
      setUploading(false);
      return;
    }

    const { data: pub } = imagesStorage(supabase).getPublicUrl(path);
    const publicUrl = pub.publicUrl;

    const { error: dbErr } = await supabase.from('ducks').update({ photo_url: publicUrl }).eq('id', duckId);

    if (dbErr) {
      toast.error(dbErr.message || 'Could not save photo URL');
      setUploading(false);
      return;
    }

    const { error: usageErr } = await recordMyPhotoUsage(supabase, uploadFile.size);
    if (usageErr) {
      console.warn('increment_my_photo_usage', usageErr.message);
    }

    setPreview(publicUrl);
    onUploaded(publicUrl);
    toast.success('Photo saved');
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-700">Duck photo</p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-inner">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-cover" />
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
            disabled={uploading}
            onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
          />
            <p className="text-xs text-slate-500">
              JPEG, PNG, WebP, or GIF · up to {Math.round(PHOTO_INPUT_MAX_BYTES / (1024 * 1024))} MB (resized before
              upload)
            </p>
        </div>
      </div>
      {uploading && (
        <Button type="button" size="sm" disabled variant="subtle">
          Uploading…
        </Button>
      )}
    </div>
  );
}
