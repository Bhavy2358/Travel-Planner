import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Plane,
  Hotel,
  Car,
  Utensils,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  IndianRupee,
  ShieldCheck
} from 'lucide-react';
import { bookingsAPI, tripsAPI } from '../services/api';
import BookingDependencyGraph from '../components/BookingDependencyGraph';
import Chatbot from '../components/Chatbot';

export default function BookingsView() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBooking, setNewBooking] = useState({
    booking_type: 'hotel',
    title: '',
    provider: 'Demo Provider',
    start_datetime: '2026-09-15 11:00',
    cost: 3500,
    confirmation_code: 'DEMO-8821'
  });

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

      const bookRes = await bookingsAPI.getBookings(tripRes.data.id);
      setBookings(bookRes.data);
    } catch (err) {
      console.warn('Bookings load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    try {
      await bookingsAPI.deleteBooking(trip.id, bookingId);
      loadData();
    } catch (err) {
      console.error('Delete booking error:', err);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newBooking.title.trim() || !trip) return;
    try {
      await bookingsAPI.createBooking(trip.id, newBooking);
      setShowAddModal(false);
      setNewBooking({
        booking_type: 'hotel',
        title: '',
        provider: 'Demo Provider',
        start_datetime: '2026-09-15 11:00',
        cost: 3500,
        confirmation_code: 'DEMO-8821'
      });
      loadData();
    } catch (err) {
      console.error('Create booking error:', err);
    }
  };

  const getBookingIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'flight':
        return <Plane className="w-4 h-4 text-indigo-600" />;
      case 'hotel':
        return <Hotel className="w-4 h-4 text-sky-600" />;
      case 'transport':
        return <Car className="w-4 h-4 text-emerald-600" />;
      case 'restaurant':
        return <Utensils className="w-4 h-4 text-amber-600" />;
      default:
        return <Calendar className="w-4 h-4 text-slate-600" />;
    }
  };

  if (loading) {
    return <div className="min-h-screen p-8 text-center text-xs text-slate-400">Loading bookings...</div>;
  }

  if (!trip) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Booking Dependency Cascading Simulator */}
        <BookingDependencyGraph tripId={trip.id} onCascadeUpdated={loadData} />

        {/* Bookings List Section */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-subtle space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Connected Travel Reservations</h3>
              <p className="text-xs text-slate-500 mt-0.5">All synchronized flight, lodging, and private transfer vouchers</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Reservation</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookings.map((b) => (
              <div
                key={b.id}
                className={`p-4 rounded-xl border transition-smooth relative group ${
                  b.status === 'conflict' || b.status === 'changed'
                    ? 'bg-amber-50/70 border-amber-300'
                    : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="p-1.5 rounded-lg bg-white shadow-subtle border border-slate-100">
                      {getBookingIcon(b.booking_type)}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {b.booking_type}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      b.status === 'conflict' || b.status === 'changed'
                        ? 'bg-amber-200 text-amber-900'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{b.title}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{b.provider}</p>

                <div className="mt-3 pt-3 border-t border-slate-200/60 space-y-1.5 text-[11px] text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Schedule:
                    </span>
                    <span className="font-semibold text-slate-800">{b.start_datetime}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Confirmation:</span>
                    <span className="font-mono text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {b.confirmation_code}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-500">Estimated Cost:</span>
                    <span className="font-bold text-slate-900">₹{b.cost?.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded">
                    Demo Data Voucher
                  </span>
                  <button
                    onClick={() => handleDeleteBooking(b.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-smooth"
                    title="Delete booking"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Add Booking Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-floating border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">Add Travel Booking</h3>
            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Booking Title</label>
                <input
                  type="text"
                  required
                  value={newBooking.title}
                  onChange={(e) => setNewBooking({ ...newBooking, title: e.target.value })}
                  placeholder="e.g. Flight BOM → AMD or Hyatt Regency"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    value={newBooking.booking_type}
                    onChange={(e) => setNewBooking({ ...newBooking, booking_type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="flight">Flight</option>
                    <option value="hotel">Hotel / Stay</option>
                    <option value="transport">Airport Cab / Transit</option>
                    <option value="restaurant">Dining Reservation</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cost (INR)</label>
                  <input
                    type="number"
                    value={newBooking.cost}
                    onChange={(e) => setNewBooking({ ...newBooking, cost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Schedule Datetime</label>
                <input
                  type="text"
                  value={newBooking.start_datetime}
                  onChange={(e) => setNewBooking({ ...newBooking, start_datetime: e.target.value })}
                  placeholder="YYYY-MM-DD HH:MM"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm"
                >
                  Save Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Chatbot tripId={trip.id} onItineraryModified={loadData} />
    </div>
  );
}
