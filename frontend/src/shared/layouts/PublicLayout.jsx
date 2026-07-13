import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../store/useAuth';
import { Search, User, LogOut, Settings, Loader2, Link as LinkIcon } from 'lucide-react';

const SocialIcon = ({ platform, className }) => {
  switch (platform.toLowerCase()) {
    case 'instagram':
      return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>;
    case 'facebook':
      return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
    case 'twitter':
    case 'twitter / x':
      return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>;
    case 'linkedin':
      return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>;
    case 'youtube':
      return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.13 1 12 1 12s0 3.87.46 5.58a2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.87 23 12 23 12s0-3.87-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>;
    default:
      return <LinkIcon className={className} />;
  }
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const PublicLayout = () => {
  const { user, isAuthenticated, loadUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [contactSettings, setContactSettings] = useState(null);
  const searchRef = useRef(null);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API_URL}/content/contact_settings`);
        if (res.data?.content) {
          setContactSettings(res.data.content);
        }
      } catch (err) {
        console.error('Failed to fetch contact settings:', err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    // Close dropdown on route change
    setShowDropdown(false);
    setSearchQuery('');
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await axios.get(`${API_URL}/products?search=${encodeURIComponent(searchQuery)}`);
        setSearchResults(res.data);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleLogout = () => {
    logout();
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowDropdown(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-body text-text bg-base">
      {/* 2.2 Main Navigation */}
      <header className="bg-surface sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4 md:gap-8">
          
          <div className="flex items-center gap-8">
            <Link to="/" className="text-3xl font-black font-heading tracking-tighter text-heading">
              P&P
            </Link>
            
            <nav className="hidden lg:flex items-center space-x-6 font-bold text-sm">
              <Link to="/products" className="hover:text-primary transition-colors">Products</Link>
              <Link to="/about" className="hover:text-primary transition-colors">About</Link>
            </nav>
          </div>

          <div className="flex-grow max-w-md hidden md:block relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input 
                type="text" 
                name="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => {
                  if (searchQuery.trim()) setShowDropdown(true);
                }}
                placeholder="Search products" 
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-border rounded-pill text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                autoComplete="off"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
              {isSearching && (
                <Loader2 className="absolute right-3 top-2.5 h-4 w-4 text-primary animate-spin" />
              )}
            </form>

            {/* Dropdown Results */}
            {showDropdown && searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-border overflow-hidden z-50">
                {searchResults.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto">
                    {searchResults.map(product => (
                      <Link 
                        key={product.id} 
                        to={`/product/${product.Category?.slug || 'misc'}/${product.slug}`}
                        className="flex items-center gap-4 p-3 hover:bg-gray-50 transition-colors border-b border-border/50 last:border-0"
                      >
                        {product.images && product.images.length > 0 ? (
                          <img src={product.images[0].url} alt={product.name} className="w-12 h-12 object-cover rounded-lg" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-xs text-gray-400">No Img</span>
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-sm text-heading">{product.name}</div>
                          <div className="text-xs text-text-muted">{product.Category?.name}</div>
                        </div>
                      </Link>
                    ))}
                    <Link 
                      to={`/products?search=${encodeURIComponent(searchQuery.trim())}`}
                      className="block p-3 text-center text-sm font-bold text-primary hover:bg-primary/5 transition-colors border-t border-border"
                      onClick={() => setShowDropdown(false)}
                    >
                      View all {searchResults.length} results
                    </Link>
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-text-muted">
                    {isSearching ? 'Searching...' : 'No products found.'}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            {isAuthenticated && user?.role === 'admin' && (
              <Link to="/admin/dashboard" className="hidden sm:flex items-center gap-2 text-sm font-semibold border border-primary/20 bg-primary/5 text-primary px-4 py-2 rounded-pill hover:bg-primary/10 transition-colors">
                <Settings className="h-4 w-4" />
                <span>Admin</span>
              </Link>
            )}
            {isAuthenticated && user ? (
              <div className="hidden sm:flex items-center gap-4">
                <span className="text-sm font-medium text-neutral/70">Hi, {user.name || user.email.split('@')[0]}</span>
                <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-semibold border border-border px-4 py-2 rounded-pill hover:border-red-500 hover:text-red-500 transition-colors">
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <Link to="/auth" className="hidden sm:flex items-center gap-2 text-sm font-semibold border border-border px-4 py-2 rounded-pill hover:border-primary hover:text-primary transition-colors">
                <User className="h-4 w-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      {/* 2.10 Footer */}
      <footer className="bg-surface border-t border-border pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            
            <div className="lg:col-span-2">
              <h3 className="text-3xl font-black font-heading tracking-tighter mb-4 text-heading">P&P</h3>
              <p className="text-text-muted mb-6 max-w-sm">Premium custom printing and packaging solutions designed to help your brand stand out. Low minimums, fast turnaround.</p>
            </div>
            
            <div>
              <h4 className="font-bold text-heading mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-text-muted">
                <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link to="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-heading mb-4">Support</h4>
              <ul className="space-y-3 text-sm text-text-muted">
                <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-heading mb-4">Shop</h4>
              <ul className="space-y-3 text-sm text-text-muted">
                <li><Link to="/products" className="hover:text-primary transition-colors">All Products</Link></li>
              </ul>
            </div>

          </div>

          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-text-muted">© {new Date().getFullYear()} P&P Printing. All rights reserved.</p>
            <div className="flex gap-4">
              {contactSettings?.socialLinks?.map((link, idx) => {
                if (!link.url) return null;
                
                return (
                  <a 
                    key={idx}
                    href={link.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-text-muted hover:bg-primary hover:text-white transition-colors cursor-pointer"
                    title={link.platform}
                  >
                    <SocialIcon platform={link.platform} className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
