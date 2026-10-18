'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatINR, formatGrowth, formatRupees } from '@/lib/format';
import { VerifiedBadge } from '@/components/ui/Badge';
import {
  ShieldCheck, TrendingUp, Users, Building2, ArrowRight,
  CheckCircle2, Sparkles, Star, Award, Zap, Lock, ChevronRight, Play
} from 'lucide-react';

export default function HomePage() {
  const { login } = useAuth();
  const [startups, setStartups] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [stats, setStats] = useState({
    startupsCount: 25,
    investorsCount: 15,
    committedCr: 38.5,
  });

  useEffect(() => {
    // Fetch top startups
    api.getStartups({ pageSize: 6, sortBy: 'leaderboardScore', sortOrder: 'desc' })
      .then((res) => {
        if (res && res.data) setStartups(res.data);
      })
      .catch(() => {});

    // Fetch top leaderboard
    api.getStartupLeaderboard({ pageSize: 5 })
      .then((res) => {
        if (res && res.data) setLeaderboard(res.data);
      })
      .catch(() => {});
  }, []);

  // Quick Demo Auto-login handlers
  const handleQuickDemo = async (role: 'founder' | 'investor' | 'admin') => {
    try {
      let res;
      if (role === 'founder') {
        res = await api.loginStartup({ email: 'rahul@kiranapay.in', password: 'Test@1234' });
        login(res.accessToken, res.user);
        window.location.href = '/startup/dashboard';
      } else if (role === 'investor') {
        res = await api.loginInvestor({ email: 'rajiv@blumeraise.vc', password: 'Test@1234' });
        login(res.accessToken, res.user);
        window.location.href = '/investor/dashboard';
      } else {
        res = await api.loginAdmin({ email: 'admin@nidhiflow.in', password: 'Test@1234' });
        login(res.accessToken, res.user);
        window.location.href = '/admin/dashboard';
      }
    } catch (e: any) {
      alert(`Demo login failed: ${e.message}`);
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* ── Demo Quick Switch Bar ── */}
      <div className="bg-brand-950 text-white text-xs py-2 px-4 border-b border-brand-900/60">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-slate-300">Instant Demo Evaluation:</span>
            <span className="text-slate-400 hidden sm:inline">Try pre-populated seed profiles in 1-click</span>
          </div>
          <div className="flex items-center gap-2 font-medium">
            <button
              onClick={() => handleQuickDemo('founder')}
              className="px-2.5 py-1 bg-brand-800 hover:bg-brand-700 rounded text-emerald-300 flex items-center gap-1 transition-colors"
            >
              <Building2 className="w-3 h-3" /> Founder (KiranaPay)
            </button>
            <button
              onClick={() => handleQuickDemo('investor')}
              className="px-2.5 py-1 bg-brand-800 hover:bg-brand-700 rounded text-blue-300 flex items-center gap-1 transition-colors"
            >
              <Users className="w-3 h-3" /> Investor (BlumeRaise VC)
            </button>
            <button
              onClick={() => handleQuickDemo('admin')}
              className="px-2.5 py-1 bg-brand-800 hover:bg-brand-700 rounded text-purple-300 flex items-center gap-1 transition-colors"
            >
              <ShieldCheck className="w-3 h-3" /> Admin (Verification Queue)
            </button>
          </div>
        </div>
      </div>

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28 bg-gradient-to-b from-white via-slate-50 to-brand-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-brand-950/20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-brand-500/10 via-indigo-500/10 to-transparent blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-6 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>MCA Statutory Verified & DPIIT Integrated Dealflow</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.1]">
            Where genuine Indian startups meet{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-700 via-indigo-600 to-brand-500">
              real investors.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Eliminate cold outreach chaos. Pre-vetted traction metrics, transparent statutory verification, and direct deal room chats across India.
          </p>

          {/* Actions */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/startups"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-brand-800 hover:bg-brand-900 shadow-lg shadow-brand-800/25 flex items-center justify-center gap-2 transition-all hover:gap-3"
            >
              Explore Verified Startups
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/investor/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Users className="w-4 h-4 text-brand-600" />
              Join as Angel / VC
            </Link>
          </div>

          {/* Trust stats pill bar */}
          <div className="mt-16 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl glass-card shadow-glass">
            <div className="p-3 text-center border-r border-slate-200/60 dark:border-slate-800/60 last:border-none">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                ₹38.5 Cr+
              </div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                Capital Committed
              </div>
            </div>
            <div className="p-3 text-center border-r border-slate-200/60 dark:border-slate-800/60 last:border-none">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                25+
              </div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                Vetted Startups
              </div>
            </div>
            <div className="p-3 text-center border-r border-slate-200/60 dark:border-slate-800/60 last:border-none">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                15+
              </div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                Verified Investors
              </div>
            </div>
            <div className="p-3 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                100%
              </div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                Statutory Audited
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Startups Section ── */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> High Traction Companies
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Featured Verified Deals
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Active rounds with validated statutory registration and verified metrics.
            </p>
          </div>
          <Link
            href="/startups"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700"
          >
            Browse all 25 startups <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {startups.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between hover:shadow-xl hover:border-brand-300 dark:hover:border-brand-700 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-700 to-indigo-500 flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
                    {s.companyName.charAt(0)}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {s.verificationStatus === 'VERIFIED' && (
                      <VerifiedBadge type="VERIFIED_STARTUP" size="sm" />
                    )}
                    {s.dpiitNumber && (
                      <VerifiedBadge type="DPIIT_RECOGNISED" size="sm" />
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">
                  {s.companyName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  {s.tagline}
                </p>

                <div className="flex items-center gap-2 mt-3">
                  <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {s.sector}
                  </span>
                  <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {s.stage}
                  </span>
                  <span className="text-xs text-slate-400">
                    {s.city}, {s.state}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 my-5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Monthly Revenue</span>
                    <div className="text-base font-extrabold text-slate-900 dark:text-white">
                      {formatINR(s.mrr)}
                      <span className="text-xs text-slate-400 font-normal">/mo</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">MoM Growth</span>
                    <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {formatGrowth(s.growthRateMom)}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Funding Ask</span>
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {formatINR(s.fundingAsk)}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Equity Offered</span>
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {s.equityOffered ? `${s.equityOffered}%` : 'Flexible'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  Score: <span className="font-bold text-slate-700 dark:text-slate-200">{s.leaderboardScore || 85}</span>/100
                </div>
                <Link
                  href={`/startups/${s.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
                >
                  View Details <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Leaderboard Preview Section ── */}
      <section className="py-16 bg-slate-900 text-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-brand-400 mb-1 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Transparent Ranking Formula
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold">
                Live Startup Leaderboard
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Weighted by: Traction (25%), Growth (20%), Profile Completeness (15%), Investor Interest (15%), Updates (10%), Transparency (10%), Committed Capital (5%).
              </p>
            </div>
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-300 hover:text-white"
            >
              Full Rankings & Weights <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Startup</th>
                    <th className="py-3 px-4">Sector</th>
                    <th className="py-3 px-4">MRR (INR)</th>
                    <th className="py-3 px-4">MoM Growth</th>
                    <th className="py-3 px-4">Funding Ask</th>
                    <th className="py-3 px-4 text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {leaderboard.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-300">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                          idx === 0 ? 'bg-amber-400 text-slate-950' : idx === 1 ? 'bg-slate-300 text-slate-950' : idx === 2 ? 'bg-amber-600 text-white' : 'text-slate-400'
                        }`}>
                          {item.leaderboardRank || idx + 1}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-white hover:text-brand-400 cursor-pointer">
                            {item.companyName}
                          </span>
                          {item.verificationStatus === 'VERIFIED' && (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{item.sector}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-200">
                        {formatINR(item.mrr)}
                      </td>
                      <td className="py-3.5 px-4 text-emerald-400 font-semibold">
                        {formatGrowth(item.growthRateMom)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {formatINR(item.fundingAsk)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-brand-400">
                        {item.leaderboardScore}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust & Verification Pillars ── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-1">
            Trust Engine
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            Verification is the Core Feature, Not an Afterthought.
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mt-3 text-base">
            Every entity on NidhiFlow is subjected to rigorous statutory checks to protect founders and investors from fraudulent profiles and spam.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Statutory Verification (MCA & DPIIT)
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              We validate Corporate Identification Numbers (CIN/LLPIN), Company PAN, GSTIN registrations, and official Startup India DPIIT certificates.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-5">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Accredited Investor Vetting
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Investors verify SEBI registration numbers (for institutional AIFs) or provide net-worth declarations, eliminating casual tire-kickers.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-5">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              6-Dimensional Investor Reviews
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Founders rate investors on responsiveness, transparency, value-add, and decision speed. Bad actors who ghost founders are held accountable.
            </p>
          </div>
        </div>
      </section>

      {/* ── Ready to Raise / Invest CTA ── */}
      <section className="py-16 bg-gradient-to-tr from-brand-950 via-brand-900 to-indigo-950 text-white w-full border-t border-brand-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Ready to accelerate your dealflow?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-brand-200 max-w-2xl mx-auto">
            Join hundreds of founders and investors connecting across India with verified trust.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/startup/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold bg-white text-brand-900 hover:bg-brand-50 shadow-lg shadow-black/20 transition-all"
            >
              Raise as a Startup
            </Link>
            <Link
              href="/investor/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold bg-brand-800/80 hover:bg-brand-800 text-white border border-brand-700/60 transition-all"
            >
              Sign Up as an Investor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
