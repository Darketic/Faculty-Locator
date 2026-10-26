'use client';

import React from 'react';
import { Database, AlertTriangle } from 'lucide-react';

export default function DemoBanner() {
  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-1.5 text-xs font-medium flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <span className="bg-amber-200 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
          <Database className="w-3 h-3" /> DEMO DATA
        </span>
        <span className="truncate">
          Fictional demonstration faculty records for Software Engineering Academic Project. Connected to live PostgreSQL database.
        </span>
      </div>
      <div className="hidden md:flex items-center space-x-4 text-[11px] text-amber-800">
        <span>40 Rooms • 240 Cabins</span>
        <span className="text-amber-500">•</span>
        <span>PostgreSQL & Prisma</span>
      </div>
    </div>
  );
}
