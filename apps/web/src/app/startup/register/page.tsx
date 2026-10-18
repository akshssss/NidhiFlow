'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { SECTORS, INDIAN_STATES } from '@nidhiflow/shared';
import { Building2, ArrowRight, Check, ShieldCheck, ChevronLeft } from 'lucide-react';

export default function StartupRegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [form, setForm] = useState({
    // Step 1: User
    name: '',
    email: '',
    password: '',
    // Step 2: Company
    companyName: '',
    tagline: '',
    sector: 'Fintech',
    stage: 'SEED',
    city: 'Bengaluru',
    state: 'Karnataka',
    foundedYear: 2023,
    website: '',
    // Step 3: Traction
    mrrLakhs: 5,
    totalUsers: 1500,
    growthRateMom: 25,
    fundingAskLakhs: 200,
    equityOffered: 10,
    // Step 4: Verification & Description
    cin: '',
    companyPan: '',
    dpiitNumber: '',
    description: '',
  });

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Register User & Startup
      const res = await api.registerStartup({
        email: form.email,
        password: form.password,
        name: form.name,
        companyName: form.companyName,
        tagline: form.tagline,
        sector: form.sector,
        stage: form.stage,
        city: form.city,
        state: form.state,
        foundedYear: Number(form.foundedYear),
        website: form.website,
        mrr: Number(form.mrrLakhs) * 100000 * 100, // paise
        totalUsers: Number(form.totalUsers),
        growthRateMom: Number(form.growthRateMom),
        fundingAsk: Number(form.fundingAskLakhs) * 100000 * 100, // paise
        equityOffered: Number(form.equityOffered),
        cin: form.cin || undefined,
        companyPan: form.companyPan || undefined,
        dpiitNumber: form.dpiitNumber || undefined,
        description: form.description,
      });

      login(res.accessToken, res.user);
      router.push('/startup/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-brand-800 text-white flex items-center justify-center mx-auto mb-3 shadow-lg">
          <Building2 className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Apply to Raise on NidhiFlow
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Join 25+ verified Indian startups with transparent investor outreach
        </p>

        {/* Step Progress Bar */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {['Founder', 'Company', 'Traction', 'Verification'].map((label, idx) => {
            const stepNum = idx + 1;
            const isCompleted = step > stepNum;
            const isCurrent = step === stepNum;
            return (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    isCurrent
                      ? 'bg-brand-800 text-white'
                      : isCompleted
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? <Check className="w-3 h-3" /> : stepNum}
                  <span>{label}</span>
                </div>
                {idx < 3 && <div className="w-4 h-0.5 bg-slate-200" />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
          {error && (
            <div className="p-3 mb-6 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); setStep(step + 1); }}>
            {/* ── STEP 1: FOUNDER INFO ── */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  Step 1: Founder Information
                </h3>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Rahul Sharma"
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Official Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="rahul@kiranapay.in"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Password (min 8 chars, 1 uppercase, 1 digit, 1 special)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="Create secure password"
                    value={form.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            )}

            {/* ── STEP 2: COMPANY INFO ── */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  Step 2: Startup Profile
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                      Company / Brand Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="KiranaPay"
                      value={form.companyName}
                      onChange={(e) => handleChange('companyName', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                      Sector
                    </label>
                    <select
                      value={form.sector}
                      onChange={(e) => handleChange('sector', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm bg-white dark:bg-slate-900 focus:outline-none"
                    >
                      {SECTORS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    One-line Tagline
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="UPI payments and credit line for kirana stores"
                    value={form.tagline}
                    onChange={(e) => handleChange('tagline', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                      Stage
                    </label>
                    <select
                      value={form.stage}
                      onChange={(e) => handleChange('stage', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm bg-white dark:bg-slate-900"
                    >
                      <option value="IDEA">Idea</option>
                      <option value="MVP">MVP</option>
                      <option value="PRE_SEED">Pre-Seed</option>
                      <option value="SEED">Seed</option>
                      <option value="SERIES_A">Series A</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Mumbai"
                      value={form.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                      State
                    </label>
                    <select
                      value={form.state}
                      onChange={(e) => handleChange('state', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm bg-white dark:bg-slate-900"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3: TRACTION & FUNDING ASK ── */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  Step 3: Metrics & Funding Round
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                      Monthly Recurring Revenue (₹ Lakh)
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      step="0.5"
                      placeholder="8.5"
                      value={form.mrrLakhs}
                      onChange={(e) => handleChange('mrrLakhs', Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                      Total Active Users / Clients
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      placeholder="12400"
                      value={form.totalUsers}
                      onChange={(e) => handleChange('totalUsers', Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                      Month-on-Month Growth (%)
                    </label>
                    <input
                      type="number"
                      required
                      step="1"
                      placeholder="28"
                      value={form.growthRateMom}
                      onChange={(e) => handleChange('growthRateMom', Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                      Funding Round Ask (₹ Lakh)
                    </label>
                    <input
                      type="number"
                      required
                      min={10}
                      step="10"
                      placeholder="500"
                      value={form.fundingAskLakhs}
                      onChange={(e) => handleChange('fundingAskLakhs', Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-bold text-brand-700"
                    />
                    <span className="text-[10px] text-slate-400">
                      ₹{form.fundingAskLakhs >= 100 ? `${(form.fundingAskLakhs / 100).toFixed(2)} Crore` : `${form.fundingAskLakhs} Lakh`}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Equity Offered (%)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={form.equityOffered}
                    onChange={(e) => handleChange('equityOffered', Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-bold"
                  />
                </div>
              </div>
            )}

            {/* ── STEP 4: STATUTORY AUDIT & VERIFICATION ── */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Step 4: Statutory Verification & Narrative
                  </h3>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs">
                  Providing verified statutory numbers awards the <strong>Verified Startup Shield</strong> and increases investor reply rates by 4.2x.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                      MCA CIN / LLPIN
                    </label>
                    <input
                      type="text"
                      placeholder="U72200MH2022PTC384521"
                      value={form.cin}
                      onChange={(e) => handleChange('cin', e.target.value.toUpperCase())}
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
                      value={form.companyPan}
                      onChange={(e) => handleChange('companyPan', e.target.value.toUpperCase())}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Startup India DPIIT Recognition (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="DIPP12345"
                    value={form.dpiitNumber}
                    onChange={(e) => handleChange('dpiitNumber', e.target.value.toUpperCase())}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Pitch Summary / Problem & Solution
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Briefly explain what problem you solve and why your team will win..."
                    value={form.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brand-800 hover:bg-brand-900 text-white font-bold text-sm shadow-md flex items-center gap-2"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md flex items-center gap-2"
                >
                  {loading ? 'Submitting Application...' : 'Submit & Launch Profile'}
                </button>
              )}
            </div>
          </form>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 mt-4">
            Already registered?{' '}
            <Link href="/startup/login" className="font-bold text-brand-600 hover:text-brand-700">
              Sign In here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
