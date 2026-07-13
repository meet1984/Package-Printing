import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../shared/store/useAuth';
import { useToast } from '../../../shared/store/useToast';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/products`);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`${API_URL}/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchProducts();
      } catch (err) {
        showToast('Error deleting product', 'error');
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black font-display text-neutral">Products</h1>
        <Link 
          to="/admin/products/new"
          className="px-6 py-2 bg-primary text-white rounded-xl font-medium"
        >
          Add Product
        </Link>
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-kraft/10 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-bold">Product</th>
              <th className="px-6 py-4 font-bold">Status</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map(product => (
              <tr key={product.id} className="hover:bg-kraft/5">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-kraft/20 rounded-md overflow-hidden flex items-center justify-center text-xs">
                      {product.images?.[0]?.url ? <img src={product.images[0].url} alt="" className="w-full h-full object-cover" /> : 'IMG'}
                    </div>
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-neutral/50">{product.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {product.is_active ? 
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-bold">Active</span> : 
                    <span className="px-2 py-1 bg-neutral/10 text-neutral text-xs rounded-full font-bold">Draft</span>}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link to={`/admin/products/edit/${product.slug}`} className="text-primary hover:underline mr-4">Edit</Link>
                  <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan="4" className="text-center py-8 text-neutral/50">No products found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProducts;
