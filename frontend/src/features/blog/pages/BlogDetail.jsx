import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Loader2 } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin h-8 w-8 text-brand" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <h1 className="text-3xl font-display font-semibold mb-4 text-gray-900">Post not found</h1>
        <Link to="/blog" className="text-brand font-semibold hover:underline inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to insights
        </Link>
      </div>
    );
  }

  return (
    <article className="bg-white min-h-screen pb-24">
      <SEO 
        title={`${post.meta_title || post.title} | Zeprr Insights`} 
        description={post.meta_description} 
      />
      
      {/* Header Image */}
      <div className="relative w-full h-[50vh] md:h-[60vh] bg-gray-900">
        <img 
          src={post.cover_image || 'https://via.placeholder.com/1920x1080'} 
          alt={post.title} 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/30 to-transparent pointer-events-none" />
        <div className="absolute inset-0 flex items-end justify-center pb-16 md:pb-24">
          <div className="mx-auto max-w-4xl px-4 text-center text-white">
            <div className="mb-6">
              <span className="bg-brand-subtle text-brand px-3 py-1.5 text-xs font-semibold uppercase tracking-widest rounded-full shadow-sm">
                {post.published_at ? format(new Date(post.published_at), 'MMM d, yyyy') : 'Recent'}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold tracking-tight max-w-3xl mx-auto leading-[1.1]">
              {post.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 mt-8 md:mt-12">
        <Link to="/blog" className="inline-flex items-center text-gray-500 hover:text-brand font-medium mb-10 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Insights
        </Link>
        
        {/* We use prose for nice typography, using design system fonts and colors */}
        <div className="
          prose prose-lg md:prose-xl max-w-none 
          prose-headings:font-display prose-headings:font-semibold prose-headings:text-gray-900 prose-headings:tracking-tight
          prose-p:font-body prose-p:text-gray-700 prose-p:leading-relaxed
          prose-a:text-brand prose-a:no-underline hover:prose-a:underline
          prose-strong:text-gray-900 prose-strong:font-semibold
          prose-blockquote:border-brand prose-blockquote:bg-brand-subtle prose-blockquote:py-2 prose-blockquote:px-5 prose-blockquote:not-italic prose-blockquote:rounded-r-xl
          whitespace-pre-wrap
        ">
          {post.content}
        </div>
      </div>
    </article>
  );
};

export default BlogDetail;
