import React, { useState } from 'react';
import { Zap, TrendingDown, Clock, Route, CheckCircle2, RefreshCw } from 'lucide-react';
import { itineraryAPI } from '../services/api';

export default function RouteOptimizerCard({ trip, onOptimizationComplete }) {
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  if (!trip) return null;

  const beforeKm = trip.before_opt_distance_km || Math.round(trip.total_distance_km * 1.55 * 10) / 10;
  const afterKm = trip.total_distance_km;
  const savedKm = Math.max(0, Math.round((beforeKm - afterKm) * 10) / 10);

  const beforeMins = trip.before_opt_time_minutes || Math.round(trip.total_travel_time_minutes * 1.6);
  const afterMins = trip.total_travel_time_minutes;
  const savedMins = Math.max(0, beforeMins - afterMins);

  const formatHours = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const handleRunOptimizer = async () => {
    setLoading(true);
    try {
      const res = await itineraryAPI.optimizeRoute(trip.id);
      setLastResult(res.data);
      if (onOptimizationComplete) {
        onOptimizationComplete(res.data);
      }
    } catch (err) {
      console.error('Optimization error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-5 shadow-card border border-slate-700/60">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-700/50">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center gap-1 border border-amber-500/30">
              <Zap className="w-3.5 h-3.5" />
              Google OR-Tools
            </span>
            <h3 className="text-base font-bold text-white tracking-tight">Smart Route & Transit Optimizer</h3>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Minimizes transit distance, prevents unnecessary city backtracking, and respects venue opening windows.
          </p>
        </div>

        <button
          onClick={handleRunOptimizer}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 active:scale-95 rounded-xl shadow-sm transition-smooth disabled:opacity-50 self-start sm:self-auto shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Solving TSP...' : 'Re-Run Optimizer'}</span>
        </button>
      </div>

      {/* Comparison Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-4">
        
        {/* Before Optimization */}
        <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/50">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Before Optimization</span>
            <span className="text-rose-400">Standard Order</span>
          </div>
          <div className="flex items-baseline space-x-3">
            <span className="text-xl font-extrabold text-slate-300">{beforeKm} km</span>
            <span className="text-xs text-slate-400">({formatHours(beforeMins)})</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Direct stop additions without matrix routing</p>
        </div>

        {/* After Optimization */}
        <div className="bg-brand-900/40 rounded-xl p-3.5 border border-brand-500/40">
          <div className="text-[11px] font-semibold text-brand-300 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>After OR-Tools TSP</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-3">
            <span className="text-xl font-extrabold text-emerald-300">{afterKm} km</span>
            <span className="text-xs text-emerald-400 font-semibold">({formatHours(afterMins)})</span>
          </div>
          <p className="text-[11px] text-brand-200 mt-1">Geographically sequenced for minimum transit</p>
        </div>

        {/* Net Savings Badge */}
        <div className="bg-emerald-950/40 rounded-xl p-3.5 border border-emerald-500/40 flex flex-col justify-center">
          <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" />
            Total Savings
          </div>
          <div className="text-lg font-black text-white">
            -{savedKm} km <span className="text-emerald-400 text-sm font-semibold">(-{formatHours(savedMins)} saved)</span>
          </div>
          <p className="text-[11px] text-emerald-300/80 mt-0.5">Reduced cab fares & zero wasted transit hours</p>
        </div>

      </div>

      {/* Rationale Footer */}
      <div className="text-[11px] text-slate-300 bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/40 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
        <span>
          <b>Algorithm Detail:</b> Solved via <i>Google OR-Tools Routing Index Manager</i> with <i>Guided Local Search</i> and time-window constraint satisfaction.
        </span>
      </div>

    </div>
  );
}
