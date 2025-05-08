// utils/routeUtils.js

export function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // rayon de la Terre en kilomètres
    const toRad = (value) => (value * Math.PI) / 180;
  
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
  
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
  
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }
  
  export function processRouteData(routes) {
    let total = 0;
    const counts = {};
  
    const processedRoutes = routes.map((route) => {
      const distance = haversineDistance(
        route.startLatitude,
        route.startLongitude,
        route.endLatitude,
        route.endLongitude
      );
      total += distance;
  
      const mode = route.transportMode?.toLowerCase();
      counts[mode] = (counts[mode] || 0) + 1;
  
      return { ...route, distance };
    });
  
    return {
      routesWithDistance: processedRoutes,
      totalDistance: total,
      transportCounts: counts,
    };
  }
  