'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatINR, formatGrowth } from '@/lib/format';
import { VerifiedBadge } from '@/components/ui/Badge';
import { SECTORS, INDIAN_STATES } from '@nidhiflow/shared';
import {
  Search, Filter, TrendingUp, ShieldCheck, MapPin,
  ChevronRight, Building2, SlidersHorizontal, ArrowUpDown
} from 'lucide-react';

export default function StartupsDirectoryPage() {
  const [startups, setStartups] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('');
  const [stage, setStage] = useState('');
  const [state, setState] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('leaderboardScore');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchStartups = async () => {
    setLoading(true);
    try {
      const params: any = {
        pageSize: 24,
        sortBy,
        sortOrder,
      };
      if (search) params.search = search;
      if (sector) params.sector = sector;
      if (stage) params.stage = stage;
      if (state) params.state = state;
      if (verifiedOnly) params.verifiedOnly = 'true';

      const res = await api.getStartups(params);
      if (res && res.data) {
        setStartups(res.data);
        setTotal(res.total || res.data.length);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStartups();
  }, [sector, stage, state, verifiedOnly, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStartups();
  };

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Explore Startups
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Discover verified early-stage and growth Indian startups actively raising capital.
          </p>
        </div>

        {/* Search & Filters Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 mb-8 shadow-sm space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by company name, keywords, problem statement..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-brand-800 hover:bg-brand-900 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Search
            </button>
          </form>

          {/* Filter dropdowns */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            {/* Sector */}
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="">All Sectors</option>
              {SECTORS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Stage */}
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="">All Stages</option>
              <option value="IDEA">Idea</option>
              <option value="MVP">MVP</option>
              <option value="PRE_SEED">Pre-Seed</option>
              <option value="SEED">Seed</option>
              <option value="SERIES_A">Series A</option>
              <option value="SERIES_B_PLUS">Series B+</option>
            </select>

            {/* State */}
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="">All States</option>
              {INDIAN_STATES.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>

            {/* Sort by */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="leaderboardScore">Sort by Rank Score</option>
              <option value="mrr">Sort by MRR</option>
              <option value="growthRateMom">Sort by MoM Growth</option>
              <option value="fundingAsk">Sort by Funding Ask</option>
              <option value="createdAt">Sort by Newest</option>
            </select>

            {/* Verified Only checkbox */}
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer ml-auto">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Verified Only
              </span>
            </label>
          </div>
        </div>

        {/* Startups Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : startups.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No startups found</h3>
            <p className="text-sm text-slate-500 mt-1">Try relaxing your search or filters.</p>
          </div>
        ) : (
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
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                    {s.tagline}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 mt-3">
                    <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {s.sector}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {s.stage}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-0.5 ml-auto">
                      <MapPin className="w-3 h-3" />
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

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    Leaderboard Score: <span className="font-bold text-slate-800 dark:text-slate-200">{s.leaderboardScore || 85}</span>
                  </div>
                  <Link
                    href={`/startups/${s.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 transition-colors"
                  >
                    View Profile <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
