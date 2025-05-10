import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { FaCar, FaBicycle, FaWalking, FaMotorcycle } from "react-icons/fa";
import axios from "axios"; // Utilisation d'axios pour effectuer des requêtes HTTP
import "./RouteHistory.css";

export default function RouteHistory() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addresses, setAddresses] = useState({});

  const fetchHistory = async () => {
    const token = localStorage.getItem("token");
  
    if (!token) {
      window.location.href = "/auth"; // Rediriger manuellement si non connecté
      return;
    }
  
    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch (err) {
      window.location.href = "/auth"; // Rediriger manuellement si le token est invalide
      return;
    }
  
    const userId = decoded.userId;
    if (!userId) {
      window.location.href = "/auth"; // Rediriger si l'utilisateur n'est pas trouvé
      return;
    }
  
    try {
      const response = await fetch(`/api/route/user/${userId}/recent?limit=10`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des données (Code: ${response.status}).`);
      }
  
      const data = await response.json();
      setRoutes(data);

      fetchAddresses(data);  // Ajout de la fonction pour récupérer les adresses
    } catch (err) {
      console.error(err);
      setError(`Erreur lors de la récupération de l'historique : ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async (routes) => {
    const newAddresses = {};
  
    for (const route of routes) {
      const { startLatitude, startLongitude, endLatitude, endLongitude } = route;
      const cachedStartAddress = localStorage.getItem(`start-${route.id}`);
      const cachedEndAddress = localStorage.getItem(`end-${route.id}`);
  
      if (cachedStartAddress && cachedEndAddress) {
        newAddresses[route.id] = { startAddress: cachedStartAddress, endAddress: cachedEndAddress };
        continue;
      }
  
      try {
        const startAddressResponse = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?lat=${startLatitude}&lon=${startLongitude}&format=json`
        );
        const endAddressResponse = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?lat=${endLatitude}&lon=${endLongitude}&format=json`
        );
  
        const formatAddress = (addressData) => {
          const address = addressData.address;
          return [
          address.house_number,
          address.road,
          address.suburb,
          address.city,
          address.postcode,
          address.country
        ].filter(Boolean).join(', ');
        };
  
        const startAddress = formatAddress(startAddressResponse.data);
        const endAddress = formatAddress(endAddressResponse.data);
  
        newAddresses[route.id] = { startAddress, endAddress };
  
        // Sauvegarder dans le cache local pour les prochaines fois
        localStorage.setItem(`start-${route.id}`, startAddress);
        localStorage.setItem(`end-${route.id}`, endAddress);
      } catch (error) {
        console.error("Erreur géocodage", error);
      }
    }
  
    setAddresses(newAddresses);
  };
  

  useEffect(() => {
    fetchHistory();
  }, []);

  const transportLabels = {
    auto: { label: "Voiture", icon: <FaCar /> },
    bicycle: { label: "Vélo", icon: <FaBicycle /> },
    pedestrian: { label: "À pied", icon: <FaWalking /> },
    motor_scooter: { label: "Moto", icon: <FaMotorcycle /> },
  };

  return (
    <div className="route-history-container">
      <h2 className="route-history-title">Historique de vos itinéraires</h2>

      {loading && <p className="route-loading">Chargement...</p>}
      {error && <p className="route-error">{error}</p>}
      {!loading && !error && routes.length === 0 && (
        <p className="route-empty">Aucun itinéraire récent trouvé.</p>
      )}

      {!loading && !error && routes.length > 0 && (
        <ul className="route-list">
          {routes.map((route) => {
            const mode = transportLabels[route.transportMode?.toLowerCase()] || { label: route.transportMode, icon: null };
            const address = addresses[route.id] || { startAddress: "Chargement...", endAddress: "Chargement..." };

            return (
              <li key={route.id} className="route-item">
                <strong>Départ :</strong> {address.startAddress} <br />
                <strong>Arrivée :</strong> {address.endAddress} <br />
                <strong>Mode de transport :</strong>{" "}
                {mode.icon ? (
                  <span className="transport-mode">
                    <span className="icon">{mode.icon}</span> {mode.label}
                  </span>
                ) : (
                  mode.label
                )}{" "}
                <strong>Péages évités :</strong> {route.avoidTolls ? "Oui" : "Non"} <br />
                <small>{new Date(route.createdAt).toLocaleString()}</small>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
