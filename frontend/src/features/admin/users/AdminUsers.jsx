import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../shared/store/useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/users/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data.users);
      setTotalCount(res.data.totalCount);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold font-display text-gray-900">Registered Users</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Total Users</div>
          <div className="text-4xl font-semibold text-brand font-display">{totalCount}</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Verified Users</div>
          <div className="text-4xl font-semibold text-green-600 font-display">
            {users.filter(u => u.is_verified).length}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-kraft/5 border-b border-gray-200">
              <tr>
                <th className="p-4 font-bold text-sm text-gray-500">ID</th>
                <th className="p-4 font-bold text-sm text-gray-500">Email</th>
                <th className="p-4 font-bold text-sm text-gray-500">Status</th>
                <th className="p-4 font-bold text-sm text-gray-500">Joined Date</th>
                <th className="p-4 font-bold text-sm text-gray-500">Last Login</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b border-gray-200/50 hover:bg-gray-50/50">
                  <td className="p-4 text-sm text-gray-500">#{user.id}</td>
                  <td className="p-4 font-bold">{user.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded-md ${user.is_verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {user.is_verified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-ink-soft">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
