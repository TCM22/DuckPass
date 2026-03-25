'use client';

import {
  type ButtonSize,
  type ButtonVariant,
  buttonBaseInteractiveClass,
  buttonSizeStyles,
  buttonVariantStyles,
} from '@/lib/button-styles';
import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

export type { ButtonSize, ButtonVariant };

/**
 * Button system: primary (amber), secondary (sky), outline (amber border), subtle (neutral border),
 * ghost (text only), danger, solidLight (white on saturated / orange sections).
 * Sizes share min-heights for touch-friendly targets on mobile.
 */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          buttonBaseInteractiveClass,
          buttonVariantStyles[variant],
          buttonSizeStyles[size],
          loading && 'scale-[0.99]! opacity-[0.93]! brightness-[0.98]',
          className
        )}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
