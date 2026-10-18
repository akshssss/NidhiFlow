'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { SECTORS } from '@nidhiflow/shared';
import { Users, ArrowRight, ShieldCheck } from 'lucide-react';

export default function InvestorRegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    displayName: '',
    type: 'ANGEL',
    firmName: '',
    sectors: ['Fintech', 'SaaS', 'AI/ML'],
    stagePreference: ['SEED', 'SERIES_A'],
    ticketSizeMinLakhs: 25,
    ticketSizeMaxLakhs: 200,
    pan: '',
    sebiRegistration: '',
    thesis: '',
  });

  const handleChange = (field: string, val: any) => {
    setForm((p) => ({ ...p, [field]: val }));
  };

  const handleToggleSector = (s: string) => {
    setForm((prev) => {
      const exists = prev.sectors.includes(s);
      const next = exists ? prev.sectors.filter((item) => item !== s) : [...prev.sectors, s];
      return { ...prev, sectors: next.length ? next : [s] };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.registerInvestor({
        name: form.name,
        email: form.email,
        password: form.password,
        displayName: form.displayName || form.name,
        type: form.type,
        firmName: form.firmName || undefined,
        sectors: form.sectors,
        stagePreference: form.stagePreference,
        ticketSizeMin: Number(form.ticketSizeMinLakhs) * 100000 * 100, // paise
        ticketSizeMax: Number(form.ticketSizeMaxLakhs) * 100000 * 100, // paise
        pan: form.pan || undefined,
        sebiRegistration: form.sebiRegistration || undefined,
        thesis: form.thesis,
      });

      login(res.accessToken, res.user);
      router.push('/investor/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-blue-700 text-white flex items-center justify-center mx-auto mb-3 shadow-lg">
          <Users className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Join as an Investor
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Access pre-vetted Indian startups with statutory checks and direct founder deal rooms
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Vikramaditya Singhania"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Work / Personal Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="partner@bluestar.vc"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                placeholder="Create secure password"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Investor Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm bg-white dark:bg-slate-900"
                >
                  <option value="ANGEL">Angel Investor</option>
                  <option value="VC">Venture Capital (VC)</option>
                  <option value="FAMILY_OFFICE">Family Office</option>
                  <option value="HNI">HNI / Syndicate</option>
                  <option value="CORPORATE">Corporate VC</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Fund / Firm Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="BlueStar Ventures"
                  value={form.firmName}
                  onChange={(e) => handleChange('firmName', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm"
                />
              </div>
            </div>

            {/* Ticket Size Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Min Ticket (₹ Lakh)
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.ticketSizeMinLakhs}
                  onChange={(e) => handleChange('ticketSizeMinLakhs', Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Max Ticket (₹ Lakh)
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.ticketSizeMaxLakhs}
                  onChange={(e) => handleChange('ticketSizeMaxLakhs', Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-bold text-blue-700"
                />
              </div>
            </div>

            {/* Sectors of interest */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                Target Sectors of Interest
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950">
                {SECTORS.map((s) => {
                  const active = form.sectors.includes(s);
                  return (
                    <button
                      type="button"
                      key={s}
                      onClick={() => handleToggleSector(s)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        active
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200'
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SEBI / PAN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  PAN Number (KYC)
                </label>
                <input
                  type="text"
                  placeholder="ABCDE1234F"
                  value={form.pan}
                  onChange={(e) => handleChange('pan', e.target.value.toUpperCase())}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  SEBI Reg. No. (if Fund/AIF)
                </label>
                <input
                  type="text"
                  placeholder="IN/AIF2/12-34/5678"
                  value={form.sebiRegistration}
                  onChange={(e) => handleChange('sebiRegistration', e.target.value.toUpperCase())}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Investment Thesis & Focus
              </label>
              <textarea
                rows={2}
                placeholder="We back early-stage founders building deeptech and B2B SaaS with positive unit economics..."
                value={form.thesis}
                onChange={(e) => handleChange('thesis', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? 'Submitting Application...' : 'Register as Investor'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
            Already registered as an investor?{' '}
            <Link href="/investor/login" className="font-bold text-blue-600 hover:text-blue-700">
              Sign In here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
