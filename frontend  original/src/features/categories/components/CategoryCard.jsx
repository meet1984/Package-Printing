import React from 'react';
import { Link } from 'react-router-dom';

const CategoryCard = ({ category }) => {
  return (
    <Link 
      to={`/products/${category.slug}`}
      className="group block overflow-hidden rounded-xl bg-surface border border-border transition-all hover:shadow-lg hover:-translate-y-1"
    >
      <div className="aspect-[4/3] bg-kraft/20 overflow-hidden relative">
        <img 
          src={category.image || 'https://via.placeholder.com/400x300'} 
          alt={category.name} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg text-text">{category.name}</h3>
      </div>
    </Link>
  );
};

export default CategoryCard;
