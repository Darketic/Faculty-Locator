'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  MapPin,
  Search,
  RotateCcw,
  User,
  Building,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ExternalLink,
  Layers,
  ChevronRight,
  Maximize2,
  Minimize2,
  Info,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import DemoBanner from '@/components/DemoBanner';
import { ToastProvider, useToast } from '@/components/Toast';

function MapContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Collapsed by default for maximal map space!
  const [loading, setLoading] = useState(true);

  // Map Overview Data (All 40 rooms)
  const [rooms, setRooms] = useState<any[]>([]);

  // Selection states
  const [selectedRoomNumber, setSelectedRoomNumber] = useState<number | null>(null);
  const [selectedCabinLetter, setSelectedCabinLetter] = useState<string | null>(null);
  const [selectedTableNumber, setSelectedTableNumber] = useState<number | null>(null);

  // Active room detailed data (cabins & 24 tables)
  const [roomDetails, setRoomDetails] = useState<any>(null);
  const [loadingRoom, setLoadingRoom] = useState(false);

  // Search input on map
  const [mapSearch, setMapSearch] = useState('');

  // 1. Check user session
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

  // 2. Fetch Map Overview (40 rooms)
  const fetchOverview = useCallback(async () => {
    try {
      const res = await fetch('/api/map/overview');
      const data = await res.json();
      if (res.ok) {
        setRooms(data.rooms);
      }
    } catch (err) {
      console.error('Error fetching map overview:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  // 3. Load specific room details when selected
  const fetchRoomDetails = useCallback(async (rNum: number) => {
    setLoadingRoom(true);
    try {
      const res = await fetch(`/api/map/room/${rNum}`);
      const data = await res.json();
      if (res.ok) {
        setRoomDetails(data.room);
      }
    } catch (err) {
      console.error('Error fetching room detail:', err);
    } finally {
      setLoadingRoom(false);
    }
  }, []);

  useEffect(() => {
    if (selectedRoomNumber) {
      fetchRoomDetails(selectedRoomNumber);
    } else {
      setRoomDetails(null);
    }
  }, [selectedRoomNumber, fetchRoomDetails]);

  // 4. Handle "Locate on Map" URL query parameters
  useEffect(() => {
    const qRoom = searchParams.get('room');
    const qCabin = searchParams.get('cabin');
    const qTable = searchParams.get('table');

    if (qRoom) {
      const rNum = parseInt(qRoom, 10);
      if (!isNaN(rNum) && rNum >= 301 && rNum <= 340) {
        setSelectedRoomNumber(rNum);
        if (qCabin) setSelectedCabinLetter(qCabin.toUpperCase());
        if (qTable) setSelectedTableNumber(parseInt(qTable, 10));
        toast(`Locating Room ${rNum} • Cabin ${qCabin || ''}-${qTable || ''}`, 'info');
      }
    }
  }, [searchParams, toast]);

  // Handle Room Click
  const handleRoomClick = (roomNumber: number) => {
    if (selectedRoomNumber === roomNumber) {
      // already selected, keep open or change cabin
      return;
    }
    setSelectedRoomNumber(roomNumber);
    setSelectedCabinLetter('A'); // default to cabin A
    setSelectedTableNumber(null);
  };

  // Reset Map View
  const handleResetMap = () => {
    setSelectedRoomNumber(null);
    setSelectedCabinLetter(null);
    setSelectedTableNumber(null);
    setRoomDetails(null);
    setMapSearch('');
    toast('Map selection reset to overview', 'info');
  };

  // Filter or highlight rooms matching mapSearch
  const matchingRoomNumbers = useMemo(() => {
    if (!mapSearch.trim()) return new Set<number>();
    const query = mapSearch.trim().toLowerCase();
    const matches = new Set<number>();

    for (const r of rooms) {
      if (r.roomNumber.toString().includes(query)) {
        matches.add(r.roomNumber);
      }
      for (const c of r.cabins) {
        if (c.identifier.toLowerCase().includes(query)) {
          matches.add(r.roomNumber);
        }
      }
    }
    return matches;
  }, [mapSearch, rooms]);

  // Get active cabin from roomDetails
  const activeCabin = useMemo(() => {
    if (!roomDetails || !selectedCabinLetter) return null;
    return roomDetails.cabins.find((c: any) => c.letter === selectedCabinLetter);
  }, [roomDetails, selectedCabinLetter]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <DemoBanner />
      <Navbar
        user={currentUser}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole={currentUser?.role} />

        <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full space-y-5">
          {/* Top Map Header & Controls */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-brand-600" />
                <h1 className="text-base sm:text-lg font-bold text-slate-900">
                  LHC 3rd Floor
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                40 Rooms (301–340) • 240 Cabins (A–F)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Map search box */}
              <div className="relative">
                <input
                  type="text"
                  value={mapSearch}
                  onChange={(e) => setMapSearch(e.target.value)}
                  placeholder="Find room (301-340) or cabin (301-A)..."
                  className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 w-64"
                  id="map-filter-input"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              </div>

              {/* Reset Map Button */}
              <button
                onClick={handleResetMap}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                id="map-reset-btn"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Map</span>
              </button>
            </div>
          </div>

          {/* Availability Color Legend */}
          <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between text-xs gap-3">
            <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
              Cabin Status Legend:
            </span>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-600"></span>
                <span className="text-emerald-800">Available (All Present)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500 border border-rose-600"></span>
                <span className="text-rose-800">Unavailable (Away)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500 border border-amber-600"></span>
                <span className="text-amber-800">Mixed (Some Present)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-300 border border-slate-400"></span>
                <span className="text-slate-600">Vacant / Stale</span>
              </div>
            </div>
          </div>

          {/* MAIN RECTANGULAR GRID (5 Rows × 8 Columns = Exactly 40 Rooms) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-brand-600" />
                <span className="font-bold text-xs uppercase tracking-wide text-slate-700">
                  Floor Grid Layout (5 Rows × 8 Columns)
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                Click any room to inspect its 6 cabins
              </span>
            </div>

            {loading ? (
              <div className="py-20 text-center text-xs text-slate-500">
                <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <span>Generating rectangular floor grid...</span>
              </div>
            ) : (
              <div className="overflow-x-auto pb-2">
                <div className="grid grid-cols-8 gap-2.5 min-w-[760px]">
                  {rooms.map((room) => {
                    const isSelected = selectedRoomNumber === room.roomNumber;
                    const isSearched = matchingRoomNumbers.has(room.roomNumber);

                    // Compute overall room color badge
                    let statusBg = 'bg-slate-50 border-slate-200 text-slate-700 hover:border-brand-400';
                    if (room.availableCount > 0 && room.unavailableCount === 0) {
                      statusBg = 'bg-emerald-50/70 border-emerald-300 text-emerald-900 hover:border-emerald-500';
                    } else if (room.unavailableCount > 0 && room.availableCount === 0) {
                      statusBg = 'bg-rose-50/70 border-rose-300 text-rose-900 hover:border-rose-500';
                    } else if (room.availableCount > 0 && room.unavailableCount > 0) {
                      statusBg = 'bg-amber-50/70 border-amber-300 text-amber-900 hover:border-amber-500';
                    }

                    if (isSelected) {
                      statusBg = 'border-2 border-brand-600 bg-brand-50 text-brand-900 ring-2 ring-brand-300 shadow-md';
                    }

                    return (
                      <button
                        key={room.roomNumber}
                        onClick={() => handleRoomClick(room.roomNumber)}
                        className={`p-3 rounded-xl border text-center transition-all flex flex-col justify-between h-24 relative group ${statusBg} ${
                          isSearched ? 'ring-2 ring-blue-500 scale-105' : ''
                        }`}
                        id={`room-box-${room.roomNumber}`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Room</span>
                          {room.availableCount > 0 && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          )}
                        </div>

                        <span className="text-xl font-black tracking-tight my-auto">{room.roomNumber}</span>

                        {/* Room Hover Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-white text-[10px] py-1 px-2 rounded shadow-lg whitespace-nowrap z-50 pointer-events-none">
                          Room {room.roomNumber}: 6 Cabins (A–F)
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* DETAILED ROOM & CABIN DRILLDOWN PANEL */}
          {selectedRoomNumber && (
            <div className="bg-white rounded-2xl border-2 border-brand-400 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="bg-brand-600 px-6 py-4 text-white flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-white/20 font-bold px-2 py-0.5 rounded uppercase">
                      Selected Room
                    </span>
                    <h2 className="text-lg font-black">Room {selectedRoomNumber}</h2>
                  </div>
                  <p className="text-xs text-brand-100 mt-0.5">
                    Click a cabin tab (A through F) to view assigned professors and cabin locations.
                  </p>
                </div>

                <button
                  onClick={() => setSelectedRoomNumber(null)}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-xs font-semibold transition-colors"
                >
                  Close Room
                </button>
              </div>

              {loadingRoom ? (
                <div className="p-12 text-center text-xs text-slate-500">
                  <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <span>Loading cabins...</span>
                </div>
              ) : (
                <div className="p-6 space-y-6">
                  {/* Cabins Selector Tabs (A, B, C, D, E, F) */}
                  <div>
                    <span className="text-xs font-bold text-slate-700 block mb-2 uppercase tracking-wider">
                      Cabins in Room {selectedRoomNumber}
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                      {roomDetails?.cabins?.map((cabin: any) => {
                        const isCabinActive = selectedCabinLetter === cabin.letter;
                        return (
                          <button
                            key={cabin.letter}
                            onClick={() => {
                              setSelectedCabinLetter(cabin.letter);
                              setSelectedTableNumber(null);
                            }}
                            className={`p-3 rounded-xl border text-center transition-all ${
                              isCabinActive
                                ? 'border-brand-600 bg-brand-50 text-brand-900 font-black shadow-md ring-2 ring-brand-300'
                                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                            }`}
                            id={`cabin-tab-${cabin.letter}`}
                          >
                            <span className="text-xs text-slate-400 block font-normal">Cabin</span>
                            <span className="text-lg font-bold block">{cabin.letter}</span>
                            <span
                              className="text-[10px] font-bold block mt-1"
                              style={{ color: cabin.color }}
                            >
                              {cabin.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* ACTIVE CABIN: 4 SEATS DISPLAY (Cabin A-1, A-2, A-3, A-4) */}
                  {activeCabin && (
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeCabin.color }}></span>
                          <h3 className="font-bold text-sm text-slate-900">
                            Room {selectedRoomNumber} • Cabin {activeCabin.letter} (Positions {activeCabin.letter}-1 to {activeCabin.letter}-4)
                          </h3>
                        </div>
                        <span className="text-xs font-semibold text-slate-500">
                          Status: <strong style={{ color: activeCabin.color }}>{activeCabin.label}</strong>
                        </span>
                      </div>

                      {/* 4 Cabins Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {activeCabin.tables.map((table: any) => {
                          const isTableHighlighted = selectedTableNumber === table.tableNumber;
                          const prof = table.professor;

                          return (
                            <div
                              key={table.id}
                              className={`bg-white p-4 rounded-xl border transition-all flex flex-col justify-between ${
                                isTableHighlighted
                                  ? 'border-2 border-brand-600 ring-2 ring-brand-200 shadow-lg bg-brand-50/20'
                                  : 'border-slate-200 hover:border-slate-300 shadow-sm'
                              }`}
                              id={`table-card-${table.tableNumber}`}
                            >
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                                    Cabin {activeCabin.letter}-{table.tableNumber}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {table.identifier}
                                  </span>
                                </div>

                                {table.isVacant ? (
                                  <div className="py-6 text-center text-slate-400 space-y-1">
                                    <span className="text-xs font-bold uppercase tracking-wider block">
                                      Vacant Position
                                    </span>
                                    <span className="text-[11px] block">No faculty assigned</span>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    <div className="flex items-start justify-between gap-1">
                                      <div>
                                        <h4 className="font-bold text-xs text-slate-900 leading-snug">
                                          {prof.name}
                                        </h4>
                                        <span className="text-[10px] text-slate-500 block">
                                          {prof.designation}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Availability Status Badge */}
                                    <div className="pt-1">
                                      <span
                                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${prof.availability.badgeClass}`}
                                      >
                                        {prof.availability.state === 'AVAILABLE' ? (
                                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                        ) : prof.availability.state === 'UNAVAILABLE' ? (
                                          <XCircle className="w-3 h-3 text-rose-600" />
                                        ) : (
                                          <Clock className="w-3 h-3 text-slate-500" />
                                        )}
                                        <span>{prof.availability.label}</span>
                                      </span>
                                    </div>

                                    <div className="text-[11px] text-slate-600 space-y-1 pt-1">
                                      <p className="truncate font-medium">{prof.department}</p>
                                      <p className="truncate text-slate-500">{prof.email}</p>
                                      <p className="text-slate-500">{prof.contactNumber}</p>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {!table.isVacant && (
                                <div className="mt-3 pt-3 border-t border-slate-100">
                                  <Link
                                    href={`/faculty/${prof.id}`}
                                    className="w-full py-1.5 px-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition-colors"
                                  >
                                    <User className="w-3 h-3" />
                                    <span>View Profile & Timetable</span>
                                  </Link>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function InteractiveMapPage() {
  return (
    <ToastProvider>
      <MapContent />
    </ToastProvider>
  );
}
