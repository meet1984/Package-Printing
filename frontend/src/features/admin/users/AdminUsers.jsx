import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../../shared/store/useAuth';
import { useToast } from '../../../shared/store/useToast';
import { 
  UserPlus, Shield, ShieldAlert, User, Trash2, Loader2, X, CheckCircle2 
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [superAdminEmail, setSuperAdminEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('all'); // 'all', 'admin', 'customer'
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const { token, user: currentAdmin } = useAuth();
  const { showToast } = useToast();

  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/users/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data.users || []);
      setTotalCount(res.data.totalCount || 0);
      setSuperAdminEmail(res.data.superAdminEmail || '');
    } catch (err) {
      console.error('Failed to fetch users', err);
      showToast('Failed to load user list', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, showToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      showToast('Email and password are required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post(
        `${API_URL}/users/admin/create-admin`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast(res.data.message || 'Admin account created successfully!', 'success');
      setShowModal(false);
      setFormData({ name: '', email: '', password: '' });
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create admin account', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleRole = async (targetUser) => {
    const newRole = targetUser.role === 'admin' ? 'customer' : 'admin';
    const actionText = newRole === 'admin' ? 'promote this user to Admin' : 'demote this Admin to Customer';
    
    if (!window.confirm(`Are you sure you want to ${actionText}?`)) return;

    setActionLoadingId(targetUser.id);
    try {
      const res = await axios.patch(
        `${API_URL}/users/admin/${targetUser.id}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast(res.data.message || `User role changed to ${newRole}`, 'success');
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update role', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteUser = async (targetUser) => {
    if (!window.confirm(`Are you sure you want to permanently delete user (${targetUser.email})? This action cannot be undone.`)) {
      return;
    }

    setActionLoadingId(targetUser.id);
    try {
      await axios.delete(`${API_URL}/users/admin/${targetUser.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('User deleted successfully', 'success');
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete user', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (filterRole === 'admin') return u.role === 'admin';
    if (filterRole === 'customer') return u.role !== 'admin';
    return true;
  });

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const verifiedCount = users.filter((u) => u.is_verified).length;

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold font-display text-gray-900 tracking-tight">
            User & Admin Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage customer accounts, create administrator credentials, and configure access permissions.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-brand text-white rounded-xl font-bold text-sm shadow-lg hover:bg-brand/90 focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all cursor-pointer"
        >
          <UserPlus size={18} />
          <span>Add New Admin</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Total Registered</div>
            <div className="text-3xl font-bold text-gray-900 font-display">{totalCount}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
            <User size={24} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-brand/20 p-6 shadow-xs flex items-center justify-between bg-gradient-to-br from-brand/5 to-transparent">
          <div>
            <div className="text-xs font-bold text-brand mb-1 uppercase tracking-wider">Admin Accounts</div>
            <div className="text-3xl font-bold text-brand font-display">{adminCount}</div>
            <div className="text-xs text-gray-500 mt-1">Receive inquiry notifications</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
            <Shield size={24} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Verified Users</div>
            <div className="text-3xl font-bold text-green-600 font-display">{verifiedCount}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
            <CheckCircle2 size={24} />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-3">
        {[
          { id: 'all', label: `All Users (${users.length})` },
          { id: 'admin', label: `Admins (${adminCount})` },
          { id: 'customer', label: `Customers (${users.length - adminCount})` }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterRole(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              filterRole === tab.id
                ? 'bg-brand text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 font-bold text-xs uppercase tracking-wider text-gray-400">User / Email</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider text-gray-400">Role</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider text-gray-400">Verification</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider text-gray-400">Joined Date</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider text-gray-400">Last Login</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((u) => {
                const isAdmin = u.role === 'admin';
                const isSelf = parseInt(currentAdmin?.id) === parseInt(u.id);
                const isRowSuperAdmin = superAdminEmail && u.email?.toLowerCase() === superAdminEmail.toLowerCase();
                const isCurrentSuperAdmin = superAdminEmail && currentAdmin?.email?.toLowerCase() === superAdminEmail.toLowerCase();
                const isActionLoading = actionLoadingId === u.id;
                const disableRoleToggle = isSelf || !isCurrentSuperAdmin || isRowSuperAdmin;
                const disableDelete = isSelf || isRowSuperAdmin;

                return (
                  <tr key={u.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-gray-900 text-sm">
                        {u.name || 'Unnamed User'}
                        {isSelf && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 font-mono mt-0.5">{u.email}</div>
                    </td>
                    <td className="p-4">
                      {isRowSuperAdmin ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <ShieldAlert size={12} />
                          Super Admin
                        </span>
                      ) : isAdmin ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-brand/10 text-brand border border-brand/20">
                          <Shield size={12} />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700">
                          <User size={12} />
                          Customer
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-lg ${
                          u.is_verified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {u.is_verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isActionLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                        ) : (
                          <>
                            <button
                              onClick={() => handleToggleRole(u)}
                              disabled={disableRoleToggle}
                              title={
                                !isCurrentSuperAdmin
                                  ? 'Only the Super Admin (.env) can manage admin roles'
                                  : isRowSuperAdmin
                                  ? 'Super Admin role cannot be modified'
                                  : isAdmin
                                  ? 'Demote to Customer'
                                  : 'Promote to Admin'
                              }
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                disableRoleToggle
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : isAdmin
                                  ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                  : 'bg-brand/10 text-brand hover:bg-brand/20 border border-brand/20'
                              }`}
                            >
                              {isAdmin ? 'Demote' : 'Make Admin'}
                            </button>

                            <button
                              onClick={() => handleDeleteUser(u)}
                              disabled={disableDelete}
                              title={
                                isRowSuperAdmin
                                  ? 'Super Admin account cannot be deleted'
                                  : isSelf
                                  ? 'Cannot delete your own account'
                                  : 'Delete user'
                              }
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                disableDelete
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : 'text-red-500 hover:bg-red-50'
                              }`}
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-gray-500">
                    No users found matching this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
                <Shield size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 font-display">Add Administrator</h3>
                <p className="text-xs text-gray-500">Create new admin credentials or promote an existing user.</p>
              </div>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Meet Singh"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. admin@zeprr.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-sm"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Minimum 6 characters. If the user already exists, this password will override their existing password and promote them to Admin.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl font-bold text-sm shadow-md hover:bg-brand/90 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Create Admin Account</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
