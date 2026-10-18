'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatINR, formatGrowth, formatDate } from '@/lib/format';
import { VerifiedBadge, StatusBadge } from '@/components/ui/Badge';
import {
  Building2, TrendingUp, Users, DollarSign, ShieldCheck,
  CheckCircle, Clock, AlertCircle, MessageSquare, Send,
  Plus, Edit, ExternalLink, X, ArrowUpRight, Sparkles, Bot
} from 'lucide-react';
import { TinyFishAutoEnrichModal } from '@/components/tinyfish/TinyFishAutoEnrichModal';

export default function StartupDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Post update modal state
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateContent, setUpdateContent] = useState('');
  const [postingUpdate, setPostingUpdate] = useState(false);

  // Verification modal state
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [cin, setCin] = useState('');
  const [pan, setPan] = useState('');
  const [dpiit, setDpiit] = useState('');
  const [gstin, setGstin] = useState('');
  const [submittingVerify, setSubmittingVerify] = useState(false);

  // TinyFish Auto-Enrichment modal state
  const [enrichModalOpen, setEnrichModalOpen] = useState(false);

  const handleApplyEnrichment = async (enriched: any) => {
    try {
      await api.updateMyStartup({
        tagline: enriched.tagline,
        description: enriched.description,
        targetMarket: enriched.targetMarket,
        businessModel: enriched.businessModel,
        problemStatement: enriched.problemStatement,
        solution: enriched.solution,
      });
      alert('Startup profile successfully auto-enriched using TinyFish Web Agent intelligence!');
      fetchDashboard();
    } catch (err: any) {
      alert(err.message || 'Failed to apply auto-enrichment');
    }
  };

  const fetchDashboard = async () => {
    try {
      const data = await api.getMyStartupDashboard();
      setDashboard(data);
      if (data?.startup) {
        setCin(data.startup.cin || '');
        setPan(data.startup.companyPan || '');
        setDpiit(data.startup.dpiitNumber || '');
        setGstin(data.startup.gstin || '');
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'STARTUP')) {
      router.push('/startup/login');
      return;
    }
    if (user?.role === 'STARTUP') {
      fetchDashboard();
    }
  }, [user, isLoading]);

  const handlePostUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostingUpdate(true);
    try {
      await api.postStartupUpdate({ title: updateTitle, content: updateContent, isPublic: true });
      setUpdateModalOpen(false);
      setUpdateTitle('');
      setUpdateContent('');
      fetchDashboard();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setPostingUpdate(false);
    }
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingVerify(true);
    try {
      await api.submitStartupVerification({
        cin: cin || undefined,
        companyPan: pan || undefined,
        dpiitNumber: dpiit || undefined,
        gstin: gstin || undefined,
      });
      alert('Verification submitted successfully! Our compliance team will audit it shortly.');
      setVerifyModalOpen(false);
      fetchDashboard();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSubmittingVerify(false);
    }
  };

  const handleAcceptInterest = async (id: string) => {
    try {
      await api.acceptInterest(id);
      fetchDashboard();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDeclineInterest = async (id: string) => {
    try {
      await api.declineInterest(id);
      fetchDashboard();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleCommitDeal = async (id: string) => {
    try {
      await api.commitInterest(id);
      alert('Deal commitment confirmed! This updates your total committed deal score.');
      fetchDashboard();
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Loading founder workspace...</p>
      </div>
    );
  }

  const startup = dashboard?.startup;
  const stats = dashboard?.stats || {};
  const recentInterests = dashboard?.recentInterests || [];

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* ── Top Bar ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {startup?.companyName}
                </h1>
                <StatusBadge status={startup?.verificationStatus} />
                {startup?.dpiitNumber && <VerifiedBadge type="DPIIT_RECOGNISED" size="sm" />}
              </div>
              <p className="text-sm text-slate-500 font-medium">
                {startup?.tagline} • {startup?.sector} • {startup?.stage}
              </p>

              {/* Profile completeness progress */}
              <div className="mt-4 flex items-center gap-3 max-w-md">
                <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-600 h-full rounded-full transition-all"
                    style={{ width: `${startup?.profileCompleteness || 60}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  {startup?.profileCompleteness || 60}% Profile Completed
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/startups/${startup?.id}`}
                target="_blank"
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Public Pitch
              </Link>
              <button
                onClick={() => setEnrichModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-indigo-600/20 transition-all hover:scale-[1.02]"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-200" /> Auto-Enrich with TinyFish
              </button>
              <button
                onClick={() => setVerifyModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <ShieldCheck className="w-4 h-4" />
                {startup?.verificationStatus === 'VERIFIED' ? 'Update KYC' : 'Verify Startup'}
              </button>
              <button
                onClick={() => setUpdateModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Post Monthly Traction
              </button>
            </div>
          </div>
        </div>

        {/* ── KPI Metric Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Monthly Revenue</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {formatINR(startup?.mrr)}
              <span className="text-xs text-slate-400 font-normal">/mo</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-bold mt-1 block">
              {formatGrowth(startup?.growthRateMom)} MoM
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Users</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {startup?.totalUsers?.toLocaleString('en-IN') || 0}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Active customers</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Round Funding Ask</span>
            <div className="text-2xl font-black text-brand-700 dark:text-brand-400 mt-1">
              {formatINR(startup?.fundingAsk)}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {startup?.equityOffered ? `${startup?.equityOffered}% equity` : 'SAFE / Convertible'}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Committed Capital</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {formatINR(stats.totalCommitted)}
            </div>
            <span className="text-[11px] text-emerald-600 font-bold mt-1 block">
              {stats.fundingProgress ? `${stats.fundingProgress.toFixed(0)}% of round` : '0% of round'}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Leaderboard Rank</span>
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
              #{stats.leaderboardRank || '—'}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Score: {stats.leaderboardScore || 0}/100
            </span>
          </div>
        </div>

        {/* ── Deal Flow / Incoming Investor Interests ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-600" />
                Investor Deal Pipeline ({recentInterests.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Investors who reviewed your profile and expressed interest in writing a cheque.
              </p>
            </div>
            <Link
              href="/chat"
              className="px-3.5 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-xs font-bold text-brand-700 flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Open Deal Rooms
            </Link>
          </div>

          {recentInterests.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <DollarSign className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                No active interests yet
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Post monthly updates and get verified to rise to the top of investor discovery!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentInterests.map((interest: any) => (
                <div
                  key={interest.id}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-base">
                        {interest.investor?.displayName}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700">
                        {interest.investor?.firmName || interest.investor?.type}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        interest.status === 'COMMITTED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : interest.status === 'ACCEPTED'
                          ? 'bg-brand-100 text-brand-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {interest.status}
                      </span>
                    </div>

                    <div className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                      Proposed Ticket: <span className="text-brand-600">{formatINR(interest.ticketAmount)}</span>
                    </div>

                    {interest.message && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                        "{interest.message}"
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {interest.status === 'EXPRESSED' && (
                      <>
                        <button
                          onClick={() => handleAcceptInterest(interest.id)}
                          className="px-4 py-2 rounded-xl bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold shadow-sm"
                        >
                          Accept Interest
                        </button>
                        <button
                          onClick={() => handleDeclineInterest(interest.id)}
                          className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100"
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {interest.status === 'ACCEPTED' && !interest.startupConfirmed && (
                      <button
                        onClick={() => handleCommitDeal(interest.id)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                      >
                        Confirm Commitment
                      </button>
                    )}

                    <Link
                      href="/chat"
                      className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Chat
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Post Monthly Traction Update Modal ── */}
      {updateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setUpdateModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handlePostUpdate} className="space-y-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Post Monthly Traction Update
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Regular updates increase your Leaderboard Consistency Score and notify interested investors.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Update Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="E.g., October 2026: Hit ₹10L MRR, launched mobile POS v2"
                  value={updateTitle}
                  onChange={(e) => setUpdateTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Update Details (MRR, Users, Key Wins, Asks)
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Share revenue numbers, key customer logos, product updates, and what help you need from investors..."
                  value={updateContent}
                  onChange={(e) => setUpdateContent(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setUpdateModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={postingUpdate}
                  className="px-6 py-2.5 rounded-xl bg-brand-800 hover:bg-brand-900 text-white text-sm font-bold shadow-md"
                >
                  {postingUpdate ? 'Publishing...' : 'Publish Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Statutory KYC Verification Modal ── */}
      {verifyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setVerifyModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleSubmitVerification} className="space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-500" />
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    Statutory Verification Submission
                  </h3>
                  <p className="text-xs text-slate-500">
                    Verify company registration with MCA & DPIIT for the Verified Badge.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Corporate Identification Number (CIN)
                </label>
                <input
                  type="text"
                  placeholder="U72200MH2022PTC384521"
                  value={cin}
                  onChange={(e) => setCin(e.target.value.toUpperCase())}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Company PAN
                </label>
                <input
                  type="text"
                  placeholder="AABCK1234F"
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase())}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  DPIIT Recognition Number
                </label>
                <input
                  type="text"
                  placeholder="DIPP12345"
                  value={dpiit}
                  onChange={(e) => setDpiit(e.target.value.toUpperCase())}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  GSTIN
                </label>
                <input
                  type="text"
                  placeholder="27AABCK1234F1Z5"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setVerifyModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingVerify}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md"
                >
                  {submittingVerify ? 'Submitting...' : 'Submit to Compliance Audit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── TinyFish Auto-Enrichment Modal ── */}
      <TinyFishAutoEnrichModal
        isOpen={enrichModalOpen}
        onClose={() => setEnrichModalOpen(false)}
        currentWebsite={startup?.website || ''}
        onApplyEnrichment={handleApplyEnrichment}
      />
    </div>
  );
}
