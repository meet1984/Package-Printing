import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const ProductCard = ({ product, index, isQuoteCard = false }) => {
  const primaryImage = product.images?.find(img => img.is_primary)?.url
    || product.images?.[0]?.url
    || null;

  return (
    <Link
      to={`/product/${product.Category?.slug || 'misc'}/${product.slug}`}
      className="w-full block group"
      draggable={false}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-gray-100">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product.image_alt || product.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out)] group-hover:scale-105 pointer-events-none"
            draggable={false}
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-100 flex items-center justify-center pointer-events-none">
            <span className="text-gray-400 text-sm">No image</span>
          </div>
        )}
        {/* Subtle bottom gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--duration-normal)] pointer-events-none" />
      </div>

      <div className="pt-3 space-y-1">
        <h4 className="font-display font-semibold text-base text-gray-900 leading-snug line-clamp-1 group-hover:text-brand transition-colors duration-[var(--duration-fast)]">
          {product.name}
        </h4>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-brand group-hover:gap-1.5 transition-all duration-[var(--duration-fast)]">
          {isQuoteCard ? 'Request a quote' : 'View product'}
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
};

export default ProductCard;
