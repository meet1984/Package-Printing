import React, { useState, useEffect } from 'react';
import axios from 'axios';
import imageCompression from 'browser-image-compression';
import { useAuth } from '../../../shared/store/useAuth';
import { useToast } from '../../../shared/store/useToast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminHomepage = () => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '', panel_position: 'left', image: '', cta_label: '', cta_link: '', subtitle_links: [], sort_order: 0, is_active: true
  });
  const [uploading, setUploading] = useState(false);

  const fetchBanners = async () => {
    try {
      const res = await axios.get(`${API_URL}/hero-banners`);
      setBanners(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };

      if (formData.id) {
        await axios.put(`${API_URL}/hero-banners/${formData.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/hero-banners`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setIsEditing(false);
      fetchBanners();
    } catch (error) {
      console.error(error);
      showToast('Failed to save banner', 'error');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      // Compress the image before uploading
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);

      const formDataObj = new FormData();
      formDataObj.append('image', compressedFile);

      const res = await axios.post(`${API_URL}/upload/image`, formDataObj, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` 
        }
      });
      setFormData({ ...formData, image: res.data.url });
    } catch (error) {
      console.error(error);
      showToast('Failed to upload image', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (banner) => {
    let parsedLinks = [];
    if (banner.subtitle_links) {
      if (typeof banner.subtitle_links === 'string') {
        try { parsedLinks = JSON.parse(banner.subtitle_links); } catch(e) {}
      } else if (Array.isArray(banner.subtitle_links)) {
        parsedLinks = banner.subtitle_links;
      }
    }

    setFormData({
      ...banner,
      subtitle_links: parsedLinks
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this banner?')) {
      try {
        await axios.delete(`${API_URL}/hero-banners/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchBanners();
      } catch (error) {
        console.error(error);
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-heading">Manage Hero Banners</h1>
        {!isEditing && (
          <button 
            onClick={() => {
              setFormData({title: '', panel_position: 'left', image: '', cta_label: '', cta_link: '', subtitle_links: [], sort_order: 0, is_active: true});
              setIsEditing(true);
            }}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
          >
            Add Banner
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="bg-surface p-6 rounded shadow max-w-2xl">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1">Title</label>
              <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border rounded p-2" required />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Panel Position</label>
              <select value={formData.panel_position} onChange={e => setFormData({...formData, panel_position: e.target.value})} className="w-full border rounded p-2">
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Image URL</label>
              <div className="flex gap-2">
                <input type="text" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full border rounded p-2" required />
                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 border rounded px-4 py-2 flex items-center whitespace-nowrap">
                  {uploading ? 'Uploading...' : 'Upload Image'}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                </label>
              </div>
              {formData.image && (
                <img src={formData.image.startsWith('http') ? formData.image : `http://localhost:5000${formData.image}`} alt="Preview" className="h-20 mt-2 object-cover rounded" />
              )}
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">CTA Label</label>
              <input type="text" value={formData.cta_label} onChange={e => setFormData({...formData, cta_label: e.target.value})} className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">CTA Link</label>
              <input type="text" value={formData.cta_link} onChange={e => setFormData({...formData, cta_link: e.target.value})} className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Subtitle Links</label>
              <div className="space-y-2">
                {formData.subtitle_links.map((link, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input 
                      type="text" 
                      placeholder="Label (e.g. Bags)" 
                      value={link.label} 
                      onChange={e => {
                        const newLinks = [...formData.subtitle_links];
                        newLinks[idx].label = e.target.value;
                        setFormData({...formData, subtitle_links: newLinks});
                      }} 
                      className="flex-1 border rounded p-2 text-sm" 
                    />
                    <input 
                      type="text" 
                      placeholder="Link (e.g. /products)" 
                      value={link.link} 
                      onChange={e => {
                        const newLinks = [...formData.subtitle_links];
                        newLinks[idx].link = e.target.value;
                        setFormData({...formData, subtitle_links: newLinks});
                      }} 
                      className="flex-1 border rounded p-2 text-sm" 
                    />
                    <button 
                      type="button" 
                      onClick={() => {
                        const newLinks = formData.subtitle_links.filter((_, i) => i !== idx);
                        setFormData({...formData, subtitle_links: newLinks});
                      }} 
                      className="text-red-500 hover:text-red-700 font-bold px-2"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
              <button 
                type="button" 
                onClick={() => setFormData({...formData, subtitle_links: [...formData.subtitle_links, {label: '', link: ''}]})} 
                className="mt-2 text-sm text-primary font-bold hover:underline"
              >
                + Add Link
              </button>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Sort Order</label>
              <input type="number" value={formData.sort_order} onChange={e => setFormData({...formData, sort_order: parseInt(e.target.value)})} className="w-full border rounded p-2" />
            </div>
          </div>
          <div className="mt-6 flex gap-4">
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded">Save</button>
            <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 border rounded">Cancel</button>
          </div>
        </form>
      ) : (
        <div className="bg-surface rounded shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4">Title</th>
                <th className="p-4">Panel</th>
                <th className="p-4">Order</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {banners.map(banner => (
                <tr key={banner.id} className="border-b">
                  <td className="p-4">{banner.title}</td>
                  <td className="p-4 capitalize">{banner.panel_position}</td>
                  <td className="p-4">{banner.sort_order}</td>
                  <td className="p-4 flex gap-2">
                    <button onClick={() => handleEdit(banner)} className="text-blue-500">Edit</button>
                    <button onClick={() => handleDelete(banner.id)} className="text-red-500">Delete</button>
                  </td>
                </tr>
              ))}
              {banners.length === 0 && (
                <tr><td colSpan="4" className="p-4 text-center">No banners found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminHomepage;
