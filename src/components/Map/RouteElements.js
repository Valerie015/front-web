import React from "react";
import { Polyline, Marker, Popup, Tooltip } from "react-leaflet";
import L from "leaflet";

// Function to render all route-related elements
export function renderRouteElements({
  decodedCoords,
  maneuvers,
  summary,
  selectedAltIndex,
  alternateRoutes,
  handleRouteSelect,
  units,
  displayDistance
}) {
  return (
    <>
      {/* Main route polyline */}
      {decodedCoords.length > 0 && renderMainRoute(decodedCoords, summary, units, displayDistance)}
      
      {/* Maneuver markers */}
      {renderManeuverMarkers(maneuvers, decodedCoords, units, displayDistance)}
      
      {/* Selected alternate route */}
      {selectedAltIndex >= 0 && alternateRoutes[selectedAltIndex] && 
        renderSelectedAlternateRoute(alternateRoutes[selectedAltIndex], units, displayDistance)}
      
      {/* Other alternate routes */}
      {renderAlternateRoutes(alternateRoutes, selectedAltIndex, handleRouteSelect, units, displayDistance)}
    </>
  );
}

// Render the main route
function renderMainRoute(decodedCoords, summary, units, displayDistance) {
  return (
    <Polyline
      positions={decodedCoords}
      color="#3498db"
      weight={6}
      opacity={0.9}
      eventHandlers={{
        mouseover: (e) => e.target.setStyle({ weight: 8 }),
        mouseout: (e) => e.target.setStyle({ weight: 6 }),
      }}
    >
      <Popup>
        <div className="route-popup">
          <h4>Itinéraire principal</h4>
          <p>Distance: {displayDistance(summary.length, units)}</p>
          <p>Durée: {Math.round(summary.time / 60)} minutes</p>
        </div>
      </Popup>
    </Polyline>
  );
}

// Render maneuver markers
function renderManeuverMarkers(maneuvers, decodedCoords, units, displayDistance, onManeuverHover, onManeuverOut) {
  return maneuvers.map((maneuver, index) => {
    const pos = decodedCoords[maneuver.begin_shape_index];
    if (!pos) return null;

    return (
      <Marker
        key={index}
        position={pos}
        icon={L.divIcon({
          className: "custom-icon",
          html: `<div class="custom-icon">${index + 1}</div>`,
          iconSize: [20, 20],
        })}
        eventHandlers={{
          mouseover: onManeuverHover,
          mouseout: onManeuverOut,
        }}
      >
        <Tooltip direction="top" offset={[0, -10]} opacity={0.9} sticky>
          <div>
            <strong>Étape {index + 1}:</strong><br />
            {maneuver.instruction}<br />
            Distance: {displayDistance(maneuver.length, units)}<br />
            Durée: {Math.round(maneuver.time / 60)} min
          </div>
        </Tooltip>
        <Popup>
          <strong>Étape {index + 1}:</strong> {maneuver.instruction}
          <br />
          Distance: {displayDistance(maneuver.length, units)}
          <br />
          Durée: {Math.round(maneuver.time / 60)} minutes
        </Popup>
      </Marker>
    );
  });
}

// Render the selected alternate route
function renderSelectedAlternateRoute(altRoute, units, displayDistance) {
  return (
    <Polyline
      positions={altRoute.decoded}
      color="#e67e22"
      weight={5}
      opacity={0.9}
      dashArray="0"
    >
      <Popup>
        <div className="route-popup">
          <h4>Itinéraire alternatif sélectionné</h4>
          <p>Distance: {displayDistance(altRoute.summary.length, units)}</p>
          <p>Durée: {Math.round(altRoute.summary.time / 60)} minutes</p>
        </div>
      </Popup>
    </Polyline>
  );
}

// Render other alternate routes
function renderAlternateRoutes(alternateRoutes, selectedAltIndex, handleRouteSelect, units, displayDistance) {
  return alternateRoutes.map((altRoute, altIndex) => {
    if (altIndex === selectedAltIndex) return null; // Skip selected route
    
    const color = ['#2ecc71', '#9b59b6'][altIndex % 2];
    
    return (
      <Polyline
        key={`alt-${altIndex}`}
        positions={altRoute.decoded}
        color={color}
        weight={4}
        opacity={0.7}
        dashArray="10, 5"
        eventHandlers={{
          click: () => handleRouteSelect(altIndex),
          mouseover: (e) => e.target.setStyle({ weight: 6 }),
          mouseout: (e) => e.target.setStyle({ weight: 4 }),
        }}
      >
        <Popup>
          <div className="route-popup">
            <h4>Alternative {altIndex + 1}</h4>
            <p>Distance: {displayDistance(altRoute.summary.length, units)}</p>
            <p>Durée: {Math.round(altRoute.summary.time / 60)} minutes</p>
            <button 
              onClick={() => handleRouteSelect(altIndex)}
              className="select-route-btn"
            >
              Choisir cet itinéraire
            </button>
          </div>
        </Popup>
      </Polyline>
    );
  });
}