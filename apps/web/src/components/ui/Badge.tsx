import React from 'react';
import { ShieldCheck, Award, CheckCircle2, AlertCircle, Clock, XCircle } from 'lucide-react';

interface VerifiedBadgeProps {
  type: 'VERIFIED_STARTUP' | 'DPIIT_RECOGNISED' | 'VERIFIED_INVESTOR' | 'SEBI_REGISTERED';
  size?: 'sm' | 'md' | 'lg';
}

export function VerifiedBadge({ type, size = 'sm' }: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  switch (type) {
    case 'VERIFIED_STARTUP':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 ${sizeClasses[size]}`}
          title="Verified Startup by NidhiFlow"
        >
          <ShieldCheck className={iconSizes[size]} />
          Verified Startup
        </span>
      );
    case 'DPIIT_RECOGNISED':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 ${sizeClasses[size]}`}
          title="DPIIT Recognised by Govt. of India"
        >
          <Award className={iconSizes[size]} />
          DPIIT Recognised
        </span>
      );
    case 'VERIFIED_INVESTOR':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 ${sizeClasses[size]}`}
          title="Verified Angel/Institutional Investor"
        >
          <ShieldCheck className={iconSizes[size]} />
          Verified Investor
        </span>
      );
    case 'SEBI_REGISTERED':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 ${sizeClasses[size]}`}
          title="SEBI Registered AIF/Fund"
        >
          <Award className={iconSizes[size]} />
          SEBI Registered
        </span>
      );
  }
}

export function StatusBadge({ status }: { status: 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' }) {
  switch (status) {
    case 'VERIFIED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          Verified
        </span>
      );
    case 'UNDER_REVIEW':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
          <Clock className="w-3.5 h-3.5 text-indigo-500" />
          Under Review
        </span>
      );
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
          <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
          Pending Verification
        </span>
      );
    case 'REJECTED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20">
          <XCircle className="w-3.5 h-3.5 text-red-500" />
          Rejected
        </span>
      );
  }
}
