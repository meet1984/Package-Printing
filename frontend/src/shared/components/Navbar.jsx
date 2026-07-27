import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../store/useAuth';
import { Search, Menu, X, ChevronRight, ArrowRight } from 'lucide-react';
import logo from '../../assets/logo.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchRef = useRef(null);

  const [megaMenuData, setMegaMenuData] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [isProductsHovered, setIsProductsHovered] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Track scroll for sticky header style
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setShowDropdown(false);
    setSearchQuery('');
    setIsMobileMenuOpen(false);
    setIsProductsHovered(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    // Fetch products and categories for mega menu
    const fetchMegaMenuData = async () => {
      try {
        const [catsRes, prodsRes] = await Promise.all([
          axios.get(`${API_URL}/categories`),
          axios.get(`${API_URL}/products`)
        ]);

        const grouped = {};

        // Initialize all categories first so they always show up
        catsRes.data.forEach(c => {
          grouped[c.name] = { slug: c.slug, products: [] };
        });

        // Populate with products
        prodsRes.data.forEach(product => {
          const catName = product.Category?.name || 'Uncategorized';
          const catSlug = product.Category?.slug || 'misc';
          if (!grouped[catName]) {
            grouped[catName] = { slug: catSlug, products: [] };
          }
          grouped[catName].products.push(product);
        });

        const groupedEntries = Object.entries(grouped);
        setMegaMenuData(groupedEntries);
        if (groupedEntries.length > 0) {
          setActiveCategory(groupedEntries[0][0]);
        }
      } catch (e) {
        console.error('Failed to fetch mega menu data', e);
      }
    };
    fetchMegaMenuData();

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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowDropdown(false);
      setIsMobileMenuOpen(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { to: '/products', label: 'Products', hasMega: true },
    { to: '/about', label: 'About' },
    { to: '/mockup-generator', label: 'Mockup' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <>
      {/* ─── Sticky Header ─────────────────────────────────── */}
      <header
        className={`
          sticky top-0 z-50 w-full
          transition-all duration-[var(--duration-normal)] ease-[var(--ease-out)]
          ${scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200/60'
            : 'bg-white border-b border-gray-100'}
        `}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between gap-3 sm:gap-6">

            {/* ── Logo ──────────────────────────────────── */}
            <Link to="/" className="flex items-center shrink-0">
              <img src={logo} alt="zeprr logo" className="h-24 w-auto" />
            </Link>

            {/* ── Desktop Nav ───────────────────────────── */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map(link => (
                link.hasMega ? (
                  <div
                    key={link.to}
                    className="relative"
                    onMouseEnter={() => setIsProductsHovered(true)}
                    onMouseLeave={() => setIsProductsHovered(false)}
                  >
                    <Link
                      to={link.to}
                      className={`
                        px-3 py-2 text-sm font-medium rounded-md
                        transition-colors duration-[var(--duration-fast)]
                        ${location.pathname.startsWith('/product')
                          ? 'text-brand bg-brand-subtle'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
                      `}
                    >
                      {link.label}
                    </Link>

                    {/* ── Mega Menu ─────────────────────── */}
                    {isProductsHovered && megaMenuData.length > 0 && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-[60]">
                        <div className="w-[680px] bg-white rounded-lg border border-gray-200 shadow-xl flex overflow-hidden">

                          {/* Left: Categories */}
                          <div className="w-[220px] bg-gray-50 border-r border-gray-100 py-3">
                            <div className="px-4 pb-2 mb-1">
                              <span className="text-label">Categories</span>
                            </div>
                            <ul>
                              {megaMenuData.map(([catName, data]) => (
                                <li key={catName}>
                                  <button
                                    onClick={() => navigate(`/products/${data.slug}`)}
                                    onMouseEnter={() => setActiveCategory(catName)}
                                    className={`
                                      w-full flex items-center justify-between text-left
                                      px-4 py-2.5 text-sm font-medium
                                      transition-all duration-[var(--duration-fast)]
                                      ${activeCategory === catName
                                        ? 'text-brand bg-brand-subtle'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
                                    `}
                                  >
                                    <span className="truncate">{catName}</span>
                                    <div className="flex items-center gap-1.5">
                                      <span className={`
                                        text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded-full
                                        ${activeCategory === catName
                                          ? 'bg-brand/10 text-brand'
                                          : 'bg-gray-200 text-gray-500'}
                                      `}>
                                        {data.products.length}
                                      </span>
                                      <ChevronRight className={`w-3.5 h-3.5 transition-opacity ${activeCategory === catName ? 'opacity-100 text-brand' : 'opacity-0'}`} />
                                    </div>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Right: Products */}
                          <div className="flex-1 p-5">
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-label">{activeCategory}</span>
                              {activeCategory && (
                                <Link
                                  to={`/products/${megaMenuData.find(d => d[0] === activeCategory)?.[1]?.slug}`}
                                  className="text-xs font-medium text-brand hover:text-brand-hover flex items-center gap-1 group"
                                >
                                  View all <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {activeCategory &&
                                megaMenuData.find(d => d[0] === activeCategory)?.[1]?.products.slice(0, 6).map(p => (
                                  <Link
                                    key={p.id}
                                    to={`/product/${megaMenuData.find(d => d[0] === activeCategory)[1].slug}/${p.slug}`}
                                    className="group/item flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors duration-[var(--duration-fast)]"
                                  >
                                    {p.images && p.images.length > 0 ? (
                                      <img
                                        src={p.images[0].url}
                                        alt={p.name}
                                        className="w-10 h-10 object-cover rounded-md bg-gray-100"
                                      />
                                    ) : (
                                      <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center">
                                        <span className="text-[8px] font-mono text-gray-400">—</span>
                                      </div>
                                    )}
                                    <span className="text-sm text-gray-700 group-hover/item:text-gray-900 transition-colors truncate">
                                      {p.name}
                                    </span>
                                  </Link>
                                ))}
                              {activeCategory && megaMenuData.find(d => d[0] === activeCategory)?.[1]?.products.length === 0 && (
                                <div className="col-span-2 text-sm text-gray-400 py-8 text-center">
                                  No products yet
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`
                      px-3 py-2 text-sm font-medium rounded-md
                      transition-colors duration-[var(--duration-fast)]
                      ${location.pathname === link.to
                        ? 'text-brand bg-brand-subtle'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
                    `}
                  >
                    {link.label}
                  </Link>
                )
              ))}
            </nav>

            {/* ── Search ─────────────────────────── */}
            <div className="flex-1 max-w-xs relative" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                  placeholder="Search products…"
                  className="
                    w-full pl-9 pr-4 py-2 text-sm
                    bg-gray-50 border border-gray-200 rounded-lg
                    placeholder-gray-400 text-gray-900
                    focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand focus:bg-white
                    transition-all duration-[var(--duration-fast)]
                  "
                  autoComplete="off"
                />
              </form>

              {/* Search Results Dropdown */}
              {showDropdown && searchQuery.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden z-50">
                  {searchResults.length > 0 ? (
                    <div className="max-h-80 overflow-y-auto">
                      {searchResults.map(product => (
                        <Link
                          key={product.id}
                          to={`/product/${product.Category?.slug || 'misc'}/${product.slug}`}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                        >
                          {product.images && product.images.length > 0 ? (
                            <img src={product.images[0].url} alt={product.name} className="w-9 h-9 object-cover rounded-md" />
                          ) : (
                            <div className="w-9 h-9 bg-gray-100 rounded-md" />
                          )}
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">{product.name}</div>
                            <div className="text-xs text-gray-500">{product.Category?.name}</div>
                          </div>
                        </Link>
                      ))}
                      <Link
                        to={`/products?search=${encodeURIComponent(searchQuery.trim())}`}
                        className="block px-4 py-3 text-center text-sm font-medium text-brand hover:bg-brand-subtle transition-colors"
                        onClick={() => setShowDropdown(false)}
                      >
                        View all {searchResults.length} results →
                      </Link>
                    </div>
                  ) : (
                    <div className="px-4 py-6 text-center text-sm text-gray-500">
                      {isSearching ? 'Searching…' : 'No products found'}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Desktop Actions ────────────────────────── */}
            <div className="hidden lg:flex items-center gap-3 shrink-0">
              {isAuthenticated && user?.role === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  className="text-sm font-medium text-white bg-gray-900 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Admin
                </Link>
              )}
              {isAuthenticated && user ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-600">
                    {user.name || user.email.split('@')[0]}
                  </span>
                  <button
                    onClick={logout}
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="text-sm font-medium bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand-hover transition-colors shadow-sm"
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* ── Mobile Menu Button ─────────────────────── */}
            <button
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* ─── Mobile Menu Overlay ───────────────────────────── */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-20 z-40 bg-white overflow-y-auto">
          <div className="px-4 py-6 flex flex-col gap-6">



            {/* Mobile Nav Links */}
            <nav className="flex flex-col">
              <Link
                to="/products"
                className="flex items-center justify-between py-3.5 px-3 text-base font-semibold text-gray-900 rounded-xl hover:bg-gray-50 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Products
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>

              {/* Category sub-links */}
              {megaMenuData.length > 0 && (
                <div className="ml-3 border-l-2 border-gray-100 pl-4 mb-2 space-y-0.5">
                  {megaMenuData.map(([catName, data]) => (
                    <Link
                      key={catName}
                      to={`/products/${data.slug}`}
                      className="block py-2.5 px-3 text-sm text-gray-600 hover:text-brand rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {catName}
                      <span className="ml-2 text-xs text-gray-400">{data.products.length}</span>
                    </Link>
                  ))}
                </div>
              )}

              {navLinks.filter(l => !l.hasMega).map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center justify-between py-3.5 px-3 text-base font-semibold text-gray-900 rounded-xl hover:bg-gray-50 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
              ))}
            </nav>

            {/* Mobile Actions */}
            <div className="mt-auto pt-6 border-t border-gray-100 flex flex-col gap-3">
              {isAuthenticated && user?.role === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  className="text-center font-semibold bg-gray-900 text-white px-5 py-3.5 rounded-xl hover:bg-gray-800 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Admin Dashboard
                </Link>
              )}
              {isAuthenticated && user ? (
                <>
                  <div className="text-center text-sm text-gray-500">
                    Signed in as {user.name || user.email.split('@')[0]}
                  </div>
                  <button
                    onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                    className="text-center font-semibold border border-gray-200 px-5 py-3.5 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="text-center font-semibold bg-brand text-white px-5 py-3.5 rounded-xl hover:bg-brand-hover transition-colors shadow-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;