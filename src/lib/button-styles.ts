import { cn } from '@/lib/utils';

/**
 * Shared button tokens + linkButtonClass for Server Components and clients.
 * (Kept out of `button.tsx` so `'use client'` does not block RSC usage.)
 */
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'subtle'
  | 'ghost'
  | 'danger'
  | 'solidLight';
export type ButtonSize = 'sm' | 'md' | 'lg';

export const buttonVariantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-b from-amber-400 to-amber-600 text-white hover:from-amber-500 hover:to-amber-700 shadow-md shadow-amber-600/25',
  secondary:
    'bg-gradient-to-b from-sky-400 to-sky-600 text-white hover:from-sky-500 hover:to-sky-700 shadow-md shadow-sky-600/20',
  outline:
    'border-2 border-amber-400/90 text-amber-800 bg-white hover:bg-amber-50 hover:border-amber-500 shadow-sm',
  subtle:
    'border border-slate-300/95 text-slate-800 bg-white hover:bg-slate-50 hover:border-slate-400 shadow-sm',
  ghost: 'text-slate-600 hover:bg-slate-100/90 active:bg-slate-100',
  danger:
    'bg-gradient-to-b from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-md',
  solidLight:
    'border border-white/95 bg-white text-amber-900 shadow-md shadow-amber-950/20 hover:bg-amber-50 hover:text-amber-950 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-amber-700',
};

export const buttonSizeStyles: Record<ButtonSize, string> = {
  sm: 'min-h-10 px-3.5 py-2 text-sm leading-tight rounded-xl',
  md: 'min-h-11 px-5 py-2.5 text-[0.9375rem] leading-snug rounded-xl',
  lg: 'min-h-12 px-6 py-3 text-base leading-snug rounded-xl',
};

/** Shared base for `<Button />` and anchor-styled CTAs (`linkButtonClass`). */
export const buttonBaseInteractiveClass =
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap text-center font-semibold select-none transition-[transform,opacity,filter] duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/80 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 active:scale-[0.98] active:opacity-[0.92] active:brightness-[0.98]';

export function linkButtonClass(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className?: string
) {
  return cn(buttonBaseInteractiveClass, buttonVariantStyles[variant], buttonSizeStyles[size], className);
}
