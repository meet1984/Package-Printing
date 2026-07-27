import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

const HeroSection = ({ banners }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!banners || banners.length === 0) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-gray-50 text-gray-400">
        Configure hero banners in Admin
      </div>
    );
  }

  const leftBanners = banners.filter(b => b.panel_position === 'left');
  const rightBanners = banners.filter(b => b.panel_position === 'right');

  const maxSlides = Math.max(leftBanners.length, rightBanners.length);

  const nextSlide = () => setActiveIndex((prev) => (prev + 1) % maxSlides);
  const prevSlide = () => setActiveIndex((prev) => (prev - 1 + maxSlides) % maxSlides);

  useEffect(() => {
    if (maxSlides <= 1) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [maxSlides]);

  const leftBanner = leftBanners[activeIndex] || leftBanners[leftBanners.length - 1];
  const rightBanner = rightBanners[activeIndex] || rightBanners[rightBanners.length - 1];

  const renderPanel = (banner, isSecondary = false) => {
    if (!banner) return <div className={`w-full md:w-1/2 h-[320px] md:h-[500px] lg:h-[580px] bg-gray-900 ${isSecondary ? 'hidden md:block' : ''}`}></div>;

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
      <div className={`w-full md:w-1/2 h-[320px] md:h-[500px] lg:h-[580px] relative overflow-hidden group ${isSecondary ? 'hidden md:block' : ''}`}>
        <img
          key={banner.image}
          src={banner.image.startsWith('http') ? banner.image : `${banner.image}`}
          alt={banner.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] ease-[var(--ease-out)] group-hover:scale-[1.03]"
          loading={isSecondary ? 'lazy' : 'eager'}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/5 pointer-events-none" />

        {/* Content */}
        <div className="absolute left-0 right-0 bottom-0 p-6 md:p-8 lg:p-10 z-10 flex flex-col justify-end">
          <h2
            key={`title-${banner.id}`}
            className="font-display font-semibold text-[28px] md:text-[34px] lg:text-[42px] text-white mb-4 leading-[1.1] whitespace-pre-line tracking-tight"
          >
            {banner.title}
          </h2>

          <div key={`links-${banner.id}`} className="flex flex-col sm:flex-row sm:items-center gap-3 mt-1">
            <div className="flex flex-wrap gap-2">
              {links && links.map((link, idx) => (
                <Link
                  key={idx}
                  to={link.link}
                  className="
                    text-white/90 border border-white/30 text-xs
                    px-3.5 py-2 rounded-md font-medium
                    hover:bg-white/10 hover:border-white/50
                    transition-all duration-[var(--duration-fast)]
                    backdrop-blur-sm
                  "
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {banner.cta_label && banner.cta_link && (
              <Link
                to={banner.cta_link}
                className="
                  inline-flex items-center gap-2
                  font-semibold text-sm px-5 py-2.5 rounded-md
                  bg-brand text-white
                  hover:bg-brand-hover
                  transition-colors duration-[var(--duration-fast)]
                  shadow-md shrink-0
                "
              >
                {banner.cta_label}
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="relative w-full bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="relative rounded-xl overflow-hidden shadow-lg group/carousel">
          <div className="flex flex-col md:flex-row w-full bg-gray-900">
            {renderPanel(leftBanner)}
            {renderPanel(rightBanner, true)}
          </div>

          {/* Navigation Arrows */}
          {maxSlides > 1 && (
            <>
              <button
                onClick={prevSlide}
                aria-label="Previous slide"
                className="
                  absolute top-1/2 -translate-y-1/2 left-3 md:left-5
                  w-10 h-10 rounded-full
                  bg-white/20 backdrop-blur-md border border-white/20
                  flex items-center justify-center
                  text-white hover:bg-white/30
                  transition-all duration-[var(--duration-fast)]
                  opacity-0 group-hover/carousel:opacity-100 z-20
                  shadow-lg
                "
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextSlide}
                aria-label="Next slide"
                className="
                  absolute top-1/2 -translate-y-1/2 right-3 md:right-5
                  w-10 h-10 rounded-full
                  bg-white/20 backdrop-blur-md border border-white/20
                  flex items-center justify-center
                  text-white hover:bg-white/30
                  transition-all duration-[var(--duration-fast)]
                  opacity-0 group-hover/carousel:opacity-100 z-20
                  shadow-lg
                "
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Dots */}
        {maxSlides > 1 && (
          <div className="flex gap-1.5 justify-center pt-4" role="tablist" aria-label="Slide navigation">
            {Array.from({ length: maxSlides }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                role="tab"
                aria-selected={idx === activeIndex}
                aria-label={`Go to slide ${idx + 1}`}
                className={`
                  h-1.5 rounded-full transition-all duration-[var(--duration-normal)]
                  ${idx === activeIndex ? 'bg-brand w-6' : 'bg-gray-300 w-1.5 hover:bg-gray-400'}
                `}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
