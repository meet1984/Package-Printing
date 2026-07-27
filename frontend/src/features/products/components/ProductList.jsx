import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProducts } from '../useProducts';
import { useCategories } from '../../categories/useCategories';
import ProductCard from './ProductCard';
import SEO from '../../../shared/components/SEO';
import Breadcrumb from '../../../shared/components/Breadcrumb';
import { Menu, X, ChevronRight } from 'lucide-react';

const ProductList = () => {
  const { categorySlug } = useParams();
  const { products, loading: productsLoading, error, fetchProducts } = useProducts();
  const { categories, loading: categoriesLoading, fetchCategories } = useCategories();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchProducts(categorySlug === 'all' ? null : categorySlug);
  }, [fetchProducts, fetchCategories, categorySlug]);

  const activeCategory = categorySlug && categorySlug !== 'all' 
    ? categories.find(c => c.slug === categorySlug) 
    : null;

  const currentCount = products?.length || 0;

  const renderSidebarContent = () => (
    <div className="flex flex-col">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Categories</h3>
      <div className="flex flex-col gap-0.5">
        <Link 
          to="/products" 
          onClick={() => setIsSidebarOpen(false)}
          className={`
            flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors duration-[var(--duration-fast)]
            ${(!categorySlug || categorySlug === 'all')
              ? 'bg-brand-subtle text-brand font-semibold'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
          `}
        >
          <span>All Products</span>
          {(!categorySlug || categorySlug === 'all') && (
            <span className="text-xs bg-brand/10 text-brand px-1.5 py-0.5 rounded-full font-mono">{currentCount}</span>
          )}
        </Link>
        {categories.map(cat => (
          <Link 
            key={cat.id} 
            to={`/products/${cat.slug}`}
            onClick={() => setIsSidebarOpen(false)}
            className={`
              flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors duration-[var(--duration-fast)]
              ${categorySlug === cat.slug
                ? 'bg-brand-subtle text-brand font-semibold'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
            `}
          >
            <span>{cat.name}</span>
            {categorySlug === cat.slug && <ChevronRight className="w-3.5 h-3.5 text-brand" />}
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <SEO 
        title={activeCategory ? `${activeCategory.name} Products` : "All Products"} 
        description={activeCategory?.description || "Browse our complete catalog of custom printing and packaging solutions."} 
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="py-8 md:py-10 border-b border-gray-200 mb-8">
          <Breadcrumb category={activeCategory} />
          
          <h1 className="text-3xl md:text-4xl font-display font-semibold text-gray-900 tracking-tight">
            {activeCategory ? activeCategory.name : 'All Products'}
          </h1>
          {currentCount > 0 && (
            <p className="text-label mt-2">{currentCount} products</p>
          )}
        </div>

        {/* Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 relative">
          
          {/* Mobile Sidebar Toggle */}
          <button 
            className="lg:hidden flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-xs"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <span className="font-semibold text-gray-900 text-sm">Filter by Category</span>
            {isSidebarOpen ? <X className="h-4 w-4 text-gray-500" /> : <Menu className="h-4 w-4 text-gray-500" />}
          </button>

          {/* Sidebar Navigation */}
          <aside className={`
            lg:block lg:w-[220px] shrink-0 
            ${isSidebarOpen ? 'block' : 'hidden'} 
            lg:sticky lg:top-[80px] lg:h-[calc(100vh-100px)] lg:overflow-y-auto
          `}>
            {categoriesLoading ? (
              <div className="space-y-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-10 skeleton rounded-lg" />
                ))}
              </div>
            ) : (
              renderSidebarContent()
            )}
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            {error && <div className="py-12 text-center text-danger text-sm">{error}</div>}
            
            {productsLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="group">
                    <div className="aspect-[4/5] skeleton rounded-xl mb-3" />
                    <div className="space-y-2">
                      <div className="h-4 w-2/3 skeleton" />
                      <div className="h-3 w-1/3 skeleton" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !products || products.length === 0 ? (
              <div className="py-20 text-center bg-white border border-gray-200 rounded-xl flex flex-col items-center justify-center">
                <div className="text-4xl mb-4">📦</div>
                <h3 className="text-xl font-display font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-6 text-sm">We couldn't find any products in this category.</p>
                <Link to="/products" className="px-5 py-2.5 bg-brand text-white font-semibold rounded-lg hover:bg-brand-hover transition-colors text-sm">
                  View All Products
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 md:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
