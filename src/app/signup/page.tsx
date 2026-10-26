'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User, ArrowRight, AlertCircle, Shield, GraduationCap, Briefcase } from 'lucide-react';
import DemoBanner from '@/components/DemoBanner';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'PROFESSOR'>('STUDENT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password, confirmPassword, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
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
            <div className="mb-4 text-center">
              <h2 className="text-lg font-bold text-slate-800">New User Registration</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Register with your official college domain email address
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Account Role Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('STUDENT')}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      role === 'STUDENT'
                        ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                    id="signup-role-student"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Student</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('PROFESSOR')}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      role === 'PROFESSOR'
                        ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                    id="signup-role-professor"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Professor</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. John Doe"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                    id="signup-name-input"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">College Email</label>
                  <span className="text-[10px] text-brand-600 font-semibold">@jaipur.manipal.edu</span>
                </div>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@jaipur.manipal.edu"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                    id="signup-email-input"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      required
                      className="w-full pl-8 pr-2 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                      id="signup-password-input"
                    />
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter"
                      required
                      className="w-full pl-8 pr-2 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                      id="signup-confirm-password-input"
                    />
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-4 rounded-lg shadow transition-all text-xs flex items-center justify-center gap-2 disabled:opacity-60"
                id="signup-submit-btn"
              >
                {loading ? (
                  <span>Registering Account...</span>
                ) : (
                  <>
                    <span>Create {role === 'PROFESSOR' ? 'Faculty' : 'Student'} Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 text-center text-xs text-slate-600">
              Already have an account?{' '}
              <Link href="/login" className="text-brand-600 font-bold hover:underline">
                Sign In
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
