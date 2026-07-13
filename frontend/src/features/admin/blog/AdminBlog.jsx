import React, { useState, useEffect } from 'react';
import axios from 'axios';
import imageCompression from 'browser-image-compression';
import { useAuth } from '../../../shared/store/useAuth';
import { useToast } from '../../../shared/store/useToast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminBlog = () => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '', slug: '', meta_description: '', content: '', cover_image: '', is_published: false
  });
  const [uploading, setUploading] = useState(false);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API_URL}/blog-posts`);
      setPosts(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await axios.put(`${API_URL}/blog-posts/${formData.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/blog-posts`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setIsEditing(false);
      setFormData({ title: '', slug: '', meta_description: '', content: '', cover_image: '', is_published: false });
      fetchPosts();
    } catch (error) {
      console.error(error);
      showToast('Failed to save post', 'error');
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
      setFormData({ ...formData, cover_image: res.data.url });
    } catch (error) {
      console.error(error);
      showToast('Failed to upload image', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (post) => {
    setFormData(post);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this post?')) {
      try {
        await axios.delete(`${API_URL}/blog-posts/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchPosts();
      } catch (error) {
        console.error(error);
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-heading">Manage Blog Posts</h1>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
          >
            Create Post
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="bg-surface p-6 rounded shadow max-w-2xl">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1">Title</label>
              <input 
                type="text" 
                value={formData.title} 
                onChange={e => {
                  const title = e.target.value;
                  setFormData(prev => ({
                    ...prev, 
                    title,
                    ...(!prev.id ? { slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') } : {})
                  }));
                }}
                className="w-full border rounded p-2" required
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Slug</label>
              <input 
                type="text" 
                value={formData.slug} 
                onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')})}
                className="w-full border rounded p-2" required
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Excerpt (Meta Description)</label>
              <textarea 
                value={formData.meta_description} 
                onChange={e => setFormData({...formData, meta_description: e.target.value})}
                className="w-full border rounded p-2"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Content</label>
              <textarea 
                value={formData.content} 
                onChange={e => setFormData({...formData, content: e.target.value})}
                className="w-full border rounded p-2 h-32"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Cover Image URL</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={formData.cover_image} 
                  onChange={e => setFormData({...formData, cover_image: e.target.value})}
                  className="w-full border rounded p-2"
                />
                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 border rounded px-4 py-2 flex items-center whitespace-nowrap">
                  {uploading ? 'Uploading...' : 'Upload Image'}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                </label>
              </div>
              {formData.cover_image && (
                <img src={formData.cover_image.startsWith('http') ? formData.cover_image : `http://localhost:5000${formData.cover_image}`} alt="Preview" className="h-20 mt-2 object-cover rounded" />
              )}
            </div>
            <div className="flex items-center">
              <input 
                type="checkbox" 
                checked={formData.is_published}
                onChange={e => setFormData({...formData, is_published: e.target.checked})}
                className="mr-2"
              />
              <label className="text-sm font-bold">Published</label>
            </div>
          </div>
          <div className="mt-6 flex gap-4">
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded">Save Post</button>
            <button type="button" onClick={() => {
              setIsEditing(false);
              setFormData({ title: '', slug: '', meta_description: '', content: '', cover_image: '', is_published: false });
            }} className="px-4 py-2 border rounded">Cancel</button>
          </div>
        </form>
      ) : (
        <div className="bg-surface rounded shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4">Title</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr key={post.id} className="border-b">
                  <td className="p-4">{post.title}</td>
                  <td className="p-4">{post.is_published ? 'Published' : 'Draft'}</td>
                  <td className="p-4 flex gap-2">
                    <button onClick={() => handleEdit(post)} className="text-blue-500">Edit</button>
                    <button onClick={() => handleDelete(post.id)} className="text-red-500">Delete</button>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr><td colSpan="3" className="p-4 text-center">No posts found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminBlog;
