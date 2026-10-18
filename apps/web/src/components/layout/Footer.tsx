import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-800 flex items-center justify-center text-white font-bold text-sm">
                ₹
              </div>
              <span className="font-extrabold text-lg text-slate-900 dark:text-white">
                Nidhi<span className="text-brand-600">Flow</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              India's first verified two-sided dealflow platform. Connecting high-traction startups with genuine angels & VCs with statutory trust.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>DPIIT & MCA Verification Engine</span>
            </div>
          </div>

          {/* Directory Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Explore Deals
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li><Link href="/startups?sector=Fintech" className="hover:text-brand-600">Fintech Startups</Link></li>
              <li><Link href="/startups?sector=Healthtech" className="hover:text-brand-600">Healthtech & AI</Link></li>
              <li><Link href="/startups?sector=Agritech" className="hover:text-brand-600">Agritech & Supply Chain</Link></li>
              <li><Link href="/startups?stage=SEED" className="hover:text-brand-600">Seed Stage Companies</Link></li>
              <li><Link href="/leaderboard" className="hover:text-brand-600">Traction Leaderboard</Link></li>
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              For Ecosystem
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li><Link href="/startup/register" className="hover:text-brand-600">Apply to Raise Capital</Link></li>
              <li><Link href="/investor/register" className="hover:text-brand-600">Join as an Investor</Link></li>
              <li><Link href="/investors" className="hover:text-brand-600">Verified Angels & VCs</Link></li>
              <li><Link href="/startup/login" className="hover:text-brand-600">Founder Login</Link></li>
              <li><Link href="/investor/login" className="hover:text-brand-600">Investor Login</Link></li>
            </ul>
          </div>

          {/* Compliance & Regulatory Disclaimer */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Regulatory Note
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              NidhiFlow is an informational technology marketplace facilitating direct introductions between verified entities. It is not an exchange, broker-dealer, or investment advisor under SEBI regulations. Unlisted startup investments carry capital risk.
            </p>
            <div className="mt-3 text-xs text-slate-400">
              Made with <Heart className="w-3 h-3 inline text-red-500" /> for Indian Founders & Angels.
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <div>© {new Date().getFullYear()} NidhiFlow Technologies Private Limited. All rights reserved.</div>
          <div className="flex gap-4">
            <span className="hover:text-slate-600 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-600 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-600 cursor-pointer">Verification Criteria</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
