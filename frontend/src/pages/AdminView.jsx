import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Zap,
  Layers,
  Database,
  Route,
  Sparkles,
  Bot,
  RefreshCw,
  CheckCircle2,
  Cpu,
  BarChart2
} from 'lucide-react';
import { adminAPI, tripsAPI } from '../services/api';

export default function AdminView() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getMetrics();
      setMetrics(res.data);
    } catch (err) {
      console.warn('Admin metrics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetDemo = async () => {
    setSeeding(true);
    setSeedSuccess(false);
    try {
      await tripsAPI.resetDemoTrip();
      setSeedSuccess(true);
      await loadMetrics();
    } catch (err) {
      console.error('Reset error:', err);
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen p-8 text-center text-xs text-slate-400">Loading system metrics...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Viva / Faculty Panel
              </span>
              <h2 className="text-xl font-bold text-slate-900">Project Demo & Architecture Dashboard</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Architecture telemetry, algorithm execution logs, and live demo management.
            </p>
          </div>

          <button
            onClick={handleResetDemo}
            disabled={seeding}
            className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition-smooth disabled:opacity-50 self-start sm:self-auto shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
            <span>{seeding ? 'Resetting Demo...' : 'Reset Ahmedabad Demo Trip'}</span>
          </button>
        </div>

        {seedSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center space-x-2 text-xs text-emerald-800 font-medium animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Turnkey 3-Day Ahmedabad Demo Scenario has been reset with clean baseline stats and bookings!</span>
          </div>
        )}

        {/* Telemetry Metrics Grid */}
        {metrics && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Trips Created</div>
              <div className="text-2xl font-black text-slate-900">{metrics.total_trips_created}</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Bookings Active</div>
              <div className="text-2xl font-black text-brand-600">{metrics.total_bookings_managed}</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Scheduled Stops</div>
              <div className="text-2xl font-black text-emerald-600">{metrics.total_activities_scheduled}</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">RAG Vectors</div>
              <div className="text-2xl font-black text-indigo-600">{metrics.knowledge_documents_indexed}</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Audit Edits</div>
              <div className="text-2xl font-black text-amber-600">{metrics.ai_itinerary_changes_logged}</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Avg Budget</div>
              <div className="text-2xl font-black text-slate-900">₹{metrics.average_trip_budget?.toLocaleString()}</div>
            </div>
          </div>
        )}

        {/* Technical Architecture Explainers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Box 1: Route Optimization */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-subtle space-y-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                <Route className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Route & Transit Optimization</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Implemented using <b>Google OR-Tools</b> with the <code>RoutingIndexManager</code> and <code>RoutingModel</code> constraint solver. It computes a distance-time cost matrix via Haversine geometry and re-sequences stops using Guided Local Search to eliminate crisscrossing and minimize vehicular emissions.
            </p>
            <div className="p-2.5 bg-slate-50 rounded-lg text-[11px] text-slate-700 font-mono">
              Solver: OR-Tools TSP • Search: PATH_CHEAPEST_ARC
            </div>
          </div>

          {/* Box 2: Cascading Dependency System */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-subtle space-y-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Smart Booking Cascading Engine</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Maintains an explicit relational dependency graph between <code>Flight ➔ Airport Transfer ➔ Hotel Check-in ➔ Day 1 Itinerary</code>. When an upstream schedule changes (e.g. flight delayed by 2 hours), the conflict engine flags impacted items and automatically re-aligns downstream timestamps.
            </p>
            <div className="p-2.5 bg-slate-50 rounded-lg text-[11px] text-slate-700 font-mono">
              Engine: Relational Dependency Tree & Conflict Scanner
            </div>
          </div>

          {/* Box 3: Strict Schema Validation */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-subtle space-y-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Pydantic Schema Validation & Retry</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Raw LLM outputs are never directly presented or stored. All structured plans are validated against strict <code>AIItineraryPlan</code> Pydantic models with type guarantees, opening-closing boundary clamping, and cost sanity checks before database persistence.
            </p>
            <div className="p-2.5 bg-slate-50 rounded-lg text-[11px] text-slate-700 font-mono">
              Validator: Pydantic v2.6+ Structured JSON Validator
            </div>
          </div>

          {/* Box 4: Vector Knowledge Base */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-subtle space-y-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-brand-50 text-brand-700">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">RAG Vector Intelligence</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Stores verified destination guides, cultural etiquette, safety protocols, and transit instructions. Semantic search operates via normalized embedding vector cosine similarity, retrieving relevant context documents to answer tourist queries.
            </p>
            <div className="p-2.5 bg-slate-50 rounded-lg text-[11px] text-slate-700 font-mono">
              Vector Metric: Normalized Vector Cosine Similarity
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
