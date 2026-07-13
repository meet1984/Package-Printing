import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../useProducts';

import SEO from '../../../shared/components/SEO';
import { Helmet } from 'react-helmet-async';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { currentProduct: product, loading, error, fetchProductDetails } = useProducts();

  const [selectedVariant, setSelectedVariant] = useState(null);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" role="status" aria-label="Loading product" />
      </div>
    );
  }
  if (error || !product) return <div className="py-20 text-center text-neutral/60">Product not found.</div>;


  const handleRequestQuote = () => {
    const variantText = selectedVariant ? ` - ${selectedVariant.value}` : '';
    const message = `I would like to request a quote for ${product.name}${variantText}.`;
    navigate('/contact', { state: { message, department: 'bulk' } });
  };

  return (
    <div className="bg-base min-h-screen pt-24 pb-16">
      <SEO 
        title={product.meta_title || `${product.name} | P&P`} 
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

      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Left Column: Photo Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-surface rounded-2xl border border-border p-8 flex items-center justify-center overflow-hidden relative">
               {product.images?.length > 0 ? (
                 <img src={product.images[selectedImageIndex]?.url || product.images[0].url} alt={product.name} className="w-full h-full object-contain" />
               ) : (
                 <div className="text-neutral/30 text-lg">No Image Available</div>
               )}
            </div>
            {product.images?.length > 1 && (
              <div className="flex space-x-4 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    aria-label={`View image ${idx + 1} of ${product.images.length}`}
                    aria-current={selectedImageIndex === idx}
                    className={`w-24 h-24 flex-shrink-0 bg-surface border rounded-lg p-2 overflow-hidden transition-colors ${
                      selectedImageIndex === idx ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details */}
          <div className="flex flex-col">
            
            {/* 1. Benefit-led opening line */}
            <h1 className="text-4xl lg:text-5xl font-display font-bold text-neutral leading-tight mb-2">
              {product.name}
            </h1>
            <p className="text-xl text-neutral/80 font-medium mb-8">
              {product.meta_title || "Make every interaction a walking ad for your brand."}
            </p>

            {/* 3. Variant selector with live price */}
            {product.variants?.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-neutral mb-3">Select Option</h3>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map(v => (
                    <button 
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      aria-pressed={selectedVariant?.id === v.id}
                      className={`px-5 py-2.5 rounded-full border transition-all ${selectedVariant?.id === v.id ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-border bg-surface hover:border-neutral/30 text-neutral/80'}`}
                    >
                      {v.value}
                    </button>
                  ))}
                </div>
              </div>
            )}


            {/* 5. Specs woven into short prose */}
            <div className="prose prose-neutral mb-10">
              <p className="whitespace-pre-wrap">{product.description}</p>
            </div>





            {/* 7. Request a Quote button */}
            <button 
              onClick={handleRequestQuote}
              className="w-full bg-primary text-white py-4 rounded-full font-bold text-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
            >
              <span>Request a Quote</span>
            </button>
          </div>
        </div>

        {/* 8. Product-specific FAQ block */}
        {product.faqs?.length > 0 && (
          <div className="mt-24 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold font-display text-center mb-10">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {product.faqs.map(faq => (
                <div key={faq.id} className="bg-surface border border-border rounded-xl p-6">
                  <h4 className="font-bold text-lg mb-2">{faq.question}</h4>
                  <p className="text-neutral/70">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductDetail;
