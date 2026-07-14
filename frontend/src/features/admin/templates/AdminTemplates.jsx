import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import { getTemplates, deleteTemplate } from './api';
import { useToast } from '../../../shared/store/useToast';
import { getImageUrl } from '../../../shared/utils/getImageUrl';

export default function AdminTemplates() {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const data = await getTemplates();
      setTemplates(data);
    } catch (error) {
      showToast('Failed to fetch templates', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    try {
      await deleteTemplate(id);
      showToast('Template deleted', 'success');
      fetchTemplates();
    } catch (error) {
      showToast('Failed to delete template', 'error');
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mockup Templates</h1>
          <p className="text-gray-500 mt-2">Manage reusable mockup templates for the generator.</p>
        </div>
        <Link
          to="/admin/templates/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          Create New Template
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div key={template.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="aspect-square bg-gray-100 relative">
              {template.baseImageUrl ? (
                <img 
                  src={getImageUrl(template.baseImageUrl)} 
                  alt={template.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <ImageIcon size={48} />
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  template.status === 'published' ? 'bg-green-100 text-green-800' :
                  template.status === 'archived' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {template.status}
                </span>
              </div>
            </div>
            <div className="p-4 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{template.name}</h3>
                <p className="text-sm text-gray-500">{template.productType}</p>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                <Link
                  to={`/admin/templates/edit/${template.id}`}
                  className="flex-1 flex justify-center items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 :bg-gray-600 rounded-lg transition-colors"
                >
                  <Edit size={16} /> Edit
                </Link>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="p-2 text-red-600 hover:bg-red-50 :bg-red-900/20 rounded-lg transition-colors"
                  aria-label="Delete template"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {templates.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No templates yet</h3>
          <p className="text-gray-500 mt-1">Create your first template to get started.</p>
        </div>
      )}
    </div>
  );
}
