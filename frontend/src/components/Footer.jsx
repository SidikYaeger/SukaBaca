import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-r from-[#5998cf] via-[#4d86b8] to-[#6daed6] text-white py-12 px-6 sm:px-12 mt-16">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <h3 className="text-xl font-bold tracking-tight text-white mb-2">
            SukaBapak
          </h3>
          <p className="text-xs text-white/80">
            Platform manajemen & ringkasan jurnal riset akademik.
          </p>
        </div>

        {/* Member */}
        <div>
          <h4 className="text-sm font-semibold mb-3 text-white/95">Member</h4>
          <ul className="space-y-2 text-xs text-white/80">
            <li className="hover:text-white cursor-pointer transition-colors">Adira</li>
            <li className="hover:text-white cursor-pointer transition-colors">Berjasha</li>
            <li className="hover:text-white cursor-pointer transition-colors">Dirga</li>
            <li className="hover:text-white cursor-pointer transition-colors">Gumilar</li>
          </ul>
        </div>

        {/* Features */}
        <div>
          <h4 className="text-sm font-semibold mb-3 text-white/95">Features</h4>
          <ul className="space-y-2 text-xs text-white/80">
            <li className="hover:text-white cursor-pointer transition-colors">Core features</li>
            <li className="hover:text-white cursor-pointer transition-colors">Pro experience</li>
            <li className="hover:text-white cursor-pointer transition-colors">Integrations</li>
          </ul>
        </div>

        {/* Learn more */}
        <div>
          <h4 className="text-sm font-semibold mb-3 text-white/95">Learn more</h4>
          <ul className="space-y-2 text-xs text-white/80">
            <li className="hover:text-white cursor-pointer transition-colors">Blog</li>
            <li className="hover:text-white cursor-pointer transition-colors">Case studies</li>
            <li className="hover:text-white cursor-pointer transition-colors">Customer stories</li>
            <li className="hover:text-white cursor-pointer transition-colors">Best practices</li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-sm font-semibold mb-3 text-white/95">Support</h4>
          <ul className="space-y-2 text-xs text-white/80">
            <li className="hover:text-white cursor-pointer transition-colors">Contact</li>
            <li className="hover:text-white cursor-pointer transition-colors">Support</li>
            <li className="hover:text-white cursor-pointer transition-colors">Legal</li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto border-t border-white/20 mt-10 pt-6 text-center text-xs text-white/70">
        © 2026 SukaBaca (Tubes IMK). All rights reserved.
      </div>
    </footer>
  );
}
