import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ToastContainer from '../components/ToastContainer';
import { useAuth } from '../store/useAuth';

const PublicLayout = () => {
  const { loadUser } = useAuth();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const location = useLocation();
  const hideFooter = location.pathname.startsWith('/auth');

  return (
    <div className="min-h-screen flex flex-col font-body text-ink bg-paper">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
      <ToastContainer />
    </div>
  );
};

export default PublicLayout;
