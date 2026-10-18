'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { TinyFishEnrichmentResult } from '@nidhiflow/shared';
import {
  X, Sparkles, Globe, CheckCircle2, ArrowRight,
  RefreshCw, Bot, Check, Tag
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentWebsite?: string;
  onApplyEnrichment: (data: Partial<TinyFishEnrichmentResult>) => void;
}

export function TinyFishAutoEnrichModal({
  isOpen,
  onClose,
  currentWebsite = '',
  onApplyEnrichment,
}: Props) {
  const [url, setUrl] = useState(currentWebsite);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TinyFishEnrichmentResult | null>(null);

  if (!isOpen) return null;

  const handleEnrich = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    try {
      const data = await api.enrichStartupFromUrl(url.trim());
      setResult(data);
    } catch (err: any) {
      alert(err.message || 'Auto-enrichment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!result) return;
    onApplyEnrichment(result);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                TinyFish Profile Auto-Enrichment
              </h3>
              <p className="text-xs text-slate-500">
                Let TinyFish web agents extract your value prop and tags directly from your website
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          <form onSubmit={handleEnrich} className="space-y-3">
            <label className="block text-xs font-bold uppercase text-slate-500">
              Company Website URL
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://yourstartup.com"
                  disabled={loading}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Enrich
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Extracted preview */}
          {result && (
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Extracted Intelligence
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                  Ready to Apply
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block text-[11px]">Tagline</span>
                  <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                    {result.tagline}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[11px]">Target Market</span>
                  <p className="text-slate-700 dark:text-slate-300 mt-0.5">
                    {result.targetMarket}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[11px]">Business Model</span>
                  <p className="text-slate-700 dark:text-slate-300 mt-0.5">
                    {result.businessModel}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[11px]">Suggested Tags</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {result.suggestedTags?.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!result}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            Apply to Profile
          </button>
        </div>
      </div>
    </div>
  );
}
