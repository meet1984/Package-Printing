import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Save, Image as ImageIcon, Upload, Eye, Plus, Trash2 } from 'lucide-react';
import PrintAreaEditor from './components/PrintAreaEditor';
import { getTemplate, createTemplate, updateTemplate } from './api';
import { useToast } from '../../../shared/store/useToast';
import { useAuth } from '../../../shared/store/useAuth';
import { renderMockupCanvas } from '../../../shared/utils/renderMockup';
import { getImageUrl } from '../../../shared/utils/getImageUrl';

const DEFAULT_CONSTRAINTS = { minScale: 0.5, maxScale: 1.5, minRotation: -20, maxRotation: 20 };
const DEFAULT_PRINT_AREA = { x: 0.25, y: 0.25, width: 0.5, height: 0.5, rotation: 0 };

const generateId = () => Math.random().toString(36).substring(2, 9);

export default function AdminTemplateEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [isLoading, setIsLoading] = useState(!!id);
  const [isSaving, setIsSaving] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState('');
  
  const fileInputRef = useRef(null);
  const shadingInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    productType: '',
    status: 'draft',
    faces: [
      {
        id: generateId(),
        name: 'Face 1',
        baseImageUrl: '',
        shadingMapUrl: '',
        printArea: { ...DEFAULT_PRINT_AREA },
        constraints: { ...DEFAULT_CONSTRAINTS }
      }
    ]
  });

  const [activeFaceIndex, setActiveFaceIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchTemplate();
    }
  }, [id]);

  const fetchTemplate = async () => {
    try {
      const data = await getTemplate(id);
      
      let faces = data.faces || [];
      if (faces.length === 0 && data.baseImageUrl) {
        faces = [{
          id: generateId(),
          name: 'Face 1',
          baseImageUrl: data.baseImageUrl,
          shadingMapUrl: data.shadingMapUrl || '',
          printArea: data.printArea || { ...DEFAULT_PRINT_AREA },
          constraints: data.constraints || { ...DEFAULT_CONSTRAINTS }
        }];
      } else if (faces.length === 0) {
        faces = [{
          id: generateId(),
          name: 'Face 1',
          baseImageUrl: '',
          shadingMapUrl: '',
          printArea: { ...DEFAULT_PRINT_AREA },
          constraints: { ...DEFAULT_CONSTRAINTS }
        }];
      }

      setFormData({
        name: data.name,
        productType: data.productType,
        status: data.status,
        faces
      });
    } catch (error) {
      showToast('Failed to load template', 'error');
      navigate('/admin/templates');
    } finally {
      setIsLoading(false);
    }
  };

  const activeFace = formData.faces[activeFaceIndex] || formData.faces[0];

  const updateActiveFace = (updates) => {
    setFormData(prev => {
      const newFaces = [...prev.faces];
      newFaces[activeFaceIndex] = { ...newFaces[activeFaceIndex], ...updates };
      return { ...prev, faces: newFaces };
    });
  };

  const handleAddFace = () => {
    setFormData(prev => ({
      ...prev,
      faces: [
        ...prev.faces,
        {
          id: generateId(),
          name: `Face ${prev.faces.length + 1}`,
          baseImageUrl: '',
          shadingMapUrl: '',
          printArea: { ...DEFAULT_PRINT_AREA },
          constraints: { ...DEFAULT_CONSTRAINTS }
        }
      ]
    }));
    setActiveFaceIndex(formData.faces.length);
    setPreviewDataUrl('');
  };

  const handleDeleteFace = (index) => {
    if (formData.faces.length <= 1) {
      showToast('Template must have at least one face', 'error');
      return;
    }
    if (window.confirm('Delete this face?')) {
      setFormData(prev => {
        const newFaces = [...prev.faces];
        newFaces.splice(index, 1);
        return { ...prev, faces: newFaces };
      });
      if (activeFaceIndex >= index && activeFaceIndex > 0) {
        setActiveFaceIndex(activeFaceIndex - 1);
      }
      setPreviewDataUrl('');
    }
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const data = new FormData();
    data.append('image', file);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const uploadRes = await axios.post(`${API_URL}/upload/image`, data, {
        withCredentials: true
      });
      const imageUrl = uploadRes.data.url;
      
      if (type === 'base') {
        updateActiveFace({ baseImageUrl: imageUrl });
      } else {
        updateActiveFace({ shadingMapUrl: imageUrl });
      }
    } catch (err) {
      showToast('Error uploading image', 'error');
    } finally {
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFaceNameChange = (e) => {
    updateActiveFace({ name: e.target.value });
  };

  const handleConstraintChange = (e) => {
    const { name, value } = e.target;
    updateActiveFace({
      constraints: { ...activeFace.constraints, [name]: parseFloat(value) }
    });
  };

  const handlePrintAreaChange = (newArea) => {
    updateActiveFace({ printArea: newArea });
  };

  const generatePreview = async () => {
    if (!activeFace.baseImageUrl) {
      showToast('Please upload a base image first', 'warning');
      return;
    }
    
    const designCanvas = document.createElement('canvas');
    designCanvas.width = 400;
    designCanvas.height = 400;
    const ctx = designCanvas.getContext('2d');
    ctx.fillStyle = '#ff0055';
    ctx.fillRect(0, 0, 400, 400);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 40px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('DESIGN', 200, 200);
    
    const designDataUrl = designCanvas.toDataURL();
    
    try {
      const faceConfig = {
        baseImageUrl: getImageUrl(activeFace.baseImageUrl),
        printArea: activeFace.printArea,
        shadingMapUrl: activeFace.shadingMapUrl ? getImageUrl(activeFace.shadingMapUrl) : null
      };
      
      const resultCanvas = await renderMockupCanvas(
        faceConfig,
        designDataUrl,
        { x: 0, y: 0, scale: 1, rotation: 0 }
      );
      setPreviewDataUrl(resultCanvas.toDataURL());
    } catch (e) {
      showToast('Failed to generate preview', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.faces.some(f => !f.baseImageUrl)) {
      showToast('All faces must have a base image', 'error');
      return;
    }

    setIsSaving(true);
    try {
      if (id) {
        await updateTemplate(id, formData);
        showToast('Template updated successfully', 'success');
      } else {
        await createTemplate(formData);
        showToast('Template created successfully', 'success');
        navigate('/admin/templates');
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to save template', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {id ? 'Edit Template' : 'Create Template'}
        </h1>
        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          <Save size={20} />
          {isSaving ? 'Saving...' : 'Save Template'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Editor */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Basic Info</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
                <input
                  type="text"
                  name="productType"
                  value={formData.productType}
                  onChange={handleChange}
                  placeholder="e.g. Mylar Bag, Box, Label"
                  required
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="draft">Draft (Hidden)</option>
                  <option value="published">Published (Visible to users)</option>
                  <option value="archived">Archived (Hidden, keeps past data)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Faces tabs */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Faces / Sides</h3>
              <button 
                onClick={handleAddFace}
                className="flex items-center gap-1 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md transition-colors font-medium text-gray-700"
              >
                <Plus size={16} /> Add Face
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {formData.faces.map((face, index) => (
                <button
                  key={face.id}
                  onClick={() => { setActiveFaceIndex(index); setPreviewDataUrl(''); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${index === activeFaceIndex ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {face.name}
                </button>
              ))}
            </div>

            {/* Face specific settings */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex justify-between items-end">
                <div className="flex-1 mr-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Face Name</label>
                  <input
                    type="text"
                    value={activeFace.name}
                    onChange={handleFaceNameChange}
                    placeholder="e.g. Front, Back, Sleeve"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <button 
                  onClick={() => handleDeleteFace(activeFaceIndex)}
                  className="flex items-center gap-1 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors border border-transparent hover:border-red-100"
                >
                  <Trash2 size={18} /> Delete Face
                </button>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2 mt-4">Constraints</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">Min Scale</label>
                    <input type="number" step="0.1" name="minScale" value={activeFace.constraints.minScale} onChange={handleConstraintChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">Max Scale</label>
                    <input type="number" step="0.1" name="maxScale" value={activeFace.constraints.maxScale} onChange={handleConstraintChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">Min Rotation (°)</label>
                    <input type="number" name="minRotation" value={activeFace.constraints.minRotation} onChange={handleConstraintChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">Max Rotation (°)</label>
                    <input type="number" name="maxRotation" value={activeFace.constraints.maxRotation} onChange={handleConstraintChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Editor for Active Face */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Print Area Setup ({activeFace.name})</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md transition-colors"
                >
                  <Upload size={16} /> Base Image
                </button>
              </div>
            </div>
            
            <input type="file" ref={fileInputRef} onChange={(e) => handleImageUpload(e, 'base')} className="hidden" accept="image/*" />
            <input type="file" ref={shadingInputRef} onChange={(e) => handleImageUpload(e, 'shading')} className="hidden" accept="image/*" />
            
            <p className="text-sm text-gray-500 mb-4">Drag the blue box to define where designs will be placed. Drag corners to resize, use top handle to rotate.</p>
            
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <PrintAreaEditor 
                imageUrl={activeFace.baseImageUrl ? getImageUrl(activeFace.baseImageUrl) : null}
                printArea={activeFace.printArea}
                onChange={handlePrintAreaChange}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Live Preview ({activeFace.name})</h3>
              <button 
                onClick={generatePreview}
                className="text-sm flex items-center gap-1 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors"
              >
                <Eye size={16} /> Generate Preview
              </button>
            </div>
            
            {previewDataUrl ? (
              <img src={previewDataUrl} alt="Preview" className="w-full rounded-lg border border-gray-200" />
            ) : (
              <div className="aspect-square bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400">
                <p>Click "Generate Preview" to see how designs will map.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
