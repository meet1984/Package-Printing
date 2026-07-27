import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const Breadcrumb = ({ category }) => {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-gray-500 mb-6">
      <Link to="/" className="hover:text-brand transition-colors duration-[var(--duration-fast)]">Home</Link>
      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
      {category ? (
        <>
          <Link to="/products" className="hover:text-brand transition-colors duration-[var(--duration-fast)]">Products</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-900 font-medium">{category.name}</span>
        </>
      ) : (
        <span className="text-gray-900 font-medium">Products</span>
      )}
    </nav>
  );
};

export default Breadcrumb;
