import React from "react";

export default function RouteControls({
  transportMode,
  setTransportMode,
  avoidTolls,
  setAvoidTolls,
  avoidHighways,
  setAvoidHighways,
  avoidFerries,
  setAvoidFerries,
  units,
  setUnits,
  language,
  setLanguage,
  alternateCount,
  setAlternateCount,
  loading,
  error,
  setShowIncidentPopup,
  setIncidentData,
  decodedCoords,
  summary,
  displayDistance,
  setShowQRCode,
}) {
  
  return (
    <>
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

        <label htmlFor="alternateCount">Nombre d'itinéraires alternatifs:</label>
        <select 
          id="alternateCount" 
          value={alternateCount}
          onChange={(e) => setAlternateCount(parseInt(e.target.value))}
        >
          <option value="0">0</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
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
        
        <button 
          onClick={() => {
            if (decodedCoords && decodedCoords.length > 0) {
              setShowQRCode(true);
            }
          }}
          style={{
            marginTop: '20px',
            padding: '10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: decodedCoords.length > 0 ? 'pointer' : 'not-allowed',
            opacity: decodedCoords.length > 0 ? 1 : 0.6
          }}
          disabled={decodedCoords.length === 0}
        >
          Générer QRCode de l'itinéraire
        </button>
      </div>

      {/* Summary */}
      <div className="route-summary">
        <h3>Récapitulatif</h3>
        <p>Distance totale: {summary.length ? displayDistance(summary.length, units) : "-"}</p>
        <p>Temps estimé: {summary.time ? Math.round(summary.time / 60) + " minutes" : "-"}</p>
      </div>
    </>
  );
}