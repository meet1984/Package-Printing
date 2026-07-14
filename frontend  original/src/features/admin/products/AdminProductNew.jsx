import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/store/useAuth';
import { useToast } from '../../../shared/store/useToast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminProductNew = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);
  
  const [categories, setCategories] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    base_price: '0.00',
    moq: 1,
    turnaround_estimate: '',
    is_active: true,
    category_id: '',
    show_in_home_scroll: false,
    home_scroll_order: 0,
    image_alt: '',
    templateId: '',   // optional mockup template
    images: [] // temporary array before product creation
  });

  useEffect(() => {
    fetchCategories();
    fetchTemplates();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/categories`);
      setCategories(res.data);
      if (res.data.length > 0) {
        setFormData(prev => ({ ...prev, category_id: res.data[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await axios.get(`${API_URL}/templates?status=published`);
      setTemplates(res.data);
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = new FormData();
    data.append('image', file);
    data.append('type', 'product');

    try {
      const uploadRes = await axios.post(`${API_URL}/upload/image`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const imageUrl = uploadRes.data.url;
      
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), { id: Date.now(), url: imageUrl, is_primary: !prev.images || prev.images.length === 0 }]
      }));
    } catch (err) {
      showToast('Error uploading image', 'error');
    }
  };

  const handleDeleteImage = (imageId) => {
    if (!window.confirm('Remove this image?')) return;
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create product
      const res = await axios.post(`${API_URL}/products`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const newProduct = res.data;

      // Save uploaded images
      if (formData.images && formData.images.length > 0) {
        await Promise.all(formData.images.map(img => 
          axios.post(`${API_URL}/products/${newProduct.id}/images`, {
            url: img.url,
            is_primary: img.is_primary
          }, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ));
      }

      navigate('/admin/products');
    } catch (err) {
      showToast('Error creating product: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-black font-display text-neutral mb-8">Add New Product</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-surface p-8 rounded-2xl border border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-bold text-neutral/70 mb-2">Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full bg-base border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral/70 mb-2">Category</label>
                <select name="category_id" value={formData.category_id} onChange={handleChange} required className="w-full bg-base border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary">
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-neutral/70 mb-2">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full bg-base border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary"></textarea>
            </div>



            <div className="mb-8">
              <label className="flex items-center space-x-3 cursor-pointer mb-4">
                <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="w-5 h-5 text-primary focus:ring-primary border-border rounded" />
                <span className="text-sm font-bold text-neutral">Active (visible on public site)</span>
              </label>

              <label className="block text-sm font-bold text-neutral/70 mb-2 mt-4">Image Alt Text (Accessibility)</label>
              <input type="text" name="image_alt" value={formData.image_alt} onChange={handleChange} placeholder="Describe the product image" className="w-full bg-base border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary text-neutral mb-4" />

              <label className="flex items-center space-x-3 cursor-pointer mb-4">
                <input type="checkbox" name="show_in_home_scroll" checked={formData.show_in_home_scroll} onChange={handleChange} className="w-5 h-5 text-primary focus:ring-primary border-border rounded" />
                <span className="text-sm font-bold text-neutral">Show in homepage scroll</span>
              </label>

              {formData.show_in_home_scroll && (
                <div className="mt-4">
                  <label className="block text-sm font-bold text-neutral/70 mb-2">Homepage Scroll Order</label>
                  <input type="number" name="home_scroll_order" value={formData.home_scroll_order} onChange={handleChange} className="w-full bg-base border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary" />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <button type="button" onClick={() => navigate('/admin/products')} className="px-6 py-3 bg-kraft/10 text-neutral rounded-xl font-medium hover:bg-kraft/20 transition-colors">Cancel</button>
              <button type="submit" className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors">Create Product</button>
            </div>
          </form>
        </div>

        {/* Sidebar for Media & Variants (Mirrors Edit Product) */}
        <div className="space-y-6">
          <div className="bg-surface p-6 rounded-2xl border border-border">
            <h3 className="font-bold mb-4">Images</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {formData.images?.map(img => (
                <div key={img.id} className="aspect-square bg-kraft/10 rounded-lg overflow-hidden border border-border relative group">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  {img.is_primary && <span className="absolute top-1 left-1 bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold">Primary</span>}
                  <button 
                    onClick={() => handleDeleteImage(img.id)}
                    className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-sm font-bold"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 border-2 border-dashed border-border rounded-xl text-neutral/60 font-medium hover:border-primary hover:text-primary transition-colors text-sm"
            >
              + Upload Image
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
            <p className="text-xs text-neutral/50 mt-3 text-center">Images will be saved when you click "Create Product".</p>
          </div>
          
          <div className="bg-surface p-6 rounded-2xl border border-border">
            <h3 className="font-bold mb-1">Mockup Template</h3>
            <p className="text-xs text-neutral/50 mb-3">Optional – link a template so customers can preview their logo on this product.</p>
            <select
              name="templateId"
              value={formData.templateId}
              onChange={handleChange}
              className="w-full bg-base border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
            >
              <option value="">None (no mockup)</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.name} — {t.productType}</option>
              ))}
            </select>
          </div>

          <div className="bg-surface p-6 rounded-2xl border border-border">
            <h3 className="font-bold mb-4">Variants</h3>
            <p className="text-sm text-neutral/60 italic mb-4">Variants can be added after the product is created.</p>
            <button disabled className="w-full py-2 bg-kraft/10 text-neutral/50 rounded-xl font-medium cursor-not-allowed text-sm">
              Add Variant (Save First)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProductNew;
