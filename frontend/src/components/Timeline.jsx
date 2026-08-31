import React, { useState } from 'react';
import {
  Clock,
  MapPin,
  Car,
  Footprints,
  Sparkles,
  Trash2,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
  Landmark,
  Utensils,
  ShoppingBag,
  Palmtree,
  Compass,
  Star,
  Plus
} from 'lucide-react';

export default function Timeline({
  day,
  onUpdateActivity,
  onDeleteActivity,
  onAddActivity
}) {
  const [expandedWhy, setExpandedWhy] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAct, setNewAct] = useState({
    name: '',
    category: 'Culture',
    start_time: '14:00',
    duration_minutes: 60,
    estimated_cost: 0,
    transport_mode: 'Taxi',
  });

  if (!day) {
    return <div className="p-8 text-center text-slate-400">No day selected.</div>;
  }

  const toggleWhy = (id) => {
    setExpandedWhy(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'historical':
      case 'culture':
        return <Landmark className="w-4 h-4 text-brand-600" />;
      case 'food':
        return <Utensils className="w-4 h-4 text-amber-500" />;
      case 'shopping':
        return <ShoppingBag className="w-4 h-4 text-purple-500" />;
      case 'nature':
      case 'relaxation':
        return <Palmtree className="w-4 h-4 text-emerald-500" />;
      default:
        return <Compass className="w-4 h-4 text-slate-500" />;
    }
  };

  const activities = (day.activities || []).sort((a, b) => a.order_index - b.order_index);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newAct.name.trim()) return;
    onAddActivity(day.id, {
      ...newAct,
      end_time: '15:00',
      latitude: 23.0225,
      longitude: 72.5714,
      why_chosen: 'Custom activity added by user.'
    });
    setNewAct({ name: '', category: 'Culture', start_time: '14:00', duration_minutes: 60, estimated_cost: 0, transport_mode: 'Taxi' });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Day Overview Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
              Day {day.day_number}
            </span>
            <h3 className="text-base font-bold text-slate-900">{day.theme}</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            Area: <span className="font-semibold text-slate-700">{day.area_name}</span>
            <span className="text-slate-300">•</span>
            <span>Est. Transit: {day.estimated_distance_km} km ({day.estimated_travel_time_minutes} min)</span>
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg border border-brand-200 transition-smooth self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Stop</span>
        </button>
      </div>

      {/* Vertical Timeline */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {activities.map((act, index) => {
          const isWhyOpen = expandedWhy[act.id];

          return (
            <div key={act.id} className="relative group">
              {/* Timeline Connector Dot */}
              <div className="absolute -left-6 top-1.5 w-6 h-6 rounded-full bg-white border-2 border-brand-600 text-brand-700 flex items-center justify-center text-[11px] font-bold shadow-sm z-10">
                {index + 1}
              </div>

              {/* Transit Details between stops */}
              {index > 0 && act.travel_time_minutes > 0 && (
                <div className="mb-2 -mt-3 flex items-center space-x-2 text-[11px] text-slate-500 bg-slate-100/80 px-2.5 py-1 rounded-md w-fit border border-slate-200">
                  <Car className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {act.travel_distance_km} km via {act.transport_mode || 'Taxi'} ({act.travel_time_minutes} min transit)
                  </span>
                </div>
              )}

              {/* Activity Card */}
              <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 p-4 shadow-subtle hover:shadow-card transition-smooth">
                <div className="flex items-start justify-between gap-3">
                  
                  {/* Left content */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="p-1 rounded-md bg-slate-100">
                        {getCategoryIcon(act.category)}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        {act.category}
                      </span>
                      <span className="text-slate-300">•</span>
                      <div className="flex items-center text-xs font-semibold text-slate-700">
                        <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {act.start_time} - {act.end_time}
                        <span className="text-slate-400 font-normal ml-1">({act.duration_minutes}m)</span>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{act.name}</h4>
                    {act.address && (
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{act.address}</span>
                      </p>
                    )}

                    {/* Metadata Badges */}
                    <div className="flex flex-wrap items-center gap-2 mt-2.5">
                      {act.rating > 0 && (
                        <span className="inline-flex items-center text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <Star className="w-3 h-3 mr-1 fill-amber-400 text-amber-500" />
                          {act.rating}
                        </span>
                      )}

                      {act.estimated_cost !== undefined && (
                        <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {act.estimated_cost > 0 ? `₹${act.estimated_cost}` : 'Free Entry'}
                        </span>
                      )}

                      {act.opening_time && act.closing_time && (
                        <span className="text-[11px] text-slate-500">
                          Open: {act.opening_time} - {act.closing_time}
                        </span>
                      )}
                    </div>

                    {/* Explainability Accordion ("Why did AI choose this?") */}
                    {act.why_chosen && (
                      <div className="mt-3">
                        <button
                          onClick={() => toggleWhy(act.id)}
                          className="text-[11px] font-medium text-brand-600 hover:text-brand-800 flex items-center space-x-1"
                        >
                          <Sparkles className="w-3 h-3 text-brand-500" />
                          <span>Why AI selected this stop?</span>
                          {isWhyOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>

                        {isWhyOpen && (
                          <div className="mt-1.5 p-2.5 rounded-lg bg-brand-50/60 border border-brand-200/70 text-xs text-slate-700 leading-relaxed animate-in fade-in">
                            {act.why_chosen}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-smooth">
                    <button
                      onClick={() => onUpdateActivity(act.id, { is_locked: !act.is_locked })}
                      className={`p-1.5 rounded-lg border transition-smooth ${
                        act.is_locked ? 'bg-amber-50 border-amber-300 text-amber-600' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
                      }`}
                      title={act.is_locked ? 'Stop is pinned / locked' : 'Pin stop to lock time'}
                    >
                      {act.is_locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => onDeleteActivity(act.id)}
                      className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-smooth"
                      title="Remove activity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Stop Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-floating border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">Add Custom Stop to Day {day.day_number}</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Place Name</label>
                <input
                  type="text"
                  required
                  value={newAct.name}
                  onChange={(e) => setNewAct({ ...newAct, name: e.target.value })}
                  placeholder="e.g. Sidi Saiyyed Mosque or Local Cafe"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newAct.category}
                    onChange={(e) => setNewAct({ ...newAct, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="Historical">Historical</option>
                    <option value="Culture">Culture</option>
                    <option value="Food">Food / Dining</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Nature">Nature / Park</option>
                    <option value="Relaxation">Relaxation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newAct.start_time}
                    onChange={(e) => setNewAct({ ...newAct, start_time: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm"
                >
                  Add Stop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
