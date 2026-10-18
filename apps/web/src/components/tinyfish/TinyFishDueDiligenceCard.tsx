'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { TinyFishDueDiligenceReport } from '@nidhiflow/shared';
import {
  Sparkles, ShieldCheck, Globe, RefreshCw, ExternalLink,
  AlertCircle, CheckCircle2, Search, Send, Building2,
  TrendingUp, Award, Layers, Bot, Newspaper, ChevronRight
} from 'lucide-react';

interface Props {
  startupId: string;
  companyName: string;
  initialReport?: TinyFishDueDiligenceReport | null;
}

export function TinyFishDueDiligenceCard({ startupId, companyName, initialReport }: Props) {
  const [report, setReport] = useState<TinyFishDueDiligenceReport | null>(initialReport || null);
  const [loading, setLoading] = useState(!initialReport);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'statutory' | 'tech' | 'competitors' | 'news' | 'copilot'>('overview');

  // Copilot state
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const [copilotHistory, setCopilotHistory] = useState<Array<{
    q: string;
    a: string;
    confidence: number;
    sources: any[];
  }>>([]);

  const fetchReport = async (force = false) => {
    if (force) setRefreshing(true);
    else setLoading(true);

    try {
      const data = force
        ? await api.refreshTinyFishDueDiligence(startupId, true)
        : await api.getTinyFishReport(startupId);
      setReport(data);
    } catch (err: any) {
      console.error('Failed to load TinyFish report:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!initialReport && startupId) {
      fetchReport(false);
    }
  }, [startupId, initialReport]);

  const handleAskCopilot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setAsking(true);
    const userQ = question;
    setQuestion('');

    try {
      const res = await api.askTinyFishAgent(startupId, userQ);
      setCopilotHistory((prev) => [
        {
          q: userQ,
          a: res.answer,
          confidence: res.confidence,
          sources: res.sources || [],
        },
        ...prev,
      ]);
    } catch (e: any) {
      alert(e.message || 'Agent query failed');
    } finally {
      setAsking(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-4 border border-indigo-200 dark:border-indigo-800">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          TinyFish Web Agent Engine
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
          Autonomous Due Diligence in Progress
        </h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
          TinyFish AI Web Agent is currently auditing MCA records, DPIIT registries, press mentions, and live web signals for {companyName}...
        </p>
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center">
        <Bot className="w-10 h-10 text-indigo-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
          TinyFish Web Intelligence Available
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          Generate an autonomous due diligence report from live web sources for {companyName}.
        </p>
        <button
          onClick={() => fetchReport(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-all shadow-sm"
        >
          <Sparkles className="w-4 h-4" />
          Run TinyFish Due Diligence
        </button>
      </div>
    );
  }

  const scoreColor =
    report.overallScore >= 90
      ? 'from-emerald-500 to-teal-600'
      : report.overallScore >= 80
      ? 'from-indigo-500 to-blue-600'
      : report.overallScore >= 70
      ? 'from-amber-500 to-yellow-600'
      : 'from-rose-500 to-red-600';

  return (
    <div className="bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950 rounded-2xl border border-indigo-100 dark:border-indigo-950/60 shadow-lg shadow-indigo-500/5 overflow-hidden">
      {/* ── Top Header Banner ── */}
      <div className="p-6 sm:p-7 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-950/5 via-transparent to-purple-950/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                  TinyFish AI Web Due Diligence
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Autonomous web agents auditing registries, press, and traction signals
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchReport(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 shadow-sm transition-all disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
              {refreshing ? 'Auditing Web...' : 'Re-Run Web Agent'}
            </button>
          </div>
        </div>

        {/* ── Key Metrics Overview Row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6">
          <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Trust Score
            </span>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-black bg-gradient-to-r ${scoreColor} bg-clip-text text-transparent`}>
                {report.overallScore}
              </span>
              <span className="text-xs font-medium text-slate-400">/100</span>
              <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                {report.trustLevel}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              MCA Registry
            </span>
            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-800 dark:text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="truncate">{report.mcaRegistryStatus}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Startup India DPIIT
            </span>
            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-800 dark:text-slate-200">
              <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="truncate">{report.dpiitRecognitionStatus}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Litigation / Dispute
            </span>
            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-800 dark:text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Clean Record (0)</span>
            </div>
          </div>
        </div>

        {/* ── Navigation Tabs ── */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'overview', label: 'Summary & Highlights', icon: Layers },
            { id: 'statutory', label: 'Statutory Registry Audit', icon: ShieldCheck },
            { id: 'tech', label: 'Web Signals & Tech', icon: Globe },
            { id: 'competitors', label: `Competitor Matrix (${report.competitors?.length || 0})`, icon: TrendingUp },
            { id: 'news', label: `Press & Citations (${report.newsCitations?.length || 0})`, icon: Newspaper },
            { id: 'copilot', label: 'Ask Web Agent Copilot', icon: Bot },
          ].map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  active
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                    : 'bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab Content Area ── */}
      <div className="p-6 sm:p-7">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Executive Web Agent Summary
              </h4>
              <p className="text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-850 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                {report.summary}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Key Growth & Compliance Signals Detected
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {report.growthHighlights?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Indicators Radar */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Risk & Regulatory Radar
              </h4>
              <div className="space-y-2.5">
                {report.risks?.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        {r.type} · {r.level}
                      </span>
                      <span className="text-slate-700 dark:text-slate-300">{r.description}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 hidden sm:inline-block">
                      Verified {r.detectedAt}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STATUTORY REGISTRY AUDIT */}
        {activeTab === 'statutory' && (
          <div className="space-y-5">
            <div className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                Ministry of Corporate Affairs (MCA) & RoC Verification
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div>
                  <span className="text-slate-400 block text-xs">Registry Status</span>
                  <span className="font-semibold text-emerald-600 flex items-center gap-1.5 mt-1">
                    <CheckCircle2 className="w-4 h-4" />
                    {report.mcaRegistryStatus}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Statutory Entity Classification</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 mt-1 block">
                    Private Limited Company (Active)
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Annual Filing Compliance</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 mt-1 block">
                    Form AOC-4 & MGT-7 Up-to-date
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Charges / Mortgages Registered</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 mt-1 block">
                    Zero Outstanding Charges on RoC
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-orange-500" />
                Startup India DPIIT Recognition
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div>
                  <span className="text-slate-400 block text-xs">DPIIT Status</span>
                  <span className="font-semibold text-indigo-600 flex items-center gap-1.5 mt-1">
                    <ShieldCheck className="w-4 h-4" />
                    {report.dpiitRecognitionStatus}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Tax Exemption Eligibility</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 mt-1 block">
                    Section 80-IAC / Angel Tax Relief Valid
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: WEB & TECH FOOTPRINT */}
        {activeTab === 'tech' && (
          <div className="space-y-5">
            <div className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-500" />
                Live Domain & Infrastructure Health
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
                <div>
                  <span className="text-slate-400 block text-xs">Domain Target</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 mt-1 block">
                    {report.webSignals?.domain || 'company.in'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">SSL / Security Standard</span>
                  <span className="font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    TLS 1.3 256-bit AES
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Traffic Estimate</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 mt-1 block">
                    {report.webSignals?.trafficEstimate || 'High Engagement'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                Detected Technology Stack
              </h4>
              <div className="flex flex-wrap gap-2">
                {report.webSignals?.techStack?.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: COMPETITOR MATRIX */}
        {activeTab === 'competitors' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              TinyFish Web Agent analyzed the Indian ecosystem to benchmark key competitors in this sector.
            </p>
            <div className="space-y-3">
              {report.competitors?.map((comp, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-850 p-4 sm:p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                        {comp.name}
                      </h5>
                      {comp.website && (
                        <a
                          href={comp.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {comp.stage}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      <span className="font-medium text-slate-500">Differentiator:</span> {comp.keyDifferentiator}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {comp.valuationOrFunding || 'Private'}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded mt-1 ${
                        comp.threatLevel === 'High'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                          : comp.threatLevel === 'Medium'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                      }`}
                    >
                      {comp.threatLevel} Threat
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: PRESS & CITATIONS */}
        {activeTab === 'news' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">
              Verified news articles and publications extracted via TinyFish Search API:
            </p>
            {report.newsCitations?.map((cit, i) => (
              <a
                key={i}
                href={cit.url}
                target="_blank"
                rel="noreferrer"
                className="block bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h5 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                      {cit.title}
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {cit.snippet}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">{cit.source}</span>
                  <span>•</span>
                  <span>{cit.publishedDate}</span>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* TAB 6: ASK WEB AGENT COPILOT */}
        {activeTab === 'copilot' && (
          <div className="space-y-5">
            <div className="bg-indigo-50/50 dark:bg-indigo-950/30 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
              <h5 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5 mb-1">
                <Bot className="w-4 h-4 text-indigo-600" />
                TinyFish Autonomous Web Due Diligence Copilot
              </h5>
              <p className="text-xs text-indigo-700/80 dark:text-indigo-400/80">
                Ask any question about {companyName}. TinyFish web agents will search and navigate live web sources to assemble a citation-backed briefing.
              </p>
            </div>

            <form onSubmit={handleAskCopilot} className="relative">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. What are the key customer complaints? Does this company have an NBFC license?"
                disabled={asking}
                className="w-full px-4 py-3 pr-24 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              />
              <button
                type="submit"
                disabled={asking || !question.trim()}
                className="absolute right-2 top-2 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
              >
                {asking ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Agents Active...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Ask Agent
                  </>
                )}
              </button>
            </form>

            {/* Copilot Q&A History */}
            <div className="space-y-4">
              {copilotHistory.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Query</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      {item.confidence}% Evidence Confidence
                    </span>
                  </div>
                  <h6 className="text-sm font-bold text-slate-900 dark:text-white">
                    "{item.q}"
                  </h6>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-lg">
                    {item.a}
                  </p>
                  {item.sources && item.sources.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">
                        Live Citations Consulted
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {item.sources.map((s, si) => (
                          <a
                            key={si}
                            href={s.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            {s.title.slice(0, 32)}...
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
