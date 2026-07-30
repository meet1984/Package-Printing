import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../shared/store/useAuth';
import { useToast } from '../../../shared/store/useToast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminHomeScrollers = () => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [scrollers, setScrollers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    sort_order: 0,
    is_active: true,
    productIds: []
  });

  const fetchScrollers = async () => {
    try {
      const res = await axios.get(`${API_URL}/home-scrollers`);
      setScrollers(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/products?limit=1000`);
      setProducts(res.data.products || res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    Promise.all([fetchScrollers(), fetchProducts()]).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await axios.post(`${API_URL}/home-scrollers/${formData.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/home-scrollers`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setIsEditing(false);
      fetchScrollers();
      showToast('Scroller saved successfully', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to save scroller', 'error');
    }
  };

  const handleEdit = (scroller) => {
    setFormData({
      id: scroller.id,
      title: scroller.title,
      sort_order: scroller.sort_order,
      is_active: scroller.is_active,
      productIds: scroller.products ? scroller.products.map(p => p.id) : []
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this scroller?')) {
      try {
        await axios.delete(`${API_URL}/home-scrollers/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchScrollers();
        showToast('Scroller deleted', 'success');
      } catch (error) {
        console.error(error);
        showToast('Failed to delete scroller', 'error');
      }
    }
  };

  const toggleProduct = (productId) => {
    setFormData(prev => {
      const isSelected = prev.productIds.includes(productId);
      if (isSelected) {
        return { ...prev, productIds: prev.productIds.filter(id => id !== productId) };
      } else {
        return { ...prev, productIds: [...prev.productIds, productId] };
      }
    });
  };

  if (loading) return <div>Loading scrollers...</div>;

  return (
    <div className="mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-display">Manage Product Scrollers</h2>
        {!isEditing && (
          <button
            onClick={() => {
              setFormData({ title: '', sort_order: 0, is_active: true, productIds: [] });
              setIsEditing(true);
            }}
            className="px-4 py-2 bg-brand text-white rounded hover:bg-brand/90 transition"
          >
            Add Scroller
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Title</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({ ...formData, title: e.target.value })} 
                  className="w-full border rounded p-2" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Sort Order</label>
                <input 
                  type="number" 
                  value={formData.sort_order} 
                  onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) })} 
                  className="w-full border rounded p-2" 
                />
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={formData.is_active} 
                  onChange={e => setFormData({ ...formData, is_active: e.target.checked })} 
                />
                <label htmlFor="isActive" className="text-sm font-bold">Is Active</label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold mb-2">Select Products</label>
              <div className="border rounded h-64 overflow-y-auto bg-white p-2">
                {products.length === 0 && <div className="text-sm text-gray-500">No products available.</div>}
                {products.map(product => (
                  <label key={product.id} className="flex items-center gap-2 p-1 hover:bg-gray-50 cursor-pointer text-sm">
                    <input 
                      type="checkbox" 
                      checked={formData.productIds.includes(product.id)}
                      onChange={() => toggleProduct(product.id)}
                    />
                    {product.name}
                  </label>
                ))}
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {formData.productIds.length} product(s) selected
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex gap-4">
            <button type="submit" className="px-4 py-2 bg-brand text-white rounded">Save</button>
            <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 border rounded bg-white">Cancel</button>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4">Title</th>
                <th className="p-4">Products</th>
                <th className="p-4">Active</th>
                <th className="p-4">Order</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {scrollers.map(scroller => (
                <tr key={scroller.id} className="border-b">
                  <td className="p-4">{scroller.title}</td>
                  <td className="p-4">{scroller.products?.length || 0}</td>
                  <td className="p-4">{scroller.is_active ? 'Yes' : 'No'}</td>
                  <td className="p-4">{scroller.sort_order}</td>
                  <td className="p-4 flex gap-2">
                    <button onClick={() => handleEdit(scroller)} className="text-blue-500">Edit</button>
                    <button onClick={() => handleDelete(scroller.id)} className="text-red-500">Delete</button>
                  </td>
                </tr>
              ))}
              {scrollers.length === 0 && (
                <tr><td colSpan="5" className="p-4 text-center">No scrollers found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminHomeScrollers;
