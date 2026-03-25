'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { generateDuckSlug } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { BackToDashboardButton } from '@/components/ui/back-to-dashboard-button';
import toast from 'react-hot-toast';
import {
  ACCEPT_IMAGE,
  PHOTO_INPUT_MAX_BYTES,
  duckImagePublicUrl,
  duckPhotoPath,
  extFromMime,
  formatImageUploadError,
  imagesStorage,
  uniqueImageFilename,
  validateImageFileForUpload,
} from '@/lib/photo-storage';
import { compressImageForUpload } from '@/lib/image-compress';
import { perfTimeEnd, perfTimeStart } from '@/lib/perf-log';

const TOAST_ID = 'duck-register';

export default function NewDuckPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [launchShip, setLaunchShip] = useState('');
  const [launchCruise, setLaunchCruise] = useState('');
  const [launchPort, setLaunchPort] = useState('');
  const [launchDate, setLaunchDate] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const submitInFlightRef = useRef(false);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (submitInFlightRef.current) return;
      if (!name.trim()) {
        toast.error('Your duck needs a name!');
        return;
      }

      submitInFlightRef.current = true;
      setLoading(true);

      try {
        perfTimeStart('createDuck');
        try {
          // Prefer session (local) — avoids an extra round-trip vs getUser() when possible.
          let user = (await supabase.auth.getSession()).data.session?.user ?? null;
          if (!user) {
            user = (await supabase.auth.getUser()).data.user;
          }
          if (!user) {
            toast.error('You must be logged in', { id: TOAST_ID });
            router.push('/login');
            return;
          }

          const slug = generateDuckSlug();

          const { data: row, error } = await supabase
            .from('ducks')
            .insert({
              owner_id: user.id,
              slug,
              name: name.trim(),
              description: description.trim(),
              launch_ship: launchShip.trim() || null,
              launch_cruise: launchCruise.trim() || null,
              launch_port: launchPort.trim() || null,
              launch_date: launchDate || null,
            })
            .select('id')
            .single();

          if (error || !row) {
            toast.error(error?.message || 'Could not create duck', { id: TOAST_ID });
            return;
          }

          if (photoFile) {
            const v = validateImageFileForUpload(photoFile);
            if (v) {
              toast.error(v, { id: TOAST_ID });
              return;
            }
            let uploadFile: File;
            try {
              uploadFile = await compressImageForUpload(photoFile);
            } catch (err) {
              toast.error(err instanceof Error ? err.message : 'Could not process photo', { id: TOAST_ID });
              return;
            }
            const ext = extFromMime(uploadFile.type);
            const path = duckPhotoPath(user.id, row.id, uniqueImageFilename(ext));
            const { error: upErr } = await imagesStorage(supabase).upload(path, uploadFile, {
              contentType: uploadFile.type,
              cacheControl: '3600',
              upsert: false,
            });
            if (upErr) {
              toast.error(formatImageUploadError(upErr.message) + ' Duck was still created.', { id: TOAST_ID });
            } else {
              const publicUrl = duckImagePublicUrl(supabase, path);
              if (!publicUrl?.trim()) {
                toast.error('Photo uploaded but URL could not be resolved — check NEXT_PUBLIC_SUPABASE_URL.', {
                  id: TOAST_ID,
                });
              } else {
                const { error: photoDbErr } = await supabase
                  .from('ducks')
                  .update({ photo_url: publicUrl })
                  .eq('id', row.id);
                if (photoDbErr) {
                  toast.error(photoDbErr.message || 'Photo saved to storage but passport could not be updated.', {
                    id: TOAST_ID,
                  });
                }
              }
            }
          }

          // Success toast + navigate right after DB insert succeeds; photo warnings use same toast id above.
          toast.success('Duck registered! 🦆', { id: TOAST_ID });
          router.push(`/dashboard/ducks/${slug}?new=1`);
          router.refresh();
        } finally {
          perfTimeEnd('createDuck');
        }
      } finally {
        submitInFlightRef.current = false;
        setLoading(false);
      }
    },
    [
      name,
      description,
      launchShip,
      launchCruise,
      launchPort,
      launchDate,
      photoFile,
      router,
      supabase,
    ]
  );

  return (
    <div className="mx-auto max-w-lg">
      <BackToDashboardButton className="mb-4" />
      <h1 className="cq-heading mb-2 text-3xl font-semibold text-slate-900">Register a new duck</h1>
      <p className="mb-8 text-slate-600">
        Name your duck and add launch details—this becomes the first page of its passport. You can edit the photo
        later from the manage page too.
      </p>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            id="name"
            label="Duck name *"
            placeholder="Captain Waddles"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={80}
            disabled={loading}
          />
          <Textarea
            id="description"
            label="Description / story"
            placeholder="A brave rubber duck setting sail on its first adventure..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            disabled={loading}
          />
          <div>
            <label htmlFor="duck-photo" className="mb-1.5 block text-sm font-medium text-slate-700">
              Photo (optional)
            </label>
            <input
              id="duck-photo"
              type="file"
              accept={ACCEPT_IMAGE}
              disabled={loading}
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-amber-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-amber-900 hover:file:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
              onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
            />
            <p className="mt-1 text-xs text-slate-500">
              One passport photo · JPEG, PNG, or WebP · resized before upload (up to{' '}
              {Math.round(PHOTO_INPUT_MAX_BYTES / (1024 * 1024))} MB)
            </p>
          </div>
          <Input
            id="launchShip"
            label="Launch ship"
            placeholder="Royal Caribbean Oasis of the Seas"
            value={launchShip}
            onChange={(e) => setLaunchShip(e.target.value)}
            disabled={loading}
          />
          <Input
            id="launchCruise"
            label="Voyage / itinerary"
            placeholder="7-Night Western Caribbean"
            value={launchCruise}
            onChange={(e) => setLaunchCruise(e.target.value)}
            disabled={loading}
          />
          <Input
            id="launchPort"
            label="Launch port"
            placeholder="Port Canaveral, FL"
            value={launchPort}
            onChange={(e) => setLaunchPort(e.target.value)}
            disabled={loading}
          />
          <Input
            id="launchDate"
            label="Launch date"
            type="date"
            value={launchDate}
            onChange={(e) => setLaunchDate(e.target.value)}
            disabled={loading}
          />
          <Button type="submit" loading={loading} className="w-full" size="lg">
            {loading ? 'Saving' : 'Register this duck 🦆'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
