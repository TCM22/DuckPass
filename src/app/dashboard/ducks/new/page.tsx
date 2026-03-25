'use client';

import { useState } from 'react';
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

export default function NewDuckPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [launchShip, setLaunchShip] = useState('');
  const [launchCruise, setLaunchCruise] = useState('');
  const [launchPort, setLaunchPort] = useState('');
  const [launchDate, setLaunchDate] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Your duck needs a name!');
      return;
    }
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('You must be logged in');
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
      toast.error(error?.message || 'Could not create duck');
      setLoading(false);
      return;
    }

    if (photoFile) {
      const v = validateImageFileForUpload(photoFile);
      if (v) {
        toast.error(v);
        setLoading(false);
        return;
      }
      let uploadFile: File;
      try {
        uploadFile = await compressImageForUpload(photoFile);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Could not process photo');
        setLoading(false);
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
        toast.error(formatImageUploadError(upErr.message) + ' Duck was still created.');
      } else {
        const publicUrl = duckImagePublicUrl(supabase, path);
        if (!publicUrl?.trim()) {
          toast.error('Photo uploaded but URL could not be resolved — check NEXT_PUBLIC_SUPABASE_URL.');
        } else {
          const { error: photoDbErr } = await supabase
            .from('ducks')
            .update({ photo_url: publicUrl })
            .eq('id', row.id);
          if (photoDbErr) {
            toast.error(photoDbErr.message || 'Photo saved to storage but passport could not be updated.');
          }
        }
      }
    }

    toast.success('Duck registered! 🦆');
    router.push(`/dashboard/ducks/${slug}?new=1`);
    router.refresh();
  };

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
          />
          <Textarea
            id="description"
            label="Description / story"
            placeholder="A brave rubber duck setting sail on its first adventure..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
          />
          <div>
            <label htmlFor="duck-photo" className="mb-1.5 block text-sm font-medium text-slate-700">
              Photo (optional)
            </label>
            <input
              id="duck-photo"
              type="file"
              accept={ACCEPT_IMAGE}
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-amber-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-amber-900 hover:file:bg-amber-200"
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
          />
          <Input
            id="launchCruise"
            label="Voyage / itinerary"
            placeholder="7-Night Western Caribbean"
            value={launchCruise}
            onChange={(e) => setLaunchCruise(e.target.value)}
          />
          <Input
            id="launchPort"
            label="Launch port"
            placeholder="Port Canaveral, FL"
            value={launchPort}
            onChange={(e) => setLaunchPort(e.target.value)}
          />
          <Input
            id="launchDate"
            label="Launch date"
            type="date"
            value={launchDate}
            onChange={(e) => setLaunchDate(e.target.value)}
          />
          <Button type="submit" loading={loading} className="w-full" size="lg">
            Register this duck 🦆
          </Button>
        </form>
      </Card>
    </div>
  );
}
