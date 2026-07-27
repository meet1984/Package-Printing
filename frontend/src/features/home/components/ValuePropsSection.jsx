import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const ValuePropsSection = ({ data }) => {
  if (!data) return null;

  const title = data.title;
  let items = [];
  try {
    items = JSON.parse(data.content);
  } catch (e) {
    console.error("Failed to parse value props content", e);
  }

  return (
    <section className="section-padding bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-20">

          {/* Left Column */}
          <div className="w-full lg:w-1/3 flex flex-col justify-center">
            <h2 className="text-display tracking-tight text-gray-900 mb-5 max-w-sm">
              {title}
            </h2>
            <p className="text-lg text-gray-500 mb-8 max-w-sm leading-relaxed">
              We've redesigned the packaging experience to be faster, simpler, and more sustainable. Everything your growing brand needs to stand out.
            </p>
            <div>
              <Link
                to="/products"
                className="
                  inline-flex items-center gap-2
                  font-semibold text-sm
                  bg-brand text-white
                  hover:bg-brand-hover
                  px-6 py-3 rounded-lg
                  transition-colors duration-[var(--duration-fast)]
                  shadow-sm hover:shadow-md
                "
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Column - Cards */}
          <div className="w-full lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="
                  p-7 rounded-xl
                  bg-gray-50 border border-gray-100
                  hover:border-gray-200 hover:shadow-sm
                  transition-all duration-[var(--duration-normal)]
                "
              >
                <h3 className="text-xl font-display font-semibold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-500 leading-relaxed text-[15px]">
                  {item.content}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default ValuePropsSection;
