export type AvailabilityState = 'AVAILABLE' | 'UNAVAILABLE' | 'STALE' | 'UNKNOWN';
export type CabinRollupState = 'AVAILABLE' | 'UNAVAILABLE' | 'MIXED' | 'VACANT' | 'UNKNOWN';

export function getFreshnessThresholdMinutes(): number {
  const val = process.env.AVAILABILITY_STALE_MINUTES;
  const parsed = val ? parseInt(val, 10) : 60;
  return isNaN(parsed) || parsed <= 0 ? 60 : parsed;
}

export function isStatusStale(lastUpdated: Date | string | null | undefined): boolean {
  if (!lastUpdated) return true;
  const updatedTime = new Date(lastUpdated).getTime();
  const thresholdMs = getFreshnessThresholdMinutes() * 60 * 1000;
  return Date.now() - updatedTime > thresholdMs;
}

export function computeProfessorStatus(
  isAvailable: boolean | null | undefined,
  lastUpdated: Date | string | null | undefined
): { state: AvailabilityState; isStale: boolean; label: string; color: string; badgeClass: string } {
  if (isAvailable === null || isAvailable === undefined) {
    return {
      state: 'UNKNOWN',
      isStale: false,
      label: 'Unknown',
      color: '#64748B',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
    };
  }

  const stale = isStatusStale(lastUpdated);
  if (stale) {
    return {
      state: 'STALE',
      isStale: true,
      label: 'Status Stale (>60m)',
      color: '#64748B',
      badgeClass: 'bg-slate-100 text-slate-600 border-dashed border-slate-400',
    };
  }

  if (isAvailable) {
    return {
      state: 'AVAILABLE',
      isStale: false,
      label: 'Available in Cabin',
      color: '#16A34A',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-300',
    };
  } else {
    return {
      state: 'UNAVAILABLE',
      isStale: false,
      label: 'Unavailable',
      color: '#DC2626',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-300',
    };
  }
}

export function computeCabinRollup(
  assignedStatuses: Array<{ isAvailable: boolean | null | undefined; lastUpdated: Date | string | null | undefined }>
): { rollup: CabinRollupState; availableCount: number; unavailableCount: number; totalAssigned: number; label: string; color: string } {
  const totalAssigned = assignedStatuses.length;
  if (totalAssigned === 0) {
    return {
      rollup: 'VACANT',
      availableCount: 0,
      unavailableCount: 0,
      totalAssigned: 0,
      label: 'Vacant Cabin',
      color: '#94A3B8',
    };
  }

  let availableCount = 0;
  let unavailableCount = 0;
  let staleOrUnknownCount = 0;

  for (const item of assignedStatuses) {
    const status = computeProfessorStatus(item.isAvailable, item.lastUpdated);
    if (status.state === 'AVAILABLE') {
      availableCount++;
    } else if (status.state === 'UNAVAILABLE') {
      unavailableCount++;
    } else {
      staleOrUnknownCount++;
    }
  }

  if (availableCount > 0 && unavailableCount === 0 && staleOrUnknownCount === 0) {
    return {
      rollup: 'AVAILABLE',
      availableCount,
      unavailableCount,
      totalAssigned,
      label: 'All Available',
      color: '#16A34A',
    };
  }

  if (unavailableCount > 0 && availableCount === 0 && staleOrUnknownCount === 0) {
    return {
      rollup: 'UNAVAILABLE',
      availableCount,
      unavailableCount,
      totalAssigned,
      label: 'All Unavailable',
      color: '#DC2626',
    };
  }

  if (availableCount > 0 && unavailableCount > 0) {
    return {
      rollup: 'MIXED',
      availableCount,
      unavailableCount,
      totalAssigned,
      label: 'Mixed Status',
      color: '#D97706',
    };
  }

  return {
    rollup: 'UNKNOWN',
    availableCount,
    unavailableCount,
    totalAssigned,
    label: 'Status Pending/Stale',
    color: '#64748B',
  };
}
