import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowRight } from 'lucide-react';

const BlogSection = ({ posts }) => {

  return (
    <section className="section-padding bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-12">
          <h2 className="text-display tracking-tight mb-3">
            Get inspired
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Tips, trends, and inspiration from the Zeprr Insights Hub.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {(posts || []).map(post => (
            <article key={post.id} className="group bg-white rounded-xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-md transition-all duration-[var(--duration-normal)]">
              <Link to={`/blog/${post.slug}`} className="block relative aspect-[4/3] overflow-hidden bg-gray-100">
                <img
                  src={post.cover_image || 'https://via.placeholder.com/600x450'}
                  alt={post.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out)] group-hover:scale-105"
                  loading="lazy"
                />
              </Link>

              <div className="p-5 space-y-2.5">
                <div className="text-label text-brand">
                  {post.published_at ? format(new Date(post.published_at), 'MMM d, yyyy') : 'Recent'}
                </div>
                <Link to={`/blog/${post.slug}`}>
                  <h3 className="text-lg font-display font-semibold text-gray-900 group-hover:text-brand transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h3>
                </Link>
                <p className="text-gray-500 text-sm line-clamp-2">
                  {post.meta_description || 'Read more about this topic on our blog.'}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/blog"
            className="
              inline-flex items-center gap-2 px-6 py-3
              bg-white border border-gray-200 text-gray-800
              font-semibold text-sm rounded-lg
              hover:border-gray-300 hover:shadow-sm
              transition-all duration-[var(--duration-fast)]
            "
          >
            Explore Zeprr Insights
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default BlogSection;
