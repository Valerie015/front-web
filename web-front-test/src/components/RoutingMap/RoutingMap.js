import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  ZoomControl,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./RoutingMap.css";
import { decodePolyline } from "../../utils/decodePolyline";

// Fix icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Gestion du clic sur la carte
function MapClickHandler({ onClick, incidentMode, onIncidentPositionClick }) {
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

function IncidentPositionHelper() {
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

// Auto-fit entre les deux points
function FitBounds({ start, end }) {
  const map = useMap();
  useEffect(() => {
    if (start && end) {
      const bounds = L.latLngBounds([start, end]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [start, end, map]);
  return null;
}

export default function RouteMap() {
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [decodedCoords, setDecodedCoords] = useState([]);
  const [maneuvers, setManeuvers] = useState([]);
  const [summary, setSummary] = useState({ length: 0, time: 0 });

  const [transportMode, setTransportMode] = useState("auto");
  const [avoidTolls, setAvoidTolls] = useState(false);
  const [avoidHighways, setAvoidHighways] = useState(false);
  const [avoidFerries, setAvoidFerries] = useState(false);
  const [units, setUnits] = useState("kilometers");
  const [language, setLanguage] = useState("fr-FR");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showIncidentPopup, setShowIncidentPopup] = useState(false);
  const [incidentData, setIncidentData] = useState({
    type: "",
    description: "",
    expectedDuration: "",
    position: null
  });
  // Nouvelle fonction pour gérer le clic sur la carte pour positionner l'incident
const handleIncidentPositionClick = (e) => {
  const { lat, lng } = e.latlng;
  setIncidentData(prev => ({
    ...prev,
    position: [lat, lng]
  }));
};

// Fonction pour soumettre l'incident à l'API
const reportIncident = async () => {
    if (!incidentData.position || !incidentData.type) return;

    try {
      const token = localStorage.getItem('token'); // Supposons que le token est stocké dans le localStorage
      if (!token) throw new Error("Authentification requise");

      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          latitude: incidentData.position[0],
          longitude: incidentData.position[1],
          type: incidentData.type,
          description: incidentData.description,
          expectedDuration: incidentData.expectedDuration ? parseInt(incidentData.expectedDuration) : undefined
        })
      });

      if (!response.ok) throw new Error("Erreur lors du signalement");
      
      const data = await response.json();
      alert("Incident signalé avec succès!");
      setShowIncidentPopup(false);
      setIncidentData({
        type: "",
        description: "",
        expectedDuration: "",
        position: null
      });
    } catch (error) {
      console.error("Erreur:", error);
      alert(error.message);
    }
  };

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    if (!startPoint) {
      setStartPoint([lat, lng]);
    } else if (!endPoint) {
      setEndPoint([lat, lng]);
    } else {
      setStartPoint([lat, lng]);
      setEndPoint(null);
      setDecodedCoords([]);
      setManeuvers([]);
      setSummary({ length: 0, time: 0 });
    }
  };

  const fetchRoute = async () => {
    if (!startPoint || !endPoint) return;
    setLoading(true);
    setError(null);

    const url = "http://localhost/api/navigation/route";
    const body = {
      locations: [
        { lat: startPoint[0], lon: startPoint[1] },
        { lat: endPoint[0], lon: endPoint[1] },
      ],
      costing: transportMode,
      costing_options: {
        [transportMode]: {
          use_tolls: avoidTolls ? 0 : 1,
          avoid_highways: avoidHighways ? 1 : 0,
          avoid_ferries: avoidFerries ? 1 : 0,
        },
      },
      directions_options: {
        language,
        units,
      },
      alternates: true,
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Erreur réseau");
      const data = await response.json();
      setRouteData(data);

      const shape = data.trip.legs[0].shape;
      const decoded = decodePolyline(shape);
      setDecodedCoords(decoded);
      setManeuvers(data.trip.legs[0].maneuvers);
      setSummary(data.trip.summary);
    } catch (error) {
      setError("Erreur lors de la récupération de l'itinéraire");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const displayDistance = (len) => {
    return units === "miles"
      ? `${len.toFixed(2)} mi`
      : `${(len * 1.60934).toFixed(2)} km`;
  };

  useEffect(() => {
    fetchRoute();
  }, [startPoint, endPoint, transportMode, avoidTolls, avoidHighways, avoidFerries, units, language]);

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%" }}>
      {/* Carte */}
      <div style={{ flex: 4 }}>
        <MapContainer
          center={startPoint || [45.7486, 4.8258]}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <MapClickHandler 
            onClick={handleMapClick}
            incidentMode={showIncidentPopup && !incidentData.position}
            onIncidentPositionClick={handleIncidentPositionClick}
          />
          {startPoint && endPoint && <FitBounds start={startPoint} end={endPoint} />}
          {showIncidentPopup && !incidentData.position && <IncidentPositionHelper />}

          {/* Marqueur d'incident (doit être DANS MapContainer) */}
            {incidentData.position && (
              <Marker 
                position={incidentData.position}
                icon={L.divIcon({
                  className: "incident-marker",
                  html: '<div style="color:red;font-weight:bold;font-size:16px;">!</div>',
                  iconSize: [24, 24]
                })}
              >
                <Popup>Nouvel incident signalé</Popup>
              </Marker>
            )}

          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <ZoomControl position="bottomright" />

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

          {decodedCoords.length > 0 && (
            <>
              <Polyline positions={decodedCoords} color="blue" weight={5} opacity={0.7} />
              {maneuvers.map((maneuver, index) => {
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
                  >
                    <Popup>
                      <strong>Étape {index + 1}:</strong> {maneuver.instruction}
                      <br />
                      Distance: {displayDistance(maneuver.length)}
                      <br />
                      Durée: {Math.round(maneuver.time / 60)} minutes
                    </Popup>
                  </Marker>
                );
              })}
            </>
          )}
        </MapContainer>
      </div>

      {/* Contrôles */}
      <div className="sidebar">
        <h3>Options d'itinéraire</h3>

        <label htmlFor="transport">Mode de transport:</label>
        <select id="transport" value={transportMode} onChange={(e) => setTransportMode(e.target.value)}>
          <option value="auto">Voiture</option>
          <option value="bicycle">Vélo</option>
          <option value="pedestrian">À pied</option>
          <option value="motor_scooter">Moto</option>
        </select>

        <div>
          <label>
            <input
              type="checkbox"
              checked={avoidTolls}
              onChange={(e) => setAvoidTolls(e.target.checked)}
              aria-label="Éviter les péages"
            />
            Éviter les péages
          </label>
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              checked={avoidHighways}
              onChange={(e) => setAvoidHighways(e.target.checked)}
              aria-label="Éviter les autoroutes"
            />
            Éviter les autoroutes
          </label>
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              checked={avoidFerries}
              onChange={(e) => setAvoidFerries(e.target.checked)}
              aria-label="Éviter les ferries"
            />
            Éviter les ferries
          </label>
        </div>

        <label htmlFor="unit">Unités:</label>
        <select id="unit" value={units} onChange={(e) => setUnits(e.target.value)}>
          <option value="kilometers">Kilomètres</option>
          <option value="miles">Miles</option>
        </select>

        <label htmlFor="lang">Langue:</label>
        <select id="lang" value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="fr-FR">Français</option>
          <option value="en-US">Anglais</option>
          <option value="de-DE">Allemand</option>
          <option value="es-ES">Espagnol</option>
        </select>

        {loading && <p>Chargement de l'itinéraire...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button 
            onClick={() => {
              setShowIncidentPopup(true);
              setIncidentData(prev => ({ ...prev, position: null }));
            }}
            style={{
              marginTop: '20px',
              padding: '10px',
              backgroundColor: '#ff4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Signaler un incident
          </button>
      </div>

      {/* Popup d'incident */}
      {showIncidentPopup && (
        <div className="incident-popup">
          <div className="incident-popup-content">
            <h3>Signaler un incident</h3>
            
            {!incidentData.position ? (
              <div>
                <p>Cliquez sur la carte pour positionner l'incident</p>
              </div>
            ) : (
              <form onSubmit={(e) => {
                e.preventDefault();
                reportIncident();
              }}>
                <div>
                  <strong>Position:</strong> 
                  {incidentData.position[0].toFixed(5)}, {incidentData.position[1].toFixed(5)}
                </div>

                <label>
                  Type d'incident:
                  <select 
                    name="type" 
                    value={incidentData.type}
                    onChange={(e) => setIncidentData(prev => ({ ...prev, type: e.target.value }))}
                    required
                  >
                    <option value="">Sélectionnez un type</option>
                    <option value="accident">Accident</option>
                    <option value="construction">Travaux</option>
                    <option value="police">Contrôle police</option>
                    <option value="hazard">Obstacle</option>
                    <option value="closure">Fermeture</option>
                    <option value="traffic_jam">Embouteillage</option>
                  </select>
                </label>

                <label>
                  Description:
                  <textarea 
                    name="description" 
                    value={incidentData.description}
                    onChange={(e) => setIncidentData(prev => ({ ...prev, description: e.target.value }))}
                    rows="3"
                    required
                  />
                </label>

                <label>
                  Durée estimée (minutes, optionnel):
                  <input 
                    type="number" 
                    name="expectedDuration" 
                    value={incidentData.expectedDuration}
                    onChange={(e) => setIncidentData(prev => ({ ...prev, expectedDuration: e.target.value }))}
                    min="1"
                  />
                </label>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                  <button type="submit" style={{ backgroundColor: '#4CAF50', color: 'white' }}>
                    Envoyer
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowIncidentPopup(false)}
                    style={{ backgroundColor: '#f44336', color: 'white' }}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Résumé */}
      <div className="route-summary">
        <h3>Récapitulatif</h3>
        <p>Distance totale: {summary.length ? displayDistance(summary.length) : "-"}</p>
        <p>Temps estimé: {summary.time ? Math.round(summary.time / 60) + " minutes" : "-"}</p>
      </div>
    </div>
  );
}
