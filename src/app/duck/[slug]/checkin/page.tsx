'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import toast from 'react-hot-toast';
import type { Duck } from '@/lib/types';
import {
  ACCEPT_IMAGE,
  PHOTO_INPUT_MAX_BYTES,
  checkinPhotoPath,
  extFromMime,
  imagesStorage,
} from '@/lib/photo-storage';
import { compressImageForUpload } from '@/lib/image-compress';
import { recordFinderPhotoForOwner } from '@/lib/record-photo-usage';

const actionOptions = [
  { value: 'found', label: '🦆 I found this duck' },
  { value: 'rehidden', label: '🫣 I rehid this duck' },
  { value: 'kept', label: "🏠 I'm keeping this duck" },
  { value: 'released', label: '🌊 I released it back into the wild' },
];

export default function CheckInPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [duck, setDuck] = useState<Duck | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [finderName, setFinderName] = useState('');
  const [action, setAction] = useState('found');
  const [shipName, setShipName] = useState('');
  const [cruiseName, setCruiseName] = useState('');
  const [port, setPort] = useState('');
  const [locationDescription, setLocationDescription] = useState('');
  const [note, setNote] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase
      .from('ducks')
      .select('*')
      .eq('slug', slug)
      .single()
      .then(({ data }) => setDuck(data));
  }, [slug, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!duck) return;
    setLoading(true);

    let photoUrl: string | null = null;
    let finderPhotoBytes: number | null = null;
    if (photoFile) {
      if (photoFile.size > PHOTO_INPUT_MAX_BYTES) {
        toast.error(`Photo must be ${Math.round(PHOTO_INPUT_MAX_BYTES / (1024 * 1024))} MB or smaller.`);
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
      finderPhotoBytes = uploadFile.size;
      const ext = extFromMime(uploadFile.type);
      const uid =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const path = checkinPhotoPath(duck.id, uid, ext);
      const { error: upErr } = await imagesStorage(supabase).upload(path, uploadFile, {
        contentType: uploadFile.type,
        cacheControl: '3600',
        upsert: false,
      });
      if (upErr) {
        toast.error(upErr.message || 'Photo upload failed');
        setLoading(false);
        return;
      }
      const { data: pub } = imagesStorage(supabase).getPublicUrl(path);
      photoUrl = pub.publicUrl;
    }

    const { error } = await supabase.from('check_ins').insert({
      duck_id: duck.id,
      finder_name: finderName.trim() || 'Anonymous',
      action,
      ship_name: shipName.trim() || null,
      cruise_name: cruiseName.trim() || null,
      port: port.trim() || null,
      location_description: locationDescription.trim() || null,
      note: note.trim() || null,
      photo_url: photoUrl,
    });

    if (error) {
      toast.error(error.message || 'Something went wrong. Please try again.');
      setLoading(false);
      return;
    }

    if (finderPhotoBytes !== null) {
      const { error: usageErr } = await recordFinderPhotoForOwner(supabase, duck.id, finderPhotoBytes);
      if (usageErr) console.warn('increment_owner_photo_usage_for_duck', usageErr.message);
    }

    setSubmitted(true);
    toast.success('Thanks — your check-in was saved!');
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="mb-4 text-6xl" aria-hidden>
          🎉
        </div>
        <h1 className="cq-heading text-2xl font-semibold text-slate-900">You&apos;re on the map</h1>
        <p className="mt-3 text-slate-600">
          Thanks for logging your sighting of <strong className="text-slate-800">{duck?.name}</strong>. The owner will
          see it on their passport dashboard.
        </p>
        <Button type="button" onClick={() => router.push(`/duck/${slug}`)} variant="primary" className="mt-8 w-full">
          View public passport
        </Button>
      </div>
    );
  }

  if (!duck) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="mb-4 text-4xl" aria-hidden>
          🔍
        </div>
        <p className="text-slate-500">Loading duck…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:py-10">
      <div className="mb-8 text-center">
        <div className="mb-3 text-5xl" aria-hidden>
          🦆
        </div>
        <h1 className="cq-heading text-2xl font-semibold text-slate-900 sm:text-3xl">
          You found <span className="text-amber-700">{duck.name}</span>
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Log your sighting — no account needed. Takes under a minute.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Select
            id="action"
            label="What happened?"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            options={actionOptions}
          />
          <Input
            id="finderName"
            label="Your name (optional)"
            placeholder="Nickname is fine"
            value={finderName}
            onChange={(e) => setFinderName(e.target.value)}
            maxLength={100}
          />
          <Input
            id="shipName"
            label="Ship (optional)"
            placeholder="e.g. Carnival Breeze"
            value={shipName}
            onChange={(e) => setShipName(e.target.value)}
          />
          <Input
            id="cruiseName"
            label="Cruise / voyage (optional)"
            placeholder="e.g. 7-night Western Caribbean"
            value={cruiseName}
            onChange={(e) => setCruiseName(e.target.value)}
          />
          <Input
            id="port"
            label="Port or place (optional)"
            placeholder="e.g. Cozumel"
            value={port}
            onChange={(e) => setPort(e.target.value)}
          />
          <Input
            id="locationDescription"
            label="Where on board? (optional)"
            placeholder="e.g. Lido deck near the pool"
            value={locationDescription}
            onChange={(e) => setLocationDescription(e.target.value)}
            maxLength={200}
          />
          <Textarea
            id="note"
            label="Note to the owner (optional)"
            placeholder="Say hi or share a fun detail"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
          />
          <div>
            <label htmlFor="finder-photo" className="mb-1.5 block text-sm font-medium text-slate-700">
              Photo (optional)
            </label>
            <input
              id="finder-photo"
              ref={photoRef}
              type="file"
              accept={ACCEPT_IMAGE}
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-sky-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-sky-900 hover:file:bg-sky-200"
              onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
            />
            <p className="mt-1 text-xs text-slate-500">
              Resized before upload (original up to {Math.round(PHOTO_INPUT_MAX_BYTES / (1024 * 1024))} MB)
            </p>
          </div>
          <Button type="submit" loading={loading} className="w-full" size="lg">
            Submit check-in
          </Button>
        </form>
      </Card>

      <p className="mt-6 text-center text-xs text-slate-500">
        No account required. Location fields are whatever you choose to share — not GPS tracking.
      </p>
    </div>
  );
}
