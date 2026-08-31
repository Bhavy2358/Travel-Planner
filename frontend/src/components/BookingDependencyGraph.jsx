import React, { useState, useEffect } from 'react';
import { Plane, Car, Hotel, Calendar, ArrowRight, AlertTriangle, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';
import { bookingsAPI } from '../services/api';

export default function BookingDependencyGraph({ tripId, onCascadeUpdated }) {
  const [cascadeResult, setCascadeResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  const handleSimulateDelay = async () => {
    setIsSimulating(true);
    setAppliedSuccess(false);
    try {
      const res = await bookingsAPI.simulateFlightDelay(tripId, 2.0, "Air Traffic Control Delay (Simulated)");
      setCascadeResult(res.data);
      if (onCascadeUpdated) onCascadeUpdated();
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleApplyResolution = async () => {
    setIsApplying(true);
    try {
      await bookingsAPI.applyDelayResolution(tripId);
      setAppliedSuccess(true);
      setCascadeResult(null);
      if (onCascadeUpdated) onCascadeUpdated();
    } catch (err) {
      console.error('Apply resolution error:', err);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-subtle space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
              Major Feature
            </span>
            <h3 className="text-base font-bold text-slate-900">Smart Booking Dependency & Cascading Engine</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tracks interconnected travel services. If your flight is delayed, downstream transfers, hotel check-in, and day tours automatically re-align.
          </p>
        </div>

        <button
          onClick={handleSimulateDelay}
          disabled={isSimulating}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition-smooth shadow-sm disabled:opacity-50 self-start sm:self-auto shrink-0"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
          <span>{isSimulating ? 'Simulating...' : 'Simulate 2-Hour Flight Delay'}</span>
        </button>
      </div>

      {/* Dependency Flow Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
        
        {/* Node 1: Flight */}
        <div className={`p-4 rounded-xl border transition-smooth ${cascadeResult ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/30' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
              <Plane className="w-4 h-4" />
            </div>
            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${cascadeResult ? 'bg-amber-200 text-amber-900' : 'bg-emerald-100 text-emerald-800'}`}>
              {cascadeResult ? 'Delayed +2h' : 'Confirmed'}
            </span>
          </div>
          <h4 className="text-xs font-bold text-slate-900">Flight DEL → AMD</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {cascadeResult ? 'Arrives 11:45 AM (Was 09:45 AM)' : 'Arrives 09:45 AM'}
          </p>
        </div>

        {/* Node 2: Transfer */}
        <div className={`p-4 rounded-xl border transition-smooth ${cascadeResult ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-400/30' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="p-1.5 rounded-lg bg-sky-100 text-sky-700">
              <Car className="w-4 h-4" />
            </div>
            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${cascadeResult ? 'bg-rose-200 text-rose-900 animate-pulse' : 'bg-emerald-100 text-emerald-800'}`}>
              {cascadeResult ? 'Conflict' : 'Synced'}
            </span>
          </div>
          <h4 className="text-xs font-bold text-slate-900">Airport Cab Transfer</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {cascadeResult ? 'Original 10:00 AM pickup impossible' : 'Pickup at 10:00 AM'}
          </p>
        </div>

        {/* Node 3: Hotel */}
        <div className={`p-4 rounded-xl border transition-smooth ${cascadeResult ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-400/30' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="p-1.5 rounded-lg bg-brand-100 text-brand-700">
              <Hotel className="w-4 h-4" />
            </div>
            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${cascadeResult ? 'bg-rose-200 text-rose-900' : 'bg-emerald-100 text-emerald-800'}`}>
              {cascadeResult ? 'Cascade' : 'Synced'}
            </span>
          </div>
          <h4 className="text-xs font-bold text-slate-900">The House of MG</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {cascadeResult ? 'Check-in must shift to 12:30 PM' : 'Check-in at 11:00 AM'}
          </p>
        </div>

        {/* Node 4: Day 1 Itinerary */}
        <div className={`p-4 rounded-xl border transition-smooth ${cascadeResult ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-400/30' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <Calendar className="w-4 h-4" />
            </div>
            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${cascadeResult ? 'bg-rose-200 text-rose-900' : 'bg-emerald-100 text-emerald-800'}`}>
              {cascadeResult ? 'Impacted' : 'On Schedule'}
            </span>
          </div>
          <h4 className="text-xs font-bold text-slate-900">Day 1 Itinerary</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {cascadeResult ? 'Ashram tour overlaps new check-in' : 'Starts 12:00 PM'}
          </p>
        </div>

      </div>

      {/* Cascading Conflict Resolution Box */}
      {cascadeResult && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3 animate-in fade-in">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <h4 className="text-xs font-bold text-amber-900">
                Cascading Impact: {cascadeResult.conflicts_detected} downstream items affected
              </h4>
            </div>
            <button
              onClick={handleApplyResolution}
              disabled={isApplying}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-smooth disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isApplying ? 'animate-spin' : ''}`} />
              <span>{isApplying ? 'Re-aligning...' : 'Apply AI Cascading Resolution'}</span>
            </button>
          </div>

          <p className="text-xs text-amber-900/90 leading-relaxed bg-white/70 p-3 rounded-lg border border-amber-200/60">
            {cascadeResult.ai_resolution_plan}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            {cascadeResult.affected_items.map((item, idx) => (
              <div key={idx} className="bg-white p-2.5 rounded-lg border border-amber-200 text-[11px]">
                <span className="font-bold text-slate-900">{item.name}</span>
                <p className="text-slate-500 mt-0.5">{item.conflict_description}</p>
                <div className="mt-1 text-emerald-700 font-semibold">New: {item.new_suggested_time}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Applied Success Message */}
      {appliedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center space-x-2 text-xs text-emerald-800 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>All downstream bookings and Day 1 itinerary activities were successfully synchronized with the new flight time!</span>
        </div>
      )}

    </div>
  );
}
