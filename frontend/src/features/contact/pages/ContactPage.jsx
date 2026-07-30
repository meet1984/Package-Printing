import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { MessageSquare, Package, HelpCircle, Handshake, UploadCloud, CheckCircle, ChevronDown, MapPin, Mail, Phone, Loader2, X } from 'lucide-react';
import SEO from '../../../shared/components/SEO';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

import Input from '../../../shared/components/Input';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';

const ContactPage = () => {
  const location = useLocation();
  const [department, setDepartment] = useState(location.state?.department || 'general');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', company: '', message: location.state?.message || '' });
  const [file, setFile] = useState(null);
  
  const [formState, setFormState] = useState('idle'); // idle, loading, success
  const [formError, setFormError] = useState('');
  const [faqs, setFaqs] = useState([]);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [contactSettings, setContactSettings] = useState({
    address: '123 Print Avenue, Industrial Estate\nNew Delhi, DL 110020\nIndia',
    hours: 'Mon-Fri, 9am - 6pm',
    email: 'support@pandp.com',
    whatsapp: '919876543210',
    supportName: 'Priya',
    supportRole: 'Support Team Lead',
    responseTime: 'We typically reply within 1 business hour.'
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    // Fetch FAQs
    axios.get(`${API_URL}/site-faqs`)
      .then(res => {
        setFaqs(res.data);
        if (res.data.length > 0) setExpandedFaq(res.data[0].id);
      })
      .catch(console.error);

    // Fetch Contact Settings
    axios.get(`${API_URL}/content/contact_settings`)
      .then(res => {
        if (res.data?.content) {
          setContactSettings(prev => ({ ...prev, ...res.data.content }));
        }
      })
      .catch(console.error);
  }, []);

  const departments = [
    { id: 'general', icon: MessageSquare, label: 'General Inquiry' },
    { id: 'bulk', icon: Package, label: 'Bulk & Wholesale' },
    { id: 'support', icon: HelpCircle, label: 'Order Support' },
    { id: 'partnership', icon: Handshake, label: 'Partnership / Press' }
  ];

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    if (selectedFile.size > 10 * 1024 * 1024) {
      alert(`File "${selectedFile.name}" exceeds the maximum upload limit of 10MB.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setFile(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!department) {
      setFormError('Please select a reason for contacting us.');
      return;
    }

    setFormState('loading');

    const data = new FormData();
    data.append('department', department);
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (file) {
      data.append('attachment', file);
    }

    try {
      await axios.post(`${API_URL}/inquiries`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormState('success');
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error submitting inquiry. Please try again.');
      setFormState('idle');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 selection:bg-brand/10">
      <SEO title="Contact Us" description="Get in touch with the Zeprr team." />
      
      {/* Hero */}
      <section className="bg-white pt-10 pb-6 px-4 text-center border-b border-gray-100">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-display text-gray-900 mb-2">Contact & Support</h1>
          <p className="text-lg text-gray-500">How can we help?</p>
        </div>
      </section>

      <section className="section-padding px-4">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
            
            {/* Main Form Column */}
            <div className="w-full lg:w-3/5">
              
              {/* Department Selector */}
              <div className="mb-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {departments.map((dept) => {
                    const Icon = dept.icon;
                    const isSelected = department === dept.id;
                    return (
                      <button
                        key={dept.id}
                        type="button"
                        onClick={() => { setDepartment(dept.id); setFormError(''); }}
                        aria-pressed={isSelected}
                        className={`
                          flex flex-col items-center justify-center p-5 rounded-xl border-2
                          transition-all duration-[var(--duration-fast)]
                          ${isSelected 
                            ? 'border-brand bg-brand-subtle text-brand' 
                            : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700'}
                        `}
                      >
                        <Icon className="w-6 h-6 mb-2.5" />
                        <span className="text-xs font-semibold text-center leading-tight">{dept.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {formError && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-danger-bg px-4 py-3 text-sm font-medium text-red-700"
                >
                  {formError}
                </div>
              )}

              {/* Form */}
              <div className={`transition-all duration-500 overflow-hidden ${department ? 'opacity-100 max-h-[2000px]' : 'opacity-0 max-h-0'}`}>
                {formState === 'success' ? (
                  <div 
                    className="bg-success-bg border border-green-200 rounded-xl p-10 text-center"
                    aria-live="polite"
                  >
                    <div className="w-14 h-14 bg-green-100 text-success rounded-full flex items-center justify-center mx-auto mb-5">
                      <CheckCircle className="w-7 h-7" />
                    </div>
                    <h3 className="text-2xl font-display font-semibold text-green-900 mb-3">Request Received!</h3>
                    <p className="text-green-800">
                      We'll reply within one business day — check your inbox at <strong>{formData.email}</strong>.
                    </p>
                    <div className="mt-6">
                      <a 
                        href={`https://wa.me/${contactSettings.whatsapp.replace(/\D/g,'')}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#20b858] transition-colors text-sm shadow-sm"
                      >
                        <Phone className="w-4 h-4" />
                        Chat on WhatsApp
                      </a>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-xs">
                      <h3 className="text-sm font-semibold text-gray-900 mb-5">Your Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4 mb-4">
                        <Input label="Full Name" name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                        <Input label="Email Address" name="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                        <Input label="Subject" name="company" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} />
                      </div>

                      <div className="mb-5">
                        <Input label="Message" name="message" type="textarea" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} required />
                      </div>

                      {/* File Attachment for Bulk */}
                      {(department === 'bulk') && (
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Artwork / Reference Docs
                          </label>
                          <div 
                            className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-gray-300 transition-colors cursor-pointer group bg-gray-50"
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                          >
                              <input 
                                type="file" 
                                className="hidden" 
                                ref={fileInputRef}
                                onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                              />

                            
                            {file ? (
                              <div className="inline-flex items-center gap-2 bg-brand-subtle text-brand px-4 py-2 rounded-lg text-sm font-medium">
                                <CheckCircle className="w-4 h-4" />
                                {file.name}
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                  className="ml-1 hover:text-danger"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center text-gray-400 group-hover:text-gray-500 transition-colors">
                                <UploadCloud className="w-8 h-8 mb-2" />
                                <p className="text-sm font-medium">Click or drag file here</p>
                                <p className="text-xs mt-1">PDF, DOC, JPG, PNG up to 10MB</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <Button 
                        type="submit" 
                        variant="primary"
                        size="lg"
                        disabled={formState === 'loading'}
                        className="w-full"
                      >
                        {formState === 'loading' ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                          </>
                        ) : (
                          'Send Message'
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Sticky Side Panel */}
            <div className="w-full lg:w-2/5">
              <div className="sticky top-24 space-y-5">
                
                {/* Expert Card */}
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-full bg-brand flex items-center justify-center text-lg font-bold text-white">
                      {contactSettings.supportName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Talk to an Expert</h4>
                      <p className="text-xs text-gray-500">{contactSettings.supportRole}</p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 text-blue-700 text-sm font-medium px-4 py-3 rounded-lg mb-5 flex items-start gap-2">
                    <span className="text-base leading-none">⏱️</span>
                    <span>{contactSettings.responseTime}</span>
                  </div>

                  <div className="space-y-2.5">
                    <a href={`mailto:${contactSettings.email}`} className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {contactSettings.email}
                    </a>
                    <a href={`https://wa.me/${contactSettings.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-lg bg-[#25D366]/10 border border-[#25D366]/20 hover:bg-[#25D366]/15 transition-colors text-sm font-medium text-[#128C7E]">
                      <Phone className="w-4 h-4" />
                      Chat on WhatsApp
                    </a>
                  </div>
                </Card>

                {/* Location Card */}
                <Card className="p-6">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3 text-sm">
                    <MapPin className="w-4 h-4 text-brand" /> HQ & Showroom
                  </h4>
                  <p className="text-gray-500 text-sm leading-relaxed mb-3 whitespace-pre-line">
                    {contactSettings.address}
                  </p>
                  <p className="text-sm font-medium text-gray-700">
                    {contactSettings.hours}
                  </p>
                </Card>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      {faqs.length > 0 && (
        <section className="section-padding bg-white border-t border-gray-100">
          <div className="mx-auto max-w-3xl px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-display font-semibold text-gray-900 tracking-tight mb-2">Frequently Asked Questions</h2>
              <p className="text-gray-500 text-sm">Quick answers to save you a message.</p>
            </div>
            <div className="space-y-3">
              {faqs.map(faq => (
                <div key={faq.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                  <button 
                    onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                    className="w-full flex items-center justify-between p-5 text-left text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    {faq.question}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-[var(--duration-normal)] ${expandedFaq === faq.id ? 'rotate-180 text-brand' : 'text-gray-400'}`} />
                  </button>
                  <div 
                    className={`transition-all duration-[var(--duration-normal)] ease-[var(--ease-out)] overflow-hidden ${expandedFaq === faq.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trust Strip */}
      <section className="bg-gray-900 text-white py-12 text-center">
        <div className="mx-auto max-w-2xl px-4">
          <div className="flex text-amber-400 justify-center mb-4 gap-1">
            {'★★★★★'.split('').map((star, i) => <span key={i} className="text-lg">{star}</span>)}
          </div>
          <p className="text-lg md:text-xl font-medium mb-3 leading-relaxed">
            "Zeprr's design help was instrumental for our new line. The team is incredibly skilled and responsive."
          </p>
          <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">
            — Mark T
          </p>
        </div>
      </section>

    </div>
  );
};

export default ContactPage;
