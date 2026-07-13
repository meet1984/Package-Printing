import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Upload } from 'lucide-react';
import { useAuth } from '../../../shared/store/useAuth';
import { useToast } from '../../../shared/store/useToast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TABS = [
  { key: 'content', label: 'Hero & Mission' },
  { key: 'valueProps', label: 'Value Props' },
  { key: 'process', label: 'Our Process' },
  { key: 'stats', label: 'Stats' },
  { key: 'brands', label: 'Brands' },
  { key: 'team', label: 'Team' },
];

// ─── Reusable inline CRUD component ─────────────────────
const CrudSection = ({ title, endpoint, fields, token, refreshKey }) => {
  const [items, setItems] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const fileRef = useRef(null);
  const { showToast } = useToast();

  const emptyForm = () => fields.reduce((acc, f) => {
    acc[f.name] = f.type === 'checkbox' ? (f.default ?? true) : (f.default ?? '');
    return acc;
  }, {});

  useEffect(() => { fetchItems(); }, [refreshKey]);

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${API_URL}/about/${endpoint}`);
      setItems(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await axios.put(`${API_URL}/about/${endpoint}/${formData.id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(`${API_URL}/about/${endpoint}`, formData, { headers: { Authorization: `Bearer ${token}` } });
      }
      setIsEditing(false);
      setFormData(emptyForm());
      fetchItems();
    } catch (err) { showToast('Error saving', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await axios.delete(`${API_URL}/about/${endpoint}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchItems();
    } catch (err) { showToast('Error deleting', 'error'); }
  };

  const uploadFile = async (file, fieldName) => {
    if (!file) return;
    const data = new FormData();
    data.append('image', file);
    try {
      const res = await axios.post(`${API_URL}/upload/image`, data, { headers: { Authorization: `Bearer ${token}` } });
      setFormData(prev => ({ ...prev, [fieldName]: res.data.url }));
    } catch (err) { showToast('Upload failed', 'error'); }
  };

  const handleImageUpload = (e, fieldName) => {
    uploadFile(e.target.files[0], fieldName);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">{title}</h2>
        {!isEditing && (
          <button onClick={() => { setFormData(emptyForm()); setIsEditing(true); }} className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium">
            Add New
          </button>
        )}
      </div>

      {isEditing && (
        <form onSubmit={handleSubmit} className="bg-kraft/5 p-6 rounded-2xl border border-border mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map(f => {
              if (f.type === 'image') {
                return (
                  <ImageDropZone
                    key={f.name}
                    label={f.label}
                    value={formData[f.name] || ''}
                    onUpload={(file) => uploadFile(file, f.name)}
                    onClear={() => setFormData({ ...formData, [f.name]: '' })}
                  />
                );
              }
              if (f.type === 'textarea') {
                return (
                  <div key={f.name} className={f.fullWidth ? 'col-span-full' : ''}>
                    <label className="block text-sm font-bold text-neutral/70 mb-1">{f.label}</label>
                    <textarea value={formData[f.name] || ''} onChange={e => setFormData({ ...formData, [f.name]: e.target.value })} rows={3} className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-base" />
                  </div>
                );
              }
              if (f.type === 'checkbox') {
                return (
                  <div key={f.name} className="flex items-center gap-2">
                    <input type="checkbox" checked={!!formData[f.name]} onChange={e => setFormData({ ...formData, [f.name]: e.target.checked })} className="w-4 h-4" />
                    <label className="text-sm font-bold text-neutral/70">{f.label}</label>
                  </div>
                );
              }
              return (
                <div key={f.name}>
                  <label className="block text-sm font-bold text-neutral/70 mb-1">{f.label}</label>
                  <input type={f.type || 'text'} value={formData[f.name] || ''} onChange={e => setFormData({ ...formData, [f.name]: e.target.value })} className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-base" required={f.required} />
                </div>
              );
            })}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setIsEditing(false); setFormData(emptyForm()); }} className="px-4 py-2 border border-border rounded-xl text-sm">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-xl text-sm">Save</button>
          </div>
        </form>
      )}

      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-kraft/10 border-b border-border">
            <tr>
              {fields.filter(f => !f.hideInTable).map(f => (
                <th key={f.name} className="px-4 py-3 font-bold">{f.label}</th>
              ))}
              <th className="px-4 py-3 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-kraft/5">
                {fields.filter(f => !f.hideInTable).map(f => (
                  <td key={f.name} className="px-4 py-3">
                    {f.type === 'image' ? (item[f.name] ? <img src={item[f.name]} alt="" className="h-10 w-10 rounded object-cover" /> : '—') :
                     f.type === 'checkbox' ? (item[f.name] ? '✓' : '✗') :
                     f.type === 'textarea' ? (item[f.name]?.substring(0, 40) + (item[f.name]?.length > 40 ? '…' : '')) :
                     item[f.name]}
                  </td>
                ))}
                <td className="px-4 py-3 text-right">
                  <button onClick={() => { setFormData(item); setIsEditing(true); }} className="text-primary hover:underline mr-3">Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={99} className="px-4 py-6 text-center text-neutral/50">No items yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Drag & Drop Image Zone ─────────────────────────────
const ImageDropZone = ({ label, value, onUpload, onClear }) => {
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) onUpload(file);
  }, [onUpload]);

  const handleDragOver = useCallback((e) => { e.preventDefault(); setDragging(true); }, []);
  const handleDragLeave = useCallback(() => setDragging(false), []);

  if (value) {
    return (
      <div className="col-span-full">
        <label className="block text-sm font-bold text-neutral/70 mb-1">{label}</label>
        <div className="relative inline-block">
          <img src={value} alt="" className="h-24 rounded-xl object-cover border border-border" />
          <button
            type="button"
            onClick={onClear}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center hover:bg-red-600 shadow"
          >✕</button>
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-full">
      <label className="block text-sm font-bold text-neutral/70 mb-1">{label}</label>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          dragging
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : 'border-border hover:border-primary/50 hover:bg-kraft/5'
        }`}
      >
        <Upload className="w-8 h-8 mx-auto mb-2 text-neutral/30" />
        <p className="text-sm text-neutral/50 font-medium">Drag & drop an image here, or click to browse</p>
        <p className="text-xs text-neutral/30 mt-1">PNG, JPG, WebP up to 5MB</p>
      </div>
      <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={(e) => { if (e.target.files[0]) onUpload(e.target.files[0]); }} />
    </div>
  );
};

// ─── Content tab (Hero, Mission, CTA text) ──────────────
const ContentTab = ({ token }) => {
  const [hero, setHero] = useState({ headline: '', subtitle: '', image: '' });
  const [mission, setMission] = useState({ headline: '', body: '', cta_text: '', cta_link: '' });
  const [cta, setCta] = useState({ headline: '', body: '', cta_text: '', cta_link: '' });
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchAll = async () => {
      const keys = ['about_hero', 'about_mission', 'about_cta'];
      const results = await Promise.all(
        keys.map(k => axios.get(`${API_URL}/content/${k}`).catch(() => ({ data: { content: null } })))
      );
      const parse = (val) => {
        if (!val) return {};
        if (typeof val === 'object') return val;
        try { return JSON.parse(val); } catch { return { text: val }; }
      };
      setHero({ headline: '', subtitle: '', image: '', ...parse(results[0].data?.content) });
      setMission({ headline: '', body: '', cta_text: '', cta_link: '', ...parse(results[1].data?.content) });
      setCta({ headline: '', body: '', cta_text: '', cta_link: '', ...parse(results[2].data?.content) });
    };
    fetchAll();
  }, []);

  const handleSave = async (key, data) => {
    setSaving(true);
    try {
      await axios.put(`${API_URL}/content/${key}`, { content: data }, { headers: { Authorization: `Bearer ${token}` } });
      showToast('Saved!', 'success');
    } catch { showToast('Error saving', 'error'); }
    finally { setSaving(false); }
  };

  const handleHeroImageUpload = async (file) => {
    const fd = new FormData();
    fd.append('image', file);
    try {
      const res = await axios.post(`${API_URL}/upload/image`, fd, { headers: { Authorization: `Bearer ${token}` } });
      setHero(prev => ({ ...prev, image: res.data.url }));
    } catch { showToast('Upload failed', 'error'); }
  };

  const Input = ({ label, value, onChange, placeholder }) => (
    <div>
      <label className="block text-sm font-bold text-neutral/70 mb-1">{label}</label>
      <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-base focus:outline-none focus:border-primary" />
    </div>
  );

  const TextArea = ({ label, value, onChange, placeholder, rows = 3 }) => (
    <div>
      <label className="block text-sm font-bold text-neutral/70 mb-1">{label}</label>
      <textarea value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-base focus:outline-none focus:border-primary" />
    </div>
  );

  return (
    <div className="space-y-10">
      {/* ── Hero Section ── */}
      <div className="bg-surface p-6 rounded-2xl border border-border">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold">Hero Banner (Section 1)</h3>
          <button onClick={() => handleSave('about_hero', hero)} disabled={saving} className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Hero'}
          </button>
        </div>
        <div className="space-y-4">
          <Input label="Headline" value={hero.headline} onChange={v => setHero({ ...hero, headline: v })} placeholder="e.g. We make packaging personal" />
          <Input label="Subtitle" value={hero.subtitle} onChange={v => setHero({ ...hero, subtitle: v })} placeholder="e.g. Custom printing for growing brands" />
          <ImageDropZone
            label="Background Image"
            value={hero.image}
            onUpload={handleHeroImageUpload}
            onClear={() => setHero({ ...hero, image: '' })}
          />
        </div>
      </div>

      {/* ── Mission Section ── */}
      <div className="bg-surface p-6 rounded-2xl border border-border">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold">Mission Statement (Section 2)</h3>
          <button onClick={() => handleSave('about_mission', mission)} disabled={saving} className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Mission'}
          </button>
        </div>
        <div className="space-y-4">
          <Input label="Bold Headline" value={mission.headline} onChange={v => setMission({ ...mission, headline: v })} placeholder="e.g. Custom packaging, simplified." />
          <TextArea label="Body Paragraph" value={mission.body} onChange={v => setMission({ ...mission, body: v })} placeholder="Write your 2-3 sentence mission here…" rows={4} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="CTA Button Text" value={mission.cta_text} onChange={v => setMission({ ...mission, cta_text: v })} placeholder="e.g. Explore our products" />
            <Input label="CTA Link" value={mission.cta_link} onChange={v => setMission({ ...mission, cta_link: v })} placeholder="e.g. /products" />
          </div>
        </div>
      </div>

      {/* ── Closing CTA Section ── */}
      <div className="bg-surface p-6 rounded-2xl border border-border">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold">Closing CTA Banner (Section 8)</h3>
          <button onClick={() => handleSave('about_cta', cta)} disabled={saving} className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium disabled:opacity-50">
            {saving ? 'Saving…' : 'Save CTA'}
          </button>
        </div>
        <div className="space-y-4">
          <Input label="Headline" value={cta.headline} onChange={v => setCta({ ...cta, headline: v })} placeholder="e.g. Upload your design — we print it" />
          <TextArea label="Supporting Text (optional)" value={cta.body} onChange={v => setCta({ ...cta, body: v })} placeholder="Optional short description…" rows={2} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Button Text" value={cta.cta_text} onChange={v => setCta({ ...cta, cta_text: v })} placeholder="e.g. Browse Products" />
            <Input label="Button Link" value={cta.cta_link} onChange={v => setCta({ ...cta, cta_link: v })} placeholder="e.g. /products" />
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Admin About Page ──────────────────────────────
const AdminAboutPage = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('content');

  return (
    <div>
      <h1 className="text-3xl font-black font-display text-neutral mb-8">About Page</h1>

      <div className="flex border-b border-border mb-8 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-3 font-bold text-sm whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-neutral/50 hover:text-neutral'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'content' && <ContentTab token={token} />}

      {activeTab === 'valueProps' && (
        <CrudSection
          title="Value Proposition Cards (Section 3)"
          endpoint="value-props"
          token={token}
          refreshKey={activeTab}
          fields={[
            { name: 'title', label: 'Title', required: true },
            { name: 'description', label: 'Description', type: 'textarea', fullWidth: true },
            { name: 'image', label: 'Image', type: 'image' },
            { name: 'sort_order', label: 'Sort Order', type: 'number', default: 0 },
          ]}
        />
      )}

      {activeTab === 'process' && (
        <CrudSection
          title="Process Pillars (Section 4)"
          endpoint="process-pillars"
          token={token}
          refreshKey={activeTab}
          fields={[
            { name: 'title', label: 'Title', required: true },
            { name: 'what_it_means', label: 'What it means', type: 'textarea' },
            { name: 'why_it_matters', label: 'Why it matters', type: 'textarea' },
            { name: 'how_we_ensure_it', label: 'How we ensure it', type: 'textarea' },
            { name: 'icon_image', label: 'Icon/Image', type: 'image' },
            { name: 'sort_order', label: 'Sort Order', type: 'number', default: 0 },
          ]}
        />
      )}

      {activeTab === 'stats' && (
        <CrudSection
          title="Stat Counters (Section 5)"
          endpoint="stat-counters"
          token={token}
          refreshKey={activeTab}
          fields={[
            { name: 'label', label: 'Label', required: true },
            { name: 'value', label: 'Value', type: 'number', required: true },
            { name: 'suffix', label: 'Suffix (+, %, etc.)', default: '+' },
            { name: 'sort_order', label: 'Sort Order', type: 'number', default: 0 },
            { name: 'is_active', label: 'Active', type: 'checkbox', default: true },
          ]}
        />
      )}

      {activeTab === 'brands' && (
        <CrudSection
          title="Partner Brands (Section 6)"
          endpoint="partner-brands"
          token={token}
          refreshKey={activeTab}
          fields={[
            { name: 'name', label: 'Brand Name', required: true },
            { name: 'logo_image', label: 'Logo Image', type: 'image' },
            { name: 'website_url', label: 'Website Link (optional)' },
            { name: 'sort_order', label: 'Sort Order', type: 'number', default: 0 },
            { name: 'is_active', label: 'Active', type: 'checkbox', default: true },
          ]}
        />
      )}

      {activeTab === 'team' && (
        <CrudSection
          title="Team Members (Section 7)"
          endpoint="team-members"
          token={token}
          refreshKey={activeTab}
          fields={[
            { name: 'name', label: 'Name', required: true },
            { name: 'role', label: 'Role', required: true },
            { name: 'photo', label: 'Photo', type: 'image' },
            { name: 'sort_order', label: 'Sort Order', type: 'number', default: 0 },
            { name: 'is_active', label: 'Active', type: 'checkbox', default: true },
          ]}
        />
      )}
    </div>
  );
};

export default AdminAboutPage;
