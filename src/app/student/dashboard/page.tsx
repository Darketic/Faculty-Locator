'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  RotateCcw,
  MapPin,
  User,
  Phone,
  Mail,
  Building,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Layers,
  ChevronRight,
  Sparkles,
  Calendar,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import DemoBanner from '@/components/DemoBanner';
import { ToastProvider, useToast } from '@/components/Toast';

function StudentDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedAvailability, setSelectedAvailability] = useState('ALL');
  const [selectedRoom, setSelectedRoom] = useState('ALL');

  // Faculty and summary data
  const [professors, setProfessors] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalProfessors: 0,
    availableCount: 0,
    unavailableCount: 0,
    staleOrUnknownCount: 0,
  });
  const [departments, setDepartments] = useState<string[]>([]);
  const [lastSynced, setLastSynced] = useState<string>('');

  // 1. Fetch current authenticated user
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push('/login');
        } else {
          setCurrentUser(data.user);
        }
      })
      .catch((err) => console.error(err));
  }, [router]);

  // 2. Fetch faculty list based on filters
  const fetchFaculty = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (selectedDept !== 'ALL') params.append('department', selectedDept);
      if (selectedAvailability !== 'ALL') params.append('availability', selectedAvailability);
      if (selectedRoom !== 'ALL') params.append('room', selectedRoom);

      const res = await fetch(`/api/faculty?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setProfessors(data.professors);
        setSummary(data.summary);
        if (data.departments) setDepartments(data.departments);
        setLastSynced(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error('Error fetching faculty:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedDept, selectedAvailability, selectedRoom]);

  useEffect(() => {
    fetchFaculty();
  }, [fetchFaculty]);

  // 3. Real-time polling every 12 seconds for live availability updates
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/faculty/availability');
        if (res.ok) {
          const pollData = await res.json();
          const lookup = new Map(pollData.availabilities.map((a: any) => [a.professorId, a]));

          setProfessors((prev) =>
            prev.map((prof) => {
              const updated = lookup.get(prof.id);
              if (updated && updated.state !== prof.availability.state) {
                return {
                  ...prof,
                  availability: {
                    ...prof.availability,
                    isAvailable: updated.isAvailable,
                    lastUpdated: updated.lastUpdated,
                    state: updated.state,
                    label: updated.label,
                    color: updated.color,
                    badgeClass: updated.badgeClass,
                  },
                };
              }
              return prof;
            })
          );
          setLastSynced(new Date().toLocaleTimeString());
        }
      } catch (err) {
        // quiet polling failure without interruption
      }
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDept('ALL');
    setSelectedAvailability('ALL');
    setSelectedRoom('ALL');
    toast('Search filters cleared', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <DemoBanner />
      <Navbar
        user={currentUser}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onSearch={(q) => setSearchQuery(q)}
      />

      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole={currentUser?.role} />

        <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full space-y-5">
          {/* Top Banner: Class Coordinator Information (recreates user's reference image) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-brand-600" /> Class Coordinator Information
              </span>
              <span className="text-[11px] text-slate-500 font-medium">B.Tech CSE • Semester VI</span>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Coordinator</span>
                <span className="font-bold text-brand-600 hover:underline cursor-pointer">
                  DR. RIDHI ARORA
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Email</span>
                <span className="text-slate-700 font-medium truncate block">
                  ridhi.arora@jaipur.manipal.edu
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact</span>
                <span className="text-slate-700 font-medium">7206441507</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Department</span>
                <span className="font-bold text-slate-800">DOCSE (Room 301-A-1)</span>
              </div>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Text Search Input */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by faculty name, designation, cabin (e.g. 301-A-1), room, email..."
                  className="w-full pl-9 pr-4 py-2 text-xs md:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  id="student-search-input"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>

              {/* Department Dropdown */}
              <div className="w-full md:w-56">
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  id="student-filter-department"
                >
                  <option value="ALL">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Availability Filter */}
              <div className="w-full md:w-44">
                <select
                  value={selectedAvailability}
                  onChange={(e) => setSelectedAvailability(e.target.value)}
                  className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  id="student-filter-availability"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="AVAILABLE">Available Now Only</option>
                  <option value="UNAVAILABLE">Unavailable Only</option>
                </select>
              </div>

              {/* Room Filter */}
              <div className="w-full md:w-36">
                <select
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  id="student-filter-room"
                >
                  <option value="ALL">All Rooms</option>
                  {Array.from({ length: 40 }, (_, i) => 301 + i).map((room) => (
                    <option key={room} value={room.toString()}>
                      Room {room}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset Button */}
              <button
                onClick={handleResetFilters}
                className="px-3 py-2 border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-600 flex items-center justify-center gap-1.5 transition-colors"
                title="Reset search and filters"
                id="student-reset-filters-btn"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>
                Showing <strong>{professors.length}</strong> matching faculty members
              </span>
              {lastSynced && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-600" /> Live polling sync: {lastSynced}
                </span>
              )}
            </div>
          </div>

          {/* Faculty Cards Grid */}
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500">
              <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <span>Loading faculty directory...</span>
            </div>
          ) : professors.length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3">
              <Search className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No Faculty Records Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No professors matched your active search query or filter selection. Try adjusting the filters or resetting search.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {professors.map((faculty) => {
                const isAvailable = faculty.availability.state === 'AVAILABLE';
                return (
                  <div
                    key={faculty.id}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-4 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Header: Name and Status Badge */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <Link
                            href={`/faculty/${faculty.id}`}
                            className="font-bold text-sm text-slate-900 hover:text-brand-600 transition-colors leading-snug block"
                          >
                            {faculty.name}
                          </Link>
                          <span className="text-[11px] text-slate-500 block">{faculty.designation}</span>
                        </div>

                        {/* Availability Pill */}
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${faculty.availability.badgeClass}`}
                        >
                          {isAvailable ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : faculty.availability.state === 'UNAVAILABLE' ? (
                            <XCircle className="w-3 h-3 text-rose-600" />
                          ) : (
                            <Clock className="w-3 h-3 text-slate-500" />
                          )}
                          <span>{faculty.availability.label}</span>
                        </span>
                      </div>

                      {/* Department & Cabin Location Badges */}
                      <div className="space-y-1.5 my-3 text-xs text-slate-600">
                        <div className="flex items-center space-x-2">
                          <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="font-medium text-slate-700 truncate">{faculty.department}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <MapPin className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
                          {faculty.location ? (
                            <span className="font-semibold text-slate-800 bg-brand-50 text-brand-800 px-2 py-0.5 rounded text-[11px]">
                              {faculty.location.locationString}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">No cabin assigned</span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="text-slate-600 truncate text-[11px]">{faculty.email}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="text-slate-600 text-[11px]">{faculty.contactNumber}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons: View Profile & Locate on Map */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <Link
                        href={`/faculty/${faculty.id}`}
                        className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg text-center transition-colors flex items-center justify-center gap-1"
                        id={`faculty-profile-btn-${faculty.id}`}
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Profile</span>
                      </Link>

                      {faculty.location && (
                        <Link
                          href={`/map?room=${faculty.location.roomNumber}&cabin=${faculty.location.cabinLetter}&table=${faculty.location.tableNumber}&profId=${faculty.id}`}
                          className="flex-1 py-1.5 px-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg text-center shadow-sm transition-colors flex items-center justify-center gap-1"
                          id={`faculty-locate-btn-${faculty.id}`}
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Locate Map</span>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function StudentDashboardPage() {
  return (
    <ToastProvider>
      <StudentDashboardContent />
    </ToastProvider>
  );
}
