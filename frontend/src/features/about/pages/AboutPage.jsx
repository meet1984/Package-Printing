import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
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
    <div ref={ref} className="text-center">
      <div className="text-5xl md:text-6xl font-black font-heading text-primary tracking-tighter mb-2">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-text-muted font-medium text-sm uppercase tracking-wider">{label}</div>
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
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
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
      <div className="min-h-screen flex items-center justify-center bg-base">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) return <div className="p-8 text-center">Failed to load about page</div>;

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
    <>
      <SEO
        title="About P&P | Our Story"
        description="Learn about P&P — our mission, process, team, and why brands trust us for custom printing and packaging."
      />

      {/* ── Section 1: Hero Banner ─────────────────────── */}
      <section className="relative w-full h-[50vh] md:h-[70vh] bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
        {hero.image && (
          <img src={hero.image} alt="P&P workspace" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <FadeIn>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black font-heading text-white tracking-tighter max-w-4xl leading-[1.1] mb-4">
              {hero.headline || hero.text || 'We make packaging personal'}
            </h1>
            {hero.subtitle && (
              <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto">{hero.subtitle}</p>
            )}
          </FadeIn>
        </div>
      </section>

      {/* ── Section 2: Mission Statement ───────────────── */}
      <section className="py-24 bg-base overflow-hidden">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-12">
              <span className="text-primary text-sm font-bold uppercase tracking-widest">What is P&P?</span>
            </div>
          </FadeIn>

          <div className="relative max-w-4xl mx-auto">
            {/* Decorative rotated cards behind */}
            <div className="hidden md:block absolute -left-16 top-8 w-48 h-64 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl -rotate-6 border border-primary/10" />
            <div className="hidden md:block absolute -right-12 top-4 w-44 h-56 bg-gradient-to-br from-amber-100/60 to-amber-50/40 rounded-2xl rotate-3 border border-amber-200/40" />
            <div className="hidden md:block absolute right-8 -bottom-8 w-40 h-52 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl -rotate-2 border border-gray-200/60" />

            {/* Content card */}
            <FadeIn delay={100}>
              <div className="relative bg-white rounded-3xl shadow-xl p-10 md:p-16 border border-border/50 z-10">
                <h2 className="text-3xl md:text-4xl font-black font-heading tracking-tighter text-heading mb-6 leading-tight">
                  {mission.headline || 'Custom packaging, simplified.'}
                </h2>
                <p className="text-text-muted text-lg leading-relaxed mb-8">
                  {mission.body || 'We started P&P because getting custom packaging printed shouldn\'t require bulk orders, long waits, or guesswork. Our platform gives growing brands access to premium print quality with low minimums, transparent pricing, and a simple online ordering experience.'}
                </p>
                <Link to={mission.cta_link || '/products'} className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
                  {mission.cta_text || 'Explore our products'} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Section 3: Value Prop Cards ────────────────── */}
      {data.valueProps?.length > 0 && (
        <section className="py-24 bg-[var(--color-bg-alt)]">
          <div className="container mx-auto px-4">
            <FadeIn>
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-black font-heading tracking-tighter text-heading">
                  Why create with us?
                </h2>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {data.valueProps.map((vp, i) => (
                <FadeIn key={vp.id} delay={i * 100}>
                  <div className="bg-white rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                      {vp.image ? (
                        <img src={vp.image} alt={vp.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                          <span className="text-6xl opacity-20">✦</span>
                        </div>
                      )}
                    </div>
                    <div className="p-8">
                      <h3 className="text-xl font-bold font-heading text-heading mb-3">{vp.title}</h3>
                      <p className="text-text-muted leading-relaxed">{vp.description}</p>
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
        <section className="py-24 bg-base">
          <div className="container mx-auto px-4">
            <FadeIn>
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-black font-heading tracking-tighter text-heading mb-4">
                  Our process
                </h2>
                <p className="text-text-muted text-lg max-w-2xl mx-auto">
                  Transparency is core to how we work. Here's what goes into every order.
                </p>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
              {/* Left: texture image */}
              <FadeIn>
                <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-gray-100 sticky top-24 relative">
                  {data.processPillars.map((pillar, i) => (
                    pillar.icon_image ? (
                      <img 
                        key={pillar.id}
                        src={pillar.icon_image} 
                        alt={pillar.title} 
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${activeProcessIdx === i ? 'opacity-100' : 'opacity-0'}`} 
                      />
                    ) : (
                      <div 
                        key={pillar.id}
                        className={`absolute inset-0 w-full h-full bg-gradient-to-br from-primary/10 via-amber-50/30 to-gray-100 flex items-center justify-center transition-opacity duration-700 ease-in-out ${activeProcessIdx === i ? 'opacity-100' : 'opacity-0'}`}
                      >
                        <span className="text-8xl opacity-10">⚙</span>
                      </div>
                    )
                  ))}
                </div>
              </FadeIn>

              {/* Right: pillar breakdown */}
              <div className="space-y-10">
                {data.processPillars.map((pillar, i) => (
                  <FadeIn key={pillar.id} delay={i * 120}>
                    <div 
                      className={`bg-white rounded-2xl p-8 border shadow-sm transition-all duration-300 cursor-default ${activeProcessIdx === i ? 'border-primary/40 shadow-md ring-4 ring-primary/5' : 'border-border/50 hover:border-primary/20'}`}
                      onMouseEnter={() => setActiveProcessIdx(i)}
                    >
                      <h3 className="text-2xl font-bold font-heading text-heading mb-6">{pillar.title}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div>
                          <div className="text-xs font-bold text-primary uppercase tracking-wider mb-2">What it means</div>
                          <p className="text-text-muted text-sm leading-relaxed">{pillar.what_it_means}</p>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Why it matters</div>
                          <p className="text-text-muted text-sm leading-relaxed">{pillar.why_it_matters}</p>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-primary uppercase tracking-wider mb-2">How we ensure it</div>
                          <p className="text-text-muted text-sm leading-relaxed">{pillar.how_we_ensure_it}</p>
                        </div>
                      </div>
                    </div>
                  </FadeIn>
                ))}

                <FadeIn delay={data.processPillars.length * 120}>
                  <Link to="/about" className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all text-sm">
                    Read more about how we print <ArrowRight className="w-4 h-4" />
                  </Link>
                </FadeIn>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Section 5: By the Numbers ──────────────────── */}
      {data.statCounters?.length > 0 && (
        <section className="py-24 bg-heading text-white">
          <div className="container mx-auto px-4">
            <FadeIn>
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-black font-heading tracking-tighter">
                  By the numbers
                </h2>
              </div>
            </FadeIn>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {data.statCounters.map(stat => (
                <StatCounterItem key={stat.id} label={stat.label} value={stat.value} suffix={stat.suffix || '+'} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Section 6: Partners / Portfolio ─────────────── */}
      <section className="py-24 bg-[var(--color-bg-alt)]">
        <div className="container mx-auto px-4 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-5xl font-black font-heading tracking-tighter text-heading mb-4">
              Trusted by growing brands
            </h2>
            <p className="text-text-muted text-lg mb-12 max-w-2xl mx-auto">
              From startups to scale-ups, we've helped hundreds of businesses create packaging that stands out.
            </p>
          </FadeIn>

          <FadeIn delay={100}>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 mb-12">
              {data.partnerBrands && data.partnerBrands.length > 0 ? (
                data.partnerBrands.map((brand, i) => {
                  const content = (
                    <div className={`group relative grayscale hover:grayscale-0 opacity-50 hover:opacity-100 transition-all duration-300 ${brand.website_url ? 'cursor-pointer' : ''}`}>
                      {brand.logo_image ? (
                        <img src={brand.logo_image} alt={brand.name} className="h-12 w-auto object-contain" />
                      ) : (
                        <div className="text-xl font-bold font-heading text-neutral">{brand.name}</div>
                      )}
                    </div>
                  );
                  
                  return (
                    <React.Fragment key={brand.id}>
                      {brand.website_url ? (
                        <a href={brand.website_url.startsWith('http') ? brand.website_url : `https://${brand.website_url}`} target="_blank" rel="noopener noreferrer">
                          {content}
                        </a>
                      ) : (
                        content
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                ['Brand A', 'Brand B', 'Brand C', 'Brand D', 'Brand E'].map((name, i) => (
                  <div key={i} className="w-28 h-14 bg-gray-200 rounded-xl flex items-center justify-center text-sm font-bold text-gray-400">
                    {name}
                  </div>
                ))
              )}
            </div>
          </FadeIn>

          <FadeIn delay={200}>
            <Link to="/portfolio" className="inline-flex items-center gap-2 px-8 py-4 bg-surface border border-border text-heading font-bold rounded-pill hover:border-primary hover:text-primary transition-colors shadow-sm">
              View full portfolio <ArrowRight className="w-4 h-4" />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ── Section 7: Our Team ────────────────────────── */}
      {data.teamMembers?.length > 0 && (
        <section className="py-24 bg-base">
          <div className="container mx-auto px-4">
            <FadeIn>
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-black font-heading tracking-tighter text-heading">
                  Our team
                </h2>
              </div>
            </FadeIn>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {data.teamMembers.map((member, i) => (
                <FadeIn key={member.id} delay={i * 60}>
                  <div className="text-center group">
                    <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg group-hover:shadow-xl transition-shadow">
                      {member.photo ? (
                        <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-3xl font-bold text-primary/30">
                          {member.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <h3 className="font-bold text-heading">{member.name}</h3>
                    <p className="text-text-muted text-sm">{member.role}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Section 8: Closing CTA Banner ──────────────── */}
      <section className="py-20 md:py-28 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-5xl font-black font-heading text-white tracking-tighter mb-6 max-w-3xl mx-auto leading-tight">
              {cta.headline || 'Upload your design — we print it'}
            </h2>
            {cta.body && (
              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">{cta.body}</p>
            )}
            <Link
              to={cta.cta_link || '/products'}
              className="inline-flex items-center gap-2 px-10 py-5 bg-white text-primary font-bold text-lg rounded-pill hover:bg-gray-50 transition-colors shadow-lg"
            >
              {cta.cta_text || 'Browse Products'} <ArrowRight className="w-5 h-5" />
            </Link>
          </FadeIn>
        </div>
      </section>
    </>
  );
};

export default AboutPage;
