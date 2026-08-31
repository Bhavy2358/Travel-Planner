import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function Map({ activities = [], hotelLocation = null, center = [23.0225, 72.5714], zoom = 13 }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map if not already created
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: center,
        zoom: zoom,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      // CartoDB Positron / OpenStreetMap Clean Tiles for modern SaaS look
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      layerGroupRef.current = L.layerGroup().addTo(map);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers and route lines when activities or hotel changes
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    layerGroupRef.current.clearLayers();
    const latLngs = [];

    // 1. Add Hotel Marker if available
    if (hotelLocation && hotelLocation.latitude && hotelLocation.longitude) {
      const hotelPos = [hotelLocation.latitude, hotelLocation.longitude];
      latLngs.push(hotelPos);

      const hotelIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `<div style="background-color:#0284c7;color:white;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:16px;border:3px solid white;box-shadow:0 4px 6px -1px rgba(0,0,0,0.25);">🏨</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const hotelMarker = L.marker(hotelPos, { icon: hotelIcon }).bindPopup(`
        <div style="font-family:inherit;min-width:180px;">
          <div style="font-weight:700;font-size:13px;color:#0f172a;margin-bottom:2px;">🏨 ${hotelLocation.name || 'Base Hotel'}</div>
          <div style="font-size:11px;color:#64748b;">${hotelLocation.address || 'Central Hotel'}</div>
          <div style="margin-top:6px;font-size:11px;font-weight:600;color:#0284c7;">Main Accommodation Base</div>
        </div>
      `);
      layerGroupRef.current.addLayer(hotelMarker);
    }

    // 2. Add Activity Stop Markers in Sequence
    activities.forEach((act, idx) => {
      if (act.latitude && act.longitude && (act.latitude !== 0 || act.longitude !== 0)) {
        const pos = [act.latitude, act.longitude];
        latLngs.push(pos);

        const isFood = act.category === 'Food';
        const bgColor = isFood ? '#f59e0b' : '#4f46e5';
        const iconChar = isFood ? '🍴' : `${idx + 1}`;

        const markerIcon = L.divIcon({
          className: 'custom-map-icon',
          html: `<div style="background-color:${bgColor};color:white;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:12px;border:2.5px solid white;box-shadow:0 3px 6px rgba(0,0,0,0.2);">${iconChar}</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        const popupContent = `
          <div style="font-family:system-ui,-apple-system,sans-serif;max-width:240px;line-height:1.4;">
            ${act.photo_url ? `<img src="${act.photo_url}" style="width:100%;height:110px;object-fit:cover;border-radius:8px;margin-bottom:8px;" />` : ''}
            <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:#4f46e5;margin-bottom:2px;">Stop ${idx + 1} • ${act.category}</div>
            <div style="font-weight:700;font-size:13px;color:#0f172a;margin-bottom:4px;">${act.name}</div>
            <div style="font-size:11px;color:#475569;margin-bottom:4px;">🕒 ${act.start_time} - ${act.end_time} (${act.duration_minutes} min)</div>
            ${act.why_chosen ? `<div style="font-size:11px;color:#047857;background:#ecfdf5;padding:4px 6px;border-radius:4px;margin-top:6px;">💡 <b>Why AI chose this:</b> ${act.why_chosen}</div>` : ''}
          </div>
        `;

        const marker = L.marker(pos, { icon: markerIcon }).bindPopup(popupContent);
        layerGroupRef.current.addLayer(marker);
      }
    });

    // 3. Draw Polyline Route connecting all stops in sequence
    if (latLngs.length > 1) {
      const polyline = L.polyline(latLngs, {
        color: '#4f46e5',
        weight: 3.5,
        opacity: 0.85,
        dashArray: '6, 8',
        lineCap: 'round',
      });
      layerGroupRef.current.addLayer(polyline);
      mapInstanceRef.current.fitBounds(polyline.getBounds(), { padding: [40, 40] });
    } else if (latLngs.length === 1) {
      mapInstanceRef.current.setView(latLngs[0], 14);
    }
  }, [activities, hotelLocation]);

  return (
    <div className="relative w-full h-full min-h-[380px] rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      <div ref={mapContainerRef} className="w-full h-full min-h-[380px]" />
      
      {/* Route Legend Pill */}
      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-medium text-slate-700 shadow-sm flex items-center space-x-3 z-[1000]">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-600"></span>
          <span>Attractions</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>Dining</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
          <span>Hotel Base</span>
        </div>
      </div>
    </div>
  );
}
