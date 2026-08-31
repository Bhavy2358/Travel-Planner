import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Sparkles,
  Star,
  MapPin,
  Clock,
  Utensils,
  Landmark,
  Compass,
  PieChart as PieChartIcon
} from 'lucide-react';
import { recommendationsAPI, tripsAPI } from '../services/api';
import RAGGuideSearch from '../components/RAGGuideSearch';
import BudgetChart from '../components/BudgetChart';
import Chatbot from '../components/Chatbot';

export default function ExploreView() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [recData, setRecData] = useState(null);
  const [loading, setLoading] = useState(true);

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

      const recRes = await recommendationsAPI.getRecommendations(tripRes.data.destination, tripRes.data.id);
      setRecData(recRes.data);
    } catch (err) {
      console.warn('Explore load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen p-8 text-center text-xs text-slate-400">Loading recommendations and guides...</div>;
  }

  if (!trip) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* RAG Knowledge Base Search */}
        <RAGGuideSearch destination={trip.destination} />

        {/* Personalized Recommendations Section */}
        {recData && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-subtle space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                  AI Matchmaking
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Personalized Attractions for {trip.destination}
                </h3>
              </div>
              <p className="text-xs text-slate-600">
                {recData.ai_insight}
              </p>
            </div>

            {/* Attractions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(recData.attractions || []).map((poi) => (
                <div
                  key={poi.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-subtle overflow-hidden flex flex-col transition-smooth"
                >
                  {poi.photo_url && (
                    <img
                      src={poi.photo_url}
                      alt={poi.name}
                      className="w-full h-40 object-cover"
                    />
                  )}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-bold text-brand-600 uppercase tracking-wider">
                          {poi.category}
                        </span>
                        <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                          {poi.rating}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{poi.name}</h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{poi.description}</p>
                    </div>

                    {/* Why AI Chose This Badge */}
                    <div className="text-[11px] font-medium text-emerald-800 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200/60 leading-relaxed">
                      <div className="flex items-center space-x-1 font-bold text-emerald-900 mb-0.5">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        <span>Why AI recommends this:</span>
                      </div>
                      {poi.why_chosen}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Culinary & Dining Section */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-subtle space-y-4">
              <div className="flex items-center space-x-2">
                <Utensils className="w-4 h-4 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">Curated Local Dining & Thali Experiences</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(recData.restaurants || []).map((rest) => (
                  <div key={rest.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900">{rest.name}</h4>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                        {rest.rating} ⭐
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{rest.cuisine}</p>
                    <div className="text-[11px] text-slate-500">
                      Est. Cost: <b>₹{rest.estimated_cost_per_person}/person</b> • {rest.best_for}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Budget Analytics Module */}
            <div className="pt-4">
              <BudgetChart tripId={trip.id} />
            </div>

          </div>
        )}

      </div>
      <Chatbot tripId={trip.id} onItineraryModified={loadData} />
    </div>
  );
}
