'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatINR, formatGrowth, formatDate } from '@/lib/format';
import { VerifiedBadge, StatusBadge } from '@/components/ui/Badge';
import {
  Building2, MapPin, Globe, Linkedin, ShieldCheck, TrendingUp,
  Users, DollarSign, Calendar, Bookmark, MessageSquare, CheckCircle,
  FileText, ExternalLink, X, Send, Sparkles, AlertCircle
} from 'lucide-react';

export default function StartupDetailPage() {
  const { id } = useParams() as { id: string };
  const { user } = useAuth();
  const router = useRouter();

  const [startup, setStartup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Express interest modal state
  const [interestModalOpen, setInterestModalOpen] = useState(false);
  const [ticketLakhs, setTicketLakhs] = useState(25);
  const [message, setMessage] = useState('');
  const [submittingInterest, setSubmittingInterest] = useState(false);
  const [interestSuccess, setInterestSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      api.getStartupById(id)
        .then((data) => setStartup(data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleToggleSave = async () => {
    if (!user || user.role !== 'INVESTOR') {
      router.push('/investor/login');
      return;
    }
    setSaving(true);
    try {
      if (isSaved) {
        await api.unsaveStartup(id);
        setIsSaved(false);
      } else {
        await api.saveStartup(id);
        setIsSaved(true);
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleExpressInterest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.role !== 'INVESTOR') {
      router.push('/investor/login');
      return;
    }

    setSubmittingInterest(true);
    try {
      const ticketPaise = ticketLakhs * 100000 * 100; // Lakhs to paise
      const res = await api.expressInterest({
        startupId: id,
        ticketAmount: ticketPaise,
        message,
      });
      setInterestSuccess(true);
      setTimeout(() => {
        setInterestModalOpen(false);
        setInterestSuccess(false);
        router.push('/chat');
      }, 1500);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSubmittingInterest(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Loading startup details...</p>
      </div>
    );
  }

  if (!startup) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold">Startup not found</h2>
        <Link href="/startups" className="text-sm text-brand-600 font-semibold mt-2 inline-block">
          Back to Startups
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* ── Top Header Card ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-brand-800 via-brand-600 to-indigo-500 flex items-center justify-center text-white text-3xl font-extrabold shadow-md">
                {startup.companyName.charAt(0)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    {startup.companyName}
                  </h1>
                  {startup.verificationStatus === 'VERIFIED' && (
                    <VerifiedBadge type="VERIFIED_STARTUP" size="md" />
                  )}
                  {startup.dpiitNumber && (
                    <VerifiedBadge type="DPIIT_RECOGNISED" size="md" />
                  )}
                </div>

                <p className="text-base text-slate-600 dark:text-slate-300 font-medium">
                  {startup.tagline}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-3">
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-300">
                    {startup.sector}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-300">
                    {startup.stage}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {startup.city}, {startup.state}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Founded {startup.foundedYear}
                  </span>
                  {startup.teamSize && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {startup.teamSize} team members
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 md:self-start">
              {user?.role === 'INVESTOR' ? (
                <>
                  <button
                    onClick={handleToggleSave}
                    disabled={saving}
                    className={`px-4 py-2.5 rounded-xl border text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                      isSaved
                        ? 'border-brand-600 text-brand-600 bg-brand-50'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Bookmark className="w-4 h-4" />
                    {isSaved ? 'Saved' : 'Save'}
                  </button>
                  <button
                    onClick={() => setInterestModalOpen(true)}
                    className="px-6 py-2.5 rounded-xl bg-brand-800 hover:bg-brand-900 text-white text-sm font-bold shadow-md shadow-brand-900/20 flex items-center gap-2 transition-all hover:scale-[1.02]"
                  >
                    <Send className="w-4 h-4" />
                    Express Interest
                  </button>
                </>
              ) : (
                <button
                  onClick={() => router.push('/investor/login')}
                  className="px-6 py-2.5 rounded-xl bg-brand-800 hover:bg-brand-900 text-white text-sm font-bold shadow-md flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Sign In as Investor to Connect
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Metric Highlights Grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Monthly Revenue</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {formatINR(startup.mrr)}
              <span className="text-xs text-slate-400 font-normal">/mo</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">MoM Growth Rate</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-5 h-5" />
              {formatGrowth(startup.growthRateMom)}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Users</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {startup.totalUsers?.toLocaleString('en-IN') || 0}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Funding Ask</span>
            <div className="text-2xl font-black text-brand-700 dark:text-brand-400 mt-1">
              {formatINR(startup.fundingAsk)}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Equity Offered</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {startup.equityOffered ? `${startup.equityOffered}%` : 'Flexible'}
            </div>
          </div>
        </div>

        {/* ── Two Columns Content: Details & Statutory ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-600" />
                Company Overview
              </h2>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {startup.description || 'No description provided.'}
              </p>

              {startup.problemStatement && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                    The Problem
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    {startup.problemStatement}
                  </p>
                </div>
              )}

              {startup.solution && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                    Our Solution
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    {startup.solution}
                  </p>
                </div>
              )}

              {startup.targetMarket && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                    Target Market & Business Model
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    {startup.targetMarket}
                  </p>
                </div>
              )}
            </div>

            {/* Traction Updates Feed */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                Monthly Traction Updates ({startup.updates?.length || 0})
              </h2>

              {!startup.updates || startup.updates.length === 0 ? (
                <p className="text-sm text-slate-400">No public updates posted yet.</p>
              ) : (
                <div className="space-y-4">
                  {startup.updates.map((u: any) => (
                    <div
                      key={u.id}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{u.title}</span>
                        <span className="text-xs text-slate-400">{formatDate(u.createdAt)}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                        {u.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: Statutory Verification Audit & Links */}
          <div className="space-y-6">
            {/* Statutory Audit Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Statutory Verification Audit
                </h3>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Status</span>
                  <StatusBadge status={startup.verificationStatus} />
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">MCA CIN / LLPIN</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-slate-200">
                    {startup.cin || startup.llpin || 'Verified'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Company PAN</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-slate-200">
                    {startup.companyPan || 'Verified'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">DPIIT Recognition</span>
                  <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                    {startup.dpiitNumber || 'Not applied'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">GSTIN</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-slate-200">
                    {startup.gstin || 'State Registered'}
                  </span>
                </div>

                {startup.verifiedAt && (
                  <div className="flex items-center justify-between py-1 text-slate-400">
                    <span>Verified On</span>
                    <span>{formatDate(startup.verifiedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Links & Founder Background */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Links & Pitch Deck
              </h3>

              <div className="space-y-2">
                {startup.website && (
                  <a
                    href={startup.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 text-xs text-slate-700 dark:text-slate-200 font-medium transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-slate-400" /> Official Website
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                )}
                {startup.linkedin && (
                  <a
                    href={startup.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 text-xs text-slate-700 dark:text-slate-200 font-medium transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Linkedin className="w-4 h-4 text-blue-500" /> LinkedIn Profile
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                )}
                <div className="p-3 rounded-xl bg-brand-50/60 dark:bg-brand-950/40 border border-brand-200/60 dark:border-brand-800/60 flex items-center justify-between text-xs text-brand-900 dark:text-brand-200">
                  <span className="flex items-center gap-2 font-medium">
                    <FileText className="w-4 h-4 text-brand-600" /> Verified Pitch Deck
                  </span>
                  <span className="font-semibold text-brand-600">Attached (PDF)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Express Interest Modal ── */}
      {interestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setInterestModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            {interestSuccess ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Interest Expressed!</h3>
                <p className="text-sm text-slate-500">
                  A private deal room has been created with {startup.companyName}. Redirecting to chat...
                </p>
              </div>
            ) : (
              <form onSubmit={handleExpressInterest} className="space-y-5">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    Express Investment Interest
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Connect directly with the founder of <span className="font-bold">{startup.companyName}</span> inside a private deal room.
                  </p>
                </div>

                {/* Ticket size slider */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-2">
                    Proposed Ticket Size: <span className="text-brand-600 text-sm font-extrabold">₹{ticketLakhs} Lakh</span>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="500"
                    step="5"
                    value={ticketLakhs}
                    onChange={(e) => setTicketLakhs(Number(e.target.value))}
                    className="w-full accent-brand-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>₹5L</span>
                    <span>₹50L</span>
                    <span>₹1 Cr</span>
                    <span>₹2.5 Cr</span>
                    <span>₹5 Cr</span>
                  </div>
                </div>

                {/* Intro message */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                    Introductory Note / Investment Thesis
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="E.g., We lead seed rounds in B2B marketplaces. Impressed by your MoM unit economics and would like to review the cap table and round details."
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setInterestModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingInterest}
                    className="px-6 py-2.5 rounded-xl bg-brand-800 hover:bg-brand-900 text-white text-sm font-bold shadow-md flex items-center gap-2"
                  >
                    {submittingInterest ? 'Transmitting...' : 'Send to Founders'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
