import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, Compass, Loader2 } from 'lucide-react';

export default function LoadingScreen({ destination = "Ahmedabad", onComplete }) {
  const steps = [
    "Analyzing travel style & interest profile...",
    `Retrieving curated attractions & hidden gems for ${destination}...`,
    "Grouping nearby points of interest into daily clusters...",
    "Validating opening hours, ticket costs, and dining pauses...",
    "Executing Google OR-Tools TSP algorithm to minimize travel distance...",
    "Checking schedule conflicts & cross-referencing transit buffers...",
    "Finalizing structured day-by-day travel plan..."
  ];

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          if (onComplete) onComplete();
          return prev;
        }
      });
    }, 700);

    return () => clearInterval(interval);
  }, []);

  const progressPercent = Math.min(100, Math.round(((currentStep + 1) / steps.length) * 100));

  return (
    <div className="min-h-[500px] flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 p-8 shadow-card text-center">
        
        {/* Animated Icon */}
        <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center shadow-subtle">
          <Compass className="w-7 h-7 animate-spin-slow" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-1">AI is Building Your Smart Itinerary</h3>
        <p className="text-xs text-slate-500 mb-6">Structuring optimal transit, venue opening windows & cost estimations</p>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 mb-6 overflow-hidden">
          <div
            className="bg-gradient-to-r from-brand-600 to-indigo-500 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        {/* Steps List */}
        <div className="space-y-2.5 text-left">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div
                key={idx}
                className={`flex items-center space-x-3 text-xs p-2 rounded-lg transition-smooth ${
                  isCurrent ? 'bg-brand-50/80 font-semibold text-brand-900 border border-brand-200/60' : (isCompleted ? 'text-slate-700' : 'text-slate-400')
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-brand-600 animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0"></div>
                )}
                <span className="truncate">{step}</span>
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-slate-400 mt-6 flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          Powered by Google OR-Tools Routing & Pydantic Schema Validation
        </p>

      </div>
    </div>
  );
}
