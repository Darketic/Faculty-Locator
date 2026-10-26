'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  ChevronDown,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  FileText,
  Calendar,
  Award,
  Layers,
  CheckCircle,
} from 'lucide-react';

interface NavbarProps {
  user?: {
    fullName: string;
    email: string;
    role: string;
    id?: number;
    professorId?: number;
  } | null;
  onToggleSidebar?: () => void;
  onSearch?: (query: string) => void;
}

export default function Navbar({ user, onToggleSidebar, onSearch }: NavbarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const reportsRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (reportsRef.current && !reportsRef.current.contains(event.target as Node)) {
        setReportsOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      router.push(`/student/dashboard?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const displayName = user?.fullName || 'LUVYA TIWARI';
  const displayId = user?.role === 'PROFESSOR' ? 'FACULTY PORTAL' : '2427030572';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 select-none shadow-sm">
      <div className="flex items-center justify-between px-3 md:px-6 py-2.5">
        {/* Left: University Logo & Sidebar toggle */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-700 transition-colors focus:outline-none"
            aria-label="Toggle navigation menu"
            id="nav-sidebar-toggle"
          >
            <Menu className="w-5 h-5 text-brand-600" />
          </button>

          <Link href="/" className="flex items-center space-x-2.5 group">
            <img
              src="/college-logo.png"
              alt="Manipal University Jaipur Logo"
              className="w-9 h-9 object-contain"
            />
            <div className="flex flex-col">
              <span className="text-xs md:text-sm font-bold tracking-tight text-slate-900 uppercase">
                Manipal University Jaipur
              </span>
              <span className="text-[10px] text-slate-500 font-semibold hidden sm:inline">
                Faculty Locator
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Reports Dropdown & Search Bar */}
        <div className="flex items-center space-x-2 md:space-x-4 flex-1 max-w-xl mx-2 md:mx-6">
          {/* Reports dropdown */}
          <div className="relative hidden lg:block" ref={reportsRef}>
            <button
              onClick={() => setReportsOpen(!reportsOpen)}
              className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 hover:text-brand-600 py-1.5 px-2.5 rounded hover:bg-slate-50 transition-colors"
              id="nav-reports-button"
            >
              <span>Reports</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {reportsOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-1">
                <h4 className="font-bold text-slate-900 border-b pb-1 mb-2 text-xs">Faculty Reports</h4>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li>
                    <Link
                      href="/student/dashboard"
                      onClick={() => setReportsOpen(false)}
                      className="hover:text-brand-600 flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-brand-500" /> Faculty Directory
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/map"
                      onClick={() => setReportsOpen(false)}
                      className="hover:text-brand-600 flex items-center gap-1.5"
                    >
                      <Layers className="w-3.5 h-3.5 text-brand-500" /> LHC 3rd Floor Map
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/student/dashboard#schedules"
                      onClick={() => setReportsOpen(false)}
                      className="hover:text-brand-600 flex items-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5 text-brand-500" /> Faculty Timetables
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Search bar input pill with orange focus */}
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search faculty name, cabin, room, department..."
                className="w-full pl-9 pr-4 py-1.5 text-xs md:text-sm bg-slate-50 border border-brand-300 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all shadow-inner"
                id="navbar-search-input"
              />
              <Search className="w-4 h-4 text-brand-600 absolute left-3 top-2.5 pointer-events-none" />
            </div>
          </form>
        </div>

        {/* Right: Notifications & Profile flyout */}
        <div className="flex items-center space-x-3">
          {/* Notifications bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-1.5 text-slate-600 hover:text-brand-600 rounded-full hover:bg-slate-100 transition-colors relative"
              aria-label="View notifications"
              id="navbar-notifications-btn"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-brand-500 rounded-full ring-2 ring-white"></span>
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                  <span className="text-xs font-bold text-slate-800">Notifications & Events</span>
                  <span className="text-[10px] text-brand-600 font-semibold">Active Term</span>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="p-2 rounded bg-brand-50 border border-brand-100 text-slate-700">
                    <p className="font-semibold text-brand-900">Faculty Availability Sync Active</p>
                    <p className="text-[11px] text-slate-600">
                      Live status polling connected to PostgreSQL database every 10 seconds.
                    </p>
                  </div>
                  <div className="p-2 rounded bg-slate-50 text-slate-700 border border-slate-200">
                    <p className="font-semibold text-slate-800">Class Coordinator Assigned</p>
                    <p className="text-[11px] text-slate-600">
                      Dr. Ridhi Arora is coordinator for DOCSE (Cabin 301-A-1).
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User info badge & avatar dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center space-x-2 p-1 rounded-full md:rounded-lg hover:bg-slate-100 transition-colors text-left"
              id="navbar-profile-btn"
            >
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-tight">
                  {displayId} :: {displayName.toUpperCase()}
                </span>
                <span className="text-[10px] text-brand-600 font-medium">
                  {user ? (user.role === 'PROFESSOR' ? 'Faculty Member' : 'Student') : 'Guest'}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-brand-500 flex items-center justify-center text-slate-700 font-bold text-xs shadow-sm">
                <UserIcon className="w-4 h-4 text-slate-600" />
              </div>
            </button>

            {/* Profile Flyout (matches screenshot 2) */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1">
                {/* Burnt Orange Header Card */}
                <div className="bg-brand-600 p-4 text-white text-center">
                  <div className="w-14 h-14 mx-auto rounded-full bg-white/20 border-2 border-white flex items-center justify-center mb-2">
                    <UserIcon className="w-8 h-8 text-white" />
                  </div>
                  <p className="font-bold text-sm tracking-wide uppercase">{displayName}</p>
                  <p className="text-xs text-brand-100 truncate">{user?.email || 'student.demo@jaipur.manipal.edu'}</p>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/20 text-white">
                    {user?.role || 'STUDENT'}
                  </span>
                </div>

                {/* Profile actions */}
                <div className="p-3 space-y-2">
                  <Link
                    href={user?.role === 'PROFESSOR' ? '/professor/dashboard' : '/student/dashboard'}
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center space-x-2.5 p-2 rounded text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-brand-600 transition-colors"
                    id="profile-flyout-myprofile"
                  >
                    <UserIcon className="w-4 h-4 text-slate-500" />
                    <span>My Dashboard & Profile</span>
                  </Link>

                  <Link
                    href="/map"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center space-x-2.5 p-2 rounded text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-brand-600 transition-colors"
                  >
                    <Layers className="w-4 h-4 text-slate-500" />
                    <span>Interactive Floor Map</span>
                  </Link>

                  <div className="border-t border-slate-100 pt-2">
                    {user ? (
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold py-2 px-4 rounded shadow transition-colors"
                        id="profile-flyout-signout"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>SIGN OUT</span>
                      </button>
                    ) : (
                      <Link
                        href="/login"
                        onClick={() => setProfileOpen(false)}
                        className="w-full flex items-center justify-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold py-2 px-4 rounded shadow transition-colors"
                      >
                        <span>SIGN IN</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
