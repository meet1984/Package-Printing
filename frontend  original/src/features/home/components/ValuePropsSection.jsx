import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus } from 'lucide-react';

const ValuePropsSection = ({ data }) => {
  if (!data) return null;

  const title = data.title;
  let items = [];
  try {
    items = JSON.parse(data.content);
  } catch (e) {
    console.error("Failed to parse value props content", e);
  }

  const [openIndex, setOpenIndex] = useState(0);

  const toggleItem = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <section className="py-24 bg-[var(--color-bg-alt)] border-t border-border/40">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          
          {/* Left Column */}
          <div className="w-full lg:w-5/12 flex flex-col justify-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black font-heading tracking-tighter text-heading mb-6 leading-tight">
              {title}
            </h2>
            <p className="text-lg text-text-muted mb-10 max-w-md">
              We've redesigned the packaging experience to be faster, simpler, and more sustainable. Everything your growing brand needs to stand out.
            </p>
            <div>
              <Link to="/products" className="inline-flex px-8 py-4 bg-primary text-white font-bold rounded-pill hover:bg-primary/90 transition-colors shadow-sm">
                Get Started
              </Link>
            </div>
          </div>

          {/* Right Column - Accordion */}
          <div className="w-full lg:w-7/12 flex flex-col justify-center">
            <div className="border-t border-border">
              {items.map((item, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <div key={idx} className="border-b border-border">
                    <button 
                      onClick={() => toggleItem(idx)}
                      className="w-full flex items-center justify-between py-6 text-left focus:outline-none group"
                    >
                      <h3 className={`text-xl md:text-2xl font-bold font-heading transition-colors ${isOpen ? 'text-primary' : 'text-heading group-hover:text-primary'}`}>
                        {item.title}
                      </h3>
                      <span className={`ml-4 flex-shrink-0 h-8 w-8 rounded-full border flex items-center justify-center transition-colors ${isOpen ? 'border-primary text-primary bg-primary/5' : 'border-border text-text-muted group-hover:border-primary group-hover:text-primary'}`}>
                        {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </span>
                    </button>
                    
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 opacity-100 pb-6' : 'max-h-0 opacity-0'}`}
                    >
                      <p className="text-text-muted md:text-lg pr-12">
                        {item.content}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ValuePropsSection;
