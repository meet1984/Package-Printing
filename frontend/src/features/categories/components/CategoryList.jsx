import React, { useEffect } from 'react';
import { useCategories } from '../useCategories';
import CategoryCard from './CategoryCard';
import SEO from '../../../shared/components/SEO';

const CategoryList = () => {
  const { categories, loading, error, fetchCategories } = useCategories();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  if (loading) return <div className="py-12 text-center text-neutral/50">Loading categories...</div>;
  if (error) return (
    <div className="bg-base min-h-screen">
      <SEO 
        title="Custom Packaging & Printing" 
        description="Premium custom packaging, boxes, and mailers for your brand." 
      />
      <div className="py-12 text-center text-red-500">Error: {error}</div>
    </div>
  );
  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4 max-w-7xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Explore Our Packaging
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.filter(c => !c.parent_id).map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryList;
