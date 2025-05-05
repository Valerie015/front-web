import { decodePolyline } from "../../utils/decodePolyline";

// Function to fetch a route
export async function fetchRoute({
  startPoint,
  endPoint,
  transportMode,
  avoidTolls,
  units,
  language,
  alternateCount
}) {
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

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) throw new Error("Erreur réseau");
  const data = await response.json();

  // Process main route
  const mainShape = data.trip.legs[0].shape;
  const mainDecoded = decodePolyline(mainShape);
  const maneuvers = data.trip.legs[0].maneuvers;
  const summary = data.trip.summary;

  // Process alternate routes
  const alternates = [];
  if (data.alternates && data.alternates.length > 0) {
    data.alternates.forEach(alt => {
      alternates.push({
        shape: alt.trip.legs[0].shape,
        decoded: decodePolyline(alt.trip.legs[0].shape),
        summary: alt.trip.summary,
        maneuvers: alt.trip.legs[0].maneuvers,
      });
    });
  }

  return {
    data,
    mainDecoded,
    maneuvers,
    summary,
    alternates
  };
}

// Helper to display distance based on units
export function displayDistance(len, units) {
  return units === "miles"
    ? `${len.toFixed(2)} mi`
    : `${(len * 1.60934).toFixed(2)} km`;
}