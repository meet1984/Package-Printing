import React from 'react';
import { Link } from 'react-router-dom';

const CategoryCard = ({ category }) => {
  return (
    <Link 
      to={`/products/${category.slug}`}
      className="group block relative aspect-[3/4] overflow-hidden rounded-[var(--radius-card)] bg-surface card-lifted border border-border"
    >
      <img 
        src={category.homepage_image || 'https://via.placeholder.com/600x800'} 
        alt={category.name} 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      {/* Subtle dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="absolute bottom-6 left-6 right-6 z-10">
        <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{category.name}</h3>
        <span className="inline-flex items-center text-sm font-bold text-white opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          Shop now →
        </span>
      </div>
    </Link>
  );
};

export default CategoryCard;
