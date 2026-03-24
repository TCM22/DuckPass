'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function CopyLinkButton({
  url,
  label = 'Copy link',
  copiedLabel = 'Copied!',
  variant = 'outline',
  size = 'sm',
  className,
}: {
  url: string;
  label?: string;
  copiedLabel?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url.trim());
      toast.success('Link copied to clipboard');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy—try selecting the URL manually');
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={cn(className)}
    >
      {copied ? copiedLabel : label}
    </Button>
  );
}
