'use client';

import React from 'react';

interface FormContainerProps extends React.FormHTMLAttributes<HTMLFormElement> {
  title?: string;
  description?: string;
  columns?: 1 | 2 | 3;
  spacing?: 'compact' | 'normal' | 'relaxed';
}

/**
 * Mobile-first responsive form container
 * Handles responsive column layout and spacing
 * Stacks vertically on mobile, horizontally on larger screens
 */
export const FormContainer = React.forwardRef<
  HTMLFormElement,
  FormContainerProps
>(({ title, description, columns = 1, spacing = 'normal', children, className, ...props }, ref) => {
  const spacingClass = {
    compact: 'gap-2 md:gap-3',
    normal: 'gap-3 md:gap-4',
    relaxed: 'gap-4 md:gap-6',
  }[spacing];

  const columnClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  }[columns];

  return (
    <form
      ref={ref}
      className={`space-y-${spacing === 'compact' ? '4' : spacing === 'normal' ? '6' : '8'} md:space-y-${spacing === 'compact' ? '6' : spacing === 'normal' ? '8' : '12'} ${className}`}
      {...props}
    >
      {(title || description) && (
        <div className="mb-6 md:mb-8">
          {title && (
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-2">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-sm md:text-base text-gray-600">
              {description}
            </p>
          )}
        </div>
      )}
      <div className={`grid ${columnClass} ${spacingClass}`}>
        {children}
      </div>
    </form>
  );
});

FormContainer.displayName = 'FormContainer';

export default FormContainer;
