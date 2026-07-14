import { useState, useEffect } from 'react';
import { getPublicTemplates } from './api';
import { useToast } from '../../shared/store/useToast';
import { getImageUrl } from '../../shared/utils/getImageUrl';
import MockupEditor from './components/MockupEditor';

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

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading templates...</div>;

  if (!selectedTemplate) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-black font-display text-center mb-4">Mockup Generator</h1>
        <p className="text-center text-gray-500 mb-12">Select a product template to get started</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {templates.map(template => {
            const firstFace = template.faces && template.faces.length > 0 ? template.faces[0] : template;
            return (
              <div 
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
              >
                <div className="aspect-square bg-gray-50 p-4">
                  <img 
                    src={getImageUrl(firstFace.baseImageUrl)} 
                    alt={template.name}
                    className="w-full h-full object-contain drop-shadow-md"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-1">{template.name}</h3>
                  <p className="text-sm text-gray-500">{template.productType}</p>
                </div>
              </div>
            );
          })}
        </div>
        
        {templates.length === 0 && (
          <div className="text-center py-24 text-gray-500">
            No templates available at the moment. Please check back later.
          </div>
        )}
      </div>
    );
  }

  return <MockupEditor template={selectedTemplate} onClose={() => setSelectedTemplate(null)} />;
}
