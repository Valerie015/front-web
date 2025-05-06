import React from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function QRCodeMap({ decodedCoords, routeConfig }) {
  if (!decodedCoords || decodedCoords.length < 2 || 
      !Array.isArray(decodedCoords[0]) || decodedCoords[0].length !== 2 ||
      !Array.isArray(decodedCoords[decodedCoords.length - 1]) || decodedCoords[decodedCoords.length - 1].length !== 2
  ) {
    return (
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <p>Données d'itinéraire incomplètes pour générer un QR code.</p>
      </div>
    );
  }

  // Extraire [lat, lng] depuis les tableaux
  const [endLat, endLng] = decodedCoords[decodedCoords.length - 1];

  const qrData = JSON.stringify({
    routeConfig,
    coordinates: {
      end: { lat: endLat, lng: endLng }
    }
  });

  return (
    <div style={{ marginTop: "20px", textAlign: "center" }}>
      <h3>QRCode de l'itinéraire</h3>
      <QRCodeCanvas value={qrData} size={256} />
      <p>Arrivée: {endLat.toFixed(5)}, {endLng.toFixed(5)}</p>
      <p>Mode: {routeConfig.costing}</p>
      <p>Options: 
        {routeConfig.costing_options?.[routeConfig.costing]?.use_tolls ? ' Péages' : ' Sans péages'}
      </p>
    </div>
  );
}
