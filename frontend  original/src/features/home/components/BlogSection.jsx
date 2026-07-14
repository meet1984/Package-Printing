import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const BlogSection = ({ posts }) => {

  return (
    <section className="py-24 bg-[var(--color-bg-alt)]">
      <div className="container mx-auto px-4">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black font-heading tracking-tighter text-heading mb-4">
            Get inspired
          </h2>
          <p className="text-text-muted text-lg">
            Tips, trends, and inspiration from the P&P Insights Hub.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {(posts || []).map(post => (
            <div key={post.id} className="group">
              <Link to={`/blog/${post.slug}`} className="block relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] mb-6">
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
                  <h3 className="text-xl font-bold font-heading text-heading group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                </Link>
                <p className="text-text-muted text-sm line-clamp-2">
                  {post.meta_description || 'Read more about this topic on our blog.'}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/blog" className="inline-flex items-center justify-center px-8 py-4 bg-surface border border-border text-heading font-bold rounded-pill hover:border-primary hover:text-primary transition-colors shadow-sm">
            Explore P&P Insights →
          </Link>
        </div>

      </div>
    </section>
  );
};

export default BlogSection;
