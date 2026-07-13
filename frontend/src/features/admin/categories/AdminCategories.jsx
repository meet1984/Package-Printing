import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../shared/store/useAuth';
import { useToast } from '../../../shared/store/useToast';
import { UploadCloud } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', slug: '', sort_order: 0, show_on_homepage: false, homepage_image: '' });
  const [isDragging, setIsDragging] = useState(false);
  const { token } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/categories`);
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    const data = new FormData();
    data.append('image', file);

    try {
      const res = await axios.post(`${API_URL}/upload/image`, data, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` 
        }
      });
      setFormData({ ...formData, homepage_image: res.data.url });
    } catch (err) {
      showToast('Error uploading image', 'error');
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await axios.put(`${API_URL}/categories/${formData.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/categories`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setIsEditing(false);
      setFormData({ name: '', slug: '', sort_order: 0, show_on_homepage: false, homepage_image: '' });
      fetchCategories();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error saving category', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await axios.delete(`${API_URL}/categories/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchCategories();
      } catch (err) {
        showToast('Error deleting category', 'error');
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black font-display text-neutral">Categories</h1>
        <button 
          onClick={() => {
            setFormData({ name: '', slug: '', sort_order: 0, show_on_homepage: false, homepage_image: '' });
            setIsEditing(true);
          }}
          className="px-6 py-2 bg-primary text-white rounded-xl font-medium"
        >
          Add Category
        </button>
      </div>

      {isEditing && (
        <form onSubmit={handleSubmit} className="bg-surface p-6 rounded-2xl border border-border mb-8 max-w-2xl space-y-4">
          <h2 className="text-xl font-bold">{formData.id ? 'Edit Category' : 'New Category'}</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border px-4 py-2 rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Slug</label>
            <input type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full border px-4 py-2 rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sort Order</label>
            <input type="number" value={formData.sort_order} onChange={e => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})} className="w-full border px-4 py-2 rounded-lg" />
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="show_on_homepage" checked={formData.show_on_homepage || false} onChange={e => setFormData({...formData, show_on_homepage: e.target.checked})} className="h-4 w-4" />
            <label htmlFor="show_on_homepage" className="text-sm font-medium">Show on Homepage Scroller</label>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Category Image (Used on Homepage)</label>
            {formData.homepage_image && (
              <div className="relative inline-block mb-4 group">
                <img src={formData.homepage_image} alt="Preview" className="h-32 object-cover rounded-xl border border-border shadow-sm" />
                <button type="button" onClick={() => setFormData({...formData, homepage_image: ''})} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
            )}
            
            <div 
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => document.getElementById('category-image-upload').click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:bg-surface/50'}`}
            >
              <UploadCloud className={`mx-auto h-10 w-10 mb-2 ${isDragging ? 'text-primary' : 'text-neutral/40'}`} />
              <p className="text-sm font-medium text-neutral mb-1">
                {isDragging ? 'Drop image here' : 'Drag & drop image here or click to browse'}
              </p>
              <p className="text-xs text-neutral/50">Supports JPG, PNG, WEBP</p>
              <input 
                id="category-image-upload" 
                type="file" 
                accept="image/*" 
                onChange={(e) => handleImageUpload(e.target.files[0])} 
                className="hidden" 
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg">Save</button>
          </div>
        </form>
      )}

      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-kraft/10 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-bold">Name</th>
              <th className="px-6 py-4 font-bold">Slug</th>
              <th className="px-6 py-4 font-bold">Sort</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categories.map(category => (
              <tr key={category.id} className="hover:bg-kraft/5">
                <td className="px-6 py-4 font-medium">{category.name}</td>
                <td className="px-6 py-4 text-neutral/60">{category.slug}</td>
                <td className="px-6 py-4">{category.sort_order}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => { setFormData(category); setIsEditing(true); }} className="text-primary hover:underline mr-4">Edit</button>
                  <button onClick={() => handleDelete(category.id)} className="text-red-500 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCategories;
