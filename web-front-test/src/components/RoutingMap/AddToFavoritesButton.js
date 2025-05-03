import React from "react";

export default function AddToFavoritesButton({ routeData, transportMode, avoidTolls, avoidHighways, avoidFerries, units, language, summary }) {
  const handleAddToFavorites = () => {
    if (!routeData) return;

    const favorite = {
      from: routeData.trip.locations[0],
      to: routeData.trip.locations[1],
      transportMode,
      options: {
        avoidTolls,
        avoidHighways,
        avoidFerries,
        units,
        language,
      },
      summary,
      shape: routeData.trip.legs[0].shape,
    };

    const existingFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
    existingFavorites.push(favorite);
    localStorage.setItem("favorites", JSON.stringify(existingFavorites));

    alert("Itinéraire ajouté aux favoris !");
  };

  return (
    <button onClick={handleAddToFavorites} disabled={!routeData}>
      Ajouter aux favoris
    </button>
  );
}
