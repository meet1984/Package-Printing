import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import SEO from '../../../shared/components/SEO';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─── Animated counter hook ───────────────────────────────
const useCountUp = (end, duration = 2000) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  const start = useCallback(() => {
    if (started) return;
    setStarted(true);
    const startTime = performance.now();
    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutQuart for a satisfying deceleration
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, started]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) start(); },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [start]);

  return { count, ref };
};

// ─── Single stat counter component ───────────────────────
const StatCounterItem = ({ label, value, suffix }) => {
  const { count, ref } = useCountUp(value);
  return (
    <div ref={ref} className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="text-4xl md:text-5xl font-display font-semibold text-brand tracking-tight mb-2">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-gray-500 font-medium text-sm">{label}</div>
    </div>
  );
};

// ─── Fade-in on scroll wrapper ───────────────────────────
const FadeIn = ({ children, className = '', delay = 0 }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-[800ms] ease-[var(--ease-out)] ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const AboutPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeProcessIdx, setActiveProcessIdx] = useState(0);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const res = await axios.get(`${API_URL}/about`);
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch about data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAbout();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-brand" />
      </div>
    );
  }

  if (!data) return <div className="p-8 text-center text-gray-500">Failed to load about page</div>;

  // Parse JSON content safely
  const parseSafe = (val) => {
    if (!val) return {};
    if (typeof val === 'object') return val;
    try { return JSON.parse(val); } catch { return { text: val }; }
  };

  const hero = parseSafe(data.heroContent);
  const mission = parseSafe(data.missionContent);
  const cta = parseSafe(data.ctaContent);

  return (
    <div className="bg-white">
      <SEO
        title="About Zeprr | Our Story"
        description="Learn about Zeprr — our mission, process, team, and why brands trust us for custom printing and packaging."
      />

      {/* ── Section 1: Hero Banner ─────────────────────── */}
      <section className="relative w-full h-[60vh] md:h-[70vh] bg-gray-900 overflow-hidden flex items-center justify-center">
        {hero.image && (
          <img src={hero.image} alt="Zeprr workspace" className="absolute inset-0 w-full h-full object-cover opacity-50" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/40 to-transparent pointer-events-none" />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <FadeIn>
            <h1 className="text-display text-white mb-5 leading-[1.1] tracking-tight">
              {hero.headline || hero.text || 'We make packaging personal'}
            </h1>
            {hero.subtitle && (
              <p className="text-gray-300 text-lg md:text-xl font-medium max-w-2xl mx-auto">
                {hero.subtitle}
              </p>
            )}
          </FadeIn>
        </div>
      </section>

      {/* ── Section 2: Mission Statement ───────────────── */}
      <section className="section-padding bg-gray-50 overflow-hidden relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
            
            <FadeIn className="w-full lg:w-1/2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-subtle text-brand text-xs font-semibold uppercase tracking-widest mb-6">
                Our Mission
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-semibold text-gray-900 mb-6 leading-tight tracking-tight">
                {mission.headline || 'Custom packaging, simplified.'}
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                {mission.body || 'We started Zeprr because getting custom packaging printed shouldn\'t require bulk orders, long waits, or guesswork. Our platform gives growing brands access to premium print quality with low minimums, transparent pricing, and a simple online ordering experience.'}
              </p>
              <Link to={mission.cta_link || '/products'} className="inline-flex items-center justify-center gap-2 font-semibold text-sm px-6 py-3 rounded-lg bg-brand text-white hover:bg-brand-hover transition-colors shadow-sm">
                {mission.cta_text || 'Explore our products'} <ArrowRight className="w-4 h-4" />
              </Link>
            </FadeIn>

            <FadeIn delay={100} className="w-full lg:w-1/2 relative">
               <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                 <img src={hero.image || 'https://via.placeholder.com/800x600'} alt="Our mission" className="w-full h-full object-cover" />
               </div>
               <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hidden md:block max-w-xs">
                 <div className="flex items-center gap-3 mb-2">
                   <div className="w-10 h-10 bg-success-bg text-success rounded-full flex items-center justify-center">
                     <CheckCircle2 className="w-5 h-5" />
                   </div>
                   <h4 className="font-semibold text-gray-900">Quality Guaranteed</h4>
                 </div>
                 <p className="text-sm text-gray-500">Every order goes through a strict 5-point quality check before shipping.</p>
               </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Section 3: Value Prop Cards ────────────────── */}
      {data.valueProps?.length > 0 && (
        <section className="section-padding bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-tight text-gray-900 mb-4">
                  Why create with us?
                </h2>
                <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                  We've streamlined the entire process so you can focus on building your brand.
                </p>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {data.valueProps.map((vp, i) => (
                <FadeIn key={vp.id} delay={i * 100}>
                  <div className="h-full bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-[var(--duration-normal)] flex flex-col group">
                    <div className="aspect-[4/3] bg-gray-200 overflow-hidden relative">
                      {vp.image ? (
                        <img src={vp.image} alt={vp.title} className="w-full h-full object-cover transition-transform duration-[800ms] group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                           No Image
                        </div>
                      )}
                    </div>
                    <div className="p-8 flex-1 flex flex-col">
                      <h3 className="text-xl font-display font-semibold text-gray-900 mb-3">{vp.title}</h3>
                      <p className="text-gray-500 leading-relaxed flex-1">{vp.description}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Section 4: Our Process ─────────────────────── */}
      {data.processPillars?.length > 0 && (
        <section className="section-padding bg-gray-900 text-gray-300">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-tight text-white mb-4">
                  How we work
                </h2>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                  Transparency is core to our process. Here's what goes into every order.
                </p>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left: Interactive list */}
              <div className="flex flex-col gap-4">
                {data.processPillars.map((pillar, i) => (
                  <FadeIn key={pillar.id} delay={i * 100}>
                    <button
                      onClick={() => setActiveProcessIdx(i)}
                      className={`
                        w-full text-left p-6 rounded-xl border transition-all duration-[var(--duration-fast)]
                        ${activeProcessIdx === i
                          ? 'bg-white/10 border-white/20'
                          : 'bg-transparent border-transparent hover:bg-white/5'}
                      `}
                    >
                      <h3 className={`text-xl font-display font-semibold mb-2 ${activeProcessIdx === i ? 'text-white' : 'text-gray-400'}`}>
                        {String(i + 1).padStart(2, '0')}. {pillar.title}
                      </h3>
                      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 overflow-hidden transition-all duration-[var(--duration-normal)] ${activeProcessIdx === i ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                         <div>
                           <div className="text-xs font-semibold text-brand uppercase tracking-wider mb-1">What it means</div>
                           <p className="text-sm leading-relaxed">{pillar.what_it_means}</p>
                         </div>
                         <div>
                           <div className="text-xs font-semibold text-brand uppercase tracking-wider mb-1">Why it matters</div>
                           <p className="text-sm leading-relaxed">{pillar.why_it_matters}</p>
                         </div>
                      </div>
                    </button>
                  </FadeIn>
                ))}
              </div>

              {/* Right: Image display */}
              <FadeIn className="hidden lg:block">
                <div className="aspect-square rounded-2xl overflow-hidden bg-gray-800 relative shadow-2xl">
                  {data.processPillars.map((pillar, i) => (
                    pillar.icon_image ? (
                      <img 
                        key={pillar.id}
                        src={pillar.icon_image} 
                        alt={pillar.title} 
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-[var(--ease-out)] ${activeProcessIdx === i ? 'opacity-100' : 'opacity-0'}`} 
                      />
                    ) : (
                      <div 
                        key={pillar.id}
                        className={`absolute inset-0 w-full h-full bg-gray-800 flex items-center justify-center transition-opacity duration-700 ease-[var(--ease-out)] ${activeProcessIdx === i ? 'opacity-100' : 'opacity-0'}`}
                      >
                        <span className="text-gray-600 font-display text-4xl">{pillar.title}</span>
                      </div>
                    )
                  ))}
                </div>
              </FadeIn>
            </div>
          </div>
        </section>
      )}

      {/* ── Section 5: By the Numbers ──────────────────── */}
      {data.statCounters?.length > 0 && (
        <section className="section-padding bg-gray-50 border-b border-gray-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {data.statCounters.map((stat, i) => (
                <FadeIn key={stat.id} delay={i * 100}>
                  <StatCounterItem label={stat.label} value={stat.value} suffix={stat.suffix || '+'} />
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Section 6: Partners / Portfolio ─────────────── */}
      <section className="section-padding bg-white text-center">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-10">
              Trusted by innovative brands globally
            </h2>
          </FadeIn>

          <FadeIn delay={100}>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 mb-12 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
              {data.partnerBrands && data.partnerBrands.length > 0 ? (
                data.partnerBrands.map((brand, i) => {
                  const content = (
                    <div className="transition-transform hover:scale-105">
                      {brand.logo_image ? (
                        <img src={brand.logo_image} alt={brand.name} className="h-10 w-auto object-contain" />
                      ) : (
                        <div className="text-xl font-bold font-display text-gray-900">{brand.name}</div>
                      )}
                    </div>
                  );
                  
                  return brand.website_url ? (
                    <a key={brand.id} href={brand.website_url.startsWith('http') ? brand.website_url : `https://${brand.website_url}`} target="_blank" rel="noopener noreferrer">
                      {content}
                    </a>
                  ) : (
                    <div key={brand.id}>{content}</div>
                  );
                })
              ) : (
                ['Brand A', 'Brand B', 'Brand C', 'Brand D'].map((name, i) => (
                  <div key={i} className="text-xl font-bold font-display text-gray-900">{name}</div>
                ))
              )}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Section 7: Our Team ────────────────────────── */}
      {data.teamMembers?.length > 0 && (
        <section className="section-padding bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-tight text-gray-900">
                  Meet the team
                </h2>
              </div>
            </FadeIn>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {data.teamMembers.map((member, i) => (
                <FadeIn key={member.id} delay={i * 60}>
                  <div className="text-center group">
                    <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-white shadow-sm border border-gray-100 group-hover:shadow-md transition-all duration-[var(--duration-normal)]">
                      {member.photo ? (
                        <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-brand-subtle flex items-center justify-center text-3xl font-semibold text-brand">
                          {member.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-gray-500 text-sm">{member.role}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Section 8: Closing CTA Banner ──────────────── */}
      <section className="py-20 md:py-28 bg-brand">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-5xl font-display font-semibold text-white tracking-tight mb-6 leading-tight">
              {cta.headline || "Ready to start your project?"}
            </h2>
            {cta.body && (
              <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">{cta.body}</p>
            )}
            <Link
              to={cta.cta_link || '/contact'}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-brand font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-lg"
            >
              {cta.cta_text || 'Contact Us'} <ArrowRight className="w-5 h-5" />
            </Link>
          </FadeIn>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
