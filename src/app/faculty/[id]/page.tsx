'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  User,
  MapPin,
  Calendar,
  Building,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Copy,
  ExternalLink,
  Shield,
  Layers,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import DemoBanner from '@/components/DemoBanner';
import { ToastProvider, useToast } from '@/components/Toast';

function FacultyProfileContent() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [professor, setProfessor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const professorId = params.id;

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setCurrentUser(data.user);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!professorId) return;
    fetch(`/api/faculty/${professorId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProfessor(data.professor);
        } else {
          toast(data.error || 'Professor not found', 'error');
        }
      })
      .catch((err) => {
        console.error('Error fetching professor:', err);
        toast('Failed to load profile', 'error');
      })
      .finally(() => setLoading(false));
  }, [professorId, toast]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast(`${label} copied to clipboard`, 'success');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <span className="text-xs text-slate-500">Loading faculty profile...</span>
        </div>
      </div>
    );
  }

  if (!professor) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        <Navbar user={currentUser} />
        <div className="p-12 text-center text-xs text-slate-500">
          <h2 className="text-base font-bold text-slate-800 mb-2">Professor Not Found</h2>
          <Link href="/student/dashboard" className="text-brand-600 font-bold hover:underline">
            Return to Faculty Directory
          </Link>
        </div>
      </div>
    );
  }

  const isAvailable = professor.availability?.state === 'AVAILABLE';
  const isUnavailable = professor.availability?.state === 'UNAVAILABLE';
  const lastUpdated = professor.availability?.lastUpdated
    ? new Date(professor.availability.lastUpdated).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Unknown';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <DemoBanner />
      <Navbar
        user={currentUser}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole={currentUser?.role} />

        <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full space-y-6">
          {/* Back Button */}
          <div>
            <Link
              href="/student/dashboard"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-brand-600 transition-colors"
              id="back-to-directory-link"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Faculty Directory</span>
            </Link>
          </div>

          {/* Profile Header Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-brand-600 h-28 w-full relative">
              <div className="absolute top-3 right-4">
                <span className="bg-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase">
                  Faculty Member
                </span>
              </div>
            </div>

            <div className="px-6 pb-6 pt-0 relative">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12 mb-4">
                <div className="flex items-end space-x-4">
                  <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-brand-600 text-3xl font-black bg-brand-50">
                    {professor.name
                      .split(' ')
                      .map((n: string) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div className="pb-1">
                    <h1 className="text-xl font-black text-slate-900 leading-tight">
                      {professor.name}
                    </h1>
                    <p className="text-xs font-semibold text-brand-600">{professor.designation}</p>
                    <p className="text-xs text-slate-500 font-mono">ID: {professor.facultyId}</p>
                  </div>
                </div>

                {/* Primary Action: Locate on Map */}
                {professor.location && (
                  <Link
                    href={`/map?room=${professor.location.roomNumber}&cabin=${professor.location.cabinLetter}&table=${professor.location.tableNumber}&profId=${professor.id}`}
                    className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-md transition-all flex items-center gap-2 self-start sm:self-auto"
                    id="profile-locate-on-map-btn"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Locate on Cabin Map</span>
                  </Link>
                )}
              </div>

              {/* Status and Location Badges */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                {/* Cabin Position */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Assigned Cabin Location
                    </span>
                    <span className="font-bold text-slate-800 text-sm">
                      {professor.location ? professor.location.locationString : 'No Cabin Assigned'}
                    </span>
                    {professor.location && (
                      <span className="text-[11px] text-brand-600 font-mono block mt-0.5">
                        Cabin ID: {professor.location.tableIdentifier}
                      </span>
                    )}
                  </div>
                  <MapPin className="w-6 h-6 text-brand-600 opacity-80" />
                </div>

                {/* Live Availability Status */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Current Availability
                    </span>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span
                        className={`w-3 h-3 rounded-full ${
                          isAvailable ? 'bg-emerald-500 animate-pulse' : isUnavailable ? 'bg-rose-500' : 'bg-slate-400'
                        }`}
                      ></span>
                      <span className="font-black text-slate-900 text-sm">
                        {professor.availability.label}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Last Updated: {lastUpdated}
                    </span>
                  </div>
                  {isAvailable ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 opacity-80" />
                  ) : (
                    <XCircle className="w-6 h-6 text-rose-600 opacity-80" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Details & Contact Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Contact Details */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-brand-600" />
                Academic Details
              </h2>
              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Department</span>
                  <span className="font-semibold text-slate-800">{professor.department}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Office Hours</span>
                  <span className="font-medium text-slate-700">{professor.officeHours}</span>
                </div>
              </div>
            </div>

            {/* Email card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-brand-600" />
                College Email
              </h2>
              <div className="space-y-2 text-xs">
                <p className="font-semibold text-slate-800 truncate">{professor.email}</p>
                <button
                  onClick={() => copyToClipboard(professor.email, 'Email address')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-semibold text-slate-700 flex items-center gap-1 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy College Email</span>
                </button>
              </div>
            </div>

            {/* Phone card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-brand-600" />
                Contact Number
              </h2>
              <div className="space-y-2 text-xs">
                <p className="font-semibold text-slate-800">{professor.contactNumber}</p>
                <button
                  onClick={() => copyToClipboard(professor.contactNumber, 'Phone number')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-semibold text-slate-700 flex items-center gap-1 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy Phone Number</span>
                </button>
              </div>
            </div>
          </div>

          {/* Weekly Class Timetable (Monday through Saturday) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-brand-600" />
                <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Weekly Class Timetable (Monday through Saturday)
                </h2>
              </div>
              <span className="text-[11px] text-slate-500 font-semibold">
                {professor.schedules?.length || 0} Scheduled Lectures & Labs
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Day</th>
                    <th className="py-2.5 px-4">Timing</th>
                    <th className="py-2.5 px-4">Subject</th>
                    <th className="py-2.5 px-4">Section</th>
                    <th className="py-2.5 px-4">Classroom / Lab</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {professor.schedules && professor.schedules.length > 0 ? (
                    professor.schedules.map((schedule: any) => (
                      <tr key={schedule.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-4 font-bold text-slate-900">{schedule.day}</td>
                        <td className="py-2.5 px-4 font-mono text-[11px]">
                          {schedule.startTime} - {schedule.endTime}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-brand-800">{schedule.subject}</td>
                        <td className="py-2.5 px-4">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                            {schedule.section}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-slate-800">{schedule.classroom}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        No scheduled classes found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function FacultyProfilePage() {
  return (
    <ToastProvider>
      <FacultyProfileContent />
    </ToastProvider>
  );
}
