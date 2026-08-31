import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Sparkles, ChevronDown, ChevronUp, Clock, AlertCircle } from 'lucide-react';
import { conflictsAPI } from '../services/api';

export default function ConflictBanner({ tripId, onResolved }) {
  const [conflictData, setConflictData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    if (tripId) {
      loadConflicts();
    }
  }, [tripId]);

  const loadConflicts = async () => {
    setLoading(true);
    try {
      const res = await conflictsAPI.scanConflicts(tripId);
      setConflictData(res.data);
    } catch (err) {
      console.warn('Conflict scan error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAll = async () => {
    setResolving(true);
    try {
      const res = await conflictsAPI.resolveConflicts(tripId);
      await loadConflicts();
      if (onResolved) {
        onResolved(res.data);
      }
    } catch (err) {
      console.error('Conflict resolve error:', err);
    } finally {
      setResolving(false);
    }
  };

  if (!conflictData) return null;

  if (!conflictData.has_conflicts) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between shadow-subtle">
        <div className="flex items-center space-x-2.5 text-xs text-emerald-800 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span><b>Schedule Collision-Free:</b> All activities, transit buffers, and hotel/flight bookings are synchronized.</span>
        </div>
        <button
          onClick={loadConflicts}
          className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 underline"
        >
          Re-scan
        </button>
      </div>
    );
  }

  return (
    <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-4 shadow-subtle transition-smooth">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Left icon and message */}
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-amber-900">
                {conflictData.total_conflicts} Schedule & Transit Conflict(s) Detected
              </span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-200/70 text-amber-800">
                {conflictData.critical_count} Critical
              </span>
            </div>
            <p className="text-xs text-amber-800/90 mt-0.5">
              {conflictData.ai_summary}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 self-end sm:self-auto">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1.5 text-xs font-medium text-amber-900 bg-amber-100 hover:bg-amber-200/80 rounded-lg flex items-center space-x-1"
          >
            <span>{isExpanded ? 'Hide Details' : 'View Conflicts'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleResolveAll}
            disabled={resolving}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-smooth disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${resolving ? 'animate-spin' : ''}`} />
            <span>{resolving ? 'Auto-Resolving...' : 'Auto-Resolve with AI'}</span>
          </button>
        </div>

      </div>

      {/* Expanded List of Conflicts */}
      {isExpanded && (
        <div className="mt-4 pt-3 border-t border-amber-200/70 space-y-2.5">
          {conflictData.conflicts.map((c) => (
            <div key={c.id} className="bg-white/80 rounded-lg p-3 border border-amber-200 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  {c.title}
                </span>
                {c.day_number && (
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    Day {c.day_number}
                  </span>
                )}
              </div>
              <p className="text-slate-600 mt-1">{c.description}</p>
              <div className="mt-2 text-[11px] font-medium text-emerald-700 bg-emerald-50/80 p-1.5 rounded border border-emerald-200/60 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <b>AI Fix:</b> {c.suggested_fix}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
