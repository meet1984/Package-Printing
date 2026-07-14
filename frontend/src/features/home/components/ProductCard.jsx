import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const primaryImage = product.images?.find(img => img.is_primary)?.url 
    || product.images?.[0]?.url 
    || 'https://via.placeholder.com/400';

  return (
    <Link 
      to={`/product/${product.Category?.slug || 'all'}/${product.slug}`} 
      className="w-full group block bg-surface card-lifted rounded-[var(--radius-card)] border border-transparent p-3 transition-all duration-300 hover:-translate-y-[5px] hover:border-border"
    >
      <div className="block relative aspect-square md:aspect-[4/5] overflow-hidden rounded-[calc(var(--radius-card)-0.25rem)] mb-4">
        <img 
          src={primaryImage} 
          alt={product.image_alt || product.name} 
          className="w-full h-full object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.15]"
        />
        {product.is_new && (
          <div className="absolute top-4 right-4 badge-stamp badge-stamp-orange">
            New
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <h3 className="font-bold text-text group-hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
        <span className="inline-block mt-2 text-sm font-bold text-primary transition-colors">
          Request a Quote →
        </span>
      </div>
    </Link>
  );
};

export default ProductCard;
