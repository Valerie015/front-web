import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./RoutingMap.css";
import SearchBar from "../Header/SearchBar"

import { MapClickHandler, FitBounds } from "./MapHandlers";
import { fetchRoute, displayDistance } from "./RouteService";
import RouteControls from "./RouteControls";
import { renderRouteElements } from "./RouteElements";
import QRCodeMap from "./QRCode";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

export default function RouteMap({ externalStartPoint, externalEndPoint, onPointsChange }) {
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [decodedCoords, setDecodedCoords] = useState([]);
  const [maneuvers, setManeuvers] = useState([]);
  const [summary, setSummary] = useState({ length: 0, time: 0 });
  const [showQRCode, setShowQRCode] = useState(false);
  
  // Route options
  const [transportMode, setTransportMode] = useState("auto");
  const [avoidTolls, setAvoidTolls] = useState(false);
  const [units, setUnits] = useState("kilometers");
  const [language, setLanguage] = useState("fr-FR");
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  
  // Alternative routes
  const [alternateCount, setAlternateCount] = useState(1); 
  const [selectedAltIndex, setSelectedAltIndex] = useState(-1);
  const [alternateRoutes, setAlternateRoutes] = useState([]);

  const handleLocationFound = (location) => {
    if (!location) return; 
    
    const newPoint = [location.lat, location.lng];
    
    if (!startPoint) {
      setStartPoint(newPoint);
      onPointsChange?.({ start: newPoint, end: endPoint });
    } else if (!endPoint) {
      setEndPoint(newPoint);
      onPointsChange?.({ start: startPoint, end: newPoint });
    } else {
      setStartPoint(newPoint);
      setEndPoint(null);
      onPointsChange?.({ start: newPoint, end: null });
      setDecodedCoords([]);
      setManeuvers([]);
      setSummary({ length: 0, time: 0 });
    }
  };

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    if (!startPoint) {
      const newStart = [lat, lng];
      setStartPoint(newStart);
      onPointsChange?.({ start: newStart, end: endPoint });
    } else if (!endPoint) {
      const newEnd = [lat, lng];
      setEndPoint(newEnd);
      onPointsChange?.({ start: startPoint, end: newEnd });
    } else {
      const newStart = [lat, lng];
      setStartPoint(newStart);
      setEndPoint(null);
      onPointsChange?.({ start: newStart, end: null });
      setDecodedCoords([]);
      setManeuvers([]);
      setSummary({ length: 0, time: 0 });
    }
  };

  const handleRouteSelect = (index) => {
    setSelectedAltIndex(index);
    const altRoute = alternateRoutes[index];
    setDecodedCoords(altRoute.decoded);
    setSummary(altRoute.summary);
    setManeuvers(altRoute.maneuvers);
  };

  useEffect(() => {
    const getRoute = async () => {
      if (!startPoint || !endPoint) return;
      
      setLoading(true);
      try {
        const result = await fetchRoute({
          startPoint,
          endPoint,
          transportMode,
          avoidTolls,
          units,
          language,
          alternateCount
        });
        
        setRouteData(result.data);
        setDecodedCoords(result.mainDecoded);
        setManeuvers(result.maneuvers);
        setSummary(result.summary);
        setAlternateRoutes(result.alternates);
      } catch (err) {
        setError("Erreur lors de la récupération de l'itinéraire");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    getRoute();
  }, [startPoint, endPoint, transportMode, avoidTolls, units, language, alternateCount]);

  // Update points from external sources
  useEffect(() => {
    if (externalStartPoint) {
      setStartPoint(externalStartPoint);
    }
    if (externalEndPoint) {
      setEndPoint(externalEndPoint);
    }
  }, [externalStartPoint, externalEndPoint]);

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%" }}>
      {/* Ajoutez cette div pour la barre de recherche */}
      <div style={{
         position: 'fixed',
         top: '3.5%',
         left: '55%',
         transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        width: '300px',
      }}>
        <SearchBar 
          onLocationFound={handleLocationFound}
          placeholder="Rechercher un lieu..."
        />
      </div>
      {/* Map */}
      <div style={{ flex: 4 }}>
        <MapContainer
          center={startPoint || [45.7486, 4.8258]}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <MapClickHandler 
            onClick={handleMapClick}
          />
          
          {startPoint && endPoint && (
            <FitBounds 
              start={startPoint} 
              end={endPoint} 
              alternateRoute={selectedAltIndex >= 0 ? alternateRoutes[selectedAltIndex].decoded : null}
            />
          )}
          

          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <ZoomControl position="bottomright" />

          {/* Start/End markers */}
          {startPoint && (
            <Marker position={startPoint}>
              <Popup>Point de départ</Popup>
            </Marker>
          )}

          {endPoint && (
            <Marker position={endPoint}>
              <Popup>Point d'arrivée</Popup>
            </Marker>
          )}

          {/* Render all route elements */}
          {renderRouteElements({
            decodedCoords,
            maneuvers,
            summary,
            selectedAltIndex,
            alternateRoutes,
            handleRouteSelect,
            units,
            displayDistance,
          })}

        </MapContainer>
        
      </div>

      {/* Controls sidebar */}
      <RouteControls 
        transportMode={transportMode}
        setTransportMode={setTransportMode}
        avoidTolls={avoidTolls}
        setAvoidTolls={setAvoidTolls}
        units={units}
        setUnits={setUnits}
        language={language}
        setLanguage={setLanguage}
        alternateCount={alternateCount}
        setAlternateCount={setAlternateCount}
        loading={loading}
        error={error}
        decodedCoords={decodedCoords}
        summary={summary}
        displayDistance={displayDistance}
        setShowQRCode={setShowQRCode}
      />
      
      {/* QRCode popup */}
      {showQRCode && decodedCoords && decodedCoords.length >= 2 && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          zIndex: 1000
        }}>
          <QRCodeMap 
            decodedCoords={decodedCoords}
            routeConfig={{
              locations: [
                { lat: startPoint[0], lon: startPoint[1] },
                { lat: endPoint[0], lon: endPoint[1] },
              ],
              costing: transportMode,
              costing_options: {
                [transportMode]: {
                  use_tolls: avoidTolls ? 0 : 1,
                },
              },
              directions_options: {
                language,
                units,
              },
              alternates: alternateCount,
            }}
          />

          <button 
            onClick={() => setShowQRCode(false)}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Fermer
          </button>
        </div>
      )}
    </div>
  );
}