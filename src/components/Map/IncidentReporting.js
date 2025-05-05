import React from "react";
import "./IncidentReporting.css";

// Function to report an incident to the API
export async function reportIncident(incidentData) {
  if (!incidentData.position || !incidentData.type) return false;

  try {
    const token = localStorage.getItem('token');
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
    return true;
  } catch (error) {
    console.error("Erreur:", error);
    alert(error.message);
    return false;
  }
}

// Helper component for map click instructions
export function IncidentPositionHelper() {
  return (
    <div className="incident-position-helper">
      Cliquez sur la carte pour positionner l'incident
    </div>
  );
}

// Incident form component
export function IncidentPopup({ incidentData, setIncidentData, setShowIncidentPopup }) {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await reportIncident(incidentData);
    if (success) {
      alert("Incident signalé avec succès!");
      setShowIncidentPopup(false);
      setIncidentData({
        type: "",
        description: "",
        expectedDuration: "",
        position: null
      });
    }
  };

  const handleClose = (e) => {
    if (e.target.className === 'incident-popup') {
      setShowIncidentPopup(false);
    }
  };

  return (
    <div className="incident-popup" onClick={handleClose}>
      <div className="incident-popup-content">
        
        {!incidentData.position ? (
          <div className="click-instructions">
            <p>Cliquez sur la carte pour positionner l'incident</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="coordinates-display">
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

            <div className="button-group">
              <button type="submit" className="submit-button">
                Envoyer
              </button>
              <button 
                type="button" 
                onClick={() => setShowIncidentPopup(false)}
                className="cancel-button"
              >
                Annuler
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}