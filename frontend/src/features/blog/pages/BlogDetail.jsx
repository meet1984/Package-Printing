import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import SEO from '../../../shared/components/SEO';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const BlogDetail = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`${API_URL}/blog-posts/${slug}`);
        setPost(res.data);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base p-4 text-center">
        <h1 className="text-3xl font-bold font-heading mb-4">Post not found</h1>
        <Link to="/blog" className="text-primary font-bold hover:underline">
          &larr; Back to insights
        </Link>
      </div>
    );
  }

  return (
    <article className="bg-base min-h-screen pb-24">
      <SEO 
        title={`${post.meta_title || post.title} | P&P Insights`} 
        description={post.meta_description} 
      />
      
      {/* Header Image */}
      <div className="relative w-full h-[40vh] md:h-[60vh] bg-surface">
        <img 
          src={post.cover_image || 'https://via.placeholder.com/1920x1080'} 
          alt={post.title} 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="container mx-auto px-4 text-center text-white">
            <div className="mb-4">
              <span className="bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full">
                {post.published_at ? format(new Date(post.published_at), 'MMM d, yyyy') : 'Recent'}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black font-heading tracking-tighter max-w-4xl mx-auto leading-tight">
              {post.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 mt-12 max-w-3xl">
        <Link to="/blog" className="inline-flex items-center text-text-muted hover:text-primary font-bold mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Insights
        </Link>
        
        <div className="prose prose-lg prose-neutral max-w-none font-body whitespace-pre-wrap">
          {post.content}
        </div>
      </div>
    </article>
  );
};

export default BlogDetail;
