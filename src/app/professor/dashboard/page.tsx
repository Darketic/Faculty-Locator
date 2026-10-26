'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  Building,
  Mail,
  Phone,
  Shield,
  Layers,
  Sparkles,
  ArrowRight,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  AlertCircle,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import DemoBanner from '@/components/DemoBanner';
import { ToastProvider, useToast } from '@/components/Toast';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Schedule {
  id: number;
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  section: string;
  classroom: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DAY_ORDER: Record<string, number> = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
};

const EMPTY_FORM: Omit<Schedule, 'id'> = {
  day: 'Monday',
  startTime: '09:00 AM',
  endTime: '10:00 AM',
  subject: '',
  section: '',
  classroom: '',
};

// ─── Schedule Editor Modal ────────────────────────────────────────────────────

function ScheduleModal({
  mode,
  initial,
  onClose,
  onSave,
}: {
  mode: 'add' | 'edit';
  initial: Omit<Schedule, 'id'>;
  onClose: () => void;
  onSave: (data: Omit<Schedule, 'id'>) => Promise<void>;
}) {
  const [form, setForm] = useState<Omit<Schedule, 'id'>>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.subject.trim()) { setError('Subject is required'); return; }
    if (!form.section.trim()) { setError('Section is required'); return; }
    if (!form.classroom.trim()) { setError('Classroom / Lab is required'); return; }
    setSaving(true);
    try {
      await onSave(form);
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="bg-brand-600 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <span className="font-bold text-sm uppercase tracking-wide">
              {mode === 'add' ? 'Add New Class' : 'Edit Class Entry'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Day */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Day
            </label>
            <select
              value={form.day}
              onChange={(e) => set('day', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              id="sched-modal-day"
            >
              {DAYS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Timing Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Start Time
              </label>
              <input
                type="text"
                value={form.startTime}
                onChange={(e) => set('startTime', e.target.value)}
                placeholder="09:00 AM"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                id="sched-modal-start"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                End Time
              </label>
              <input
                type="text"
                value={form.endTime}
                onChange={(e) => set('endTime', e.target.value)}
                placeholder="10:00 AM"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                id="sched-modal-end"
              />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 -mt-2">Format: HH:MM AM / PM — e.g. 09:00 AM, 01:30 PM</p>

          {/* Subject */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Subject
            </label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => set('subject', e.target.value)}
              placeholder="Software Engineering"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              id="sched-modal-subject"
            />
          </div>

          {/* Section + Classroom Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Section
              </label>
              <input
                type="text"
                value={form.section}
                onChange={(e) => set('section', e.target.value)}
                placeholder="CSE 6A"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                id="sched-modal-section"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Classroom / Lab
              </label>
              <input
                type="text"
                value={form.classroom}
                onChange={(e) => set('classroom', e.target.value)}
                placeholder="3AB-201"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                id="sched-modal-classroom"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-xs font-bold rounded-lg shadow transition-colors"
              id="sched-modal-save-btn"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving…' : mode === 'add' ? 'Add Class' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Dashboard Component ─────────────────────────────────────────────────

function ProfessorDashboardContent() {
  const router = useRouter();
  const { toast } = useToast();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [professor, setProfessor] = useState<any>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Modal state
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // ── Load professor data ──
  const loadProfessorData = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();

      if (!data.authenticated) { router.push('/login'); return; }
      if (data.user.role !== 'PROFESSOR') {
        toast('Access restricted: Professor role required', 'error');
        router.push('/student/dashboard');
        return;
      }

      setCurrentUser(data.user);

      if (data.user.professor) {
        const profRes = await fetch(`/api/faculty/${data.user.professor.id}`);
        const profData = await profRes.json();
        if (profRes.ok) {
          setProfessor(profData.professor);
          // Use schedules from faculty endpoint initially
          setSchedules(
            (profData.professor.schedules || []).sort(
              (a: Schedule, b: Schedule) =>
                (DAY_ORDER[a.day] ?? 99) - (DAY_ORDER[b.day] ?? 99)
            )
          );
        }
      }
    } catch (err) {
      console.error('Error loading professor:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProfessorData(); }, [router]);

  // ── Availability update ──
  const handleUpdateAvailability = async (isAvailable: boolean) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch('/api/faculty/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable }),
      });
      const data = await res.json();
      if (!res.ok) { toast(data.error || 'Failed to update availability', 'error'); return; }
      setProfessor((prev: any) => ({ ...prev, availability: data.availability }));
      toast(
        isAvailable
          ? 'Status updated: Available in Cabin (Saved to PostgreSQL)'
          : 'Status updated: Unavailable (Saved to PostgreSQL)',
        'success'
      );
    } catch {
      toast('Network error while updating status', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ── Schedule CRUD ──
  const handleAddSchedule = async (form: Omit<Schedule, 'id'>) => {
    const res = await fetch('/api/faculty/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add class');
    setSchedules((prev) =>
      [...prev, data.schedule].sort(
        (a, b) => (DAY_ORDER[a.day] ?? 99) - (DAY_ORDER[b.day] ?? 99)
      )
    );
    setModalMode(null);
    toast('New class added to timetable ✓', 'success');
  };

  const handleEditSchedule = async (form: Omit<Schedule, 'id'>) => {
    if (!editingSchedule) return;
    const res = await fetch(`/api/faculty/schedules/${editingSchedule.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update class');
    setSchedules((prev) =>
      prev
        .map((s) => (s.id === editingSchedule.id ? data.schedule : s))
        .sort((a, b) => (DAY_ORDER[a.day] ?? 99) - (DAY_ORDER[b.day] ?? 99))
    );
    setModalMode(null);
    setEditingSchedule(null);
    toast('Timetable entry updated ✓', 'success');
  };

  const handleDeleteSchedule = async (id: number) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/faculty/schedules/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) { toast(data.error || 'Failed to delete class', 'error'); return; }
      setSchedules((prev) => prev.filter((s) => s.id !== id));
      toast('Class entry removed from timetable ✓', 'success');
    } catch {
      toast('Network error while deleting', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const openAdd = () => { setEditingSchedule(null); setModalMode('add'); };
  const openEdit = (s: Schedule) => { setEditingSchedule(s); setModalMode('edit'); };
  const closeModal = () => { setModalMode(null); setEditingSchedule(null); };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span className="text-xs text-slate-500">Loading Professor Portal…</span>
        </div>
      </div>
    );
  }

  const isAvailable = professor?.availability?.state === 'AVAILABLE';
  const isUnavailable = professor?.availability?.state === 'UNAVAILABLE';
  const lastUpdatedFormatted = professor?.availability?.lastUpdated
    ? new Date(professor.availability.lastUpdated).toLocaleTimeString([], {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      })
    : 'Not yet recorded';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Schedule modal */}
      {modalMode && (
        <ScheduleModal
          mode={modalMode}
          initial={
            modalMode === 'edit' && editingSchedule
              ? {
                  day: editingSchedule.day,
                  startTime: editingSchedule.startTime,
                  endTime: editingSchedule.endTime,
                  subject: editingSchedule.subject,
                  section: editingSchedule.section,
                  classroom: editingSchedule.classroom,
                }
              : EMPTY_FORM
          }
          onClose={closeModal}
          onSave={modalMode === 'add' ? handleAddSchedule : handleEditSchedule}
        />
      )}

      <DemoBanner />
      <Navbar user={currentUser} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole={currentUser?.role} />

        <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Faculty Cabin Management Portal
              </h1>
              <p className="text-xs text-slate-500">
                Welcome, {professor?.name || currentUser?.fullName}. Manage your cabin availability and view schedules.
              </p>
            </div>
            {professor?.location && (
              <Link
                href={`/map?room=${professor.location.roomNumber}&cabin=${professor.location.cabinLetter}&table=${professor.location.tableNumber}&profId=${professor.id}`}
                className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto"
                id="prof-view-cabin-map-btn"
              >
                <MapPin className="w-4 h-4" />
                <span>View My Cabin on Map</span>
              </Link>
            )}
          </div>

          {/* ── Availability Controller ── */}
          <div className="bg-white rounded-2xl shadow-md border-2 border-brand-200 overflow-hidden">
            <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-3.5 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-brand-200" />
                <span className="font-bold text-sm tracking-wide uppercase">
                  Live Cabin Availability Controls
                </span>
              </div>
              <div className="text-[11px] bg-white/20 px-2.5 py-0.5 rounded-full font-medium">
                PostgreSQL Source of Truth
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                    Current Confirmed Status
                  </span>
                  <div className="flex items-center space-x-3 my-2">
                    <span
                      className={`w-4 h-4 rounded-full ${
                        isAvailable ? 'bg-emerald-500 animate-pulse' : isUnavailable ? 'bg-rose-500' : 'bg-slate-400'
                      }`}
                    />
                    <span className="text-lg font-black text-slate-900">
                      {professor?.availability?.label || 'Status Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-slate-500 space-x-2 mt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Last Saved in DB: {lastUpdatedFormatted}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Availability is instantly broadcast to student search and the 40-room floor map.
                  </p>
                </div>

                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleUpdateAvailability(true)}
                    disabled={updatingStatus}
                    className={`p-5 rounded-xl border-2 flex flex-col items-center justify-center text-center transition-all ${
                      isAvailable
                        ? 'border-emerald-600 bg-emerald-50 ring-4 ring-emerald-100 shadow-md'
                        : 'border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50/50'
                    }`}
                    id="prof-status-available-btn"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
                      <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                    </div>
                    <span className="text-sm font-black text-emerald-800">I'm Available in My Cabin</span>
                    <span className="text-[11px] text-emerald-600 mt-0.5">Mark cabin seat active for students</span>
                    {isAvailable && (
                      <span className="mt-2 text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full uppercase">
                        Active State
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateAvailability(false)}
                    disabled={updatingStatus}
                    className={`p-5 rounded-xl border-2 flex flex-col items-center justify-center text-center transition-all ${
                      isUnavailable
                        ? 'border-rose-600 bg-rose-50 ring-4 ring-rose-100 shadow-md'
                        : 'border-slate-200 bg-white hover:border-rose-400 hover:bg-rose-50/50'
                    }`}
                    id="prof-status-unavailable-btn"
                  >
                    <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-2">
                      <XCircle className="w-7 h-7 text-rose-600" />
                    </div>
                    <span className="text-sm font-black text-rose-800">I'm Unavailable</span>
                    <span className="text-[11px] text-rose-600 mt-0.5">In lecture, meeting, or away</span>
                    {isUnavailable && (
                      <span className="mt-2 text-[10px] font-bold bg-rose-600 text-white px-2 py-0.5 rounded-full uppercase">
                        Active State
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Profile + Cabin + Guidelines ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Faculty Details */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <User className="w-5 h-5 text-brand-600" />
                <h2 className="text-sm font-bold text-slate-800">Profile Details</h2>
              </div>
              <div className="space-y-2 text-xs">
                {[
                  ['Faculty Name', professor?.name, 'font-bold text-slate-800 text-sm'],
                  ['Designation', professor?.designation],
                  ['Faculty ID', professor?.facultyId, 'font-mono font-semibold'],
                  ['Department', professor?.department],
                  ['College Email', professor?.email],
                  ['Phone Number', professor?.contactNumber],
                  ['Office Hours', professor?.officeHours],
                ].map(([label, value, extra = '']) => (
                  <div key={String(label)}>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">{label}</span>
                    <span className={`text-slate-700 font-medium ${extra}`}>{value || '—'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cabin Assignment */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <MapPin className="w-5 h-5 text-brand-600" />
                <h2 className="text-sm font-bold text-slate-800">Assigned Cabin Location</h2>
              </div>
              {professor?.location ? (
                <div className="space-y-3 text-xs">
                  <div className="p-4 bg-brand-50 border border-brand-200 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-brand-800 uppercase tracking-wider block">
                      Assigned Location
                    </span>
                    <span className="text-xl font-black text-brand-900 block my-1">
                      {professor.location.locationString}
                    </span>
                    <span className="text-xs text-brand-700 font-mono">
                      Cabin ID: {professor.location.tableIdentifier}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">Room</span>
                      <span className="text-sm font-bold text-slate-800">{professor.location.roomNumber}</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">Cabin</span>
                      <span className="text-sm font-bold text-slate-800">
                        {professor.location.cabinLetter}-{professor.location.tableNumber}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    This cabin location is dynamically mapped into the 40-room rectangular grid system.
                  </p>
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-slate-500">No active cabin assignment found.</div>
              )}
            </div>

            {/* Guidelines */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <Shield className="w-5 h-5 text-brand-600" />
                <h2 className="text-sm font-bold text-slate-800">Faculty Guidelines</h2>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
                {[
                  <>Please mark yourself <strong>Available</strong> whenever present in your cabin.</>,
                  <>When leaving for lectures or labs, switch status to <strong>Unavailable</strong>.</>,
                  <>Status older than 60 minutes is marked as stale to keep students accurately informed.</>,
                  <>All status updates persist permanently in PostgreSQL.</>,
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-brand-600 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── Weekly Timetable (editable) ── */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-brand-600" />
                <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Weekly Class Timetable (Monday through Saturday)
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-slate-500 font-semibold">
                  {schedules.length} scheduled session{schedules.length !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={openAdd}
                  className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm transition-colors"
                  id="sched-add-btn"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Class
                </button>
              </div>
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
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {schedules.length > 0 ? (
                    schedules.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="py-2.5 px-4 font-bold text-slate-900">{s.day}</td>
                        <td className="py-2.5 px-4 font-mono text-[11px]">
                          {s.startTime} – {s.endTime}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-brand-800">{s.subject}</td>
                        <td className="py-2.5 px-4">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                            {s.section}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-slate-800">{s.classroom}</td>
                        <td className="py-2.5 px-4">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEdit(s)}
                              className="p-1.5 rounded hover:bg-brand-50 text-brand-600 hover:text-brand-700 transition-colors"
                              title="Edit this entry"
                              id={`sched-edit-${s.id}`}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSchedule(s.id)}
                              disabled={deletingId === s.id}
                              className="p-1.5 rounded hover:bg-rose-50 text-rose-500 hover:text-rose-700 transition-colors disabled:opacity-40"
                              title="Delete this entry"
                              id={`sched-delete-${s.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-400">
                        <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="font-semibold">No scheduled classes yet.</p>
                        <p className="text-[11px] mt-1">Click <strong>Add Class</strong> to create your first timetable entry.</p>
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

export default function ProfessorDashboardPage() {
  return (
    <ToastProvider>
      <ProfessorDashboardContent />
    </ToastProvider>
  );
}
