'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  MapPin,
  Users,
  Calendar,
  UserCheck,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  userRole?: string;
}

export default function Sidebar({ isOpen, onClose, userRole }: SidebarProps) {
  const pathname = usePathname();

  const navigationItems = [
    { label: 'Faculty Directory', href: '/student/dashboard', icon: Users },
    { label: 'LHC 3rd Floor Map', href: '/map', icon: MapPin },
    { label: 'Timetable & Schedules', href: '/student/dashboard#schedules', icon: Calendar },
  ];

  if (userRole === 'PROFESSOR') {
    navigationItems.push({
      label: 'My Availability Portal',
      href: '/professor/dashboard',
      icon: UserCheck,
    });
  }

  if (!isOpen) return null;

  return (
    <aside className="w-64 bg-brand-600 text-white flex flex-col flex-shrink-0 min-h-[calc(100vh-65px)] select-none shadow-xl transition-all duration-300 z-30">
      {/* Home Navigation */}
      <div className="p-3 border-b border-brand-700/50">
        <Link
          href={userRole === 'PROFESSOR' ? '/professor/dashboard' : '/student/dashboard'}
          className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
            pathname.includes('dashboard') && !pathname.includes('map')
              ? 'bg-brand-700 text-white shadow-inner'
              : 'hover:bg-brand-500/80 text-white'
          }`}
          id="sidebar-home-link"
        >
          <Home className="w-5 h-5 text-brand-100" />
          <span>Home</span>
        </Link>
      </div>

      {/* Menu Section */}
      <div className="flex-1 py-4 px-3 space-y-2 overflow-y-auto">
        <div className="text-[11px] font-bold uppercase tracking-wider text-brand-200 px-3 mb-2">
          Navigation
        </div>

        <div className="space-y-1">
          {navigationItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={idx}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-brand-700 text-white shadow-inner font-bold'
                    : 'text-brand-100 hover:text-white hover:bg-brand-500/60'
                }`}
              >
                <Icon className="w-4 h-4 text-brand-200 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom indicator */}
      <div className="p-3 border-t border-brand-700/50 text-[11px] text-brand-200 bg-brand-700/30">
        <p className="font-semibold text-white">Academic Term 2026</p>
        <p className="text-[10px] opacity-80">Software Engineering Lab</p>
      </div>
    </aside>
  );
}
