import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../../shared/store/useAuth';
import { useToast } from '../../../shared/store/useToast';
import { 
  History, Activity, Shield, ShieldAlert, Search, RefreshCw, 
  Trash2, Loader2, ArrowLeft, ArrowRight, User, Key, FileText,
  PlusCircle, Edit3, Trash, CheckCircle2, RotateCcw
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ACTION_BADGES = {
  CREATE: { label: '+ CREATE / ADD', bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', icon: PlusCircle },
  UPDATE: { label: '✎ UPDATE', bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', icon: Edit3 },
  DELETE: { label: '🗑 DELETE', bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', icon: Trash },
  ROLE_CHANGE: { label: '🛡 ROLE CHANGE', bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200', icon: Shield },
  STATUS_CHANGE: { label: '⟳ STATUS CHANGE', bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200', icon: RotateCcw },
  LOGIN: { label: '🔑 SIGN IN', bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200', icon: Key },
  DEFAULT: { label: '• ACTION', bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200', icon: Activity }
};

const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const diffSec = Math.floor((new Date() - new Date(dateString)) / 1000);
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return new Date(dateString).toLocaleDateString();
};

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [activeAdminsCount, setActiveAdminsCount] = useState(0);
  const [superAdminEmail, setSuperAdminEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clearing, setClearing] = useState(false);

  // Filters
  const [filterAction, setFilterAction] = useState('all');
  const [filterTargetType, setFilterTargetType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 25;

  const { token, user: currentAdmin } = useAuth();
  const { showToast } = useToast();

  const fetchLogs = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams();
      if (filterAction !== 'all') params.append('action', filterAction);
      if (filterTargetType !== 'all') params.append('target_type', filterTargetType);
      if (searchTerm.trim() !== '') params.append('search', searchTerm.trim());
      params.append('page', currentPage);
      params.append('limit', limit);

      const res = await axios.get(`${API_URL}/admin-logs?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setLogs(res.data.logs || []);
      setTotalCount(res.data.totalCount || 0);
      setTotalPages(res.data.totalPages || 1);
      setTodayCount(res.data.todayCount || 0);
      setActiveAdminsCount(res.data.activeAdminsCount || 0);
      setSuperAdminEmail(res.data.superAdminEmail || '');
    } catch (err) {
      console.error('Failed to fetch admin activity logs', err);
      showToast('Failed to load activity logs', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, filterAction, filterTargetType, searchTerm, currentPage, showToast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleClearLogs = async () => {
    if (!window.confirm('Are you sure you want to permanently delete all system activity logs? This action is irreversible.')) {
      return;
    }

    setClearing(true);
    try {
      const res = await axios.delete(`${API_URL}/admin-logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast(res.data.message || 'All logs cleared', 'success');
      setCurrentPage(1);
      fetchLogs();
    } catch (err) {
      showToast(err.response?.data?.message || 'Only Super Admin can clear logs', 'error');
    } finally {
      setClearing(false);
    }
  };

  const isCurrentSuperAdmin = superAdminEmail && currentAdmin?.email?.toLowerCase() === superAdminEmail.toLowerCase();

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-semibold font-display text-gray-900 tracking-tight">
              Administrator Activity Logs
            </h1>
            <span className="px-2.5 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold">
              Real-time Audit
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Monitor all changes, button clicks, role assignments, and updates performed by admin users.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchLogs(true)}
            disabled={refreshing || loading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold text-sm shadow-sm hover:bg-gray-50 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin text-brand' : ''} />
            <span>Refresh</span>
          </button>

          {isCurrentSuperAdmin && (
            <button
              onClick={handleClearLogs}
              disabled={clearing || totalCount === 0}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl font-bold text-sm hover:bg-red-100 transition-all cursor-pointer disabled:opacity-50"
            >
              {clearing ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              <span>Clear All Logs</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Total Recorded Actions</div>
            <div className="text-3xl font-bold text-gray-900 font-display">{totalCount}</div>
            <div className="text-xs text-gray-500 mt-1">All time audit events</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
            <History size={24} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-brand/20 p-6 shadow-xs flex items-center justify-between bg-gradient-to-br from-brand/5 to-transparent">
          <div>
            <div className="text-xs font-bold text-brand mb-1 uppercase tracking-wider">Changes Today</div>
            <div className="text-3xl font-bold text-brand font-display">{todayCount}</div>
            <div className="text-xs text-gray-500 mt-1">Actions in the last 24 hours</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
            <Activity size={24} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Active Admins</div>
            <div className="text-3xl font-bold text-emerald-600 font-display">{activeAdminsCount}</div>
            <div className="text-xs text-gray-500 mt-1">Unique staff contributors</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Shield size={24} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by admin email, name, target ID, or description..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-sm"
            />
          </div>

          <div>
            <select
              value={filterAction}
              onChange={(e) => {
                setFilterAction(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-sm font-semibold bg-white cursor-pointer"
            >
              <option value="all">All Action Types</option>
              <option value="CREATE">+ CREATE / ADD</option>
              <option value="UPDATE">✎ UPDATE</option>
              <option value="DELETE">🗑 DELETE</option>
              <option value="ROLE_CHANGE">🛡 ROLE CHANGE</option>
              <option value="STATUS_CHANGE">⟳ STATUS CHANGE</option>
              <option value="LOGIN">🔑 SIGN IN</option>
            </select>
          </div>

          <div>
            <select
              value={filterTargetType}
              onChange={(e) => {
                setFilterTargetType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-sm font-semibold bg-white cursor-pointer"
            >
              <option value="all">All Modules / Sections</option>
              <option value="Product">Products</option>
              <option value="Inquiry">Inquiries & Quotes</option>
              <option value="User">User & Admin Management</option>
              <option value="Category">Categories</option>
              <option value="Mockup Template">Mockup Templates</option>
              <option value="Homepage Banner">Homepage Banners</option>
              <option value="Site FAQ">Site FAQs</option>
              <option value="Blog">Blog Posts</option>
              <option value="About Page">About Page</option>
              <option value="Contact Settings">Contact Settings</option>
              <option value="Authentication">Authentication</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 font-bold text-xs uppercase tracking-wider text-gray-400">Timestamp</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider text-gray-400">Admin User</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider text-gray-400">Action Type</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider text-gray-400">Module / Target</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider text-gray-400">What Was Done (Details)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-16 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-brand mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Loading system activity logs...</p>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-16 text-center">
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mx-auto mb-3">
                      <FileText size={28} />
                    </div>
                    <h3 className="text-base font-bold text-gray-900">No activity logs found</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      No admin actions matched your selected filters or search terms.
                    </p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const badgeInfo = ACTION_BADGES[log.action] || ACTION_BADGES.DEFAULT;
                  const BadgeIcon = badgeInfo.icon;
                  const isRowSuperAdmin =
                    superAdminEmail && log.admin_email?.toLowerCase() === superAdminEmail.toLowerCase();

                  return (
                    <tr key={log.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="p-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          {formatRelativeTime(log.createdAt)}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {new Date(log.createdAt).toLocaleString()}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold text-xs">
                            {(log.admin_name || 'A')[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                              <span>{log.admin_name || 'Administrator'}</span>
                              {isRowSuperAdmin && (
                                <span
                                  title="Super Admin (.env)"
                                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300"
                                >
                                  <ShieldAlert size={10} />
                                  Super
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 font-mono mt-0.5">{log.admin_email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${badgeInfo.bg} ${badgeInfo.text} ${badgeInfo.border}`}
                        >
                          <BadgeIcon size={13} />
                          <span>{badgeInfo.label}</span>
                        </span>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700">
                          <span>{log.target_type}</span>
                          {log.target_id && (
                            <span className="font-mono text-gray-500 text-[11px]">#{log.target_id}</span>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="text-sm text-gray-800 font-medium leading-relaxed">
                          {log.details || 'System action performed'}
                        </div>
                        {log.ip_address && log.ip_address !== 'N/A' && (
                          <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                            IP: {log.ip_address}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50/50">
            <div className="text-sm text-gray-600 font-medium">
              Showing page <span className="font-bold text-gray-900">{currentPage}</span> of{' '}
              <span className="font-bold text-gray-900">{totalPages}</span> ({totalCount} total entries)
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50 cursor-pointer"
              >
                <ArrowLeft size={16} />
                <span>Previous</span>
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || loading}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50 cursor-pointer"
              >
                <span>Next</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogs;
