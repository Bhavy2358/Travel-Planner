import React, { useState, useEffect } from 'react';
import { History, X, Sparkles, ArrowRight, Clock, IndianRupee, MapPin } from 'lucide-react';
import { itineraryAPI } from '../services/api';

export default function WhatChangedModal({ tripId, isOpen, onClose }) {
  const [changes, setChanges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && tripId) {
      loadChanges();
    }
  }, [isOpen, tripId]);

  const loadChanges = async () => {
    setLoading(true);
    try {
      const res = await itineraryAPI.getTripChanges(tripId);
      setChanges(res.data);
    } catch (err) {
      console.warn('Trip changes error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-floating border border-slate-200 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-200">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">What Changed? (AI Audit Log)</h3>
              <p className="text-xs text-slate-500">Live before vs after comparison of all itinerary adjustments</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-smooth"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading change history...</div>
          ) : changes.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No modifications recorded yet. Try requesting an itinerary change or running route optimization!
            </div>
          ) : (
            changes.map((c) => {
              let beforeList = [];
              let afterList = [];
              try {
                beforeList = JSON.parse(c.before_state || '[]');
                afterList = JSON.parse(c.after_state || '[]');
              } catch (e) {
                // Ignore parse errors
              }

              return (
                <div key={c.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                      {c.description}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {c.reason && (
                    <p className="text-xs text-slate-600 bg-white p-2 rounded-lg border border-slate-100">
                      <b>AI Decision Reason:</b> {c.reason}
                    </p>
                  )}

                  {/* Before vs After Visual Comparison Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    
                    {/* Before state */}
                    <div className="bg-rose-50/70 p-3 rounded-lg border border-rose-200">
                      <div className="font-bold text-rose-800 text-[11px] uppercase tracking-wider mb-1.5">
                        Before Change
                      </div>
                      {Array.isArray(beforeList) && beforeList.length > 0 ? (
                        <div className="space-y-1 text-slate-700">
                          {beforeList.map((item, i) => (
                            <div key={i} className="truncate">
                              • {item.name || item.status || JSON.stringify(item)}
                              {item.time && <span className="text-slate-400 ml-1">({item.time})</span>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-500 text-[11px]">Previous itinerary baseline</p>
                      )}
                    </div>

                    {/* After state */}
                    <div className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-200">
                      <div className="font-bold text-emerald-800 text-[11px] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                        <span>After AI Adjustment</span>
                        <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      {Array.isArray(afterList) && afterList.length > 0 ? (
                        <div className="space-y-1 text-slate-700">
                          {afterList.map((item, i) => (
                            <div key={i} className="truncate">
                              • {item.name || item.summary || item.status || JSON.stringify(item)}
                              {item.time && <span className="text-emerald-700 font-medium ml-1">({item.time})</span>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-500 text-[11px]">Synchronized schedule</p>
                      )}
                    </div>

                  </div>

                  {/* Impact pill */}
                  {(c.travel_time_delta_minutes !== 0 || c.budget_delta !== 0) && (
                    <div className="flex items-center space-x-3 text-[11px] text-slate-500 pt-1">
                      {c.travel_time_delta_minutes !== 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          Travel time: {c.travel_time_delta_minutes > 0 ? `+${c.travel_time_delta_minutes} min` : `${c.travel_time_delta_minutes} min`}
                        </span>
                      )}
                      {c.budget_delta !== 0 && (
                        <span className="flex items-center gap-1">
                          <IndianRupee className="w-3 h-3 text-slate-400" />
                          Budget: {c.budget_delta > 0 ? `+₹${c.budget_delta}` : `-₹${Math.abs(c.budget_delta)}`}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg shadow-sm"
          >
            Close Audit Log
          </button>
        </div>

      </div>
    </div>
  );
}
