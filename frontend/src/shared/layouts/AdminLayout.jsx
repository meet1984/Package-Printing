import React, { useEffect, useState } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../store/useAuth';
import { Menu, X } from 'lucide-react';
import ToastContainer from '../components/ToastContainer';

const NAV_SECTIONS = [
  { label: null, links: [{ to: '/admin/dashboard', label: 'Dashboard' }] },
  {
    label: 'Catalog',
    links: [
      { to: '/admin/categories', label: 'Categories' },
      { to: '/admin/products', label: 'Products' },
    ],
  },
  {
    label: 'Sales & Users',
    links: [
      { to: '/admin/inquiries', label: 'Inquiries' },
      { to: '/admin/users', label: 'Users' },
    ],
  },
  {
    label: 'Content',
    links: [
      { to: '/admin/homepage', label: 'Homepage Banners' },
      { to: '/admin/blog', label: 'Blog' },
      { to: '/admin/site-faq', label: 'Site FAQs' },
      { to: '/admin/contact-settings', label: 'Contact Page' },
      { to: '/admin/about-editor', label: 'Pages' },
    ],
  },
];

const AdminLayout = () => {
  const { isAuthenticated, loading, loadUser, logout, user: admin } = useAuth();
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-base text-neutral">Loading Admin...</div>;
  }

  if (!isAuthenticated || admin?.role !== 'admin') {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen flex bg-base font-sans text-neutral">
      <ToastContainer />
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-border hidden md:flex flex-col">
        <div className="h-20 flex items-center px-8 border-b border-border">
          <span className="text-2xl font-black font-display tracking-tighter text-primary">P&P Admin</span>
        </div>
        
        <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
          {NAV_SECTIONS.map((section, idx) => (
            <React.Fragment key={section.label || `section-${idx}`}>
              {section.label && (
                <div className="pt-4 pb-2 px-4 text-xs font-bold text-neutral/40 uppercase tracking-wider">{section.label}</div>
              )}
              {section.links.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  aria-current={location.pathname === link.to ? 'page' : undefined}
                  className={`block px-4 py-3 rounded-xl font-medium transition-colors ${
                    location.pathname === link.to ? 'bg-primary/10 text-primary' : 'hover:bg-kraft/10'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </React.Fragment>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <Link 
            to="/"
            target="_blank"
            className="w-full block text-left px-4 py-2 mb-2 rounded-xl text-primary hover:bg-primary/5 font-medium transition-colors"
          >
            View Storefront ↗
          </Link>
          <div className="px-4 py-2 mb-2 text-sm text-neutral/60 truncate">
            {admin?.email}
          </div>
          <button 
            onClick={logout}
            className="w-full text-left px-4 py-2 rounded-xl text-red-500 hover:bg-red-50 font-medium transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-surface border-b border-border flex items-center justify-between px-4 md:hidden">
          <button
            onClick={() => setIsMobileNavOpen(true)}
            aria-label="Open admin navigation"
            aria-expanded={isMobileNavOpen}
            className="p-2 -ml-2 rounded-lg hover:bg-kraft/10 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="text-xl font-black font-display text-primary">P&P Admin</span>
          <button onClick={logout} className="text-sm font-medium text-red-500">Sign Out</button>
        </header>

        {/* Mobile Nav Drawer */}
        {isMobileNavOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <button
              aria-label="Close admin navigation"
              onClick={() => setIsMobileNavOpen(false)}
              className="absolute inset-0 bg-black/40 animate-in fade-in duration-200"
            />
            <div className="relative w-72 max-w-[80vw] h-full bg-surface border-r border-border flex flex-col animate-in slide-in-from-left duration-300">
              <div className="h-20 flex items-center justify-between px-6 border-b border-border">
                <span className="text-xl font-black font-display tracking-tighter text-primary">P&P Admin</span>
                <button
                  onClick={() => setIsMobileNavOpen(false)}
                  aria-label="Close admin navigation"
                  className="p-2 rounded-lg hover:bg-kraft/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                {NAV_SECTIONS.map((section, idx) => (
                  <React.Fragment key={section.label || `mobile-section-${idx}`}>
                    {section.label && (
                      <div className="pt-4 pb-2 px-4 text-xs font-bold text-neutral/40 uppercase tracking-wider">{section.label}</div>
                    )}
                    {section.links.map(link => (
                      <Link
                        key={link.to}
                        to={link.to}
                        aria-current={location.pathname === link.to ? 'page' : undefined}
                        className={`block px-4 py-3 rounded-xl font-medium transition-colors ${
                          location.pathname === link.to ? 'bg-primary/10 text-primary' : 'hover:bg-kraft/10'
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </React.Fragment>
                ))}
              </nav>
              <div className="p-4 border-t border-border">
                <Link to="/" target="_blank" className="block px-4 py-2 rounded-xl text-primary hover:bg-primary/5 font-medium transition-colors">
                  View Storefront ↗
                </Link>
              </div>
            </div>
          </div>
        )}
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
