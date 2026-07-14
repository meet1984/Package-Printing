import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { MessageSquare, Package, HelpCircle, Handshake, Briefcase, UploadCloud, CheckCircle, ChevronDown, MapPin, Mail, Phone, Loader2 } from 'lucide-react';
import SEO from '../../../shared/components/SEO';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Helper for floating label inputs
const InputField = ({ label, name, type = 'text', required = false, value, onChange }) => {
  const [focused, setFocused] = useState(false);
  const isFilled = value && value.length > 0;
  const active = focused || isFilled;
  const isValid = name === 'email' && isFilled ? validateEmail(value) : false;

  return (
    <div className="relative mb-6">
      <label 
        htmlFor={name}
        className={`absolute left-4 transition-all duration-300 pointer-events-none ${
          active ? '-top-2.5 bg-white px-1 text-xs text-primary font-bold z-10' : 'top-3.5 text-neutral/50 text-sm'
        }`}
      >
        {label} {required && '*'}
      </label>
      {type === 'textarea' ? (
        <textarea
          id={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required={required}
          className="w-full px-4 pt-3 pb-3 min-h-[120px] rounded-xl border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all duration-300 bg-transparent relative z-0"
        />
      ) : (
        <div className="relative">
          <input
            type={type}
            id={name}
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            required={required}
            className="w-full px-4 py-3 rounded-xl border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all duration-300 bg-transparent relative z-0"
          />
          {name === 'email' && isValid && (
            <CheckCircle className="absolute right-4 top-3.5 w-5 h-5 text-green-500 animate-in fade-in zoom-in duration-300" />
          )}
        </div>
      )}
    </div>
  );
};

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
    { id: 'partnership', icon: Handshake, label: 'Partnership / Press' },
    { id: 'careers', icon: Briefcase, label: 'Careers' }
  ];

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
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
    <div className="min-h-screen bg-base font-body text-text selection:bg-primary/20">
      <SEO title="Contact Us" description="Get in touch with the P&P team." />
      
      {/* 1. Hero Band */}
      <section className="bg-surface pt-16 pb-12 px-4 border-b border-border text-center">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-black font-display tracking-tighter text-neutral mb-4">Let's create something together.</h1>
          <p className="text-xl text-neutral/60 font-medium">Whether you need 50 boxes or 50,000, we're here to make it happen.</p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
            
            {/* Main Form Column */}
            <div className="w-full lg:w-3/5">
              
              {/* 2. Progressive Disclosure - Reason Selector */}
              <div className="mb-12">
                <h2 className="text-2xl font-black font-display mb-6">How can we help?</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {departments.map((dept) => {
                    const Icon = dept.icon;
                    const isSelected = department === dept.id;
                    return (
                      <button
                        key={dept.id}
                        type="button"
                        onClick={() => { setDepartment(dept.id); setFormError(''); }}
                        aria-pressed={isSelected}
                        className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300 transform hover:-translate-y-1 ${
                          isSelected 
                            ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10' 
                            : 'border-border bg-surface text-neutral/70 hover:border-primary/50'
                        }`}
                      >
                        <Icon className={`w-8 h-8 mb-3 ${isSelected ? 'animate-bounce' : ''}`} />
                        <span className="text-sm font-bold text-center leading-tight">{dept.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {formError && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="mb-6 flex items-center gap-3 rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
                >
                  {formError}
                </div>
              )}

              {/* Form Section (Animates in when department is selected) */}
              <div className={`transition-all duration-500 overflow-hidden ${department ? 'opacity-100 max-h-[2000px]' : 'opacity-0 max-h-0'}`}>
                {formState === 'success' ? (
                  <div 
                    className="bg-green-50 border-2 border-green-200 rounded-3xl p-12 text-center animate-in fade-in slide-in-from-bottom-8 duration-500"
                    aria-live="polite"
                  >
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mb-6 mx-auto">
                      <CheckCircle className="w-10 h-10" />
                    </div>
                    <h3 className="text-3xl font-black text-green-900 mb-4">Request Received!</h3>
                    <p className="text-lg text-green-800">
                      We'll reply within one business day — check your inbox at <strong>{formData.email}</strong>.
                    </p>
                    <div className="mt-8 flex justify-center">
                      <a 
                        href={`https://wa.me/${contactSettings.whatsapp.replace(/\D/g,'')}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center gap-3 bg-[#25D366] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#20b858] transition-all duration-300 shadow-lg shadow-[#25D366]/20 hover:-translate-y-0.5"
                      >
                        <Phone className="w-6 h-6 fill-current" />
                        Chat with us on WhatsApp
                      </a>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-neutral text-white flex items-center justify-center text-sm">2</span>
                      Your Details
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                      <InputField label="Full Name" name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                      <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                      <InputField label="Phone Number" name="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                      <InputField label="Company Name" name="company" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} />
                    </div>

                    <InputField label="How can we help?" name="message" type="textarea" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} required />

                    {/* File Attachment for Bulk/Careers */}
                    {(department === 'bulk' || department === 'careers') && (
                      <div className="mb-8">
                        <label className="block text-sm font-bold text-neutral mb-2">
                          {department === 'careers' ? 'Resume / Portfolio' : 'Artwork / Reference Docs'}
                        </label>
                        <div 
                          className="border-2 border-dashed border-border rounded-2xl p-8 text-center bg-surface hover:bg-kraft/5 transition-colors cursor-pointer group"
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <input 
                            type="file" 
                            className="hidden" 
                            ref={fileInputRef}
                            onChange={(e) => e.target.files && setFile(e.target.files[0])}
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                          />
                          
                          {file ? (
                            <div className="inline-flex items-center gap-3 bg-primary/10 text-primary px-4 py-2 rounded-full font-medium">
                              <CheckCircle className="w-4 h-4" />
                              {file.name}
                              <button 
                                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                className="ml-2 hover:text-red-500"
                              >
                                &times;
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center text-neutral/60 group-hover:text-primary transition-colors">
                              <UploadCloud className="w-10 h-10 mb-3" />
                              <p className="font-bold">Click or drag file here</p>
                              <p className="text-xs mt-1">PDF, DOC, JPG, PNG up to 10MB</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <button 
                      type="submit" 
                      disabled={formState === 'loading'}
                      className={`w-full py-4 rounded-xl font-black text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                        formState === 'loading' 
                          ? 'bg-neutral text-white cursor-wait' 
                          : 'bg-primary text-white hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5'
                      }`}
                    >
                      {formState === 'loading' ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" /> Processing...
                        </>
                      ) : (
                        'Send Message'
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* 4. Sticky Side Panel */}
            <div className="w-full lg:w-2/5">
              <div className="sticky top-28 space-y-6">
                
                {/* Real Person Touch */}
                <div className="bg-surface border border-border rounded-3xl p-8 shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-kraft/20 flex items-center justify-center text-2xl border-2 border-primary/20">
                      👩🏽‍💼
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Talk to {contactSettings.supportName}</h4>
                      <p className="text-sm text-neutral/60">{contactSettings.supportRole}</p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 text-blue-800 text-sm font-bold px-4 py-3 rounded-xl mb-6 flex items-start gap-3">
                    <span className="text-xl leading-none">⏱️</span>
                    <span>{contactSettings.responseTime}</span>
                  </div>

                  <div className="space-y-3">
                    <a href={`mailto:${contactSettings.email}`} className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-colors font-medium">
                      <Mail className="w-5 h-5 text-neutral/50" />
                      {contactSettings.email}
                    </a>
                    <a href={`https://wa.me/${contactSettings.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 rounded-xl border border-[#25D366]/30 hover:border-[#25D366] hover:bg-[#25D366]/5 transition-colors font-medium">
                      <Phone className="w-5 h-5 text-[#25D366]" />
                      Chat on WhatsApp
                    </a>
                  </div>
                </div>

                {/* Location Card */}
                <div className="bg-surface border border-border rounded-3xl p-8 shadow-sm">
                  <h4 className="font-bold text-lg flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5 text-primary" /> HQ & Showroom
                  </h4>
                  <p className="text-neutral/70 text-sm leading-relaxed mb-4 whitespace-pre-line">
                    {contactSettings.address}
                  </p>
                  <p className="text-sm font-bold text-neutral">
                    Hours: {contactSettings.hours}
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. FAQ Accordion */}
      {faqs.length > 0 && (
        <section className="py-20 bg-surface border-t border-border">
          <div className="container mx-auto max-w-3xl px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black font-display text-neutral mb-4">Frequently Asked Questions</h2>
              <p className="text-neutral/60">Quick answers to save you a message.</p>
            </div>
            <div className="space-y-4">
              {faqs.map(faq => (
                <div key={faq.id} className="border border-border rounded-2xl overflow-hidden bg-white">
                  <button 
                    onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                    className="w-full flex items-center justify-between p-6 text-left font-bold hover:bg-kraft/5 transition-colors"
                  >
                    {faq.question}
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${expandedFaq === faq.id ? 'rotate-180 text-primary' : 'text-neutral/40'}`} />
                  </button>
                  <div 
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedFaq === faq.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <div className="p-6 pt-0 text-neutral/70 leading-relaxed border-t border-border/50">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. Trust Strip */}
      <section className="bg-neutral text-white py-12 text-center border-t-4 border-primary">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center max-w-2xl mx-auto">
            <div className="flex text-yellow-400 mb-4">
              {'★★★★★'.split('').map((star, i) => <span key={i} className="text-2xl">{star}</span>)}
            </div>
            <p className="text-xl md:text-2xl font-medium font-heading italic mb-4">
              "P&P understood exactly what we needed. Their team was responsive, and the final packaging elevated our entire product line."
            </p>
            <p className="text-primary font-bold tracking-wider uppercase text-sm">
              — Sarah Jenkins, Creative Director
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default ContactPage;
