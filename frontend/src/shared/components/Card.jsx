import React from 'react';

const variantStyles = {
  default: 'bg-white border border-gray-200 shadow-xs',
  elevated: 'bg-white shadow-md',
  outlined: 'bg-white border border-gray-200',
  subtle: 'bg-gray-50 border border-gray-100',
};

const Card = ({ children, variant = 'default', className = '', as: Component = 'div', ...props }) => {
  return (
    <Component
      className={`rounded-card ${variantStyles[variant] || variantStyles.default} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Card;
