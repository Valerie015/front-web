
export async function saveRouteToHistory({ start, end, transportMode, avoidTolls, token }) {
    const response = await fetch("/api/route/calculate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        startLatitude: start[0],
        startLongitude: start[1],
        endLatitude: end[0],
        endLongitude: end[1],
        transportMode,
        avoidTolls,
      }),
    });
  
    if (!response.ok) {
      throw new Error("Erreur lors de l'enregistrement de l'itinéraire.");
    }
  
    return await response.json();
  }
  