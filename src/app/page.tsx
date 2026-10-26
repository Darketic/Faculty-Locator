'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  GraduationCap,
  Building,
} from 'lucide-react';
import DemoBanner from '@/components/DemoBanner';

export default function LandingPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setSession(data.user);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleQuickDemo = async (role: 'STUDENT' | 'PROFESSOR') => {
    const email =
      role === 'PROFESSOR' ? 'ridhi.arora@jaipur.manipal.edu' : 'student.demo@jaipur.manipal.edu';
    const password = 'Password@123';

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        if (role === 'PROFESSOR') {
          router.push('/professor/dashboard');
        } else {
          router.push('/student/dashboard');
        }
      }
    } catch (err) {
      console.error('Quick demo login error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <DemoBanner />

      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src="/college-logo.png"
              alt="Manipal University Jaipur Logo"
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-none uppercase">
                Manipal University Jaipur
              </h1>
              <p className="text-[11px] text-slate-500 font-semibold">
                Faculty Locator
              </p>
            </div>
          </div>

          <nav className="flex items-center space-x-3 sm:space-x-4">
            {session ? (
              <Link
                href={session.role === 'PROFESSOR' ? '/professor/dashboard' : '/student/dashboard'}
                className="bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                id="landing-dashboard-link"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-brand-600 px-3 py-2 rounded transition-colors"
                  id="landing-login-link"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors"
                  id="landing-signup-link"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white via-brand-50/40 to-slate-50 py-12 md:py-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 bg-brand-100 text-brand-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse"></span>
                <span>Academic SE Project • Live PostgreSQL Backed</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Locate Professors & Check{' '}
                <span className="text-brand-600 underline decoration-brand-300 decoration-wavy">
                  Live Cabin Availability
                </span>
              </h2>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Empowering students to quickly search faculty schedules, view contact credentials, and track
                live cabin occupancy across all 40 faculty rooms (301–340) and 240 cabins.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/student/dashboard"
                  className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold px-6 py-3 rounded-lg shadow-md transition-all flex items-center gap-2 group"
                  id="landing-find-faculty-btn"
                >
                  <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Find Faculty & Cabin</span>
                </Link>

                <Link
                  href="/map"
                  className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-sm font-bold px-6 py-3 rounded-lg shadow-sm transition-all flex items-center gap-2"
                  id="landing-explore-map-btn"
                >
                  <MapPin className="w-4 h-4 text-brand-600" />
                  <span>Explore LHC 3rd Floor Map</span>
                </Link>
              </div>

              {/* Demo Account Quick Access Card */}
              <div className="mt-6 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-brand-600" /> One-Click Academic Demo Logins
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => handleQuickDemo('STUDENT')}
                    className="flex flex-col text-left p-3 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50/50 transition-all text-xs group"
                    id="landing-demo-student-btn"
                  >
                    <span className="font-bold text-slate-900 group-hover:text-brand-600 flex items-center justify-between">
                      Student Demo Login <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                    </span>
                    <span className="text-slate-500 text-[11px] mt-0.5">student.demo@jaipur.manipal.edu</span>
                  </button>

                  <button
                    onClick={() => handleQuickDemo('PROFESSOR')}
                    className="flex flex-col text-left p-3 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50/50 transition-all text-xs group"
                    id="landing-demo-professor-btn"
                  >
                    <span className="font-bold text-slate-900 group-hover:text-brand-600 flex items-center justify-between">
                      Professor Demo Login (Dr. Ridhi Arora) <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                    </span>
                    <span className="text-slate-500 text-[11px] mt-0.5">ridhi.arora@jaipur.manipal.edu</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Feature Representation */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="bg-brand-600 px-4 py-3 text-white flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Interactive Floor Grid Preview
                    </span>
                  </div>
                  <span className="text-[10px] bg-brand-700 px-2 py-0.5 rounded font-mono">
                    Rooms 301–340
                  </span>
                </div>

                <div className="p-4 space-y-4">
                  {/* Visual Map Matrix Preview */}
                  <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
                    <div className="p-2.5 rounded-lg border-2 border-emerald-500 bg-emerald-50 text-emerald-800">
                      301
                      <span className="block text-[9px] font-normal text-emerald-600">Available</span>
                    </div>
                    <div className="p-2.5 rounded-lg border border-rose-300 bg-rose-50 text-rose-800">
                      302
                      <span className="block text-[9px] font-normal text-rose-600">Unavailable</span>
                    </div>
                    <div className="p-2.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-800">
                      303
                      <span className="block text-[9px] font-normal text-amber-600">Mixed</span>
                    </div>
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
                      304
                      <span className="block text-[9px] font-normal text-slate-500">Vacant</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">Room 301 • Cabin A-1</span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Available in Cabin
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-700">Dr. Ridhi Arora (DOCSE)</p>
                    <p className="text-[11px] text-slate-500">
                      Software Engineering • SE Lab • Class Coordinator
                    </p>
                  </div>

                  {/* Highlights list */}
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-brand-600 flex-shrink-0" />
                      <span>Role-based authorization prevents unauthorized availability tampering</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-brand-600 flex-shrink-0" />
                      <span>Real-time availability polling with timestamp staleness detection</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Layers className="w-4 h-4 text-brand-600 flex-shrink-0" />
                      <span>Rectangular 5×8 layout with exactly 40 rooms and 240 cabins</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-12 bg-white flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="text-2xl font-bold text-slate-900">System Capabilities</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Engineered according to modern Software Engineering requirements and Manipal University Jaipur portal standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl border border-slate-200 hover:border-brand-500 transition-all bg-slate-50/50">
              <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600 mb-3">
                <Search className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Multi-Attribute Faculty Search</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Filter by professor name, department, designation, room number, cabin (e.g. A-1), or live availability.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 hover:border-brand-500 transition-all bg-slate-50/50">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 mb-3">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Persistent PostgreSQL Status</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Professors update availability with one click. Status persists permanently in PostgreSQL across sessions and restarts.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 hover:border-brand-500 transition-all bg-slate-50/50">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mb-3">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Floor Navigation</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every room (301–340) and cabin (A–F) is interactive and reflects actual database assignments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Manipal University Jaipur — Software Engineering Lab Project.</p>
          <div className="flex items-center space-x-4">
            <Link href="/student/dashboard" className="hover:text-white transition-colors">
              Student Dashboard
            </Link>
            <Link href="/map" className="hover:text-white transition-colors">
              Floor Map
            </Link>
            <Link href="/login" className="hover:text-white transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
