import { useState, useEffect } from 'react';
import { getPublicTemplates } from './api';
import { useToast } from '../../shared/store/useToast';
import { getImageUrl } from '../../shared/utils/getImageUrl';
import MockupEditor from './components/MockupEditor';
import { Loader2 } from 'lucide-react';

export default function MockupGeneratorPage() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const data = await getPublicTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      showToast('Failed to load templates', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin h-8 w-8 text-brand" />
      </div>
    );
  }

  if (!selectedTemplate) {
    return (
      <div className="min-h-screen bg-gray-50 pt-12 pb-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-display font-semibold text-gray-900 tracking-tight mb-4">
              Mockup Generator
            </h1>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Select a product template to preview your design in real-time.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {templates.map(template => {
              const firstFace = template.faces && template.faces.length > 0 ? template.faces[0] : template;
              return (
                <button 
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className="group bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-[var(--duration-normal)] border border-gray-100 flex flex-col text-left"
                >
                  <div className="aspect-square w-full bg-gray-100 p-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-200/50 to-transparent pointer-events-none" />
                    <img 
                      src={getImageUrl(firstFace.baseImageUrl)} 
                      alt={template.name}
                      className="w-full h-full object-contain drop-shadow-md transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out)] group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-display font-semibold text-lg text-gray-900 mb-1 group-hover:text-brand transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-500">{template.productType}</p>
                  </div>
                </button>
              );
            })}
          </div>
          
          {templates.length === 0 && (
            <div className="text-center py-24 bg-white rounded-2xl border border-gray-200 mt-8">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-display font-semibold text-gray-900 mb-2">No templates available</h3>
              <p className="text-gray-500">Please check back later for new product templates.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <MockupEditor template={selectedTemplate} onClose={() => setSelectedTemplate(null)} />;
}
