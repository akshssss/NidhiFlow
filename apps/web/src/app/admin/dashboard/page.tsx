'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatINR, formatDate } from '@/lib/format';
import { StatusBadge, VerifiedBadge } from '@/components/ui/Badge';
import {
  Shield, Users, Building2, CheckCircle2, XCircle, AlertCircle,
  RefreshCw, Search, FileText, Ban, Check, ArrowRight, X
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<'verification' | 'users' | 'reviews' | 'audit'>('verification');
  const [stats, setStats] = useState<any>(null);
  const [verificationQueue, setVerificationQueue] = useState<{ startups: any[]; investors: any[] }>({
    startups: [],
    investors: [],
  });
  const [usersList, setUsersList] = useState<any[]>([]);
  const [reportedReviews, setReportedReviews] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recomputing, setRecomputing] = useState(false);

  // Review modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<{ type: 'startup' | 'investor'; item: any } | null>(null);
  const [reviewAction, setReviewAction] = useState<'VERIFIED' | 'REJECTED'>('VERIFIED');
  const [reviewNote, setReviewNote] = useState('');

  const loadData = async () => {
    try {
      const [statsData, queueData, usersData, reviewsData, logsData] = await Promise.all([
        api.getAdminDashboard(),
        api.getVerificationQueue(),
        api.getAdminUsers({ pageSize: 50 }),
        api.getReportedReviews(),
        api.getAuditLogs(),
      ]);
      setStats(statsData);
      if (queueData) setVerificationQueue(queueData);
      if (usersData?.data) setUsersList(usersData.data);
      if (reviewsData?.data) setReportedReviews(reviewsData.data);
      if (logsData?.data) setAuditLogs(logsData.data);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/admin/login');
      return;
    }
    if (user?.role === 'ADMIN') {
      loadData();
    }
  }, [user, isLoading]);

  const handleRecomputeLeaderboard = async () => {
    setRecomputing(true);
    try {
      const res = await api.recomputeLeaderboard();
      alert(`Leaderboard scores successfully recalculated for ${res.updatedStartups} startups!`);
      loadData();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setRecomputing(false);
    }
  };

  const handleOpenReviewModal = (type: 'startup' | 'investor', item: any, action: 'VERIFIED' | 'REJECTED') => {
    setReviewTarget({ type, item });
    setReviewAction(action);
    setReviewNote(action === 'VERIFIED' ? 'Statutory documents verified against MCA/DPIIT registries.' : 'CIN/PAN details could not be authenticated with MCA records.');
    setReviewModalOpen(true);
  };

  const handleSubmitReviewDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTarget) return;

    try {
      if (reviewTarget.type === 'startup') {
        await api.reviewStartupVerification(reviewTarget.item.id, {
          status: reviewAction,
          note: reviewNote,
        });
      } else {
        await api.reviewInvestorVerification(reviewTarget.item.id, {
          status: reviewAction,
          note: reviewNote,
        });
      }
      setReviewModalOpen(false);
      loadData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleToggleUser = async (userId: string, currentStatus: boolean) => {
    try {
      await api.toggleUserStatus(userId, !currentStatus);
      loadData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleModerateReview = async (reviewId: string, isHidden: boolean) => {
    try {
      await api.moderateReview(reviewId, isHidden);
      loadData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Loading admin operations panel...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-950 text-white min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* ── Top Bar ── */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-6 h-6 text-purple-400" />
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Compliance & Moderation Center
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Statutory verification queue, fraud prevention, review moderation & rank calculation
            </p>
          </div>

          <button
            onClick={handleRecomputeLeaderboard}
            disabled={recomputing}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/25 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${recomputing ? 'animate-spin' : ''}`} />
            {recomputing ? 'Recalculating...' : 'Recompute Leaderboard Rankings'}
          </button>
        </div>

        {/* ── Platform KPI Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Users</span>
            <div className="text-2xl font-black mt-1">{stats?.totalUsers || 0}</div>
            <span className="text-[11px] text-slate-500 block mt-1">Platform Accounts</span>
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Startups</span>
            <div className="text-2xl font-black text-brand-400 mt-1">{stats?.totalStartups || 0}</div>
            <span className="text-[11px] text-slate-500 block mt-1">Pitch Decks Live</span>
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Investors</span>
            <div className="text-2xl font-black text-blue-400 mt-1">{stats?.totalInvestors || 0}</div>
            <span className="text-[11px] text-slate-500 block mt-1">Angels, VCs, Syndicates</span>
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Capital Committed</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {formatINR(stats?.dealFlow?.totalCommittedValue)}
            </div>
            <span className="text-[11px] text-emerald-500 block mt-1">
              {stats?.dealFlow?.committedCount || 0} Deals Finalized
            </span>
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending Audits</span>
            <div className="text-2xl font-black text-amber-400 mt-1">
              {stats?.pendingVerifications?.total || 0}
            </div>
            <span className="text-[11px] text-amber-500 block mt-1">Awaiting Review</span>
          </div>
        </div>

        {/* ── Navigation Tabs ── */}
        <div className="flex p-1 rounded-xl bg-slate-900 border border-slate-800 w-fit text-xs font-bold">
          <button
            onClick={() => setTab('verification')}
            className={`px-4 py-2 rounded-lg transition-all ${
              tab === 'verification' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Verification Queue ({verificationQueue.startups.length + verificationQueue.investors.length})
          </button>
          <button
            onClick={() => setTab('users')}
            className={`px-4 py-2 rounded-lg transition-all ${
              tab === 'users' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            User Moderation ({usersList.length})
          </button>
          <button
            onClick={() => setTab('reviews')}
            className={`px-4 py-2 rounded-lg transition-all ${
              tab === 'reviews' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Reported Reviews ({reportedReviews.length})
          </button>
          <button
            onClick={() => setTab('audit')}
            className={`px-4 py-2 rounded-lg transition-all ${
              tab === 'audit' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Audit Logs ({auditLogs.length})
          </button>
        </div>

        {/* ── TAB 1: VERIFICATION QUEUE ── */}
        {tab === 'verification' && (
          <div className="space-y-6">
            {/* Startups Sub-queue */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                Startup Verification Submissions ({verificationQueue.startups.length})
              </h2>

              {verificationQueue.startups.length === 0 ? (
                <p className="text-sm text-slate-500 py-4">No pending startup verifications in queue.</p>
              ) : (
                <div className="space-y-3">
                  {verificationQueue.startups.map((s) => (
                    <div
                      key={s.id}
                      className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base text-white">{s.companyName}</span>
                          <StatusBadge status={s.verificationStatus} />
                          {s.dpiitNumber && <VerifiedBadge type="DPIIT_RECOGNISED" size="sm" />}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          CIN: <span className="text-slate-200">{s.cin || 'N/A'}</span> •
                          PAN: <span className="text-slate-200">{s.companyPan || 'N/A'}</span> •
                          DPIIT: <span className="text-amber-400">{s.dpiitNumber || 'N/A'}</span> •
                          GSTIN: <span className="text-slate-200">{s.gstin || 'N/A'}</span>
                        </div>
                        <div className="text-xs text-slate-500">
                          Founder: {s.user?.name} ({s.user?.email}) • Submitted: {formatDate(s.updatedAt)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenReviewModal('startup', s, 'VERIFIED')}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Approve & Issue Badge
                        </button>
                        <button
                          onClick={() => handleOpenReviewModal('startup', s, 'REJECTED')}
                          className="px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 text-xs font-bold flex items-center gap-1"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Investors Sub-queue */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Investor Credential Submissions ({verificationQueue.investors.length})
              </h2>

              {verificationQueue.investors.length === 0 ? (
                <p className="text-sm text-slate-500 py-4">No pending investor verifications in queue.</p>
              ) : (
                <div className="space-y-3">
                  {verificationQueue.investors.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base text-white">{inv.displayName}</span>
                          <span className="text-xs text-blue-400 font-semibold">({inv.type})</span>
                          <StatusBadge status={inv.verificationStatus} />
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          PAN: <span className="text-slate-200">{inv.pan || 'N/A'}</span> •
                          SEBI Reg: <span className="text-purple-400">{inv.sebiRegistration || 'N/A'}</span>
                        </div>
                        <div className="text-xs text-slate-500">
                          User: {inv.user?.name} ({inv.user?.email})
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenReviewModal('investor', inv, 'VERIFIED')}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Approve
                        </button>
                        <button
                          onClick={() => handleOpenReviewModal('investor', inv, 'REJECTED')}
                          className="px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 text-xs font-bold flex items-center gap-1"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 2: USER MANAGEMENT ── */}
        {tab === 'users' && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950 text-xs uppercase font-bold text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Name & Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Entity</th>
                    <th className="py-3 px-4">Verification</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium text-xs">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/40">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{u.name}</div>
                        <div className="text-slate-400 font-mono text-[11px]">{u.email}</div>
                      </td>
                      <td className="py-3.5 px-4 font-bold">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          u.role === 'STARTUP' ? 'bg-emerald-950 text-emerald-400' : u.role === 'INVESTOR' ? 'bg-blue-950 text-blue-400' : 'bg-purple-950 text-purple-400'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {u.startup?.companyName || u.investor?.displayName || '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        {u.startup?.verificationStatus || u.investor?.verificationStatus ? (
                          <StatusBadge status={u.startup?.verificationStatus || u.investor?.verificationStatus} />
                        ) : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.isActive ? 'bg-emerald-900/60 text-emerald-300' : 'bg-red-900/60 text-red-300'
                        }`}>
                          {u.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleToggleUser(u.id, u.isActive)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            u.isActive
                              ? 'bg-red-950 text-red-400 hover:bg-red-900 border border-red-800'
                              : 'bg-emerald-950 text-emerald-400 hover:bg-emerald-900 border border-emerald-800'
                          }`}
                        >
                          {u.isActive ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 3: REPORTED REVIEWS ── */}
        {tab === 'reviews' && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">
              Reported Founder Reviews Queue ({reportedReviews.length})
            </h2>

            {reportedReviews.length === 0 ? (
              <p className="text-sm text-slate-500 py-4">No reviews currently reported for moderation.</p>
            ) : (
              <div className="space-y-4">
                {reportedReviews.map((r) => (
                  <div key={r.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">
                        Review by {r.startup?.companyName} on {r.investor?.displayName}
                      </span>
                      <span className="text-xs text-red-400 font-semibold">Reported Reason: {r.reportReason}</span>
                    </div>
                    <p className="text-xs text-slate-300 italic">"{r.comment}"</p>
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => handleModerateReview(r.id, true)}
                        className="px-3 py-1 rounded-lg bg-red-900 hover:bg-red-800 text-white text-xs font-bold"
                      >
                        Hide Review
                      </button>
                      <button
                        onClick={() => handleModerateReview(r.id, false)}
                        className="px-3 py-1 rounded-lg border border-slate-700 text-slate-300 text-xs font-medium hover:bg-slate-800"
                      >
                        Keep Visible / Dismiss Report
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 4: AUDIT LOGS ── */}
        {tab === 'audit' && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 uppercase font-bold text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Admin / User</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Entity</th>
                    <th className="py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 text-slate-400">{formatDate(log.createdAt)}</td>
                      <td className="py-3 px-4 text-purple-400 font-semibold">
                        {log.user?.email || 'SYSTEM'}
                      </td>
                      <td className="py-3 px-4 text-emerald-400 font-bold">{log.action}</td>
                      <td className="py-3 px-4 text-slate-300">
                        {log.entityType ? `${log.entityType} (${log.entityId?.slice(0, 8)}...)` : '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                        {log.details ? JSON.stringify(log.details) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Verification Review Decision Modal ── */}
      {reviewModalOpen && reviewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 max-w-lg w-full shadow-2xl relative text-white">
            <button
              onClick={() => setReviewModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleSubmitReviewDecision} className="space-y-4">
              <div>
                <h3 className="text-xl font-black">
                  {reviewAction === 'VERIFIED' ? 'Approve Verification' : 'Reject Verification'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Entity: <span className="text-white font-bold">{reviewTarget.item.companyName || reviewTarget.item.displayName}</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Audit Notes (will be sent in notification to applicant)
                </label>
                <textarea
                  rows={3}
                  required
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold shadow-md ${
                    reviewAction === 'VERIFIED'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  Confirm {reviewAction}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
