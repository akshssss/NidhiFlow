'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatINR, formatGrowth, formatDate } from '@/lib/format';
import { VerifiedBadge, StatusBadge } from '@/components/ui/Badge';
import {
  Users, DollarSign, Bookmark, MessageSquare, Star,
  TrendingUp, Building2, CheckCircle2, ChevronRight,
  ExternalLink, Trash2, Send
} from 'lucide-react';

export default function InvestorDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [dashboard, setDashboard] = useState<any>(null);
  const [savedStartups, setSavedStartups] = useState<any[]>([]);
  const [interests, setInterests] = useState<any[]>([]);
  const [pipelineFilter, setPipelineFilter] = useState<'ALL' | 'EXPRESSED' | 'ACCEPTED' | 'COMMITTED'>('ALL');
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const [dashData, savedData, interestsData] = await Promise.all([
        api.getMyInvestorDashboard(),
        api.getSavedStartups(),
        api.getInvestorInterests(),
      ]);
      setDashboard(dashData);
      if (savedData && savedData.data) setSavedStartups(savedData.data);
      if (interestsData && interestsData.data) setInterests(interestsData.data);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'INVESTOR')) {
      router.push('/investor/login');
      return;
    }
    if (user?.role === 'INVESTOR') {
      fetchDashboard();
    }
  }, [user, isLoading]);

  const handleUnsave = async (startupId: string) => {
    try {
      await api.unsaveStartup(startupId);
      setSavedStartups((prev) => prev.filter((s) => s.id !== startupId));
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleConfirmCommitment = async (interestId: string) => {
    try {
      await api.commitInterest(interestId);
      alert('Commitment confirmed! Deal marked as committed.');
      fetchDashboard();
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Loading investor command center...</p>
      </div>
    );
  }

  const investor = dashboard?.investor;
  const stats = dashboard?.stats || {};
  const filteredInterests = interests.filter((i) =>
    pipelineFilter === 'ALL' ? true : i.status === pipelineFilter
  );

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* ── Top Bar ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {investor?.displayName}
                </h1>
                <StatusBadge status={investor?.verificationStatus} />
                {investor?.sebiRegistration && <VerifiedBadge type="SEBI_REGISTERED" size="sm" />}
              </div>
              <p className="text-sm text-slate-500 font-medium">
                {investor?.firmName || investor?.type} • Ticket Range: {formatINR(investor?.ticketSizeMin)} - {formatINR(investor?.ticketSizeMax)}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/startups"
                className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <TrendingUp className="w-4 h-4" /> Discover Startups
              </Link>
              <Link
                href="/chat"
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4" /> Deal Rooms
              </Link>
            </div>
          </div>
        </div>

        {/* ── Metric Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Capital Committed</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {formatINR(stats.totalDeployed)}
            </div>
            <span className="text-[11px] text-emerald-600 font-bold mt-1 block">
              {stats.committedDeals || 0} Deals Closed
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Dealflow</span>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
              {stats.totalInterests || 0}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {stats.acceptedInterests || 0} In Due Diligence
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Shortlisted Startups</span>
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
              {savedStartups.length}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Bookmarked deals</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Founder Rating</span>
            <div className="text-2xl font-black text-amber-500 mt-1 flex items-center gap-1">
              <Star className="w-5 h-5 fill-current" />
              {stats.averageRating ? stats.averageRating.toFixed(1) : '5.0'}★
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {stats.totalReviews || 0} Verified Reviews
            </span>
          </div>
        </div>

        {/* ── Deal Pipeline Stages ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Active Deal Flow Pipeline ({filteredInterests.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Track status transitions from initial interest to diligence & closing.
              </p>
            </div>

            {/* Filter pills */}
            <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
              {(['ALL', 'EXPRESSED', 'ACCEPTED', 'COMMITTED'] as const).map((stage) => (
                <button
                  key={stage}
                  onClick={() => setPipelineFilter(stage)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    pipelineFilter === stage
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {stage}
                </button>
              ))}
            </div>
          </div>

          {filteredInterests.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <Building2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600">No deals in this stage</p>
              <Link href="/startups" className="text-xs text-blue-600 font-bold mt-1 inline-block">
                Browse startups to express interest →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInterests.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/startups/${item.startupId}`}
                        className="font-bold text-slate-900 dark:text-white text-base hover:text-blue-600"
                      >
                        {item.startup?.companyName}
                      </Link>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.status === 'COMMITTED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'ACCEPTED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                      Cheque Size: <span className="text-blue-600">{formatINR(item.ticketAmount)}</span>
                    </div>

                    {item.message && (
                      <p className="text-xs text-slate-500 italic">
                        "{item.message}"
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {item.status === 'ACCEPTED' && !item.investorConfirmed && (
                      <button
                        onClick={() => handleConfirmCommitment(item.id)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                      >
                        Confirm Deal Commitment
                      </button>
                    )}

                    <Link
                      href="/chat"
                      className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Open Deal Room
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Saved / Bookmarked Startups ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-purple-600" />
              Saved Startups ({savedStartups.length})
            </h2>
            <Link
              href="/startups"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Explore more deals <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {savedStartups.length === 0 ? (
            <p className="text-sm text-slate-400 py-4">
              You haven't bookmarked any startups yet. Click "Save" on any startup card to review later.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedStartups.map((s) => (
                <div
                  key={s.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {s.companyName}
                      </span>
                      <button
                        onClick={() => handleUnsave(s.id)}
                        className="text-slate-400 hover:text-red-500"
                        title="Remove bookmark"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">{s.tagline}</p>
                    <div className="mt-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                      MRR: {formatINR(s.mrr)} • Ask: {formatINR(s.fundingAsk)}
                    </div>
                  </div>

                  <div className="mt-4 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex justify-between items-center text-xs">
                    <span className="text-emerald-600 font-semibold">{formatGrowth(s.growthRateMom)} MoM</span>
                    <Link
                      href={`/startups/${s.id}`}
                      className="font-bold text-blue-600 hover:text-blue-700"
                    >
                      View Pitch →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
