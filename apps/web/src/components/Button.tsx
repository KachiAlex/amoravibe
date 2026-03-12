'use client';

import React from 'react';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

/**
 * Mobile-first responsive button component
 * Ensures 44×44px minimum touch targets on all screen sizes
 * Includes focus-visible styles for keyboard navigation
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      icon,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeClass = {
      sm: 'px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm',
      md: 'px-4 md:px-6 py-2 md:py-3 text-sm md:text-base',
      lg: 'px-6 md:px-8 py-3 md:py-4 text-base md:text-lg',
    }[size];

    const variantClass = {
      primary:
        'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
      secondary:
        'bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
      outline:
        'border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100',
      danger:
        'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
    }[variant];

    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center gap-2
          min-h-12 min-w-12 rounded-lg font-semibold transition-all
          ${sizeClass}
          ${variantClass}
          ${fullWidth ? 'w-full' : ''}
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none
          ${className}
        `}
        disabled={loading || disabled}
        {...props}
      >
        {loading ? (
          <svg
            className="h-4 w-4 md:h-5 md:w-5 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : icon ? (
          <>
            {icon}
            {children}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
