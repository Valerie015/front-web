import { decodePolyline } from "../../utils/decodePolyline";


const validateCoordinates = (coordinates) => {
  return (
    Array.isArray(coordinates) &&
    coordinates.length === 2 &&
    !isNaN(coordinates[0]) &&
    !isNaN(coordinates[1])
  );
};

export async function fetchRoute({
  startPoint,
  endPoint,
  transportMode,
  avoidTolls,
  units,
  language,
  alternateCount
}) {
  if (!validateCoordinates(startPoint) || !validateCoordinates(endPoint)) {
    throw new Error("Les coordonnées de départ ou d'arrivée sont invalides.");
  }

  const url = "api/navigation/route";

  
  const body = {
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
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erreur réseau");
    }

    const data = await response.json();

    
    const mainShape = data.trip.legs[0].shape;
    const mainDecoded = decodePolyline(mainShape);
    const maneuvers = data.trip.legs[0].maneuvers;
    const summary = data.trip.summary;

    
    const alternates = data.alternates?.map(alt => ({
      shape: alt.trip.legs[0].shape,
      decoded: decodePolyline(alt.trip.legs[0].shape),
      summary: alt.trip.summary,
      maneuvers: alt.trip.legs[0].maneuvers,
    })) || [];

    return {
      data,
      mainDecoded,
      maneuvers,
      summary,
      alternates
    };
  } catch (err) {
    throw new Error(`Erreur lors de la récupération des données : ${err.message}`);
  }
}


export function displayDistance(len, units) {
  return units === "miles"
    ? `${len.toFixed(2)} mi`
    : `${(len * 1.60934).toFixed(2)} km`;
}
