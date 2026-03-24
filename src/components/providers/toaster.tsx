'use client';

import { Toaster as HotToaster } from 'react-hot-toast';

export function Toaster() {
  return (
    <HotToaster
      position="top-center"
      toastOptions={{
        style: {
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '14px',
        },
        success: { duration: 3000 },
        error: { duration: 5000 },
      }}
    />
  );
}
