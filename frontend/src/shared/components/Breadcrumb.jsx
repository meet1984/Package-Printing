import React from 'react';
import { Link } from 'react-router-dom';

const Breadcrumb = ({ category }) => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-text-muted mb-6">
      <Link to="/" className="hover:text-primary transition-colors">Home</Link>
      <span>›</span>
      {category ? (
        <>
          <Link to="/products" className="hover:text-primary transition-colors">Shop</Link>
          <span>›</span>
          <span className="text-text cursor-default font-medium">{category.name}</span>
        </>
      ) : (
        <span className="text-text cursor-default font-medium">Shop</span>
      )}
    </nav>
  );
};

export default Breadcrumb;
