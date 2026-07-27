import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Package, MessageSquare, Layers, Plus, ArrowRight } from 'lucide-react';
import SEO from '../../../../shared/components/SEO';
import { useAuth } from '../../../../shared/store/useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminDashboard = () => {
  const { admin, token } = useAuth();
  const [stats, setStats] = useState({ activeProducts: 0, pendingInquiries: 0, totalCategories: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_URL}/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      }
    };
    if (token) fetchStats();
  }, [token]);

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <SEO title="Dashboard - Admin" />
      
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-display text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-gray-500 mt-2 text-lg">Welcome back, {admin?.name || 'Admin'}. Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col hover:border-gray-300 transition-colors">
          <div className="flex items-center gap-3 mb-4 text-brand">
            <div className="p-2.5 bg-brand-subtle rounded-xl"><MessageSquare size={20} /></div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Pending Inquiries</h3>
          </div>
          <p className="text-4xl font-bold font-display text-gray-900 mt-auto">{stats.pendingInquiries}</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col hover:border-gray-300 transition-colors">
          <div className="flex items-center gap-3 mb-4 text-gray-700">
            <div className="p-2.5 bg-gray-100 rounded-xl"><Package size={20} /></div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Active Products</h3>
          </div>
          <p className="text-4xl font-bold font-display text-gray-900 mt-auto">{stats.activeProducts}</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col hover:border-gray-300 transition-colors">
          <div className="flex items-center gap-3 mb-4 text-gray-700">
            <div className="p-2.5 bg-gray-100 rounded-xl"><Layers size={20} /></div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Categories</h3>
          </div>
          <p className="text-4xl font-bold font-display text-gray-900 mt-auto">{stats.totalCategories}</p>
        </div>
      </div>
      
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold font-display text-gray-900 mb-6">Quick Actions</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            to="/admin/products/new" 
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-brand text-white rounded-xl font-semibold hover:bg-brand-hover shadow-sm transition-all text-sm"
          >
            <Plus size={18} />
            Add New Product
          </Link>
          <Link 
            to="/admin/inquiries" 
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-gray-300 hover:bg-gray-50 hover:shadow-xs transition-all text-sm"
          >
            View Inquiries
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
