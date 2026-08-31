import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { conflictsAPI, tripsAPI } from '../services/api';
import Chatbot from '../components/Chatbot';

export default function ConflictsView() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [conflictData, setConflictData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [resolutionSummary, setResolutionSummary] = useState(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      let tripRes;
      if (id) {
        tripRes = await tripsAPI.getTrip(id);
      } else {
        tripRes = await tripsAPI.getDemoPreset();
      }
      setTrip(tripRes.data);

      const confRes = await conflictsAPI.scanConflicts(tripRes.data.id);
      setConflictData(confRes.data);
    } catch (err) {
      console.warn('Conflict page load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAll = async () => {
    if (!trip) return;
    setResolving(true);
    try {
      const res = await conflictsAPI.resolveConflicts(trip.id);
      setResolutionSummary(res.data);
      await loadData();
    } catch (err) {
      console.error('Resolve error:', err);
    } finally {
      setResolving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen p-8 text-center text-xs text-slate-400">Scanning schedule matrix for conflicts...</div>;
  }

  if (!trip) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                Conflict Engine
              </span>
              <h2 className="text-xl font-bold text-slate-900">Schedule & Transit Collision Detector</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Automated validation against opening hours, transit matrices, flight timings, and venue availability for {trip.destination}.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={loadData}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-smooth"
            >
              Re-Scan Matrix
            </button>

            {conflictData?.has_conflicts && (
              <button
                onClick={handleResolveAll}
                disabled={resolving}
                className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-smooth disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${resolving ? 'animate-spin' : ''}`} />
                <span>{resolving ? 'Resolving...' : 'Auto-Resolve All with AI'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Resolution Message Banner if recently resolved */}
        {resolutionSummary && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2 animate-in fade-in">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{resolutionSummary.resolution_summary}</span>
            </div>
            <ul className="text-[11px] text-emerald-800 space-y-1 pl-6 list-disc">
              {resolutionSummary.changes_applied.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Conflict Status Banner */}
        {!conflictData?.has_conflicts ? (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center shadow-subtle space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Zero Schedule Conflicts</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              All daily attraction timings, required transit buffers, check-in windows, and budget boundaries are 100% synchronized and valid.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Detected Conflicts ({conflictData.total_conflicts})
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {conflictData.conflicts.map((c) => (
                <div key={c.id} className="bg-white rounded-2xl p-5 border border-amber-200 shadow-subtle space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      {c.title}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        c.severity === 'critical'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {c.severity}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {c.description}
                  </p>

                  <div className="text-xs text-emerald-800 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200 flex items-start gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <b>Recommended Fix:</b> {c.suggested_fix}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
      <Chatbot tripId={trip.id} onItineraryModified={loadData} />
    </div>
  );
}
