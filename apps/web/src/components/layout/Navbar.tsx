'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import {
  TrendingUp, Users, Building2, Bell, MessageSquare,
  LogOut, Shield, ChevronDown, Check, Menu, X, ArrowRight
} from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);

  useEffect(() => {
    if (user) {
      api.getUnreadNotificationsCount()
        .then((res) => setUnreadCount(res.unreadCount || 0))
        .catch(() => {});
    }
  }, [user]);

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-800 via-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <span className="font-extrabold text-lg tracking-tight font-sans">₹</span>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
              Nidhi<span className="text-brand-600 dark:text-brand-400">Flow</span>
            </span>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 -mt-1">
              Verified India Dealflow
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/startups"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/startups')
                ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/50'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            Explore Startups
          </Link>
          <Link
            href="/investors"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/investors')
                ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/50'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            Verified Investors
          </Link>
          <Link
            href="/leaderboard"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              isActive('/leaderboard')
                ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/50'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Leaderboard
          </Link>
        </nav>

        {/* Right side Auth & Action */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              {/* Messages / Deal Rooms */}
              <Link
                href="/chat"
                className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                title="Messages & Deal Rooms"
              >
                <MessageSquare className="w-5 h-5" />
              </Link>

              {/* Notifications */}
              <Link
                href="/notifications"
                className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* Role Dashboard button */}
              {user.role === 'STARTUP' && (
                <Link
                  href="/startup/dashboard"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-all"
                >
                  <Building2 className="w-4 h-4" />
                  Founder Portal
                </Link>
              )}
              {user.role === 'INVESTOR' && (
                <Link
                  href="/investor/dashboard"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-all"
                >
                  <Users className="w-4 h-4" />
                  Investor Portal
                </Link>
              )}
              {user.role === 'ADMIN' && (
                <Link
                  href="/admin/dashboard"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition-all"
                >
                  <Shield className="w-4 h-4" />
                  Admin Center
                </Link>
              )}

              {/* User Dropdown / Logout */}
              <button
                onClick={() => logout()}
                className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              {/* Separate Sign In dropdown */}
              <div className="relative">
                <button
                  onClick={() => setAuthDropdownOpen(!authDropdownOpen)}
                  className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center gap-1 transition-colors"
                >
                  Sign In
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {authDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50"
                    onMouseLeave={() => setAuthDropdownOpen(false)}
                  >
                    <Link
                      href="/startup/login"
                      onClick={() => setAuthDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-brand-950/40"
                    >
                      <Building2 className="w-4 h-4 text-brand-600" />
                      <div>
                        <div className="font-medium">Startup Founder</div>
                        <div className="text-xs text-slate-400">Access your pitch & deals</div>
                      </div>
                    </Link>
                    <Link
                      href="/investor/login"
                      onClick={() => setAuthDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-brand-950/40"
                    >
                      <Users className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="font-medium">Investor / Angel / VC</div>
                        <div className="text-xs text-slate-400">Discover vetted dealflow</div>
                      </div>
                    </Link>
                    <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
                    <Link
                      href="/admin/login"
                      onClick={() => setAuthDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-1.5 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      Admin Login
                    </Link>
                  </div>
                )}
              </div>

              {/* Get Started / Join buttons */}
              <Link
                href="/startup/register"
                className="px-3.5 py-1.5 rounded-lg text-sm font-semibold border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors"
              >
                Raise Capital
              </Link>
              <Link
                href="/investor/register"
                className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-brand-800 hover:bg-brand-900 text-white shadow-sm transition-all"
              >
                Invest in Deals
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-4 space-y-2">
          <Link
            href="/startups"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200"
          >
            Explore Startups
          </Link>
          <Link
            href="/investors"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200"
          >
            Verified Investors
          </Link>
          <Link
            href="/leaderboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200"
          >
            Leaderboard
          </Link>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  href={user.role === 'STARTUP' ? '/startup/dashboard' : user.role === 'INVESTOR' ? '/investor/dashboard' : '/admin/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-lg text-center font-semibold bg-brand-600 text-white text-sm"
                >
                  Go to Dashboard
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full py-2 rounded-lg text-center font-medium text-red-600 text-sm"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/startup/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-lg text-center font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 text-sm"
                >
                  Founder Login
                </Link>
                <Link
                  href="/investor/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-lg text-center font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 text-sm"
                >
                  Investor Login
                </Link>
                <Link
                  href="/startup/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-lg text-center font-semibold bg-brand-800 text-white text-sm"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
