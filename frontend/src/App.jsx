import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import CreateTrip from './pages/CreateTrip';
import ItineraryView from './pages/ItineraryView';
import BookingsView from './pages/BookingsView';
import ConflictsView from './pages/ConflictsView';
import ExploreView from './pages/ExploreView';
import AdminView from './pages/AdminView';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProfileView from './pages/ProfileView';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create-trip" element={<CreateTrip />} />
              <Route path="/trips/:id" element={<ItineraryView />} />
              <Route path="/trips/:id/bookings" element={<BookingsView />} />
              <Route path="/trips/:id/conflicts" element={<ConflictsView />} />
              <Route path="/bookings" element={<BookingsView />} />
              <Route path="/conflicts" element={<ConflictsView />} />
              <Route path="/explore" element={<ExploreView />} />
              <Route path="/admin" element={<AdminView />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/profile" element={<ProfileView />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}
