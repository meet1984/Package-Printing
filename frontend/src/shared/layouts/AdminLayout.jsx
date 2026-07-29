import React, { useEffect, useState } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../store/useAuth';
import { Menu, X, ChevronDown, ChevronRight, LayoutDashboard, PackageSearch, Users, Image as ImageIcon, MessageSquare, HelpCircle, Mail, Settings, PenTool, Layers, History } from 'lucide-react';
import ToastContainer from '../components/ToastContainer';

const NAV_SECTIONS = [
  { label: null, links: [{ to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard }] },
  {
    label: 'Catalog',
    links: [
      { to: '/admin/categories', label: 'Categories', icon: Layers },
      { to: '/admin/products', label: 'Products', icon: PackageSearch },
      { to: '/admin/templates', label: 'Mockup Templates', icon: PenTool },
    ],
  },
  {
    label: 'Sales & Users',
    links: [
      { to: '/admin/inquiries', label: 'Inquiries', icon: MessageSquare },
      { to: '/admin/users', label: 'Users', icon: Users },
      { to: '/admin/logs', label: 'Activity Logs', icon: History },
    ],
  },
  {
    label: 'Content',
    links: [
      { to: '/admin/homepage', label: 'Homepage Banners', icon: ImageIcon },
      { to: '/admin/about', label: 'About Page', icon: Settings },
      { to: '/admin/blog', label: 'Blog', icon: PenTool },
      { to: '/admin/site-faq', label: 'Site FAQs', icon: HelpCircle },
      { to: '/admin/contact-settings', label: 'Contact Page', icon: Mail },
    ],
  },
];

const NavSectionGroup = ({ section, location, onLinkClick }) => {
  const isChildActive = (linkTo) => {
    if (linkTo === '/admin/dashboard') return location.pathname === linkTo;
    return location.pathname.startsWith(linkTo);
  };
  
  const isAutoOpenInit = section.links.some(link => isChildActive(link.to));
  const [isOpen, setIsOpen] = useState(isAutoOpenInit || false);

  useEffect(() => {
    if (section.links.some(link => isChildActive(link.to))) {
      setIsOpen(true);
    }
  }, [location.pathname, section.links]);

  if (!section.label) {
    return (
      <div className="space-y-1 mb-6 mt-2">
        {section.links.map(link => {
          const Icon = link.icon;
          const active = isChildActive(link.to);
          return (
            <Link
              key={link.to}
              to={link.to}
              onClick={onLinkClick}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-xl font-medium text-sm transition-all duration-[var(--duration-fast)] ${
                active ? 'bg-brand-subtle text-brand shadow-xs' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              {Icon && <Icon size={18} className={active ? 'text-brand' : 'text-gray-400 group-hover:text-gray-600'} />}
              {link.label}
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="mb-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full mb-2 px-6 flex items-center justify-between group cursor-pointer"
      >
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest transition-colors group-hover:text-gray-600">
          {section.label}
        </span>
        <div className="text-gray-400 group-hover:text-gray-600 transition-colors flex items-center justify-center w-5 h-5 rounded-md hover:bg-gray-100">
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
      </button>
      
      <div 
        className={`overflow-hidden transition-all duration-[var(--duration-normal)] ease-[var(--ease-out)]`}
        style={{ maxHeight: isOpen ? `${section.links.length * 50}px` : '0px', opacity: isOpen ? 1 : 0 }}
      >
        <div className="space-y-1 mt-1">
          {section.links.map(link => {
            const Icon = link.icon;
            const active = isChildActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={onLinkClick}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-all duration-[var(--duration-fast)] ${
                  active ? 'bg-brand-subtle text-brand font-semibold' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                {Icon && <Icon size={16} className={active ? 'text-brand' : 'text-gray-400 group-hover:text-gray-600'} />}
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

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
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Loading Admin...</div>;
  }

  if (!isAuthenticated || admin?.role !== 'admin') {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen flex bg-gray-50 font-body text-gray-900">
      <ToastContainer />
      
      {/* Sidebar Desktop */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col shadow-sm z-10">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <span className="text-xl font-bold font-display tracking-tight text-gray-900">Zeprr Admin</span>
        </div>
        
        <nav className="flex-1 py-6 space-y-1 overflow-y-auto no-scrollbar">
          {NAV_SECTIONS.map((section, idx) => (
            <NavSectionGroup 
              key={section.label || `section-${idx}`} 
              section={section} 
              location={location} 
            />
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <Link 
            to="/"
            target="_blank"
            className="w-full flex items-center justify-between px-4 py-2.5 mb-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-xs font-medium text-sm transition-all"
          >
            View Storefront <span className="text-gray-400">↗</span>
          </Link>
          <div className="px-4 py-2 mb-2 text-xs font-mono text-gray-500 truncate">
            {admin?.email}
          </div>
          <button 
            onClick={logout}
            className="w-full text-left px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 font-medium text-sm transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:hidden sticky top-0 z-20 shadow-sm">
          <button
            onClick={() => setIsMobileNavOpen(true)}
            aria-label="Open admin navigation"
            aria-expanded={isMobileNavOpen}
            className="p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="text-lg font-bold font-display tracking-tight text-gray-900">Zeprr Admin</span>
          <button onClick={logout} className="text-sm font-medium text-red-600">Sign Out</button>
        </header>

        {/* Mobile Nav Drawer */}
        {isMobileNavOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <button
              aria-label="Close admin navigation"
              onClick={() => setIsMobileNavOpen(false)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200"
            />
            <div className="relative w-72 max-w-[80vw] h-full bg-white border-r border-gray-200 flex flex-col shadow-2xl animate-in slide-in-from-left duration-[var(--duration-normal)]">
              <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
                <span className="text-xl font-bold font-display tracking-tight text-gray-900">Zeprr Admin</span>
                <button
                  onClick={() => setIsMobileNavOpen(false)}
                  aria-label="Close admin navigation"
                  className="p-2 -mr-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 py-6 space-y-1 overflow-y-auto no-scrollbar">
                {NAV_SECTIONS.map((section, idx) => (
                  <NavSectionGroup 
                    key={section.label || `mobile-section-${idx}`} 
                    section={section} 
                    location={location} 
                    onLinkClick={() => setIsMobileNavOpen(false)}
                  />
                ))}
              </nav>
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <Link to="/" target="_blank" className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-xs font-medium text-sm transition-all">
                  View Storefront <span className="text-gray-400">↗</span>
                </Link>
              </div>
            </div>
          </div>
        )}
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-gray-50">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
