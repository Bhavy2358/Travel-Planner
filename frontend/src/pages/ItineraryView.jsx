import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  RefreshCw,
  Send,
  History,
  AlertTriangle,
  ChevronRight,
  Route,
  Wallet
} from 'lucide-react';
import { tripsAPI, itineraryAPI } from '../services/api';
import Timeline from '../components/Timeline';
import Map from '../components/Map';
import RouteOptimizerCard from '../components/RouteOptimizerCard';
import ConflictBanner from '../components/ConflictBanner';
import WhatChangedModal from '../components/WhatChangedModal';
import Chatbot from '../components/Chatbot';

export default function ItineraryView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [nlPrompt, setNlPrompt] = useState('');
  const [isNlProcessing, setIsNlProcessing] = useState(false);
  const [showWhatChanged, setShowWhatChanged] = useState(false);

  useEffect(() => {
    loadTripData();
  }, [id]);

  const loadTripData = async () => {
    setLoading(true);
    try {
      let res;
      if (id) {
        res = await tripsAPI.getTrip(id);
      } else {
        res = await tripsAPI.getDemoPreset();
      }
      setTrip(res.data);
    } catch (err) {
      console.warn('Trip load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNlEdit = async (e) => {
    e.preventDefault();
    if (!nlPrompt.trim() || isNlProcessing || !trip) return;

    setIsNlProcessing(true);
    try {
      await itineraryAPI.naturalLanguageEdit(trip.id, nlPrompt);
      setNlPrompt('');
      await loadTripData();
      setShowWhatChanged(true);
    } catch (err) {
      console.error('NL Edit error:', err);
    } finally {
      setIsNlProcessing(false);
    }
  };

  const handleUpdateActivity = async (activityId, data) => {
    if (!trip) return;
    try {
      await itineraryAPI.updateActivity(trip.id, activityId, data);
      await loadTripData();
    } catch (err) {
      console.error('Activity update error:', err);
    }
  };

  const handleDeleteActivity = async (activityId) => {
    if (!trip) return;
    try {
      await itineraryAPI.deleteActivity(trip.id, activityId);
      await loadTripData();
    } catch (err) {
      console.error('Activity delete error:', err);
    }
  };

  const handleAddActivity = async (dayId, data) => {
    if (!trip) return;
    try {
      await itineraryAPI.addActivity(trip.id, dayId, data);
      await loadTripData();
    } catch (err) {
      console.error('Activity add error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-slate-400 text-sm">
        Loading itinerary and route maps...
      </div>
    );
  }

  if (!trip || !trip.days || trip.days.length === 0) {
    return (
      <div className="min-h-screen p-8 max-w-4xl mx-auto text-center space-y-4">
        <h3 className="text-lg font-bold text-slate-900">No itinerary generated yet</h3>
        <button
          onClick={() => navigate('/create-trip')}
          className="px-4 py-2 text-xs font-bold text-white bg-brand-600 rounded-lg shadow-sm"
        >
          Plan Trip
        </button>
      </div>
    );
  }

  const selectedDay = trip.days[selectedDayIndex] || trip.days[0];
  const hotelLocation = {
    name: "The House of MG (Heritage Base)",
    address: "Lal Darwaja, Ahmedabad",
    latitude: 23.0270,
    longitude: 72.5815
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Conflict Scanner Alert */}
        <ConflictBanner tripId={trip.id} onResolved={loadTripData} />

        {/* Google OR-Tools Optimizer Card */}
        <RouteOptimizerCard trip={trip} onOptimizationComplete={loadTripData} />

        {/* Natural Language Modification Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-3">
          <form onSubmit={handleNlEdit} className="flex-1 flex items-center space-x-2">
            <div className="relative flex-1">
              <Sparkles className="absolute left-3 top-2.5 w-4 h-4 text-brand-600" />
              <input
                type="text"
                value={nlPrompt}
                onChange={(e) => setNlPrompt(e.target.value)}
                placeholder='AI Change prompt: e.g. "Remove the museum and add a shopping experience", "Make Day 2 more relaxed"'
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isNlProcessing || !nlPrompt.trim()}
              className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-smooth disabled:opacity-40 shrink-0"
            >
              <span>{isNlProcessing ? 'Adjusting...' : 'Modify Plan'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          <button
            onClick={() => setShowWhatChanged(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl border border-slate-200 transition-smooth self-start md:self-auto shrink-0"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>View "What Changed?" Diff</span>
          </button>
        </div>

        {/* Day Selector Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
          {trip.days.map((day, idx) => (
            <button
              key={day.id}
              onClick={() => setSelectedDayIndex(idx)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-smooth whitespace-nowrap border ${
                selectedDayIndex === idx
                  ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Day {day.day_number}: {day.area_name || `Day ${day.day_number}`}
            </button>
          ))}
        </div>

        {/* Main Grid: Left Timeline vs Right Leaflet Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Timeline */}
          <div className="lg:col-span-7">
            <Timeline
              day={selectedDay}
              onUpdateActivity={handleUpdateActivity}
              onDeleteActivity={handleDeleteActivity}
              onAddActivity={handleAddActivity}
            />
          </div>

          {/* Right Column: Interactive Leaflet Map */}
          <div className="lg:col-span-5 sticky top-20">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-subtle space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Route className="w-4 h-4 text-brand-600" />
                  <h4 className="text-xs font-bold text-slate-900">Day {selectedDay.day_number} Route Map</h4>
                </div>
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {selectedDay.activities?.length || 0} Waypoints
                </span>
              </div>

              <div className="h-[460px]">
                <Map
                  activities={selectedDay.activities || []}
                  hotelLocation={hotelLocation}
                  center={
                    selectedDay.activities && selectedDay.activities.length > 0 && selectedDay.activities[0].latitude
                      ? [selectedDay.activities[0].latitude, selectedDay.activities[0].longitude]
                      : [23.0225, 72.5714]
                  }
                />
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* "What Changed?" Audit Modal */}
      <WhatChangedModal
        tripId={trip.id}
        isOpen={showWhatChanged}
        onClose={() => setShowWhatChanged(false)}
      />

      {/* Context-aware Floating Chatbot Assistant */}
      <Chatbot tripId={trip.id} onItineraryModified={loadTripData} />

    </div>
  );
}
