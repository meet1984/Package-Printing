import React, { useEffect, useState, Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../useProducts';
import SEO from '../../../shared/components/SEO';
import { Helmet } from 'react-helmet-async';
import Button from '../../../shared/components/Button';
import { ChevronDown, Sparkles } from 'lucide-react';

// Only needed when a visitor opens "Preview with Your Logo" - lazy-load it so
// the canvas editor's code isn't part of every product page's initial bundle.
const MockupEditor = lazy(() => import('../../generator/components/MockupEditor'));

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { currentProduct: product, loading, error, fetchProductDetails } = useProducts();

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showMockupModal, setShowMockupModal] = useState(false);

  useEffect(() => {
    fetchProductDetails(slug);
  }, [fetchProductDetails, slug]);

  useEffect(() => {
    if (product) {

      setSelectedImageIndex(0);
      if (product.variants?.length > 0) {
        setSelectedVariant(product.variants[0]);
      }
    }
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-brand" role="status" aria-label="Loading product" />
      </div>
    );
  }
  if (error) return <div className="text-center py-20 text-danger">{error}</div>;
  if (!product) return <div className="text-center py-20 text-gray-500">Product not found</div>;

  if (showMockupModal && product.Template) {
    return (
      <div className="bg-gray-50 min-h-screen pt-4 pb-12">
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-brand" role="status" aria-label="Loading editor" />
          </div>
        }>
          <MockupEditor
            template={product.Template}
            productId={product.id}
            onClose={() => setShowMockupModal(false)}
          />
        </Suspense>
      </div>
    );
  }

  const handleRequestQuote = () => {
    const variantText = selectedVariant ? ` - ${selectedVariant.value}` : '';
    const message = `I would like to request a quote for ${product.name}${variantText}.`;
    navigate('/contact', { state: { message, department: 'bulk' } });
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-8 md:pt-12 pb-16">
      <SEO 
        title={product.meta_title || `${product.name} | Zeprr`} 
        description={product.meta_description || product.description} 
        image={product.images?.[0]?.url} 
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "image": product.images?.map(img => img.url) || [],
            "description": product.description,
            "offers": {
              "@type": "Offer",
              "priceCurrency": "USD",
              "price": product.base_price,
              "availability": product.is_active ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
            }
          })}
        </script>
      </Helmet>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          
          {/* Left Column: Photo Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-xl border border-gray-200 p-6 md:p-8 flex items-center justify-center overflow-hidden relative shadow-xs">
               {product.images?.length > 0 ? (
                 <img src={product.images[selectedImageIndex]?.url || product.images[0].url} alt={product.name} className="w-full h-full object-contain" />
               ) : (
                 <div className="text-gray-400 text-sm">No Image Available</div>
               )}
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    aria-label={`View image ${idx + 1} of ${product.images.length}`}
                    aria-current={selectedImageIndex === idx}
                    className={`
                      w-20 h-20 flex-shrink-0 bg-white border rounded-lg p-2 overflow-hidden
                      transition-all duration-[var(--duration-fast)]
                      ${selectedImageIndex === idx
                        ? 'border-brand ring-2 ring-brand/20'
                        : 'border-gray-200 hover:border-gray-300'}
                    `}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details */}
          <div className="flex flex-col">
            
            <h1 className="text-3xl lg:text-4xl font-display font-semibold text-gray-900 leading-tight mb-2 tracking-tight">
              {product.name}
            </h1>
            <p className="text-lg text-gray-500 mb-8 leading-relaxed">
              {product.meta_title || "Make every interaction a walking ad for your brand."}
            </p>

            {/* Variant selector */}
            {product.variants?.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Select Option</h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map(v => (
                    <button 
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      aria-pressed={selectedVariant?.id === v.id}
                      className={`
                        px-4 py-2.5 rounded-lg border text-sm font-medium
                        transition-all duration-[var(--duration-fast)]
                        ${selectedVariant?.id === v.id
                          ? 'border-brand bg-brand-subtle text-brand'
                          : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'}
                      `}
                    >
                      {v.value}
                    </button>
                  ))}
                </div>
              </div>
            )}


            {/* Description */}
            <div className="mb-10 text-gray-600 leading-relaxed">
              <p className="whitespace-pre-wrap">{product.description}</p>
            </div>


            {/* Request a Quote button */}
            <div className="space-y-3 lg:max-w-md">
              <Button 
                variant="primary"
                size="xl"
                onClick={handleRequestQuote}
                className="w-full"
              >
                Request a Quote
              </Button>

              {/* Mockup Preview Button */}
              {product.Template && (
                <Button
                  variant="outline"
                  size="xl"
                  onClick={() => setShowMockupModal(true)}
                  className="w-full"
                >
                  <Sparkles className="w-4 h-4" />
                  Preview with Your Logo
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Product-specific FAQ block */}
        {product.faqs?.length > 0 && (
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-2xl font-display font-semibold text-center mb-8 tracking-tight">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {product.faqs.map(faq => (
                <FaqItem key={faq.id} faq={faq} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

const FaqItem = ({ faq }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left font-semibold text-sm text-gray-900 hover:bg-gray-50 transition-colors"
      >
        {faq.question}
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-[var(--duration-normal)] ${isOpen ? 'rotate-180 text-brand' : ''}`} />
      </button>
      <div className={`transition-all duration-[var(--duration-normal)] ease-[var(--ease-out)] overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
          {faq.answer}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
