import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import SEO from '../../../shared/components/SEO';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const BlogList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`${API_URL}/blog-posts`);
        // Filter out drafts if they aren't already filtered by the API (though the public API should filter them)
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
    <div className="bg-base min-h-screen pt-12 pb-24">
      <SEO title="Blog & Insights | P&P" description="Get inspired with tips, trends, and packaging insights from P&P." />
      <div className="container mx-auto px-4">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black font-heading tracking-tighter text-heading mb-4">
            P&P Insights Hub
          </h1>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            Discover the latest in sustainable packaging, custom design trends, and guides to help your brand stand out.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map(post => (
              <div key={post.id} className="group">
                <Link to={`/blog/${post.slug}`} className="block relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] mb-6 bg-surface">
                  <img 
                    src={post.cover_image || 'https://via.placeholder.com/600x450'} 
                    alt={post.title} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
                
                <div className="space-y-3">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider">
                    {post.published_at ? format(new Date(post.published_at), 'MMM d, yyyy') : 'Recent'}
                  </div>
                  <Link to={`/blog/${post.slug}`}>
                    <h3 className="text-2xl font-bold font-heading text-heading group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-text-muted text-sm line-clamp-3">
                    {post.meta_description || 'Read more about this topic on our blog.'}
                  </p>
                </div>
              </div>
            ))}
            
            {posts.length === 0 && (
              <div className="col-span-full text-center py-20 text-text-muted">
                No blog posts available at the moment. Check back soon!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogList;
