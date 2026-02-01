/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';

export const Card: React.FC<any> = ({ children, className = '', ...rest }) => (
  <div
    {...rest}
    className={`rounded-lg border border-gray-200 bg-white p-6 shadow-sm ${className}`}
  >
    {children}
  </div>
);

export const PillButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
    variant?: 'primary' | 'secondary' | 'outline';
  }
> = ({
  children,
  onClick,
  className = '',
  disabled = false,
  variant = 'primary',
  asChild = false,
  type,
  ...rest
}) => {
  const baseStyles =
    'px-6 py-2 rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-pink-500 text-white hover:bg-pink-600',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    outline: 'border-2 border-current',
  };

  const combinedClassName = `${baseStyles} ${variants[variant]} ${className}`;

  // If asChild, render the child directly with className
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      className: combinedClassName,
      onClick,
      ...rest,
    });
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClassName}
      {...rest}
    >
      {children}
    </button>
  );
};

export const Badge: React.FC<React.HTMLAttributes<HTMLSpanElement> & { tone?: string }> = ({
  children,
  className = '',
  tone,
  ...rest
}) => (
  <span
    {...rest}
    className={`inline-block rounded-full bg-pink-100 px-3 py-1 text-sm font-medium text-pink-700 ${className}`}
  >
    {children}
  </span>
);
