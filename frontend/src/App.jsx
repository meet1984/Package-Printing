import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// Layouts and tiny shared utilities stay as regular (non-lazy) imports since
// they're needed immediately no matter which route loads.
import PublicLayout from './shared/layouts/PublicLayout';
import AdminLayout from './shared/layouts/AdminLayout';
import ScrollToTop from './shared/components/ScrollToTop';

// Public pages
const HomePage = lazy(() => import('./features/home/HomePage'));
const ProductList = lazy(() => import('./features/products/components/ProductList'));
const ProductDetail = lazy(() => import('./features/products/components/ProductDetail'));
const AboutPage = lazy(() => import('./features/about/pages/AboutPage'));
const BlogList = lazy(() => import('./features/blog/pages/BlogList'));
const BlogDetail = lazy(() => import('./features/blog/pages/BlogDetail'));
const CustomerAuthPage = lazy(() => import('./features/auth/pages/CustomerAuthPage'));
const ContactPage = lazy(() => import('./features/contact/pages/ContactPage'));
const MockupGeneratorPage = lazy(() => import('./features/generator/MockupGeneratorPage'));

// Admin pages - previously bundled into every public visitor's initial load
const LoginPage = lazy(() => import('./features/admin/auth/pages/LoginPage'));
const AdminDashboard = lazy(() => import('./features/admin/dashboard/pages/AdminDashboard'));
const AdminCategories = lazy(() => import('./features/admin/categories/AdminCategories'));
const AdminProducts = lazy(() => import('./features/admin/products/AdminProducts'));
const AdminProductNew = lazy(() => import('./features/admin/products/AdminProductNew'));
const AdminProductEdit = lazy(() => import('./features/admin/products/AdminProductEdit'));
const AdminInquiries = lazy(() => import('./features/admin/inquiries/AdminInquiries'));
const AdminHomepage = lazy(() => import('./features/admin/homepage/AdminHomepage'));
const AdminBlog = lazy(() => import('./features/admin/blog/AdminBlog'));
const AdminAboutPage = lazy(() => import('./features/admin/about/AdminAboutPage'));
const AdminUsers = lazy(() => import('./features/admin/users/AdminUsers'));
const AdminLogs = lazy(() => import('./features/admin/logs/AdminLogs'));
const AdminSiteFaq = lazy(() => import('./features/admin/site-faq/AdminSiteFaq'));
const AdminContactSettings = lazy(() => import('./features/admin/contact-settings/AdminContactSettings'));
const AdminTemplates = lazy(() => import('./features/admin/templates/AdminTemplates'));
const AdminTemplateEdit = lazy(() => import('./features/admin/templates/AdminTemplateEdit'));

// Shown briefly while a route's chunk downloads (fast on repeat navigation,
// since the browser/CDN caches each chunk after first fetch).
const RouteLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-brand" role="status" aria-label="Loading page" />
  </div>
);

function App() {
  return (
    <>
      <ScrollToTop />
      <Helmet>
        <title>Zeprr | Custom Printing & Packaging</title>
      </Helmet>
      
      <Suspense fallback={<RouteLoadingFallback />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/:categorySlug" element={<ProductList />} />
            <Route path="/product/:categorySlug/:slug" element={<ProductDetail />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="/auth" element={<CustomerAuthPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/mockup-generator" element={<MockupGeneratorPage />} />
          </Route>

          <Route path="/admin/login" element={<LoginPage />} />
          
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/products/new" element={<AdminProductNew />} />
            <Route path="/admin/products/edit/:slug" element={<AdminProductEdit />} />
            <Route path="/admin/inquiries" element={<AdminInquiries />} />
            <Route path="/admin/site-faq" element={<AdminSiteFaq />} />
            <Route path="/admin/contact-settings" element={<AdminContactSettings />} />
            <Route path="/admin/homepage" element={<AdminHomepage />} />
            <Route path="/admin/blog" element={<AdminBlog />} />
            <Route path="/admin/about" element={<AdminAboutPage />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/logs" element={<AdminLogs />} />
            <Route path="/admin/templates" element={<AdminTemplates />} />
            <Route path="/admin/templates/new" element={<AdminTemplateEdit />} />
            <Route path="/admin/templates/edit/:id" element={<AdminTemplateEdit />} />
            <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
