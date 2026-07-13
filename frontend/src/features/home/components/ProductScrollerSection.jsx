import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import ProductCard from './ProductCard';

const ProductScrollerSection = ({ title, products, isQuoteCard = false }) => {
  const scrollRef = useRef(null);
  const sectionRef = useRef(null);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false
  );

  // Drag to scroll state
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const velocity = useRef(0);
  const lastTime = useRef(0);
  const lastX = useRef(0);
  const animationRef = useRef(null);

  // Check scroll state for right arrow
  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      // Fade arrow if we are within 10px of the end
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
      setCanScrollLeft(scrollLeft > 10);
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      checkScroll();
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll, products]);

  // Auto-scroll logic
  const autoScrollInterval = useRef(null);
  const isHovered = useRef(false);

  const handleMouseEnter = () => {
    isHovered.current = true;
  };

  const handleMouseLeave = () => {
    isHovered.current = false;
  };

  const startAutoScroll = useCallback(() => {
    if (prefersReducedMotion.current) return;
    if (autoScrollInterval.current) {
      cancelAnimationFrame(autoScrollInterval.current);
    }
    
    const animate = () => {
      if (!isHovered.current && !isDragging.current && scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        
        // Since we duplicated the array 3 times, one "block" is a third of the scroll width
        const singleBlockWidth = scrollWidth / 3;
        
        if (scrollLeft >= singleBlockWidth) {
          scrollRef.current.scrollLeft -= singleBlockWidth;
        } else {
          scrollRef.current.scrollLeft += 1;
        }
      }
      autoScrollInterval.current = requestAnimationFrame(animate);
    };
    
    autoScrollInterval.current = requestAnimationFrame(animate);
  }, []);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollInterval.current) {
      cancelAnimationFrame(autoScrollInterval.current);
      autoScrollInterval.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoScroll();
    return stopAutoScroll;
  }, [startAutoScroll, stopAutoScroll]);

  // Intersection Observer for staggered entrance
  useEffect(() => {
    const currentSection = sectionRef.current;
    if (!currentSection || prefersReducedMotion.current) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(currentSection);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(currentSection);
    return () => observer.disconnect();
  }, []);

  // Momentum scroll loop
  const startMomentumScroll = () => {
    if (prefersReducedMotion.current || Math.abs(velocity.current) < 0.1) return;
    
    scrollRef.current.scrollLeft -= velocity.current;
    velocity.current *= 0.95; // Friction/decay factor

    if (Math.abs(velocity.current) > 0.5) {
      animationRef.current = requestAnimationFrame(startMomentumScroll);
    } else {
      velocity.current = 0;
    }
  };

  const handlePointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
    lastX.current = e.pageX;
    lastTime.current = Date.now();
    velocity.current = 0;
    
    scrollRef.current.style.cursor = 'grabbing';
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
    
    const now = Date.now();
    const dt = now - lastTime.current;
    if (dt > 0) {
      const dx = e.pageX - lastX.current;
      velocity.current = dx / dt * 15;
    }
    
    lastX.current = e.pageX;
    lastTime.current = now;
  };

  const handlePointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    
    scrollRef.current.style.cursor = '';
    
    if (Math.abs(velocity.current) > 2) {
      animationRef.current = requestAnimationFrame(startMomentumScroll);
    }
  };

  const scrollRightClick = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: Math.min(scrollRef.current.clientWidth * 0.8, 320), behavior: 'smooth' });
    }
  };

  const scrollLeftClick = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -Math.min(scrollRef.current.clientWidth * 0.8, 320), behavior: 'smooth' });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <section ref={sectionRef} className="py-16 overflow-hidden select-none">
      <div className="container mx-auto px-4 mb-8 flex items-end justify-between">
        <h2 className="text-3xl md:text-4xl font-black font-heading tracking-tighter text-heading">
          {title}
        </h2>
      </div>

      <div 
        className="relative w-full group/scroller"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button 
          onClick={scrollLeftClick}
          disabled={!canScrollLeft}
          className={`absolute left-4 md:left-8 top-[45%] -translate-y-1/2 z-10 hidden md:flex h-14 w-14 bg-white rounded-full border border-border items-center justify-center shadow-lg transition-all duration-300 ${
            canScrollLeft 
              ? 'hover:border-primary hover:text-primary opacity-0 group-hover/scroller:opacity-100 hover:scale-105' 
              : 'opacity-0 pointer-events-none'
          }`}
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-7 w-7" />
        </button>

        <button 
          onClick={scrollRightClick}
          disabled={!canScrollRight}
          className={`absolute right-4 md:right-8 top-[45%] -translate-y-1/2 z-10 hidden md:flex h-14 w-14 bg-white rounded-full border border-border items-center justify-center shadow-lg transition-all duration-300 ${
            canScrollRight 
              ? 'hover:border-primary hover:text-primary opacity-0 group-hover/scroller:opacity-100 hover:scale-105' 
              : 'opacity-0 pointer-events-none'
          }`}
          aria-label="Scroll right"
        >
          <ChevronRight className="h-7 w-7" />
        </button>
        <div 
          ref={scrollRef}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          className="flex gap-6 overflow-x-auto px-4 md:px-8 pb-8 no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', touchAction: 'pan-x' }}
        >
          {[...products, ...products, ...products].map((product, i) => (
            <div 
              key={`${product.id}-${i}`} 
              className={`w-[280px] md:w-[300px] flex-shrink-0 transition-all duration-700 ${
                isVisible || prefersReducedMotion.current 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              }`}
              style={(!prefersReducedMotion.current) ? { transitionDelay: `${(i % products.length) * 60}ms` } : {}}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductScrollerSection;
