import { useState, useRef } from 'react';
import { Download, Upload, Loader2, ArrowLeft, Send, X, Mail, Phone, User, Building2 } from 'lucide-react';
import { useToast } from '../../../shared/store/useToast';
import { renderMockupCanvas } from '../../../shared/utils/renderMockup';
import { getImageUrl } from '../../../shared/utils/getImageUrl';
import { useAuth } from '../../../shared/store/useAuth';
import InteractiveMockupPreview from './InteractiveMockupPreview';

export default function MockupEditor({ template, onClose }) {
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();
  
  // Ensure template has faces array (fallback if not migrated)
  const faces = template?.faces && template.faces.length > 0 ? template.faces : [{
    id: 'default',
    name: 'Face 1',
    baseImageUrl: template?.baseImageUrl,
    shadingMapUrl: template?.shadingMapUrl,
    printArea: template?.printArea,
    constraints: template?.constraints
  }];

  const [faceData, setFaceData] = useState(() => {
    const init = {};
    faces.forEach(face => {
      init[face.id] = {
        designFile: null,
        designDataUrl: null,
        transform: { x: 0, y: 0, scale: 1, rotation: 0 },
        previewUrl: null
      };
    });
    return init;
  });
  
  const [activeFaceIndex, setActiveFaceIndex] = useState(0);
  const [isRendering, setIsRendering] = useState(false);
  const [isSideBySide, setIsSideBySide] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
  const [quoteForm, setQuoteForm] = useState({ name: '', email: '', phone: '', company: '', message: '' });
  
  const fileInputRef = useRef(null);

  const activeFace = faces[activeFaceIndex];
  const activeData = faceData[activeFace.id];
  const activeTransform = activeData?.transform;
  const activeDesignUrl = activeData?.designDataUrl;

  const updateFaceData = (faceId, updates) => {
    setFaceData(prev => ({
      ...prev,
      [faceId]: { ...prev[faceId], ...updates }
    }));
  };

  const handleDesignUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !activeFace) return;
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      updateFaceData(activeFace.id, {
        designFile: file,
        designDataUrl: ev.target.result,
        transform: { x: 0, y: 0, scale: 1, rotation: 0 } 
      });
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExport = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to export high-res mockups.', 'warning');
      return;
    }

    const hasAnyDesign = faces.some(f => faceData[f.id].designDataUrl);
    if (!hasAnyDesign) {
      showToast('Please upload a design to at least one face before exporting.', 'warning');
      return;
    }

    setIsRendering(true);
    try {
      const canvases = [];
      for (const face of faces) {
        const data = faceData[face.id];
        if (data.designDataUrl) {
          const faceConfig = {
            baseImageUrl: getImageUrl(face.baseImageUrl),
            printArea: face.printArea,
            shadingMapUrl: face.shadingMapUrl ? getImageUrl(face.shadingMapUrl) : null
          };
          const canvas = await renderMockupCanvas(faceConfig, data.designDataUrl, data.transform);
          canvases.push(canvas);
        } else {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = getImageUrl(face.baseImageUrl);
          await new Promise(r => { img.onload = r; });
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          canvases.push(canvas);
        }
      }

      const totalWidth = canvases.reduce((sum, c) => sum + c.width, 0);
      const maxHeight = Math.max(...canvases.map(c => c.height));

      const galleryCanvas = document.createElement('canvas');
      galleryCanvas.width = totalWidth;
      galleryCanvas.height = maxHeight;
      const ctx = galleryCanvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, galleryCanvas.width, galleryCanvas.height);

      let currentX = 0;
      for (const c of canvases) {
        const yOffset = (maxHeight - c.height) / 2;
        ctx.drawImage(c, currentX, yOffset);
        currentX += c.width;
      }

      const downloadUrl = galleryCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `mockup-${template.name.replace(/\s+/g, '-').toLowerCase()}-gallery.png`;
      link.click();
      
      showToast('Gallery exported successfully!', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to export mockup gallery', 'error');
    } finally {
      setIsRendering(false);
    }
  };

  const submitQuote = async (e) => {
    e.preventDefault();
    if (!quoteForm.name || !quoteForm.email) {
      showToast('Name and Email are required.', 'warning');
      return;
    }

    setIsSubmittingQuote(true);
    try {
      // 1. Generate stitched gallery image
      const canvases = [];
      for (const face of faces) {
        const data = faceData[face.id];
        if (data.designDataUrl) {
          const canvas = await renderMockupCanvas(face, data.designDataUrl, data.transform);
          canvases.push(canvas);
        } else {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = getImageUrl(face.baseImageUrl);
          await new Promise(r => { img.onload = r; });
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          canvases.push(canvas);
        }
      }

      const totalWidth = canvases.reduce((sum, c) => sum + c.width, 0);
      const maxHeight = Math.max(...canvases.map(c => c.height));
      const galleryCanvas = document.createElement('canvas');
      galleryCanvas.width = totalWidth;
      galleryCanvas.height = maxHeight;
      const ctx = galleryCanvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, galleryCanvas.width, galleryCanvas.height);

      let currentX = 0;
      for (const c of canvases) {
        const yOffset = (maxHeight - c.height) / 2;
        ctx.drawImage(c, currentX, yOffset);
        currentX += c.width;
      }

      // Convert to blob
      const blob = await new Promise(resolve => galleryCanvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error("Failed to generate image");

      // 2. Submit to API
      const formData = new FormData();
      formData.append('name', quoteForm.name);
      formData.append('email', quoteForm.email);
      formData.append('phone', quoteForm.phone);
      formData.append('company', quoteForm.company);
      formData.append('message', quoteForm.message);
      formData.append('department', 'bulk'); // Using bulk/custom department
      formData.append('attachment', blob, `design-${template.name.replace(/\s+/g, '-').toLowerCase()}.png`);
      
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/inquiries`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!res.ok) throw new Error('Failed to submit quote');

      alert('mail is send');
      showToast('Quote requested successfully! We will email you shortly.', 'success');
      setIsQuoteModalOpen(false);
      setQuoteForm({ name: '', email: '', phone: '', company: '', message: '' });
    } catch (err) {
      console.error(err);
      showToast('Failed to submit quote request. Please try again.', 'error');
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  if (!activeFace) return null;

  const { constraints } = activeFace;
  const c = constraints || { minScale: 0.5, maxScale: 1.5, minRotation: -20, maxRotation: 20 };
  const tf = activeData.transform;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <button 
        onClick={onClose}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 font-medium transition-colors"
      >
        <ArrowLeft size={20} /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Controls */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-2xl font-bold mb-2">{template.name}</h2>
          <p className="text-gray-500 mb-6">Customize your design placement</p>

          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {faces.map((face, idx) => (
              <button
                key={face.id}
                onClick={() => setActiveFaceIndex(idx)}
                className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition-colors ${idx === activeFaceIndex ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {face.name}
              </button>
            ))}
          </div>

          {!activeData.designDataUrl ? (
            <div className="mb-8 flex-1">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-full min-h-[200px] border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 transition-colors group text-center"
              >
                <div className="bg-blue-50 text-blue-600 p-4 rounded-full group-hover:scale-110 transition-transform">
                  <Upload size={24} />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Upload design for {activeFace.name}</p>
                  <p className="text-sm text-gray-500 mt-1">PNG or JPG, up to 10MB</p>
                </div>
              </button>
              <input type="file" ref={fileInputRef} onChange={handleDesignUpload} className="hidden" accept="image/*" />
            </div>
          ) : (
            <div className="space-y-6 flex-1">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">Design loaded for {activeFace.name}</span>
                <div className="flex gap-3">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Change design
                  </button>
                  <button 
                    onClick={() => updateFaceData(activeFace.id, { designFile: null, designDataUrl: null, previewUrl: null, transform: { x: 0, y: 0, scale: 1, rotation: 0 } })}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove design
                  </button>
                </div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleDesignUpload} className="hidden" accept="image/*" />

              <div>
                <label className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                  <span>Scale</span>
                  <span className="text-gray-500">{tf.scale.toFixed(2)}x</span>
                </label>
                <input 
                  type="range" 
                  min={c.minScale} max={c.maxScale} step="0.01" 
                  value={tf.scale}
                  onChange={(e) => updateFaceData(activeFace.id, { transform: { ...tf, scale: parseFloat(e.target.value) } })}
                  className="w-full accent-blue-600"
                />
              </div>
              
              <div>
                <label className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                  <span>Rotation</span>
                  <span className="text-gray-500">{tf.rotation}°</span>
                </label>
                <input 
                  type="range" 
                  min={c.minRotation} max={c.maxRotation} step="1" 
                  value={tf.rotation}
                  onChange={(e) => updateFaceData(activeFace.id, { transform: { ...tf, rotation: parseFloat(e.target.value) } })}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <label className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                  <span>Position X</span>
                  <span className="text-gray-500">{(tf.x * 100).toFixed(0)}%</span>
                </label>
                <input 
                  type="range" 
                  min="-0.5" max="0.5" step="0.01" 
                  value={tf.x}
                  onChange={(e) => updateFaceData(activeFace.id, { transform: { ...tf, x: parseFloat(e.target.value) } })}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <label className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                  <span>Position Y</span>
                  <span className="text-gray-500">{(tf.y * 100).toFixed(0)}%</span>
                </label>
                <input 
                  type="range" 
                  min="-0.5" max="0.5" step="0.01" 
                  value={tf.y}
                  onChange={(e) => updateFaceData(activeFace.id, { transform: { ...tf, y: parseFloat(e.target.value) } })}
                  className="w-full accent-blue-600"
                />
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-gray-100 mt-auto flex flex-col gap-3">
            <button 
              onClick={handleExport}
              disabled={isRendering || isSubmittingQuote}
              className="w-full bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-4 rounded-2xl shadow-sm transition-all flex justify-center items-center gap-2 disabled:opacity-70"
            >
              {isRendering ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
              {isRendering ? 'Rendering Gallery...' : 'Export Gallery'}
            </button>

            <button 
              onClick={() => {
                if (!faces.some(f => faceData[f.id].designDataUrl)) {
                  alert('Please upload a design to at least one face first.');
                  showToast('Please upload a design to at least one face first.', 'warning');
                  return;
                }
                setIsQuoteModalOpen(true);
              }}
              disabled={isRendering || isSubmittingQuote}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-md transition-all flex justify-center items-center gap-2 disabled:opacity-70"
            >
              <Send size={20} /> Request Quote with Design
            </button>
          </div>
        </div>

        {/* Right Column: Preview */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {faces.length > 1 && (
            <div className="flex justify-end shrink-0">
              <button
                onClick={() => setIsSideBySide(!isSideBySide)}
                className="text-sm font-semibold bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm hover:bg-gray-50 transition-colors"
              >
                {isSideBySide ? 'Single Face View' : 'Side-by-Side View'}
              </button>
            </div>
          )}

          {isSideBySide ? (
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full overflow-y-auto content-start bg-gray-100 p-6 rounded-3xl border border-gray-200 min-h-[500px]">
              {faces.map((face, idx) => {
                const data = faceData[face.id];
                return (
                  <div key={face.id} className="relative flex flex-col items-center bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                    <h3 className="font-bold text-gray-700 mb-4">{face.name}</h3>
                    <div className="w-full relative flex-1 flex items-center justify-center min-h-[250px]">
                      <InteractiveMockupPreview
                        face={face}
                        designDataUrl={data.designDataUrl}
                        transform={data.transform}
                        onTransformChange={(tf) => updateFaceData(face.id, { transform: tf })}
                        isSideBySide={true}
                      />
                    </div>
                    <button 
                      onClick={() => { setActiveFaceIndex(idx); setIsSideBySide(false); }}
                      className="mt-6 text-sm text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Edit {face.name}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <>
              <div className="bg-gray-100 rounded-3xl overflow-hidden flex items-center justify-center min-h-[500px] border border-gray-200">
                <InteractiveMockupPreview
                  face={activeFace}
                  designDataUrl={activeData.designDataUrl}
                  transform={activeTransform}
                  onTransformChange={(tf) => updateFaceData(activeFace.id, { transform: tf })}
                  isSideBySide={false}
                />
              </div>
              
              {/* Thumbnails of all faces */}
              {faces.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-4 justify-center mt-4">
                  {faces.map((face, idx) => {
                    const data = faceData[face.id];
                    const isSelected = idx === activeFaceIndex;
                    return (
                      <div 
                        key={face.id}
                        onClick={() => setActiveFaceIndex(idx)}
                        className={`w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer border-2 transition-colors bg-white ${isSelected ? 'border-blue-600' : 'border-gray-200 hover:border-blue-300'}`}
                      >
                        <img 
                          src={data?.previewUrl || getImageUrl(face.baseImageUrl)} 
                          alt={face.name}
                          className="w-full h-full object-contain p-2"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Quote Form Modal */}
      {isQuoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold font-display text-gray-900">Request a Quote</h2>
              <button onClick={() => setIsQuoteModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={submitQuote} className="p-6 space-y-4">
              <p className="text-gray-500 text-sm mb-6">
                Fill out the details below. We'll attach your custom mockup design automatically so our team can provide an accurate quote.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" required placeholder="Full Name" value={quoteForm.name} onChange={e => setQuoteForm({...quoteForm, name: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none" />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="email" required placeholder="Email Address" value={quoteForm.email} onChange={e => setQuoteForm({...quoteForm, email: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="tel" placeholder="Phone Number" value={quoteForm.phone} onChange={e => setQuoteForm({...quoteForm, phone: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none" />
                </div>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" placeholder="Company" value={quoteForm.company} onChange={e => setQuoteForm({...quoteForm, company: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none" />
                </div>
              </div>

              <textarea 
                placeholder="Any specific instructions, quantities, or deadlines?"
                rows={4}
                value={quoteForm.message}
                onChange={e => setQuoteForm({...quoteForm, message: e.target.value})}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none resize-none"
              />

              <button 
                type="submit" 
                disabled={isSubmittingQuote}
                className="w-full mt-4 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSubmittingQuote ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                {isSubmittingQuote ? 'Sending Quote Request...' : 'Send Quote Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
