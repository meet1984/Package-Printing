import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProducts } from '../useProducts';
import { useCategories } from '../../categories/useCategories';
import ProductCard from './ProductCard';
import SEO from '../../../shared/components/SEO';
import Breadcrumb from '../../../shared/components/Breadcrumb';
import { Menu, X } from 'lucide-react';

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
    <div className="flex flex-col space-y-4">
      <h3 className="font-bold text-lg text-heading">Products ({currentCount})</h3>
      <div className="flex flex-col space-y-2">
        <Link 
          to="/products" 
          onClick={() => setIsSidebarOpen(false)}
          className={`transition-colors ${(!categorySlug || categorySlug === 'all') ? 'font-bold text-primary' : 'text-text hover:text-primary'}`}
        >
          All Products
        </Link>
        {categories.map(cat => (
          <Link 
            key={cat.id} 
            to={`/products/${cat.slug}`}
            onClick={() => setIsSidebarOpen(false)}
            className={`transition-colors ${(categorySlug === cat.slug) ? 'font-bold text-primary' : 'text-text hover:text-primary'}`}
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-base min-h-screen pb-16">
      <SEO 
        title={activeCategory ? `${activeCategory.name} Products` : "All Products"} 
        description={activeCategory?.description || "Browse our complete catalog of custom printing and packaging solutions."} 
      />

      <div className="container mx-auto px-4 max-w-[1400px]">
        
        {/* Header Section */}
        <div className="py-8 md:py-12 border-b border-border mb-8">
          <Breadcrumb category={activeCategory} />
          
          <h1 className="text-4xl md:text-5xl font-black font-heading text-heading">
            {activeCategory ? activeCategory.name : 'All Products'}
          </h1>
        </div>

        {/* Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative">
          
          {/* Mobile Sidebar Toggle */}
          <button 
            className="lg:hidden flex items-center justify-between bg-surface p-4 rounded-xl border border-border shadow-sm mb-4"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <span className="font-bold text-heading">Categories</span>
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Sidebar Navigation */}
          <aside className={`
            lg:block lg:w-[240px] shrink-0 
            ${isSidebarOpen ? 'block' : 'hidden'} 
            lg:sticky lg:top-[100px] lg:h-[calc(100vh-120px)] lg:overflow-y-auto
          `}>
            {categoriesLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-6 w-32 bg-gray-200 rounded"></div>
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="h-4 w-28 bg-gray-200 rounded"></div>
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
              </div>
            ) : (
              renderSidebarContent()
            )}
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            {error && <div className="py-12 text-center text-red-500">Error: {error}</div>}
            
            {productsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="animate-pulse flex-shrink-0 w-full group">
                    <div className="block relative aspect-square md:aspect-[4/5] bg-gray-200 rounded-[var(--radius-card)] mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                      <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                      <div className="h-4 w-1/3 bg-gray-200 rounded mt-2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : !products || products.length === 0 ? (
              <div className="py-16 text-center bg-surface border border-border rounded-2xl flex flex-col items-center justify-center">
                <div className="text-4xl mb-4">📦</div>
                <h3 className="text-xl font-bold text-heading mb-2">No products found</h3>
                <p className="text-text-muted mb-6">We couldn't find any products in this category.</p>
                <Link to="/products" className="px-6 py-2 bg-primary text-white font-bold rounded-pill hover:bg-primary/90 transition-colors">
                  View All Products
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
