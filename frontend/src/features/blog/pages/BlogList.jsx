import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import SEO from '../../../shared/components/SEO';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const BlogList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`${API_URL}/blog-posts`);
        // Filter out drafts if they aren't already filtered by the API
        const published = res.data.filter(p => p.is_published);
        setPosts(published);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      <SEO title="Blog & Insights | Zeprr" description="Get inspired with tips, trends, and packaging insights from Zeprr." />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 pt-16 pb-12 mb-12 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-display font-semibold tracking-tight text-gray-900 mb-4">
            Zeprr Insights Hub
          </h1>
          <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Discover the latest in sustainable packaging, custom design trends, and guides to help your brand stand out.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin h-8 w-8 text-brand" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map(post => (
              <article key={post.id} className="group bg-white rounded-xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-md transition-all duration-[var(--duration-normal)] flex flex-col">
                <Link to={`/blog/${post.slug}`} className="block relative aspect-[4/3] overflow-hidden bg-gray-100">
                  <img 
                    src={post.cover_image || 'https://via.placeholder.com/600x450'} 
                    alt={post.title} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out)] group-hover:scale-105"
                    loading="lazy"
                  />
                </Link>
                
                <div className="p-6 flex-1 flex flex-col">
                  <div className="text-label text-brand mb-2">
                    {post.published_at ? format(new Date(post.published_at), 'MMM d, yyyy') : 'Recent'}
                  </div>
                  <Link to={`/blog/${post.slug}`}>
                    <h3 className="text-xl font-display font-semibold text-gray-900 group-hover:text-brand transition-colors line-clamp-2 leading-snug mb-3">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-gray-500 text-sm line-clamp-3 flex-1">
                    {post.meta_description || 'Read more about this topic on our blog.'}
                  </p>
                </div>
              </article>
            ))}
            
            {posts.length === 0 && (
              <div className="col-span-full text-center py-24 bg-white rounded-2xl border border-gray-200">
                <h3 className="text-xl font-display font-semibold text-gray-900 mb-2">No posts available</h3>
                <p className="text-gray-500">Check back soon for new insights!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogList;
