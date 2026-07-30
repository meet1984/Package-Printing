import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../shared/store/useAuth';
import { useToast } from '../../../shared/store/useToast';
import AdminImageDropzone from '../components/AdminImageDropzone';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminProductEdit = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);
  
  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState(null);
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
    templateId: ''
  });
  
  // These would be updated via separate API calls in a real app, but for this demo we'll just mock the UI or keep it simple
  // Since our backend doesn't have create/update routes for images/variants yet, this UI is a placeholder for those features.

  useEffect(() => {
    fetchCategories();
    fetchTemplates();
    fetchProduct();
  }, [slug]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/categories`);
      setCategories(res.data);
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

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`${API_URL}/products/${slug}`);
      setProduct(res.data);
      setFormData({
        name: res.data.name,
        slug: res.data.slug,
        description: res.data.description || '',
        base_price: res.data.base_price,
        moq: res.data.moq,
        turnaround_estimate: res.data.turnaround_estimate || '',
        is_active: res.data.is_active,
        category_id: res.data.category_id,
        show_in_home_scroll: res.data.show_in_home_scroll || false,
        home_scroll_order: res.data.home_scroll_order || 0,
        image_alt: res.data.image_alt || '',
        templateId: res.data.templateId || ''
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !product) return;
    const data = new FormData();
    data.append('image', file);
    data.append('type', 'product');

    try {
      // 1. Upload to storage
      const uploadRes = await axios.post(`${API_URL}/upload/image`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const imageUrl = uploadRes.data.url;

      // 2. Save to product images
      await axios.post(`${API_URL}/products/${product.id}/images`, {
        url: imageUrl,
        is_primary: product.images?.length === 0
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 3. Refresh product
      fetchProduct();
    } catch (err) {
      showToast('Error uploading image', 'error');
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      await axios.delete(`${API_URL}/products/${product.id}/images/${imageId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProduct();
    } catch (err) {
      showToast('Error deleting image', 'error');
    }
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
      await axios.post(`${API_URL}/products/${product.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/admin/products');
    } catch (err) {
      showToast('Error updating product: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  if (!product) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-semibold font-display text-gray-900 mb-8">Edit Product: {product.name}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-2">Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-clay" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-2">Category</label>
                <select name="category_id" value={formData.category_id} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-clay">
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-500 mb-2">Slug</label>
              <input type="text" name="slug" value={formData.slug} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-clay text-gray-500" />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-500 mb-2">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-clay"></textarea>
            </div>



            <div className="mb-8">
              <label className="flex items-center space-x-3 cursor-pointer mb-4">
                <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="w-5 h-5 text-brand focus:ring-primary border-gray-200 rounded" />
                <span className="text-sm font-bold text-gray-900">Active (visible on public site)</span>
              </label>

              <label className="block text-sm font-bold text-gray-500 mb-2 mt-4">Image Alt Text (Accessibility)</label>
              <input type="text" name="image_alt" value={formData.image_alt} onChange={handleChange} placeholder="Describe the product image" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-clay text-gray-900 mb-4" />

              <label className="flex items-center space-x-3 cursor-pointer mb-4">
                <input type="checkbox" name="show_in_home_scroll" checked={formData.show_in_home_scroll} onChange={handleChange} className="w-5 h-5 text-brand focus:ring-primary border-gray-200 rounded" />
                <span className="text-sm font-bold text-gray-900">Show in homepage scroll</span>
              </label>

              {formData.show_in_home_scroll && (
                <div className="mt-4">
                  <label className="block text-sm font-bold text-gray-500 mb-2">Homepage Scroll Order</label>
                  <input type="number" name="home_scroll_order" value={formData.home_scroll_order} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-clay" />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <button type="button" onClick={() => navigate('/admin/products')} className="px-6 py-3 bg-kraft/10 text-gray-900 rounded-xl font-medium hover:bg-kraft/20 transition-colors">Cancel</button>
              <button type="submit" className="px-6 py-3 bg-brand text-white rounded-xl font-medium hover:bg-brand/90 transition-colors">Update Product</button>
            </div>
          </form>
        </div>

        {/* Sidebar for Media & Variants (Mocked for Demo Phase) */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200">
            <h3 className="font-bold mb-4">Images</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {product.images?.map(img => (
                <div key={img.id} className="aspect-square bg-kraft/10 rounded-lg overflow-hidden border border-gray-200 relative group">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  {img.is_primary && <span className="absolute top-1 left-1 bg-brand text-white text-[10px] px-2 py-0.5 rounded-full font-bold">Primary</span>}
                  <button 
                    onClick={() => handleDeleteImage(img.id)}
                    className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-sm font-bold"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
            <AdminImageDropzone 
              onDrop={handleImageUpload} 
              className="w-full py-8 flex flex-col items-center justify-center text-gray-500 hover:text-brand bg-gray-50"
            >
              <svg className="w-8 h-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span className="font-medium text-sm">Click or Drag & Drop to Upload</span>
            </AdminImageDropzone>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-gray-200">
            <h3 className="font-bold mb-1">Mockup Template</h3>
            <p className="text-xs text-gray-500 mb-3">Optional – link a template so customers can preview their logo on this product.</p>
            <select
              name="templateId"
              value={formData.templateId}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-clay"
            >
              <option value="">None (no mockup)</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.name} — {t.productType}</option>
              ))}
            </select>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200">
            <h3 className="font-bold mb-4">Variants</h3>
            {product.variants?.map(v => (
              <div key={v.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-200 mb-2 text-sm">
                <span className="font-medium">{v.value}</span>
                <span className="text-brand font-bold">+${v.price_modifier}</span>
              </div>
            ))}
            <button className="w-full py-2 mt-2 bg-kraft/10 text-gray-900 rounded-xl font-medium hover:bg-kraft/20 transition-colors text-sm">
              Add Variant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProductEdit;
