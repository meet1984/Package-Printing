import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';

// How many times the product list is duplicated to create the seamless
// looping strip. The loop logic below only ever needs ~1 block of buffer on
// either side of center before it silently jumps back a block, so this just
// needs to be comfortably larger than that (not the dozens of copies it was
// before) to absorb fast drags/momentum scrolling between scroll-event ticks.
const REPEAT = 6;
const REPEAT_MID = REPEAT / 2;

const ProductScrollerSection = ({ title, products, isQuoteCard = false }) => {
  const scrollRef = useRef(null);
  const sectionRef = useRef(null);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false
  );

  // Drag to scroll logic
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const isHovered = useRef(false);
  const autoScrollInterval = useRef(null);
  // Tracks whether the section is currently on-screen so the rAF auto-scroll
  // loop below can pause itself instead of running (and forcing scroll-position
  // writes) indefinitely while the section is scrolled out of view.
  const isInViewport = useRef(false);

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
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

  // Intersection Observer for entrance
  useEffect(() => {
    const currentSection = sectionRef.current;
    if (!currentSection) return;

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

  // Continuously track on-screen state (separate from the one-shot entrance
  // observer above) so the auto-scroll rAF loop can pause while off-screen.
  useEffect(() => {
    const currentSection = sectionRef.current;
    if (!currentSection) return;

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isInViewport.current = entry.isIntersecting;
      },
      { threshold: 0 }
    );

    visibilityObserver.observe(currentSection);
    return () => visibilityObserver.disconnect();
  }, []);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth } = scrollRef.current;
    const singleBlockWidth = scrollWidth / REPEAT;

    if (scrollLeft >= singleBlockWidth * (REPEAT_MID + 1)) {
      scrollRef.current.scrollLeft -= singleBlockWidth;
    } else if (scrollLeft <= singleBlockWidth * (REPEAT_MID - 1)) {
      scrollRef.current.scrollLeft += singleBlockWidth;
    }
  }, []);

  // Auto-scroll logic
  const startAutoScroll = useCallback(() => {
    if (prefersReducedMotion.current) return;
    if (autoScrollInterval.current) {
      cancelAnimationFrame(autoScrollInterval.current);
    }

    const animate = () => {
      if (!isHovered.current && !isDragging.current && isInViewport.current && scrollRef.current) {
        scrollRef.current.scrollLeft += 1;
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


  const handlePointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
    scrollRef.current.style.cursor = 'grabbing';
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handlePointerUp = () => {
    isDragging.current = false;
    if (scrollRef.current) {
      scrollRef.current.style.cursor = '';
    }
  };

  const scrollRightClick = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const scrollLeftClick = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const initScroll = () => {
      if (scrollRef.current) {
        const singleBlockWidth = scrollRef.current.scrollWidth / REPEAT;
        scrollRef.current.scrollLeft = singleBlockWidth * REPEAT_MID;
      }
    };
    setTimeout(initScroll, 100);
  }, [products]);

  if (!products || products.length === 0) return null;

  const duplicatedProducts = Array.from({ length: REPEAT }).flatMap(() => products);

  return (
    <section ref={sectionRef} className="w-full select-none">
      <div
        className={`
          w-full overflow-hidden bg-white border-y border-gray-100
          transition-all duration-[var(--duration-slow)] ease-[var(--ease-out)]
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
        `}
        onMouseEnter={() => isHovered.current = true}
        onMouseLeave={() => isHovered.current = false}
      >
        {/* Section Head */}
        <div className="flex items-end justify-between px-6 sm:px-8 pt-10 pb-2">
          <div>
            <h2 className="font-display font-semibold text-2xl md:text-3xl text-gray-900 tracking-tight">
              {title}
            </h2>
            <p className="text-label mt-1">
              {String(products.length).padStart(2, '0')} {isQuoteCard ? 'products · request a quote' : 'products · made to order'}
            </p>
          </div>
          <div className="hidden sm:flex gap-2 pb-1">
            <button
              onClick={scrollLeftClick}
              className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-all duration-[var(--duration-fast)] shadow-xs"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={scrollRightClick}
              className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-all duration-[var(--duration-fast)] shadow-xs"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scroll Row */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="flex gap-4 overflow-x-auto px-6 sm:px-8 pt-5 pb-10 no-scrollbar"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            touchAction: 'pan-x',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 2%, black 98%, transparent)',
            maskImage: 'linear-gradient(to right, transparent, black 2%, black 98%, transparent)'
          }}
        >
          {duplicatedProducts.map((product, i) => (
            <div key={`${product.id}-${i}`} className="flex-shrink-0 w-[200px] sm:w-[220px] md:w-[240px]">
              <ProductCard product={product} index={i % products.length} isQuoteCard={isQuoteCard} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductScrollerSection;
