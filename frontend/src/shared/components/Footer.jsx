import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ExternalLink, ArrowRight, ChevronDown } from 'lucide-react';

const InstagramIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const FacebookIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const TwitterIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

const LinkedinIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const YoutubeIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
  </svg>
);

const SOCIAL_ICONS = {
  'Instagram': InstagramIcon,
  'Facebook': FacebookIcon,
  'Twitter': TwitterIcon,
  'LinkedIn': LinkedinIcon,
  'YouTube': YoutubeIcon,
};

// Custom icons for platforms not in lucide
const TikTokIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.78-1.15 5.54-3.33 7.37-1.85 1.56-4.31 2.36-6.68 2.1-2.67-.29-5.18-1.68-6.6-3.81-1.32-1.99-1.62-4.59-.8-6.84.82-2.22 2.7-3.9 4.96-4.66 2.42-.81 5.17-.6 7.42.61v4.14c-1.42-.85-3.23-1.09-4.83-.59-1.5.47-2.67 1.7-3.1 3.23-.42 1.52-.16 3.23.8 4.49 1.07 1.41 3.04 1.95 4.7 1.47 1.53-.45 2.65-1.74 3.03-3.3.06-.23.1-.47.1-.71.02-6.52.01-13.04.01-19.56z" />
  </svg>
);

const PinterestIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.163 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.592 0 12.017 0z" />
  </svg>
);

const CUSTOM_ICONS = {
  'TikTok': TikTokIcon,
  'Pinterest': PinterestIcon,
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Footer = () => {
  const [contactSettings, setContactSettings] = useState({
    address: '123 Paper St.,\nCity, Country',
    email: 'info@zeprr.com',
    whatsapp: '+1 234 567 890',
    socialLinks: []
  });

  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (section) => {
    setOpenSection(prev => prev === section ? null : section);
  };

  useEffect(() => {
    axios.get(`${API_URL}/content/contact_settings`)
      .then(res => {
        if (res.data?.content) {
          setContactSettings(prev => ({ ...prev, ...res.data.content }));
        }
      })
      .catch(console.error);
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 text-gray-300">

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-8">

          {/* Brand column */}
          <div className="lg:col-span-1 pb-6 lg:pb-0">
            <Link to="/" className="inline-flex items-center text-2xl font-bold font-display tracking-tight mb-4">
              <span className="text-white">zep</span>
              <span className="text-brand">rr</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-xs">
              Premium custom printing and packaging solutions for growing brands.
            </p>
            <div className="flex gap-3">
              {contactSettings.socialLinks && contactSettings.socialLinks.map((link, idx) => {
                const IconComponent = SOCIAL_ICONS[link.platform] || CUSTOM_ICONS[link.platform] || ExternalLink;
                return (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.platform}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-800 text-gray-400 hover:bg-brand hover:text-white transition-all duration-[var(--duration-fast)]"
                  >
                    <IconComponent size={16} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="border-t border-gray-800 lg:border-t-0 py-4 lg:py-0">
            <button
              className="w-full flex items-center justify-between lg:cursor-default lg:block"
              onClick={() => toggleSection('quickLinks')}
            >
              <h4 className="text-sm font-semibold text-white tracking-wide">Quick Links</h4>
              <ChevronDown className={`w-4 h-4 text-gray-400 lg:hidden transition-transform ${openSection === 'quickLinks' ? 'rotate-180' : ''}`} />
            </button>
            <ul className={`space-y-3 overflow-hidden transition-all duration-300 lg:max-h-none lg:mt-4 lg:opacity-100 ${openSection === 'quickLinks' ? 'max-h-64 mt-4 opacity-100' : 'max-h-0 mt-0 opacity-0'}`}>
              {[
                { to: '/', label: 'Home' },
                { to: '/products', label: 'Products' },
                { to: '/about', label: 'About Us' },
                { to: '/blog', label: 'Blog' },
                { to: '/contact', label: 'Contact' },
              ].map(link => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-400 hover:text-white transition-colors duration-[var(--duration-fast)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="border-t border-gray-800 lg:border-t-0 py-4 lg:py-0">
            <button
              className="w-full flex items-center justify-between lg:cursor-default lg:block"
              onClick={() => toggleSection('contact')}
            >
              <h4 className="text-sm font-semibold text-white tracking-wide">Contact</h4>
              <ChevronDown className={`w-4 h-4 text-gray-400 lg:hidden transition-transform ${openSection === 'contact' ? 'rotate-180' : ''}`} />
            </button>
            <div className={`space-y-3 text-sm text-gray-400 overflow-hidden transition-all duration-300 lg:max-h-none lg:mt-4 lg:opacity-100 ${openSection === 'contact' ? 'max-h-40 mt-4 opacity-100' : 'max-h-0 mt-0 opacity-0'}`}>
              <p className="whitespace-pre-line leading-relaxed">{contactSettings.address}</p>
              <a href={`mailto:${contactSettings.email}`} className="block hover:text-white transition-colors">{contactSettings.email}</a>
              <a href={`tel:${contactSettings.whatsapp}`} className="block hover:text-white transition-colors">{contactSettings.whatsapp}</a>
            </div>
          </div>

          {/* Newsletter */}
          <div className="border-t border-gray-800 lg:border-t-0 py-4 lg:py-0">
            <button
              className="w-full flex items-center justify-between lg:cursor-default lg:block"
              onClick={() => toggleSection('newsletter')}
            >
              <h4 className="text-sm font-semibold text-white tracking-wide">Stay Updated</h4>
              <ChevronDown className={`w-4 h-4 text-gray-400 lg:hidden transition-transform ${openSection === 'newsletter' ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 lg:max-h-none lg:mt-4 lg:opacity-100 ${openSection === 'newsletter' ? 'max-h-60 mt-4 opacity-100' : 'max-h-0 mt-0 opacity-0'}`}>
              <p className="text-sm text-gray-400 mb-4">Get packaging tips and exclusive offers.</p>
              <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="
                    w-full px-4 py-2.5 text-sm
                    bg-gray-800 border border-gray-700 rounded-lg
                    text-white placeholder-gray-500
                    focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand
                    transition-all duration-[var(--duration-fast)]
                  "
                  required
                />
                <button
                  type="submit"
                  className="
                    w-full px-4 py-2.5 text-sm font-semibold
                    bg-brand text-white rounded-lg
                    hover:bg-brand-hover transition-colors duration-[var(--duration-fast)]
                    flex items-center justify-center gap-2
                  "
                >
                  Subscribe <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            © {currentYear} Zeprr. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Privacy</Link>
            <Link to="/terms" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
