import React, { useState } from 'react';
import { User, Mail, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProfileView() {
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    full_name: user?.full_name || 'Demo Explorer',
    preferred_travel_style: user?.preferred_travel_style || 'Balanced',
    budget_preference: user?.budget_preference || 'Standard',
    favorite_activities: user?.favorite_activities || 'Culture, Food, History'
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      await updateProfile(formData);
      setSaved(true);
    } catch (err) {
      console.error('Profile update error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 sm:p-8 space-y-6">
          
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 rounded-full bg-brand-600 text-white font-bold text-lg flex items-center justify-center">
              {user?.full_name?.charAt(0) || 'D'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{user?.full_name || 'Demo Explorer'}</h2>
              <p className="text-xs text-slate-500">{user?.email || 'demo@travelplanner.com'} • Role: {user?.role || 'Admin'}</p>
            </div>
          </div>

          {saved && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Preferences saved successfully! Future AI itineraries will adapt to your settings.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Preferred Travel Style</label>
                <select
                  value={formData.preferred_travel_style}
                  onChange={(e) => setFormData({ ...formData, preferred_travel_style: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="Relaxed">Relaxed</option>
                  <option value="Balanced">Balanced</option>
                  <option value="Fast-paced">Fast-paced</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Budget Tier</label>
                <select
                  value={formData.budget_preference}
                  onChange={(e) => setFormData({ ...formData, budget_preference: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="Economy">Economy</option>
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Favorite Travel Activities</label>
              <input
                type="text"
                value={formData.favorite_activities}
                onChange={(e) => setFormData({ ...formData, favorite_activities: e.target.value })}
                placeholder="e.g. Culture, Food, History, Nature"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-smooth disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </form>

        </div>

      </div>
    </div>
  );
}
