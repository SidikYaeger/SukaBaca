import React from 'react';
import Navbar from '../components/Navbar';

export default function ArticleDetailPage() {
  return (
    <div className="flex-1 flex flex-col bg-white min-h-screen pb-16">
      {/* Top Navbar */}
      <Navbar variant="with-back" />

      {/* Article Content Container */}
      <article className="max-w-2xl mx-auto px-6 sm:px-8 w-full mt-2">
        {/* Date */}
        <div className="text-center mb-2">
          <time className="text-xs text-gray-500 font-medium">January 1, 2025</time>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-950 text-center tracking-tight mb-2">
          Article
        </h1>

        {/* Author */}
        <div className="text-center mb-8">
          <p className="text-xs sm:text-sm text-gray-600 font-medium">Author, Adira</p>
        </div>

        {/* Cover Graphic Banner (matching tampil.png) */}
        <div className="w-full rounded-2xl overflow-hidden mb-10 shadow-sm border border-gray-100 bg-gradient-to-br from-[#fde2e4] via-[#e2ece9] to-[#dfe7fd] flex items-center justify-center p-6 sm:p-10">
          <div className="relative w-48 h-48 sm:w-60 sm:h-60 flex items-center justify-center">
            {/* Abstract flower illustration matching mockup */}
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {/* Petals */}
              <circle cx="80" cy="70" r="35" fill="#52796f" opacity="0.8" />
              <circle cx="120" cy="70" r="35" fill="#4ea8de" opacity="0.8" />
              <circle cx="100" cy="95" r="35" fill="#b5e48c" opacity="0.8" />
              <circle cx="100" cy="60" r="28" fill="#d9ed92" opacity="0.9" />
              
              {/* Stem */}
              <rect x="96" y="95" width="8" height="75" fill="#2d6a4f" rx="4" />
              
              {/* Leaves */}
              <path d="M96 130 C70 120, 65 145, 96 145 Z" fill="#74c69d" />
              <path d="M104 140 C130 130, 135 155, 104 155 Z" fill="#74c69d" />

              {/* Cloud line accent */}
              <path d="M140 65 Q150 55 160 65 Q170 55 180 65 Q185 75 175 80 Q165 85 140 80 Z" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Section 1 */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-950 mb-3 tracking-tight">
            First subheader
          </h2>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-normal">
            The first paragraph of an article is often an introduction to the text. Sometimes it's called the "lead," and sometimes that word is spelled "lede." When you're writing an article—whether it's for a blog or a review site or somewhere else—it's always a good idea to begin with something interesting to hook a reader. If it's a piece of thought leadership, maybe you want to start with a little anecdote, or a familiar problem. If you're putting together something for businesses, you might start off with a relevant piece of data.
          </p>
        </section>

        {/* Section 2 */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-950 mb-3 tracking-tight">
            Another subheader to break up text
          </h2>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-normal">
            The second paragraph of an article is sometimes called the "nut graph," which is short for "nutshell paragraph." That's because this is usually where the article gets to the heart of the matter—the main point. After the first section, the reader is ready to hear what's truly at stake in this piece of writing. They're invested. They're paying attention. If your piece is long enough to have long, multi-paragraph sections, then you'll want to use this strategy throughout to make sure you're holding reader attention in a consistent way.
          </p>
        </section>

        {/* Section 3 */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-950 mb-3 tracking-tight">
            Last subheader, for good measure
          </h2>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-normal">
            Finally you arrive at the ending of the article. This is a good place to wrap things up and conclude with takeaways. If you're writing something for a more traditional publication, it can be nice to end on an anecdote that mirrors the theme of the piece. If you're putting together some content for a company blog, you'll probably just want to close out in a tidy way and include a CTA of some kind. Writers should take note: Usually, when you write a draft, you finally get to the main point at the end. An old editing trick is to take that idea and put it at the top of the piece. Consider whether that would work for you in this case.
          </p>
        </section>
      </article>
    </div>
  );
}
