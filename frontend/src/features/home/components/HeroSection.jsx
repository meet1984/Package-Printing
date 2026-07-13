import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HeroSection = ({ banners }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!banners || banners.length === 0) {
    return (
      <div className="w-full h-[400px] md:h-[550px] flex items-center justify-center bg-gray-100 text-text-muted">
        Configure hero banners in Admin
      </div>
    );
  }

  const leftBanners = banners.filter(b => b.panel_position === 'left');
  const rightBanners = banners.filter(b => b.panel_position === 'right');
  
  const maxSlides = Math.max(leftBanners.length, rightBanners.length);
  
  const nextSlide = () => setActiveIndex((prev) => (prev + 1) % maxSlides);
  const prevSlide = () => setActiveIndex((prev) => (prev - 1 + maxSlides) % maxSlides);

  React.useEffect(() => {
    if (maxSlides <= 1) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [maxSlides]);

  const leftBanner = leftBanners[activeIndex] || leftBanners[leftBanners.length - 1];
  const rightBanner = rightBanners[activeIndex] || rightBanners[rightBanners.length - 1];

  const renderPanel = (banner, fallbackColor) => {
    if (!banner) return <div className={`w-full md:w-1/2 h-[500px] md:h-[700px] ${fallbackColor}`}></div>;

    let links = [];
    if (banner.subtitle_links) {
      try {
        links = typeof banner.subtitle_links === 'string' 
          ? JSON.parse(banner.subtitle_links) 
          : banner.subtitle_links;
      } catch (e) {
        console.error("Error parsing subtitle links");
      }
    }

    return (
      <div className="w-full md:w-1/2 h-[400px] md:h-[550px] relative overflow-hidden group">
        <img 
          key={banner.image}
          src={banner.image.startsWith('http') ? banner.image : `${banner.image}`} 
          alt={banner.title} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 animate-in fade-in zoom-in-95"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
          <h2 key={`title-${banner.id}`} className="text-4xl md:text-5xl font-black font-heading tracking-tighter mb-4 text-white animate-in slide-in-from-bottom-4 fade-in duration-500">
            {banner.title}
          </h2>
          
          <div key={`links-${banner.id}`} className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 animate-in slide-in-from-bottom-2 fade-in duration-700">
            <div className="flex flex-wrap gap-3">
              {links && links.map((link, idx) => (
                <Link 
                  key={idx} 
                  to={link.link} 
                  className="text-xs md:text-sm font-semibold tracking-wide text-white bg-white/10 hover:bg-white/25 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/20 transition-all duration-300 hover:scale-105 shadow-sm"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            
            {banner.cta_label && banner.cta_link && (
              <Link 
                to={banner.cta_link} 
                className="inline-flex items-center justify-center text-sm font-bold bg-primary text-white hover:bg-primary/90 px-6 py-3 rounded-full transition-all duration-300 hover:scale-105 shadow-lg shrink-0"
              >
                {banner.cta_label} <span className="ml-2">→</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="relative w-full group/carousel">
      <div className="flex flex-col md:flex-row w-full">
        {renderPanel(leftBanner, 'bg-gray-200')}
        {renderPanel(rightBanner, 'bg-gray-300')}
      </div>

      {maxSlides > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute top-1/2 -translate-y-1/2 left-4 md:left-8 h-12 w-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/40 transition-all opacity-0 group-hover/carousel:opacity-100 z-10 text-white shadow-lg"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          
          <button 
            onClick={nextSlide}
            className="absolute top-1/2 -translate-y-1/2 right-4 md:right-8 h-12 w-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/40 transition-all opacity-0 group-hover/carousel:opacity-100 z-10 text-white shadow-lg"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        </>
      )}
    </section>
  );
};

export default HeroSection;
