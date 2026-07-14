import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../shared/store/useAuth';
import { useToast } from '../../../shared/store/useToast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminAboutEditor = () => {
  const [pages, setPages] = useState({ about: '', how_we_print: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const { token } = useAuth();
  const { showToast } = useToast();
  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const [aboutRes, processRes] = await Promise.all([
        axios.get(`${API_URL}/content/about`).catch(() => ({ data: { content: '' } })),
        axios.get(`${API_URL}/content/how_we_print`).catch(() => ({ data: { content: '' } }))
      ]);
      setPages({
        about: aboutRes.data?.content || '',
        how_we_print: processRes.data?.content || ''
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API_URL}/content/${activeTab}`, { content: pages[activeTab] }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Content saved successfully', 'success');
    } catch (err) {
      showToast('Error saving content', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black font-display text-neutral">Page Content Editor</h1>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-primary text-white rounded-xl font-medium disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-surface rounded-2xl border border-border overflow-hidden flex flex-col">
        <div className="flex border-b border-border bg-kraft/5">
          <button 
            className={`px-6 py-4 font-bold ${activeTab === 'about' ? 'bg-surface text-primary border-b-2 border-primary' : 'text-neutral/60 hover:text-neutral'}`}
            onClick={() => setActiveTab('about')}
          >
            About Us
          </button>
          <button 
            className={`px-6 py-4 font-bold ${activeTab === 'how_we_print' ? 'bg-surface text-primary border-b-2 border-primary' : 'text-neutral/60 hover:text-neutral'}`}
            onClick={() => setActiveTab('how_we_print')}
          >
            How We Print
          </button>
        </div>
        
        <div className="p-6">
          <label className="block text-sm font-medium mb-2 text-neutral/70">
            Content (HTML/Rich Text supported)
          </label>
          <textarea 
            className="w-full h-96 p-4 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
            value={pages[activeTab]}
            onChange={(e) => setPages({...pages, [activeTab]: e.target.value})}
            placeholder="<p>Enter your content here...</p>"
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default AdminAboutEditor;
