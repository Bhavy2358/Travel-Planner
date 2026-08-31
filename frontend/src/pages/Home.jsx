import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock,
  MapPin,
  CheckCircle2,
  Calendar,
  Layers,
  BarChart3,
  Bot,
  Route
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { tripsAPI } from '../services/api';

export default function Home() {
  const { setActiveTrip } = useAuth();
  const navigate = useNavigate();
  const [loadingDemo, setLoadingDemo] = useState(false);

  const handleDemoPreset = async () => {
    setLoadingDemo(true);
    try {
      const res = await tripsAPI.getDemoPreset();
      setActiveTrip(res.data);
      navigate(`/trips/${res.data.id}`);
    } catch (err) {
      console.error('Demo error:', err);
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-white via-brand-50/30 to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Pill Tag */}
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brand-50 border border-brand-200 rounded-full text-xs font-semibold text-brand-700 shadow-subtle animate-in fade-in">
              <Sparkles className="w-3.5 h-3.5 text-brand-600 animate-spin-slow" />
              <span>Full-Stack AI Travel Copilot & Booking Assistant</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Plan Less. <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">Explore More.</span>
            </h1>

            {/* Subheading / USP */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Plan your complete trip once, then let our intelligent assistant manage, optimize, and resolve connected travel services automatically with Google OR-Tools route optimization.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to="/create-trip"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 active:scale-98 rounded-xl shadow-card transition-smooth"
              >
                <span>Plan My Trip</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                onClick={handleDemoPreset}
                disabled={loadingDemo}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 text-sm font-bold text-slate-800 bg-white hover:bg-slate-100 active:scale-98 rounded-xl border border-slate-200 shadow-subtle transition-smooth"
              >
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span>{loadingDemo ? 'Loading Preset...' : 'Try Demo Trip (Ahmedabad)'}</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Google OR-Tools TSP Routing</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Cascading Delay Resolution</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Out-of-the-Box Demo Mode</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">How the Travel Copilot Works</h2>
            <p className="text-sm text-slate-500 mt-2">
              Beyond simple LLM prompt generation — a constraint-aware multi-step orchestration pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-subtle hover:border-slate-300 transition-smooth">
              <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center mb-4">
                <Route className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">1. Smart Route Optimization</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Uses Google OR-Tools to solve the Traveling Salesperson Problem (TSP) with time windows, reducing total commute distance by over 35%.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-semibold text-emerald-700">
                ✓ Before vs After Savings Metrics
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-subtle hover:border-slate-300 transition-smooth">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">2. Cascading Booking Dependency</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Interlinks Flights ➔ Transfers ➔ Hotel Check-in ➔ Tours. If a flight changes by 2 hours, downstream schedules auto-align in 1 click.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-semibold text-amber-700">
                ✓ Interactive Delay Simulator
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-subtle hover:border-slate-300 transition-smooth">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">3. Natural Language Edits</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Type natural requests like <i>"Remove museum and add shopping"</i>. The AI adjusts only affected items with a visual <b>What Changed?</b> audit diff.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-semibold text-indigo-700">
                ✓ "What Changed?" Audit Trail
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Faculty Demo Banner */}
      <section className="py-12 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-brand-900/60 to-slate-800 p-8 rounded-2xl border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">Ready for Viva / Evaluation</span>
              <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">Pre-Populated 3-Day Ahmedabad Scenario</h3>
              <p className="text-xs text-slate-300 mt-2 max-w-xl">
                Demonstrate the full pipeline: Input ➔ AI Planning ➔ Route Optimization ➔ Booking Graph ➔ Delay Simulation ➔ Conflict Resolution.
              </p>
            </div>
            <button
              onClick={handleDemoPreset}
              className="inline-flex items-center space-x-2 px-5 py-3 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-card transition-smooth self-start md:self-auto shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Demo Preset</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
        <p>© 2026 Travel Copilot. Built with React, FastAPI, Google OR-Tools, and Leaflet Maps.</p>
      </footer>

    </div>
  );
}
