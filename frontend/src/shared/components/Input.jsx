import React from 'react';
import { AlertCircle } from 'lucide-react';

const Input = ({ label, error, className = '', type = 'text', id, ...props }) => {
  const inputId = id || `input-${label?.replace(/\s+/g, '-').toLowerCase() || 'field'}`;
  const sharedClasses = `
    w-full bg-white border rounded-input px-4 py-3
    text-gray-900 placeholder-gray-400
    transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)]
    focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand
    disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
    ${error ? 'border-danger ring-1 ring-danger/20' : 'border-gray-200 hover:border-gray-300'}
  `;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      {type === 'textarea' ? (
        <textarea
          id={inputId}
          className={`${sharedClasses} min-h-[120px] resize-y`}
          {...props}
        />
      ) : (
        <input
          id={inputId}
          type={type}
          className={sharedClasses}
          {...props}
        />
      )}
      {error && (
        <span className="flex items-center gap-1.5 text-xs text-danger mt-0.5" role="alert">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
