import React, { useEffect } from "react";
import { useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";

// Map click handler component
export function MapClickHandler({ onClick, incidentMode, onIncidentPositionClick }) {
  const map = useMap();
  
  useMapEvents({
    click: (e) => {
      if (incidentMode) {
        onIncidentPositionClick(e);
      } else {
        onClick(e);
      }
    }
  });
  
  return null;
}

// Auto-fit bounds between points
export function FitBounds({ start, end, alternateRoute }) {
  const map = useMap();
  
  useEffect(() => {
    if (start && end) {
      let bounds;
      if (alternateRoute) {
        bounds = L.latLngBounds(alternateRoute);
      } else {
        bounds = L.latLngBounds([start, end]);
      }
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [start, end, alternateRoute, map]);
  
  return null;
}

// Helper component for incident positioning
export function IncidentPositionHelper() {
  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'white',
      padding: '10px',
      borderRadius: '5px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
      zIndex: 1000
    }}>
      Cliquez sur la carte pour positionner l'incident
    </div>
  );
}