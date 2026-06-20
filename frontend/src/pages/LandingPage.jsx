import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const categories = [
  { name: 'Electrician', icon: '⚡' },
  { name: 'Plumber', icon: '🚰' },
  { name: 'Carpenter', icon: '🪚' },
  { name: 'Painter', icon: '🎨' },
  { name: 'Cleaner', icon: '🧹' },
  { name: 'Gardener', icon: '🌿' },
];

function LandingPage() {
  return (
    <section className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex flex-col items-center pt-12 pb-24">
      {/* Hero */}
      <div className="container mx-auto flex flex-col-reverse md:flex-row items-center gap-8 px-4 lg:px-0">
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary-800 mb-4">
            Find Trusted Local Professionals in Minutes
          </h1>
          <p className="text-lg text-slate-600 mb-6 max-w-md">
            GharSeva connects you with vetted service providers for all home needs – from repairs to renovations.
          </p>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition-colors"
          >
            Explore Services <ArrowRight size={18} />
          </Link>
        </div>
        <div className="flex-1 flex justify-center">
          <img src="/logo.png" alt="GharSeva Logo" className="w-full max-w-sm rounded-2xl hover:scale-105 transition-transform object-contain drop-shadow-xl" />
        </div>
      </div>

      {/* Categories Carousel */}
      <div className="mt-16 w-full max-w-5xl">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 text-center">Popular Categories</h2>
        <div className="flex overflow-x-auto gap-6 px-4 lg:px-0 scrollbar-none custom-scrollbar">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/services?category=${cat.name.toLowerCase()}`}
              className="flex flex-col items-center bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow hover:scale-105 w-28 flex-shrink-0"
            >
              <span className="text-3xl mb-2">{cat.icon}</span>
              <span className="text-sm font-medium text-slate-700">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default LandingPage;
