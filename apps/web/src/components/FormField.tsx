'use client';

import React from 'react';

export interface FormFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Mobile-first responsive form input component
 * Ensures 44×44px minimum touch targets on all screen sizes
 * Automatically handles responsive padding and text sizing
 */
export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      fullWidth = true,
      size = 'md',
      className,
      ...props
    },
    ref
  ) => {
    const sizeClass = {
      sm: 'px-2 md:px-3 py-1 md:py-2 text-xs md:text-sm',
      md: 'px-3 md:px-4 py-2 md:py-3 text-sm md:text-base',
      lg: 'px-4 md:px-5 py-3 md:py-4 text-base md:text-lg',
    }[size];

    return (
      <div className={`flex flex-col gap-1 md:gap-2 ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label className="text-xs md:text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 text-gray-500 flex-shrink-0">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full min-h-12 rounded-lg border-2 transition-all
              ${icon ? 'pl-8 md:pl-10' : 'px-3 md:px-4'}
              ${sizeClass}
              bg-white text-gray-900 placeholder-gray-400
              border-gray-200 hover:border-gray-300
              focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}
              disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <span className="text-xs md:text-sm text-red-600 font-medium">
            {error}
          </span>
        )}
        {helperText && !error && (
          <span className="text-xs md:text-sm text-gray-600">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

export default FormField;
