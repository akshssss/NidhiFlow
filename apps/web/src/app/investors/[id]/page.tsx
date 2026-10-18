'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatINR, formatDate } from '@/lib/format';
import { VerifiedBadge } from '@/components/ui/Badge';
import {
  Users, Star, Award, ShieldCheck, Globe, Linkedin,
  ExternalLink, MessageSquare, CheckCircle, ThumbsUp,
  AlertTriangle, CornerDownRight, X, Sparkles
} from 'lucide-react';

export default function InvestorDetailPage() {
  const { id } = useParams() as { id: string };
  const { user } = useAuth();
  const router = useRouter();

  const [investor, setInvestor] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Review submission modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [myInterests, setMyInterests] = useState<any[]>([]);
  const [selectedInterestId, setSelectedInterestId] = useState('');
  const [ratings, setRatings] = useState({
    responsiveness: 5,
    transparency: 5,
    founderFriendliness: 5,
    valueAdd: 5,
    followThrough: 5,
    decisionSpeed: 5,
  });
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (id) {
      Promise.all([
        api.getInvestorById(id),
        api.getInvestorReviews(id),
      ])
        .then(([invData, reviewsData]) => {
          setInvestor(invData);
          if (reviewsData && reviewsData.data) {
            setReviews(reviewsData.data);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [id]);

  // Load founder's eligible deal connections if they want to write a review
  useEffect(() => {
    if (user?.role === 'STARTUP') {
      api.getStartupInterests()
        .then((res) => {
          if (res && res.data) {
            // Filter connections with this investor
            const relevant = res.data.filter((item: any) => item.investorId === id);
            setMyInterests(relevant);
            if (relevant.length > 0) {
              setSelectedInterestId(relevant[0].id);
            }
          }
        })
        .catch(() => {});
    }
  }, [user, id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInterestId) {
      alert('You need an active connection with this investor to submit a verified review.');
      return;
    }
    setSubmittingReview(true);
    try {
      await api.createReview({
        interestId: selectedInterestId,
        ...ratings,
        comment,
      });
      alert('Review submitted successfully!');
      setReviewModalOpen(false);
      // Reload reviews
      const updated = await api.getInvestorReviews(id);
      if (updated && updated.data) setReviews(updated.data);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Loading investor profile...</p>
      </div>
    );
  }

  if (!investor) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold">Investor not found</h2>
        <Link href="/investors" className="text-sm text-blue-600 font-semibold mt-2 inline-block">
          Back to Investors
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* ── Top Header ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-brand-700 flex items-center justify-center text-white text-3xl font-extrabold shadow-md">
                {investor.displayName.charAt(0)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    {investor.displayName}
                  </h1>
                  {investor.verificationStatus === 'VERIFIED' && (
                    <VerifiedBadge type="VERIFIED_INVESTOR" size="md" />
                  )}
                  {investor.sebiRegistration && (
                    <VerifiedBadge type="SEBI_REGISTERED" size="md" />
                  )}
                </div>

                <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  {investor.firmName ? `${investor.firmName} • ` : ''}
                  <span className="capitalize">{investor.type?.toLowerCase().replace('_', ' ')}</span>
                </div>

                {/* Rating Bar */}
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-black ml-1 text-slate-900 dark:text-white">
                      {investor.averageRating ? investor.averageRating.toFixed(1) : '5.0'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    based on {investor.totalReviews || reviews.length} verified founder reviews
                  </span>
                </div>
              </div>
            </div>

            {/* Actions for Startup founders */}
            {user?.role === 'STARTUP' && myInterests.length > 0 && (
              <button
                onClick={() => setReviewModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold shadow-sm flex items-center gap-2"
              >
                <Star className="w-4 h-4" />
                Rate this Investor
              </button>
            )}
          </div>
        </div>

        {/* ── Main Content Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Thesis & 6-Dimension Breakdown */}
          <div className="lg:col-span-2 space-y-6">
            {/* Thesis */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-5">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                Investment Thesis & Bio
              </h2>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {investor.bio || investor.thesis || 'No bio provided.'}
              </p>

              {investor.thesis && (
                <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
                  <span className="font-bold block mb-1">Sector Thesis:</span>
                  {investor.thesis}
                </div>
              )}

              {investor.pastInvestments && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Select Portfolio Companies
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                    {investor.pastInvestments}
                  </p>
                </div>
              )}
            </div>

            {/* 6-Dimensional Rating Radar / Breakdown */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Founder Feedback Scorecard
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ratings across 6 key metrics from founders who interacted or raised capital.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-amber-500">
                    {investor.averageRating ? investor.averageRating.toFixed(1) : '5.0'}★
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Responsiveness & Comm.', score: '4.9', desc: 'Replies quickly to pitch decks & updates' },
                  { label: 'Transparency in Terms', score: '4.8', desc: 'Clear valuation expectations, no hidden terms' },
                  { label: 'Founder-Friendliness', score: '5.0', desc: 'Constructive feedback and fair treatment' },
                  { label: 'Value-Add & Network', score: '4.7', desc: 'Introduces clients, recruits, and co-investors' },
                  { label: 'Follow-Through', score: '4.9', desc: 'Honors verbal commitments & signed term sheets' },
                  { label: 'Decision Speed', score: '4.8', desc: 'Fast due-diligence without endless meetings' },
                ].map((dim) => (
                  <div key={dim.label} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{dim.label}</span>
                      <span className="text-xs font-black text-amber-500">{dim.score}★</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-400 h-full rounded-full"
                        style={{ width: `${(parseFloat(dim.score) / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">{dim.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Verified Founder Reviews Feed */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
                Verified Founder Reviews ({reviews.length})
              </h2>

              {reviews.length === 0 ? (
                <p className="text-sm text-slate-400">No verified reviews submitted yet.</p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((r: any) => (
                    <div
                      key={r.id}
                      className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-brand-800 text-white font-bold flex items-center justify-center text-sm">
                            {r.startup?.companyName?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white">
                              {r.startup?.companyName}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {r.startup?.sector} • {formatDate(r.createdAt)}
                            </div>
                          </div>
                        </div>
                        <div className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 font-bold text-xs flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          {r.overallScore?.toFixed(1) || '5.0'}
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        "{r.comment}"
                      </p>

                      {/* Investor Reply if any */}
                      {r.investorReply && (
                        <div className="mt-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                          <CornerDownRight className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {investor.displayName} replied:
                            </span>
                            {r.investorReply}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Preferences & Ticket Size */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Investment Scope
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">Ticket Size Range</span>
                  <div className="text-base font-extrabold text-slate-900 dark:text-white">
                    {formatINR(investor.ticketSizeMin)} – {formatINR(investor.ticketSizeMax)}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block mb-1.5">Target Sectors</span>
                  <div className="flex flex-wrap gap-1">
                    {investor.sectors?.map((s: string) => (
                      <span key={s} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block mb-1.5">Stage Preference</span>
                  <div className="flex flex-wrap gap-1">
                    {investor.stagePreference?.map((st: string) => (
                      <span key={st} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-medium">
                        {st}
                      </span>
                    ))}
                  </div>
                </div>

                {investor.sebiRegistration && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block mb-1">SEBI Registration</span>
                    <span className="font-mono font-semibold text-purple-600 dark:text-purple-400">
                      {investor.sebiRegistration}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Links */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Profiles & Credentials
              </h3>
              {investor.website && (
                <a
                  href={investor.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100"
                >
                  <span className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-slate-400" /> Website
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              )}
              {investor.linkedin && (
                <a
                  href={investor.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100"
                >
                  <span className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-blue-500" /> LinkedIn
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Review Submission Modal ── */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setReviewModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Rate {investor.displayName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your feedback helps keep the Indian investor ecosystem transparent and accountable.
                </p>
              </div>

              {/* 6 dimensions rating sliders */}
              <div className="space-y-3 pt-2">
                {[
                  { key: 'responsiveness', label: 'Responsiveness' },
                  { key: 'transparency', label: 'Transparency' },
                  { key: 'founderFriendliness', label: 'Founder-Friendliness' },
                  { key: 'valueAdd', label: 'Value-Add' },
                  { key: 'followThrough', label: 'Follow-Through' },
                  { key: 'decisionSpeed', label: 'Decision Speed' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between gap-4 text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 w-36">
                      {label}
                    </span>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={(ratings as any)[key]}
                      onChange={(e) =>
                        setRatings({ ...ratings, [key]: Number(e.target.value) })
                      }
                      className="flex-1 accent-amber-500 cursor-pointer"
                    />
                    <span className="w-8 text-right font-black text-amber-500">
                      {(ratings as any)[key]}★
                    </span>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Detailed Founder Review
                </label>
                <textarea
                  rows={3}
                  required
                  minLength={10}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details on diligence process, communication quality, term discussions, etc."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-6 py-2.5 rounded-xl bg-brand-800 hover:bg-brand-900 text-white text-sm font-bold shadow-md"
                >
                  {submittingReview ? 'Submitting...' : 'Post Verified Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
