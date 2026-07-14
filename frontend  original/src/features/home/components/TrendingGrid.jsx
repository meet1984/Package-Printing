import React from 'react';
import { Link } from 'react-router-dom';

const TrendingGrid = ({ categories }) => {
  if (!categories || categories.length === 0) return null;

  // We take up to 4 categories for the grid
  const items = categories.slice(0, 4);

  return (
    <section className="py-16 bg-surface">
      <div className="container mx-auto px-4 mb-8">
        <h2 className="text-3xl md:text-4xl font-black font-heading tracking-tighter text-heading">
          Trending now
        </h2>
      </div>

      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1 md:gap-0">
          {items.map((cat, idx) => (
            <Link 
              key={cat.id} 
              to={`/products?category=${cat.slug}`}
              className="group block relative aspect-square md:aspect-[3/4] overflow-hidden"
            >
              <img 
                src={cat.homepage_image || 'https://via.placeholder.com/600x800'} 
                alt={cat.name} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Subtle dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
              
              <div className="absolute bottom-6 left-6 right-6">
                <h3 className="text-2xl font-bold text-white mb-2">{cat.name}</h3>
                <span className="inline-flex items-center text-sm font-bold text-white opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  Shop now →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingGrid;
