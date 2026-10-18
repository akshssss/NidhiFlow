'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatDate } from '@/lib/format';
import { Bell, CheckCheck, ShieldCheck, DollarSign, MessageSquare, Star } from 'lucide-react';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.getNotifications();
      if (res && res.data) setNotifications(res.data);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e: any) {
      alert(e.message);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'INTEREST_RECEIVED':
      case 'INTEREST_ACCEPTED':
        return <DollarSign className="w-5 h-5 text-emerald-500" />;
      case 'VERIFICATION_UPDATE':
        return <ShieldCheck className="w-5 h-5 text-blue-500" />;
      case 'REVIEW_RECEIVED':
        return <Star className="w-5 h-5 text-amber-500" />;
      default:
        return <MessageSquare className="w-5 h-5 text-brand-600" />;
    }
  };

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-6 h-6 text-brand-600" />
              Platform Alerts & Notifications
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Updates on your verification, received investor interests, and reviews
            </p>
          </div>

          <button
            onClick={handleMarkAllRead}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 flex items-center gap-1.5"
          >
            <CheckCheck className="w-4 h-4 text-brand-600" /> Mark all read
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
          {loading ? (
            <div className="p-12 text-center text-sm text-slate-400">Loading alerts...</div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              You're all caught up! No notifications.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-5 flex items-start gap-4 transition-colors ${
                  !n.isRead ? 'bg-brand-50/40 dark:bg-brand-950/20' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  {getNotificationIcon(n.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {n.title}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {formatDate(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {n.body}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
