import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SEO from '../../shared/components/SEO';
import HeroSection from './components/HeroSection';
import ProductScrollerSection from './components/ProductScrollerSection';
import CategoryScrollerSection from './components/CategoryScrollerSection';
import BlogSection from './components/BlogSection';
import ValuePropsSection from './components/ValuePropsSection';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const HomePage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomepageData = async () => {
      try {
        const res = await axios.get(`${API_URL}/homepage`);
        setData(res.data);
      } catch (error) {
        console.error('Failed to fetch homepage data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomepageData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) return <div className="p-8 text-center">Failed to load homepage</div>;

  return (
    <>
      <SEO 
        title="P&P | Custom Printing & Packaging" 
        description="Premium custom printing and packaging solutions designed to help your brand stand out."
      />
      
      {/* 2.3 Split Hero */}
      <HeroSection banners={data.heroBanners} />

      {/* 2.4 Low Minimum Must-haves */}
      <ProductScrollerSection 
        title="Low minimum must-haves" 
        products={data.homeScrollProducts} 
      />

      <CategoryScrollerSection 
        title="Shop by category"
        categories={data.trendingCategories}
      />

      {/* 2.6 Trusted by growing brands */}
      <ProductScrollerSection 
        title="Trusted by growing brands" 
        products={data.featuredProducts} 
        isQuoteCard={true}
      />

      {/* 2.7 Get Inspired (Blog) */}
      <BlogSection posts={data.blogPosts} />

      {/* 2.8 Value Prop Split */}
      <ValuePropsSection data={data.valueProps} />
    </>
  );
};

export default HomePage;
