import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CategoryCard = ({ category }) => {
  return (
    <Link
      to={`/products/${category.slug}`}
      className="group block relative w-full aspect-[3/4] overflow-hidden rounded-xl shadow-sm hover:shadow-lg transition-all duration-[var(--duration-normal)] ease-[var(--ease-out)] hover:-translate-y-1"
      draggable={false}
    >
      <div className="absolute inset-0 bg-gray-200">
        {category.homepage_image ? (
          <img
            src={category.homepage_image}
            alt={category.name}
            className="w-full h-full object-cover transition-transform duration-[800ms] ease-[var(--ease-out)] group-hover:scale-105 pointer-events-none"
            draggable={false}
            loading="lazy"
          />
        ) : null}
      </div>

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(0deg, rgba(15,14,13,0.75) 0%, rgba(15,14,13,0.2) 50%, rgba(15,14,13,0) 70%)'
        }}
      />

      <div className="absolute left-5 right-5 bottom-5 z-10">
        <h3 className="font-display font-semibold text-xl text-white mb-1 leading-tight tracking-tight">
          {category.name}
        </h3>
        {category.product_count && (
          <span className="text-xs text-white/60 font-medium block mb-3">
            {category.product_count} products
          </span>
        )}
        <span className="
          inline-flex items-center gap-1.5 text-xs font-medium text-white
          opacity-0 translate-y-2
          group-hover:opacity-100 group-hover:translate-y-0
          transition-all duration-[var(--duration-normal)] ease-[var(--ease-out)]
        ">
          Shop now <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
};

export default CategoryCard;
