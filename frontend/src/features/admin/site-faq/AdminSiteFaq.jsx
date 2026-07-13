import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../shared/store/useAuth';
import { useToast } from '../../../shared/store/useToast';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminSiteFaq = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ question: '', answer: '', sort_order: 0, is_active: true });
  const [isAdding, setIsAdding] = useState(false);
  const { token } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const res = await axios.get(`${API_URL}/site-faqs/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFaqs(res.data);
    } catch (error) {
      console.error('Error fetching FAQs', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/site-faqs/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/site-faqs`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      fetchFaqs();
      cancelEdit();
    } catch (error) {
      showToast('Error saving FAQ', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      await axios.delete(`${API_URL}/site-faqs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFaqs();
    } catch (error) {
      showToast('Error deleting FAQ', 'error');
    }
  };

  const handleEdit = (faq) => {
    setEditingId(faq.id);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      sort_order: faq.sort_order,
      is_active: faq.is_active
    });
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ question: '', answer: '', sort_order: 0, is_active: true });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black font-display text-neutral">General Site FAQs</h1>
        {!isAdding && !editingId && (
          <button 
            onClick={() => setIsAdding(true)} 
            className="bg-primary text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90"
          >
            <Plus className="w-5 h-5" /> Add FAQ
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
        <div className="bg-surface border border-border p-6 rounded-2xl mb-8">
          <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit FAQ' : 'New FAQ'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1">Question</label>
              <input 
                type="text" 
                value={formData.question} 
                onChange={e => setFormData({...formData, question: e.target.value})} 
                className="w-full px-4 py-2 border rounded-xl" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Answer</label>
              <textarea 
                value={formData.answer} 
                onChange={e => setFormData({...formData, answer: e.target.value})} 
                className="w-full px-4 py-2 border rounded-xl min-h-[100px]" 
                required 
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-bold mb-1">Sort Order (Lower = First)</label>
                <input 
                  type="number" 
                  value={formData.sort_order} 
                  onChange={e => setFormData({...formData, sort_order: parseInt(e.target.value)})} 
                  className="w-full px-4 py-2 border rounded-xl" 
                />
              </div>
              <div className="flex-1 flex items-center mt-6">
                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input 
                    type="checkbox" 
                    checked={formData.is_active} 
                    onChange={e => setFormData({...formData, is_active: e.target.checked})} 
                    className="w-5 h-5 rounded text-primary border-border focus:ring-primary"
                  />
                  Is Active
                </label>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <button type="submit" className="bg-primary text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90">
                <Check className="w-4 h-4" /> Save
              </button>
              <button type="button" onClick={cancelEdit} className="bg-gray-100 text-neutral px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-200">
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-kraft/10 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-bold w-16">Sort</th>
              <th className="px-6 py-4 font-bold">Question</th>
              <th className="px-6 py-4 font-bold w-24">Status</th>
              <th className="px-6 py-4 font-bold text-right w-32">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {faqs.map(faq => (
              <tr key={faq.id} className="hover:bg-kraft/5">
                <td className="px-6 py-4 font-mono">{faq.sort_order}</td>
                <td className="px-6 py-4">
                  <div className="font-bold">{faq.question}</div>
                  <div className="text-sm text-neutral/60 truncate max-w-xl">{faq.answer}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${faq.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {faq.is_active ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEdit(faq)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(faq.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {faqs.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-neutral/60">No FAQs found. Add one above.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSiteFaq;
