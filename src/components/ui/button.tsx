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
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
