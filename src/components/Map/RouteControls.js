import React from "react";



export default function RouteControls({
  transportMode,
  setTransportMode,
  avoidTolls,
  setAvoidTolls,
  units,
  setUnits,
  language,
  setLanguage,
  alternateCount,
  setAlternateCount,
  loading,
  error,
  decodedCoords,
  summary,
  displayDistance,
  setShowQRCode,
}) {
  const [saveMessage, setSaveMessage] = React.useState("");

  const showNotification = (msg, timeout = 3000) => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(""), timeout);
  };
  
  const handleConfirmRoute = async () => {
    if (!decodedCoords || decodedCoords.length < 2) return;
  
    const token = localStorage.getItem("token");
    if (!token) {
      showNotification("Vous devez être connecté pour enregistrer un itinéraire.");
      return;
    }
  
    const body = {
      startLatitude: decodedCoords[0][0],
      startLongitude: decodedCoords[0][1],
      endLatitude: decodedCoords[decodedCoords.length - 1][0],
      endLongitude: decodedCoords[decodedCoords.length - 1][1],
      transportMode,
      avoidTolls
    };
  
    try {
      const response = await fetch("/api/route/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
  
      if (!response.ok) {
        throw new Error("Erreur lors de l'enregistrement de l'itinéraire.");
      }
  
      showNotification("Itinéraire enregistré avec succès !");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };
  
  
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

        <button
          onClick={handleConfirmRoute}
          style={{
            marginTop: '20px',
            padding: '10px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: decodedCoords.length > 0 ? 'pointer' : 'not-allowed',
            opacity: decodedCoords.length > 0 ? 1 : 0.6
          }}
          disabled={decodedCoords.length === 0}
        >
        Confirmer l'itinéraire
      </button>
      {saveMessage && (
          <div style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            backgroundColor: "#4caf50",
            color: "white",
            padding: "10px 16px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            zIndex: 9999,
            fontSize: "14px"
          }}>
            {saveMessage}
          </div>
        )}

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