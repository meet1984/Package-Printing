import React from 'react';

const sizeStyles = {
  sm: 'px-3.5 py-2 text-sm gap-1.5',
  md: 'px-5 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
  xl: 'px-8 py-4 text-base gap-2.5',
};

const variantStyles = {
  primary:
    'bg-brand text-white hover:bg-brand-hover shadow-sm hover:shadow-md active:shadow-sm active:translate-y-px',
  secondary:
    'bg-gray-900 text-white hover:bg-gray-800 shadow-sm hover:shadow-md active:shadow-sm active:translate-y-px',
  outline:
    'border border-gray-300 bg-white text-gray-800 hover:border-gray-400 hover:bg-gray-50 shadow-xs hover:shadow-sm active:translate-y-px',
  ghost:
    'text-gray-700 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200',
  danger:
    'bg-danger text-white hover:bg-red-700 shadow-sm hover:shadow-md active:shadow-sm active:translate-y-px',
};

const Button = ({ children, variant = 'primary', size = 'md', className = '', disabled, ...props }) => {
  return (
    <button
      className={`
        inline-flex items-center justify-center
        font-semibold rounded-button
        transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)]
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        ${sizeStyles[size] || sizeStyles.md}
        ${variantStyles[variant] || variantStyles.primary}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
