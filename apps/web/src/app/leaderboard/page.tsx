'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatINR, formatGrowth } from '@/lib/format';
import { VerifiedBadge } from '@/components/ui/Badge';
import { SECTORS } from '@nidhiflow/shared';
import {
  TrendingUp, Users, ShieldCheck, ArrowUpRight, ArrowDownRight,
  Minus, Sparkles, Filter, ChevronRight, Info, Star
} from 'lucide-react';

export default function LeaderboardPage() {
  const [tab, setTab] = useState<'startups' | 'investors'>('startups');
  const [startups, setStartups] = useState<any[]>([]);
  const [investors, setInvestors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sector, setSector] = useState('');

  useEffect(() => {
    setLoading(true);
    if (tab === 'startups') {
      api.getStartupLeaderboard({ sector, pageSize: 50 })
        .then((res) => {
          if (res && res.data) setStartups(res.data);
        })
        .finally(() => setLoading(false));
    } else {
      api.getInvestorLeaderboard()
        .then((res) => {
          if (res && res.data) setInvestors(res.data);
        })
        .finally(() => setLoading(false));
    }
  }, [tab, sector]);

  const getRankDelta = (current: number, prev: number | null) => {
    if (!prev) return <span className="text-blue-500 font-bold text-[10px] px-1.5 py-0.5 rounded bg-blue-50">NEW</span>;
    const diff = prev - current;
    if (diff > 0) {
      return (
        <span className="text-emerald-500 font-bold text-xs flex items-center">
          <ArrowUpRight className="w-3.5 h-3.5" /> +{diff}
        </span>
      );
    }
    if (diff < 0) {
      return (
        <span className="text-red-500 font-bold text-xs flex items-center">
          <ArrowDownRight className="w-3.5 h-3.5" /> {diff}
        </span>
      );
    }
    return <Minus className="w-3 h-3 text-slate-400" />;
  };

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600 mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Transparent Meritocracy
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            NidhiFlow Leaderboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 max-w-2xl">
            Ranked periodically by an open 7-parameter weighted algorithm. Only verified statutory metrics and real traction data count.
          </p>
        </div>

        {/* Algorithm Explainer Box */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 mt-0.5">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs text-slate-900 dark:text-white block">
                Algorithm Weights
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Traction (25%) + MoM Growth (20%) + Profile Completeness (15%) + Investor Interest (15%) + Consistency (10%) + Transparency (10%) + Committed Deals (5%).
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-400 shrink-0 font-medium">
            Anti-gaming & Spikeproof
          </div>
        </div>

        {/* Tab & Filter selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex p-1 rounded-xl bg-slate-200 dark:bg-slate-900 w-fit">
            <button
              onClick={() => setTab('startups')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                tab === 'startups'
                  ? 'bg-white dark:bg-slate-800 text-brand-800 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Top Startups
            </button>
            <button
              onClick={() => setTab('investors')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                tab === 'investors'
                  ? 'bg-white dark:bg-slate-800 text-brand-800 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Top Rated Investors
            </button>
          </div>

          {/* Sector filter for startups */}
          {tab === 'startups' && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="">All Sectors</option>
                {SECTORS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Rankings Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-sm text-slate-400">Loading rankings...</div>
          ) : tab === 'startups' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-950/80 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 text-center">Rank</th>
                    <th className="py-3.5 px-4">Startup</th>
                    <th className="py-3.5 px-4">Sector & Stage</th>
                    <th className="py-3.5 px-4">Monthly Revenue</th>
                    <th className="py-3.5 px-4">MoM Growth</th>
                    <th className="py-3.5 px-4">Funding Ask</th>
                    <th className="py-3.5 px-4 text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {startups.map((s, idx) => {
                    const currentRank = s.leaderboardRank || idx + 1;
                    return (
                      <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                              currentRank === 1
                                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                                : currentRank === 2
                                ? 'bg-slate-300 text-slate-950'
                                : currentRank === 3
                                ? 'bg-amber-600 text-white'
                                : 'text-slate-500'
                            }`}>
                              {currentRank}
                            </span>
                            <div className="mt-1">
                              {getRankDelta(currentRank, s.previousRank)}
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <Link href={`/startups/${s.id}`} className="group block">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white group-hover:text-brand-600">
                                {s.companyName}
                              </span>
                              {s.verificationStatus === 'VERIFIED' && (
                                <VerifiedBadge type="VERIFIED_STARTUP" size="sm" />
                              )}
                            </div>
                            <span className="text-xs text-slate-400 line-clamp-1">
                              {s.tagline}
                            </span>
                          </Link>
                        </td>

                        <td className="py-4 px-4">
                          <span className="text-xs text-slate-700 dark:text-slate-300 block">{s.sector}</span>
                          <span className="text-[10px] text-slate-400">{s.stage}</span>
                        </td>

                        <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                          {formatINR(s.mrr)}
                          <span className="text-xs text-slate-400 font-normal">/mo</span>
                        </td>

                        <td className="py-4 px-4">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                            <TrendingUp className="w-3.5 h-3.5" />
                            {formatGrowth(s.growthRateMom)}
                          </span>
                        </td>

                        <td className="py-4 px-4 font-bold text-slate-700 dark:text-slate-300">
                          {formatINR(s.fundingAsk)}
                        </td>

                        <td className="py-4 px-4 text-right">
                          <span className="text-base font-black text-brand-700 dark:text-brand-400">
                            {s.leaderboardScore}
                          </span>
                          <span className="text-[10px] text-slate-400 block">/100</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-950/80 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 text-center">Rank</th>
                    <th className="py-3.5 px-4">Investor / Firm</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Sweet Spot Ticket</th>
                    <th className="py-3.5 px-4">Founder Reviews</th>
                    <th className="py-3.5 px-4 text-right">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {investors.map((inv, idx) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-4 text-center font-bold text-slate-500">
                        {idx + 1}
                      </td>

                      <td className="py-4 px-4">
                        <Link href={`/investors/${inv.id}`} className="group block">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600">
                              {inv.displayName}
                            </span>
                            {inv.sebiRegistration && (
                              <VerifiedBadge type="SEBI_REGISTERED" size="sm" />
                            )}
                          </div>
                          <span className="text-xs text-slate-400">
                            {inv.firmName || inv.type}
                          </span>
                        </Link>
                      </td>

                      <td className="py-4 px-4 text-xs capitalize text-slate-600 dark:text-slate-400">
                        {inv.type?.toLowerCase().replace('_', ' ')}
                      </td>

                      <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                        {formatINR(inv.ticketSizeMin)} – {formatINR(inv.ticketSizeMax)}
                      </td>

                      <td className="py-4 px-4 text-xs text-slate-500">
                        {inv.totalReviews || 0} reviews
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex items-center gap-1 text-amber-500 font-black text-sm">
                          <Star className="w-4 h-4 fill-current" />
                          {inv.averageRating?.toFixed(1) || '5.0'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
