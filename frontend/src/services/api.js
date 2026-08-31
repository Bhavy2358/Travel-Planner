import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to attach JWT token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('travel_copilot_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const tripsAPI = {
  createTrip: (data) => api.post('/trips', data),
  getTrips: () => api.get('/trips'),
  getTrip: (id) => api.get(`/trips/${id}`),
  updateTrip: (id, data) => api.put(`/trips/${id}`, data),
  deleteTrip: (id) => api.delete(`/trips/${id}`),
  getTripStats: (id) => api.get(`/trips/${id}/stats`),
  getDemoPreset: () => api.get('/trips/demo-preset'),
  resetDemoTrip: () => api.post('/trips/seed-demo'),
};

export const itineraryAPI = {
  getItinerary: (tripId) => api.get(`/trips/${tripId}/itinerary`),
  generateItinerary: (tripId) => api.post(`/trips/${tripId}/generate-itinerary`),
  optimizeRoute: (tripId, dayId = null) => api.post(`/trips/${tripId}/optimize`, { day_id: dayId }),
  naturalLanguageEdit: (tripId, instruction) => api.post(`/trips/${tripId}/natural-language-edit`, { instruction }),
  getTripChanges: (tripId) => api.get(`/trips/${tripId}/changes`),
  addActivity: (tripId, dayId, data) => api.post(`/trips/${tripId}/activities?day_id=${dayId}`, data),
  updateActivity: (tripId, activityId, data) => api.put(`/trips/${tripId}/activities/${activityId}`, data),
  deleteActivity: (tripId, activityId) => api.delete(`/trips/${tripId}/activities/${activityId}`),
};

export const bookingsAPI = {
  getBookings: (tripId) => api.get(`/trips/${tripId}/bookings`),
  createBooking: (tripId, data) => api.post(`/trips/${tripId}/bookings`, data),
  updateBooking: (tripId, bookingId, data) => api.put(`/trips/${tripId}/bookings/${bookingId}`, data),
  deleteBooking: (tripId, bookingId) => api.delete(`/trips/${tripId}/bookings/${bookingId}`),
  simulateFlightDelay: (tripId, delayHours = 2.0, reason = "Air Traffic Control Delay") =>
    api.post(`/trips/${tripId}/bookings/simulate-delay`, { delay_hours: delayHours, reason }),
  applyDelayResolution: (tripId) => api.post(`/trips/${tripId}/bookings/apply-delay-resolution`),
  searchFlights: (origin, destination, date, passengers) =>
    api.get('/integrations/flights/search', { params: { origin, destination, date, passengers } }),
  searchHotels: (destination, checkin, checkout, guests, max_price) =>
    api.get('/integrations/hotels/search', { params: { destination, checkin, checkout, guests, max_price } }),
};

export const conflictsAPI = {
  scanConflicts: (tripId) => api.get(`/trips/${tripId}/conflicts`),
  resolveConflicts: (tripId) => api.post(`/trips/${tripId}/conflicts/resolve`),
};

export const recommendationsAPI = {
  getRecommendations: (destination, tripId) =>
    api.get('/recommendations', { params: { destination, trip_id: tripId } }),
};

export const chatAPI = {
  sendMessage: (messages, tripId) => api.post('/chat', { messages, trip_id: tripId }),
};

export const ragAPI = {
  queryGuide: (destination, query, category) => api.post('/rag/query', { destination, query, category }),
};

export const adminAPI = {
  getMetrics: () => api.get('/admin/metrics'),
};

export const notificationsAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
};

export default api;
