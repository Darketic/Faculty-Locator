'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import DemoBanner from '@/components/DemoBanner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      if (data.user.role === 'PROFESSOR') {
        router.push('/professor/dashboard');
      } else {
        router.push('/student/dashboard');
      }
      router.refresh();
    } catch (err: any) {
      setError('An unexpected network error occurred. Please try again.');
      setLoading(false);
    }
  };

  const fillDemoCredentials = (role: 'STUDENT' | 'PROFESSOR') => {
    if (role === 'PROFESSOR') {
      setEmail('ridhi.arora@jaipur.manipal.edu');
      setPassword('Password@123');
    } else {
      setEmail('student.demo@jaipur.manipal.edu');
      setPassword('Password@123');
    }
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
      <DemoBanner />

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header Banner */}
          <div className="bg-brand-600 px-6 py-5 text-white text-center">
            <div className="w-14 h-14 bg-white rounded-full p-1.5 mx-auto mb-2 shadow-md flex items-center justify-center">
              <img
                src="/college-logo.png"
                alt="Manipal University Jaipur Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-base font-bold uppercase tracking-tight">Manipal University Jaipur</h1>
            <p className="text-xs text-brand-100 font-medium">Faculty Locator</p>
          </div>

          <div className="p-6">
            <div className="mb-5 text-center">
              <h2 className="text-lg font-bold text-slate-800">Account Sign In</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Enter your college credentials to access the academic portal
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  College Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@jaipur.manipal.edu"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                    id="login-email-input"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">Password</label>
                  <span className="text-[10px] text-slate-400">Demo password: Password@123</span>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                    id="login-password-input"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-4 rounded-lg shadow transition-all text-xs flex items-center justify-center gap-2 disabled:opacity-60"
                id="login-submit-btn"
              >
                {loading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Autofill section */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2.5 text-center">
                One-Click Demo Fill
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('STUDENT')}
                  className="p-2 border border-slate-200 rounded-lg text-left hover:border-brand-500 hover:bg-brand-50/40 transition-colors text-xs"
                  id="fill-demo-student-btn"
                >
                  <span className="font-bold text-slate-800 block text-[11px]">Fill Student Demo</span>
                  <span className="text-[10px] text-slate-500 block truncate">student.demo@...</span>
                </button>

                <button
                  type="button"
                  onClick={() => fillDemoCredentials('PROFESSOR')}
                  className="p-2 border border-slate-200 rounded-lg text-left hover:border-brand-500 hover:bg-brand-50/40 transition-colors text-xs"
                  id="fill-demo-prof-btn"
                >
                  <span className="font-bold text-slate-800 block text-[11px]">Fill Professor Demo</span>
                  <span className="text-[10px] text-slate-500 block truncate">ridhi.arora@...</span>
                </button>
              </div>
            </div>

            <div className="mt-5 text-center text-xs text-slate-600">
              Don't have an account yet?{' '}
              <Link href="/signup" className="text-brand-600 font-bold hover:underline">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>

      <footer className="py-4 text-center text-slate-400 text-xs">
        <p>Software Engineering Academic Project • Manipal University Jaipur</p>
      </footer>
    </div>
  );
}
