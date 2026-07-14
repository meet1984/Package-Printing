import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
    <div>
      <SEO title="Dashboard - Admin" />
      
      <div className="mb-8">
        <h1 className="text-3xl font-black font-display text-neutral">Dashboard</h1>
        <p className="text-neutral/60 mt-1">Welcome back, {admin?.name || 'Admin'}. Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-sm font-bold text-neutral/60 uppercase tracking-wider mb-2">Pending Inquiries</h3>
          <p className="text-4xl font-black text-primary">{stats.pendingInquiries}</p>
        </div>
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-sm font-bold text-neutral/60 uppercase tracking-wider mb-2">Active Products</h3>
          <p className="text-4xl font-black text-neutral">{stats.activeProducts}</p>
        </div>
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-sm font-bold text-neutral/60 uppercase tracking-wider mb-2">Total Categories</h3>
          <p className="text-4xl font-black text-neutral">{stats.totalCategories}</p>
        </div>
      </div>
      
      <div className="bg-surface p-8 rounded-2xl border border-border">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors">Add New Product</button>
          <button className="px-6 py-3 bg-kraft/20 text-neutral rounded-xl font-medium hover:bg-kraft/30 transition-colors">View Inquiries</button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
