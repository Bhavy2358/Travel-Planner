import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Users,
  Wallet,
  Compass,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Car,
  Hotel
} from 'lucide-react';
import { tripsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';

export default function CreateTrip() {
  const navigate = useNavigate();
  const { setActiveTrip } = useAuth();

  const [step, setStep] = useState(1);
  const [isPlanning, setIsPlanning] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    destination: 'Ahmedabad',
    starting_location: 'Sardar Vallabhbhai Patel International Airport (AMD)',
    start_date: '2026-09-15',
    end_date: '2026-09-17',
    duration_days: 3,
    travelers_count: 2,
    adults: 2,
    children: 0,
    budget_category: 'Standard',
    total_budget: 25000,
    currency: 'INR',
    travel_preferences: 'Culture, Food, History',
    travel_pace: 'Balanced',
    transport_mode: 'Taxi / Auto',
    accommodation_type: 'Hotel'
  });

  const preferenceOptions = [
    'Historical', 'Culture', 'Food', 'Shopping', 'Nature',
    'Adventure', 'Relaxation', 'Family', 'Spiritual', 'Photography'
  ];

  const handlePreferenceToggle = (pref) => {
    const current = formData.travel_preferences.split(',').map(p => p.trim()).filter(Boolean);
    let updated;
    if (current.includes(pref)) {
      updated = current.filter(p => p !== pref);
    } else {
      updated = [...current, pref];
    }
    setFormData({ ...formData, travel_preferences: updated.join(', ') });
  };

  const handleFormSubmit = async () => {
    setIsPlanning(true);
    try {
      const res = await tripsAPI.createTrip({
        ...formData,
        title: formData.title || `${formData.destination} AI Itinerary`
      });
      setActiveTrip(res.data);
      // Loading screen will call onComplete
    } catch (err) {
      console.error('Trip creation failed:', err);
      setIsPlanning(false);
    }
  };

  if (isPlanning) {
    return (
      <LoadingScreen
        destination={formData.destination}
        onComplete={() => {
          navigate(`/trips/1`);
        }}
      />
    );
  }

  const isPrefSelected = (pref) => {
    return formData.travel_preferences.split(',').map(p => p.trim()).includes(pref);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        
        {/* Wizard Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 sm:p-8 space-y-6">
          
          {/* Header */}
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
              <span>Step {step} of 3</span>
              <span>Trip Wizard</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {step === 1 && "Basic Trip Details"}
              {step === 2 && "Budget & Travel Style"}
              {step === 3 && "Pace & Accommodation Preferences"}
            </h2>
          </div>

          {/* Step 1: Destination & Dates */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Destination City</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    placeholder="e.g. Ahmedabad, Jaipur, Goa, Paris"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Date (Duration: {formData.duration_days} Days)</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Adult Travelers</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.adults}
                    onChange={(e) => setFormData({ ...formData, adults: parseInt(e.target.value) || 1, travelers_count: (parseInt(e.target.value) || 1) + formData.children })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Children</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={formData.children}
                    onChange={(e) => setFormData({ ...formData, children: parseInt(e.target.value) || 0, travelers_count: formData.adults + (parseInt(e.target.value) || 0) })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Budget & Preferences */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Budget Preference</label>
                <div className="grid grid-cols-3 gap-3">
                  {['Economy', 'Standard', 'Premium'].map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setFormData({ ...formData, budget_category: tier, total_budget: tier === 'Economy' ? 15000 : (tier === 'Standard' ? 25000 : 45000) })}
                      className={`p-3 rounded-xl border text-center transition-smooth ${
                        formData.budget_category === tier
                          ? 'bg-brand-50 border-brand-500 text-brand-700 font-bold shadow-subtle'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs">{tier}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {tier === 'Economy' ? '₹15k' : tier === 'Standard' ? '₹25k' : '₹45k'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Custom Total Budget (INR)</label>
                <input
                  type="number"
                  step="1000"
                  value={formData.total_budget}
                  onChange={(e) => setFormData({ ...formData, total_budget: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Travel Interests (Select all that apply)</label>
                <div className="flex flex-wrap gap-2">
                  {preferenceOptions.map((pref) => {
                    const selected = isPrefSelected(pref);
                    return (
                      <button
                        key={pref}
                        type="button"
                        onClick={() => handlePreferenceToggle(pref)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-smooth ${
                          selected
                            ? 'bg-brand-600 border-brand-600 text-white shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {pref}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Pace & Accommodation */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Travel Pace</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { title: 'Relaxed', desc: '2-3 stops/day' },
                    { title: 'Balanced', desc: '4 stops/day' },
                    { title: 'Fast-paced', desc: '5-6 stops/day' }
                  ].map((p) => (
                    <button
                      key={p.title}
                      type="button"
                      onClick={() => setFormData({ ...formData, travel_pace: p.title })}
                      className={`p-3 rounded-xl border text-center transition-smooth ${
                        formData.travel_pace === p.title
                          ? 'bg-brand-50 border-brand-500 text-brand-700 font-bold shadow-subtle'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs">{p.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Local Transit Mode</label>
                  <select
                    value={formData.transport_mode}
                    onChange={(e) => setFormData({ ...formData, transport_mode: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="Taxi / Auto">Taxi / Auto-Rickshaw</option>
                    <option value="Metro / Public">Metro / BRTS Bus</option>
                    <option value="Walking">Walking / Foot</option>
                    <option value="Mixed">Mixed Modes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Accommodation Type</label>
                  <select
                    value={formData.accommodation_type}
                    onChange={(e) => setFormData({ ...formData, accommodation_type: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="Hotel">Standard Hotel</option>
                    <option value="Heritage Grand">Heritage Grand Haveli</option>
                    <option value="Luxury Resort">Luxury Resort</option>
                    <option value="Hostel">Budget Hostel</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-smooth"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div></div>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="inline-flex items-center space-x-1.5 px-5 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-smooth"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFormSubmit}
                className="inline-flex items-center space-x-2 px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-card transition-smooth"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Smart Itinerary</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
