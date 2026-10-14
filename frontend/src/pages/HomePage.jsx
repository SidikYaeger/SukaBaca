import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function HomePage({ isAuthenticated = false, onLogout }) {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Top Gradient Hero Area */}
      <div 
        className="w-full text-white px-4 sm:px-8 pb-12 pt-4 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #7c3a7f 0%, #3e4a83 100%)'
        }}
      >
        {/* Navbar */}
        <Navbar 
          variant="home" 
          isAuthenticated={isAuthenticated} 
          onLogout={onLogout} 
        />

        {/* Hero Card Graphic Replica */}
        <div className="mt-8 max-w-2xl mx-auto bg-white/95 backdrop-blur rounded-2xl p-4 sm:p-6 shadow-xl border border-white/20">
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i} 
                className="h-12 sm:h-16 rounded-xl bg-gray-100/90 border border-gray-200/60 flex items-center justify-center"
              >
                <div className="w-4 h-4 rounded-full bg-purple-200/50" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Section */}
      <div className="px-6 sm:px-12 py-10 max-w-4xl mx-auto w-full">
        {/* Headline */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight mb-2.5">
            Automatically Summarize Your Journal
          </h2>
          <p className="text-sm text-gray-600 max-w-xl leading-relaxed mb-5">
            Get a clear, structured, automatic summary of any journal—just upload and click summarize.
          </p>

          <button
            onClick={() => navigate(isAuthenticated ? '/upload' : '/login')}
            className="px-6 py-2.5 bg-black hover:bg-gray-800 active:scale-95 text-white font-semibold text-xs sm:text-sm rounded-xl shadow transition-all"
          >
            Try Now
          </button>
        </div>

        {/* Visual Magazine / Journal Showcase Grid (matching mockups) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 my-10">
          {/* Left Column */}
          <div className="space-y-5">
            {/* Pale blue textured box */}
            <div className="h-44 rounded-2xl bg-gradient-to-br from-[#bad5e0] to-[#99bccd] p-4 flex items-center justify-center text-center shadow-sm">
              <span className="text-xs text-[#2c4e61] font-semibold tracking-wider uppercase">
                Academic Research Archive
              </span>
            </div>

            {/* Newspaper clipping card */}
            <div className="border border-gray-300 rounded-2xl p-4 bg-[#faf9f6] shadow-sm font-serif text-gray-800 text-xs">
              <h3 className="text-base font-black leading-tight uppercase mb-1 border-b border-gray-300 pb-1">
                Man Found Dead In Boat On Lake
              </h3>
              <p className="leading-tight text-[11px] text-gray-700">
                INDIAN LAKE — A 53-year-old vacationing with his wife and family was found at the lake...
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            {/* Magazine style card */}
            <div className="border border-gray-300 rounded-2xl p-4 bg-white shadow-sm font-sans text-xs">
              <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                <span>Ginyard International Co.</span>
                <span>04/05/2026</span>
              </div>
              <h3 className="text-base font-bold text-gray-900 border-b-2 border-black pb-1 mb-2">
                Sustainable Style
              </h3>
              <p className="text-[11px] text-gray-600 line-clamp-4 leading-snug">
                Fashion with a Conscience. Exploring green methodologies in contemporary academic textile research...
              </p>
            </div>

            {/* Pattern texture box */}
            <div className="h-44 rounded-2xl bg-gradient-to-tr from-[#98c5d9] to-[#c7e4ee] p-4 flex items-center justify-center text-center shadow-sm">
              <span className="text-xs text-[#1e485e] font-semibold tracking-wider uppercase">
                AI Structured Summary Output
              </span>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mt-14 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            Testimonials
          </h3>
          <p className="text-xs text-gray-500 mb-6">
            A little line about what's being said and who's saying it.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Testimonial 1 */}
            <div className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
                  😊
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 leading-tight">Zulfa</h4>
                  <p className="text-[10px] text-gray-500">PRADA Executive Chairman</p>
                </div>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed font-medium">
                Using this product felt like it transformed me completely.
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-sm">
                  🙂
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 leading-tight">Babas</h4>
                  <p className="text-[10px] text-gray-500">Master of Ghosting</p>
                </div>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed font-medium">
                Your expectations will fly sky high. I felt like I was soaring.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
