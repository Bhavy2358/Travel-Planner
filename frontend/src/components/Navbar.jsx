import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Compass,
  MapPin,
  Calendar,
  Layers,
  AlertTriangle,
  Sparkles,
  Bell,
  User,
  LogOut,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  PieChart,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { notificationsAPI, tripsAPI, conflictsAPI } from '../services/api';

export default function Navbar() {
  const { user, logout, activeTrip, setActiveTrip } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [trips, setTrips] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [conflictsCount, setConflictsCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showTripMenu, setShowTripMenu] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  useEffect(() => {
    loadTrips();
    loadNotifications();
  }, [user]);

  useEffect(() => {
    if (activeTrip?.id) {
      checkTripConflicts(activeTrip.id);
    }
  }, [activeTrip?.id]);

  const loadTrips = async () => {
    try {
      const res = await tripsAPI.getTrips();
      setTrips(res.data);
      if (res.data.length > 0 && !activeTrip) {
        setActiveTrip(res.data[0]);
      }
    } catch (err) {
      console.warn('Trips fetch:', err);
    }
  };

  const loadNotifications = async () => {
    try {
      const res = await notificationsAPI.getNotifications();
      setNotifications(res.data);
    } catch (err) {
      console.warn('Notifications fetch:', err);
    }
  };

  const checkTripConflicts = async (tripId) => {
    try {
      const res = await conflictsAPI.scanConflicts(tripId);
      setConflictsCount(res.data.total_conflicts);
    } catch (err) {
      console.warn('Conflict scan:', err);
    }
  };

  const handleTryDemoTrip = async () => {
    setIsDemoLoading(true);
    try {
      const res = await tripsAPI.getDemoPreset();
      setActiveTrip(res.data);
      loadTrips();
      navigate(`/trips/${res.data.id}`);
    } catch (err) {
      console.error('Demo trip load failed:', err);
    } finally {
      setIsDemoLoading(false);
    }
  };

  const unreadNotifs = notifications.filter(n => !n.is_read).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Tag */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-smooth">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                  Travel Copilot
                  <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">AI</span>
                </span>
              </div>
            </Link>

            {/* Quick Trip Switcher */}
            {activeTrip && (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setShowTripMenu(!showTripMenu)}
                  className="flex items-center space-x-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-full transition-smooth border border-slate-200"
                >
                  <MapPin className="w-3.5 h-3.5 text-brand-600" />
                  <span className="max-w-[140px] truncate font-semibold">{activeTrip.destination}</span>
                  <span className="text-slate-400 font-normal">({activeTrip.duration_days} Days)</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {showTripMenu && (
                  <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-floating border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Your Trips</div>
                    {trips.map(t => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setActiveTrip(t);
                          setShowTripMenu(false);
                          navigate(`/trips/${t.id}`);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-smooth ${activeTrip.id === t.id ? 'bg-brand-50/70 font-semibold text-brand-700' : 'text-slate-700'}`}
                      >
                        <div className="truncate">
                          <p className="truncate">{t.destination}</p>
                          <p className="text-[10px] text-slate-400 font-normal">{t.start_date}</p>
                        </div>
                        {activeTrip.id === t.id && <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />}
                      </button>
                    ))}
                    <div className="border-t border-slate-100 mt-1 pt-1 px-2">
                      <Link
                        to="/create-trip"
                        onClick={() => setShowTripMenu(false)}
                        className="block text-center py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50 rounded-lg"
                      >
                        + Create New Trip
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link
              to={activeTrip ? `/trips/${activeTrip.id}` : "/"}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-smooth ${
                location.pathname.startsWith('/trips/') && !location.pathname.includes('/bookings') && !location.pathname.includes('/conflicts') && !location.pathname.includes('/budget')
                  ? 'text-brand-600 bg-brand-50/60 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              Itinerary & Map
            </Link>

            <Link
              to={activeTrip ? `/trips/${activeTrip.id}/bookings` : "/bookings"}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-smooth ${
                location.pathname.includes('/bookings')
                  ? 'text-brand-600 bg-brand-50/60 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              Bookings & Cascade
            </Link>

            <Link
              to={activeTrip ? `/trips/${activeTrip.id}/conflicts` : "/conflicts"}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-smooth relative flex items-center gap-1.5 ${
                location.pathname.includes('/conflicts')
                  ? 'text-brand-600 bg-brand-50/60 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              Conflicts
              {conflictsCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500 text-white text-[10px] font-bold rounded-full animate-pulse">
                  {conflictsCount}
                </span>
              )}
            </Link>

            <Link
              to="/explore"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-smooth ${
                location.pathname === '/explore'
                  ? 'text-brand-600 bg-brand-50/60 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              Explore & Guides
            </Link>

            <Link
              to="/admin"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-smooth ${
                location.pathname === '/admin'
                  ? 'text-brand-600 bg-brand-50/60 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              Faculty Demo Panel
            </Link>
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center space-x-3">
            
            {/* Quick Demo Preset Button */}
            <button
              onClick={handleTryDemoTrip}
              disabled={isDemoLoading}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-lg shadow-subtle transition-smooth"
              title="1-Click Demo for Faculty Presentation: 3-Day Ahmedabad Scenario"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-600 animate-spin-slow" />
              <span>{isDemoLoading ? 'Loading Demo...' : 'Demo Trip (Ahmedabad)'}</span>
            </button>

            {/* Plan New Trip CTA */}
            <Link
              to="/create-trip"
              className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-smooth"
            >
              <span>+ Plan Trip</span>
            </Link>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-smooth"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifs > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-floating border border-slate-200 py-3 z-50">
                  <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">Trip Alerts & Sync</h4>
                    <span className="text-[10px] text-slate-400">{notifications.length} total</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <p className="px-4 py-6 text-center text-xs text-slate-500">No alerts right now.</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="p-3 hover:bg-slate-50 transition-smooth">
                          <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                          <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-100 transition-smooth"
              >
                <div className="w-7 h-7 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-floating border border-slate-200 py-1.5 z-50">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-900">{user?.full_name || 'Demo Explorer'}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user?.email || 'demo@travelplanner.com'}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <User className="w-3.5 h-3.5 mr-2 text-slate-400" />
                    Profile & Preferences
                  </Link>
                  <Link
                    to="/admin"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 mr-2 text-slate-400" />
                    Faculty Admin Metrics
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                      navigate('/login');
                    }}
                    className="w-full text-left flex items-center px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 border-t border-slate-100"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-2 text-rose-500" />
                    Logout
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
