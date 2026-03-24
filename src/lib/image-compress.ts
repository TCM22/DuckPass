import imageCompression, { type Options } from 'browser-image-compression';
import { PHOTO_INPUT_MAX_BYTES, PHOTO_MAX_BYTES } from '@/lib/photo-storage';

/**
 * Client-side resize + JPEG compression before Supabase upload.
 * Keeps storage small; output is always image/jpeg for predictable bucket rules.
 */
export async function compressImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file.');
  }
  if (file.size > PHOTO_INPUT_MAX_BYTES) {
    throw new Error(
      `Image must be ${Math.round(PHOTO_INPUT_MAX_BYTES / (1024 * 1024))} MB or smaller before processing.`,
    );
  }

  const attempts: Options[] = [
    {
      maxSizeMB: 0.9,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
      fileType: 'image/jpeg',
      initialQuality: 0.85,
    },
    {
      maxSizeMB: 0.65,
      maxWidthOrHeight: 900,
      useWebWorker: true,
      fileType: 'image/jpeg',
      initialQuality: 0.78,
    },
    {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 800,
      useWebWorker: true,
      fileType: 'image/jpeg',
      initialQuality: 0.72,
    },
  ];

  let lastOut: File | null = null;
  for (const options of attempts) {
    lastOut = await imageCompression(file, options);
    if (lastOut.size <= PHOTO_MAX_BYTES) {
      return new File([lastOut], 'photo.jpg', { type: 'image/jpeg', lastModified: Date.now() });
    }
  }

  if (lastOut && lastOut.size > PHOTO_MAX_BYTES) {
    throw new Error('Could not compress enough. Try a smaller or simpler image.');
  }
  throw new Error('Compression failed.');
}
