import React from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function QRCodeMap({ 
  decodedCoords, 
  routeConfig 
}) {
  // Vérification plus robuste des données
  if (!decodedCoords || decodedCoords.length < 2 || 
      !decodedCoords[0] || !decodedCoords[decodedCoords.length - 1] ||
      typeof decodedCoords[0].lat !== 'number' || typeof decodedCoords[0].lng !== 'number' ||
      typeof decodedCoords[decodedCoords.length - 1].lat !== 'number' || typeof decodedCoords[decodedCoords.length - 1].lng !== 'number') {
    return (
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <p>Données d'itinéraire incomplètes pour générer un QR code.</p>
      </div>
    );
  }

  const start = decodedCoords[0];
  const end = decodedCoords[decodedCoords.length - 1];

  const qrData = JSON.stringify({
    routeConfig, // Inclut tous les paramètres de configuration
    coordinates: {
      start: { lat: start.lat, lng: start.lng },
      end: { lat: end.lat, lng: end.lng }
    }
  });

  return (
    <div style={{ marginTop: "20px", textAlign: "center" }}>
      <h3>QRCode de l'itinéraire</h3>
      <QRCodeCanvas value={qrData} size={256} />
      <p>Départ: {start.lat.toFixed(5)}, {start.lng.toFixed(5)}</p>
      <p>Arrivée: {end.lat.toFixed(5)}, {end.lng.toFixed(5)}</p>
      <p>Mode: {routeConfig.costing}</p>
      <p>Options: 
        {routeConfig.costing_options[routeConfig.costing].use_tolls ? ' Péages' : ''}
      </p>
    </div>
  );
}