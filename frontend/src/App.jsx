import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import HomePage from './features/home/HomePage';
import ProductList from './features/products/components/ProductList';
import ProductDetail from './features/products/components/ProductDetail';

import AboutPage from './features/about/pages/AboutPage';
import BlogList from './features/blog/pages/BlogList';
import BlogDetail from './features/blog/pages/BlogDetail';
import CustomerAuthPage from './features/auth/pages/CustomerAuthPage';
import ContactPage from './features/contact/pages/ContactPage';
import PublicLayout from './shared/layouts/PublicLayout';
import AdminLayout from './shared/layouts/AdminLayout';
import LoginPage from './features/admin/auth/pages/LoginPage';
import AdminDashboard from './features/admin/dashboard/pages/AdminDashboard';
import AdminCategories from './features/admin/categories/AdminCategories';
import AdminProducts from './features/admin/products/AdminProducts';
import AdminProductNew from './features/admin/products/AdminProductNew';
import AdminProductEdit from './features/admin/products/AdminProductEdit';
import AdminAboutEditor from './features/admin/about-editor/AdminAboutEditor';
import AdminInquiries from './features/admin/inquiries/AdminInquiries';
import AdminHomepage from './features/admin/homepage/AdminHomepage';
import AdminBlog from './features/admin/blog/AdminBlog';
import AdminAboutPage from './features/admin/about/AdminAboutPage';
import AdminUsers from './features/admin/users/AdminUsers';
import AdminSiteFaq from './features/admin/site-faq/AdminSiteFaq';
import AdminContactSettings from './features/admin/contact-settings/AdminContactSettings';
import ScrollToTop from './shared/components/ScrollToTop';

function App() {
  return (
    <>
      <ScrollToTop />
      <Helmet>
        <title>P&P | Custom Printing & Packaging</title>
      </Helmet>
      
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
          <Route path="/admin/about-editor" element={<AdminAboutEditor />} />
          <Route path="/admin/users" element={<AdminUsers />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
