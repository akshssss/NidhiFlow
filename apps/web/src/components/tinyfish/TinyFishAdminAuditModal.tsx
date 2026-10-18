'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { TinyFishVerificationAgentResult } from '@nidhiflow/shared';
import {
  X, Sparkles, ShieldCheck, CheckCircle2, AlertTriangle,
  Bot, Clock, ArrowRight, ExternalLink, RefreshCw
} from 'lucide-react';

interface Props {
  startupId: string;
  companyName: string;
  isOpen: boolean;
  onClose: () => void;
  onApplyRecommendation: (decision: 'VERIFIED' | 'REJECTED', note: string) => void;
}

export function TinyFishAdminAuditModal({
  startupId,
  companyName,
  isOpen,
  onClose,
  onApplyRecommendation,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<TinyFishVerificationAgentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAudit = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.runTinyFishVerificationAgent(startupId);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'TinyFish compliance agent execution failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && startupId) {
      runAudit();
    }
  }, [isOpen, startupId]);

  if (!isOpen) return null;

  const handleApply = () => {
    if (!result) return;
    const decision = result.recommendation === 'APPROVE' ? 'VERIFIED' : 'REJECTED';
    const note = `TinyFish Agent Attestation (${result.confidenceScore}% confidence): ${result.recommendation}. MCA Status: ${result.cinStatus.companyStatus}. DPIIT: ${result.dpiitStatus.verified ? 'Recognized' : 'Unverified'}.`;
    onApplyRecommendation(decision, note);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                TinyFish Autonomous Compliance Audit
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  AI Agent
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Auditing statutory filings & digital legitimacy for {companyName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {loading && (
            <div className="py-12 text-center space-y-4">
              <div className="w-12 h-12 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800 dark:text-white">
                  Executing Autonomous Web Verification...
                </p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  TinyFish is querying MCA/RoC registry records, cross-verifying DPIIT numbers, and screening for negative news.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Audit Failed</p>
                <p className="mt-0.5">{error}</p>
                <button
                  onClick={runAudit}
                  className="mt-2 text-xs font-semibold text-rose-700 dark:text-rose-400 underline"
                >
                  Retry Audit
                </button>
              </div>
            </div>
          )}

          {!loading && result && (
            <>
              {/* Recommendation Callout */}
              <div
                className={`p-5 rounded-2xl border flex items-center justify-between gap-4 ${
                  result.recommendation === 'APPROVE'
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
                    : result.recommendation === 'REVIEW_REQUIRED'
                    ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-100'
                    : 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-100'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm ${
                      result.recommendation === 'APPROVE'
                        ? 'bg-emerald-600'
                        : result.recommendation === 'REVIEW_REQUIRED'
                        ? 'bg-amber-600'
                        : 'bg-rose-600'
                    }`}
                  >
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold opacity-75 block">
                      Agent Recommendation
                    </span>
                    <h4 className="text-base font-extrabold flex items-center gap-2 mt-0.5">
                      {result.recommendation === 'APPROVE'
                        ? 'Recommended for Full Verification'
                        : result.recommendation === 'REVIEW_REQUIRED'
                        ? 'Manual Compliance Review Advised'
                        : 'Reject: Significant Discrepancies'}
                    </h4>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold opacity-75 block">
                    Confidence
                  </span>
                  <span className="text-xl font-black">{result.confidenceScore}%</span>
                </div>
              </div>

              {/* Step-by-Step Audit Trail */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                  <span>Step-by-Step Agent Audit Trail</span>
                  <span className="text-[10px] font-semibold text-slate-500">
                    4 verification steps executed
                  </span>
                </h4>
                <div className="space-y-2.5">
                  {result.auditTrail?.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          {step.step}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {step.durationMs}ms
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 pl-5">
                        {step.result}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Statutory Findings Matrix */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[11px]">RoC / MCA Status</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                    {result.cinStatus.companyStatus} ({result.cinStatus.verified ? 'Verified' : 'Unmatched'})
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[11px]">DPIIT Recognition</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                    {result.dpiitStatus.verified ? 'Recognized & Active' : 'Not Linked'}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={runAudit}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Re-Scan
            </button>
            <button
              onClick={handleApply}
              disabled={loading || !result}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Apply Recommendation ({result?.recommendation || 'APPROVE'})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
