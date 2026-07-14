import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../shared/store/useAuth';
import { useToast } from '../../../shared/store/useToast';
import { Plus, Trash2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminContactSettings = () => {
  const [settings, setSettings] = useState({
    address: '123 Print Avenue, Industrial Estate\nNew Delhi, DL 110020\nIndia',
    hours: 'Mon-Fri, 9am - 6pm',
    email: 'support@pandp.com',
    whatsapp: '919876543210',
    supportName: 'Priya',
    supportRole: 'Support Team Lead',
    responseTime: 'We typically reply within 1 business hour.',
    socialLinks: [
      { platform: 'Instagram', url: 'https://instagram.com/pandp' },
      { platform: 'LinkedIn', url: 'https://linkedin.com/company/pandp' }
    ]
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { token } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API_URL}/content/contact_settings`);
      if (res.data?.content) {
        setSettings(prev => ({ ...prev, ...res.data.content }));
      }
    } catch (err) {
      console.error('Error fetching contact settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(`${API_URL}/content/contact_settings`, { content: settings }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Contact settings saved successfully!', 'success');
    } catch (err) {
      showToast('Error saving contact settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  const addSocialLink = () => {
    setSettings({
      ...settings,
      socialLinks: [...(settings.socialLinks || []), { platform: 'Instagram', url: '' }]
    });
  };

  const removeSocialLink = (index) => {
    const newLinks = [...(settings.socialLinks || [])];
    newLinks.splice(index, 1);
    setSettings({ ...settings, socialLinks: newLinks });
  };

  const updateSocialLink = (index, field, value) => {
    const newLinks = [...(settings.socialLinks || [])];
    newLinks[index][field] = value;
    setSettings({ ...settings, socialLinks: newLinks });
  };

  return (
    <div className="max-w-3xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black font-display text-neutral">Contact Page Settings</h1>
      </div>

      <div className="bg-surface border border-border p-8 rounded-3xl shadow-sm">
        <form onSubmit={handleSave} className="space-y-6">
          
          <div>
            <h3 className="font-bold text-lg border-b border-border pb-2 mb-4">Location & Hours</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Office Address</label>
                <textarea 
                  value={settings.address}
                  onChange={e => setSettings({...settings, address: e.target.value})}
                  className="w-full px-4 py-2 border border-border rounded-xl focus:border-primary outline-none"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Business Hours</label>
                <input 
                  type="text"
                  value={settings.hours}
                  onChange={e => setSettings({...settings, hours: e.target.value})}
                  className="w-full px-4 py-2 border border-border rounded-xl focus:border-primary outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg border-b border-border pb-2 mb-4">Personalization</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Support Rep Name</label>
                  <input 
                    type="text"
                    value={settings.supportName}
                    onChange={e => setSettings({...settings, supportName: e.target.value})}
                    className="w-full px-4 py-2 border border-border rounded-xl focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Support Rep Role</label>
                  <input 
                    type="text"
                    value={settings.supportRole}
                    onChange={e => setSettings({...settings, supportRole: e.target.value})}
                    className="w-full px-4 py-2 border border-border rounded-xl focus:border-primary outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Expected Response Time</label>
                <input 
                  type="text"
                  value={settings.responseTime}
                  onChange={e => setSettings({...settings, responseTime: e.target.value})}
                  className="w-full px-4 py-2 border border-border rounded-xl focus:border-primary outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg border-b border-border pb-2 mb-4">Direct Channels</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1">Support Email</label>
                <input 
                  type="email"
                  value={settings.email}
                  onChange={e => setSettings({...settings, email: e.target.value})}
                  className="w-full px-4 py-2 border border-border rounded-xl focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">WhatsApp Number (incl. country code)</label>
                <input 
                  type="text"
                  value={settings.whatsapp}
                  onChange={e => setSettings({...settings, whatsapp: e.target.value})}
                  className="w-full px-4 py-2 border border-border rounded-xl focus:border-primary outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between border-b border-border pb-2 mb-4">
              <h3 className="font-bold text-lg">Social Media Links</h3>
              <button 
                type="button" 
                onClick={addSocialLink}
                className="flex items-center gap-1 text-sm font-bold text-primary hover:text-primary/80"
              >
                <Plus className="h-4 w-4" /> Add Link
              </button>
            </div>
            
            <div className="space-y-4">
              {(!settings.socialLinks || settings.socialLinks.length === 0) && (
                <div className="text-sm text-text-muted italic">No social links added.</div>
              )}
              {settings.socialLinks?.map((link, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 border border-border rounded-xl bg-gray-50/50">
                  <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1 text-text-muted">Platform</label>
                      <select 
                        value={link.platform}
                        onChange={(e) => updateSocialLink(idx, 'platform', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-primary"
                      >
                        <option value="Instagram">Instagram</option>
                        <option value="Facebook">Facebook</option>
                        <option value="Twitter">Twitter / X</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="YouTube">YouTube</option>
                        <option value="TikTok">TikTok</option>
                        <option value="Pinterest">Pinterest</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold mb-1 text-text-muted">URL</label>
                      <input 
                        type="url"
                        value={link.url}
                        onChange={(e) => updateSocialLink(idx, 'url', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-primary"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => removeSocialLink(idx)}
                    className="mt-6 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove Link"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={saving}
              className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminContactSettings;
