import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../shared/store/useAuth';
import { useToast } from '../../../shared/store/useToast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [filterDepartment, setFilterDepartment] = useState('all');
  const { token } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    fetchInquiries();
  }, [filterDepartment]);

  const fetchInquiries = async () => {
    try {
      const res = await axios.get(`${API_URL}/inquiries?department=${filterDepartment}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInquiries(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`${API_URL}/inquiries/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchInquiries();
    } catch (err) {
      showToast('Error updating status', 'error');
    }
  };

  const toggleExpand = (id) => {
    if (expandedId === id) setExpandedId(null);
    else setExpandedId(id);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-black font-display text-neutral">Inquiries & Quotes</h1>
        <select 
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
          className="px-4 py-2 bg-surface border border-border rounded-xl focus:border-primary focus:outline-none"
        >
          <option value="all">All Departments</option>
          <option value="general">General</option>
          <option value="bulk">Bulk & Wholesale</option>
          <option value="support">Support</option>
          <option value="partnership">Partnership / Press</option>
          <option value="careers">Careers</option>
        </select>
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-kraft/10 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-bold">Client</th>
              <th className="px-6 py-4 font-bold">Dept</th>
              <th className="px-6 py-4 font-bold">Date</th>
              <th className="px-6 py-4 font-bold">Items/Attach</th>
              <th className="px-6 py-4 font-bold">Status</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {inquiries.map(inq => (
              <React.Fragment key={inq.id}>
                <tr className="hover:bg-kraft/5 cursor-pointer" onClick={() => toggleExpand(inq.id)}>
                  <td className="px-6 py-4">
                    <div className="font-bold">{inq.name}</div>
                    <div className="text-sm text-neutral/60">{inq.company || 'Individual'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-1 rounded">
                      {inq.department || 'general'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{new Date(inq.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-medium">
                    {inq.items?.length || 0} items
                    {inq.attachment_url && (
                      <span className="block mt-1 text-xs text-blue-500">Has Attachment</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={inq.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => updateStatus(inq.id, e.target.value)}
                      className={`text-xs font-bold rounded-full px-3 py-1 border-0 focus:ring-0 ${
                        inq.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        inq.status === 'quoted' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="quoted">Quoted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-primary font-bold">
                    {expandedId === inq.id ? 'Close' : 'View Details'}
                  </td>
                </tr>
                {expandedId === inq.id && (
                  <tr className="bg-kraft/5 border-b-2 border-border">
                    <td colSpan="5" className="px-8 py-6">
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <h4 className="font-bold mb-3 text-sm uppercase text-neutral/60">Contact Info</h4>
                          <p><strong>Email:</strong> <a href={`mailto:${inq.email}`} className="text-primary hover:underline">{inq.email}</a></p>
                          <p><strong>Phone:</strong> {inq.phone || 'N/A'}</p>
                          <p className="mt-4"><strong>Message:</strong></p>
                          <p className="text-neutral/80 italic mt-1">{inq.message || 'No additional message.'}</p>
                          {inq.attachment_url && (
                            <div className="mt-4">
                              <a 
                                href={`${API_URL.replace('/api', '')}${inq.attachment_url}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors"
                              >
                                📎 View Attachment
                              </a>
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold mb-3 text-sm uppercase text-neutral/60">Requested Items</h4>
                          <div className="space-y-3">
                            {inq.items?.map(item => (
                              <div key={item.id} className="bg-surface p-3 rounded-lg border border-border text-sm">
                                <div className="flex justify-between font-bold">
                                  <span>{item.quantity}x {item.Product?.name}</span>
                                </div>
                                {item.variant_details?.value && (
                                  <div className="text-neutral/60 mt-1">Variant: {item.variant_details.value}</div>
                                )}
                                {item.notes && (
                                  <div className="text-neutral/60 mt-1">Notes: {item.notes}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {inquiries.length === 0 && (
              <tr><td colSpan="5" className="text-center py-8 text-neutral/50">No inquiries yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminInquiries;
