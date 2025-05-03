// utils/polylineUtils.js

export function decodePolyline(encoded) {
    const coords = [];
    let index = 0, lat = 0, lng = 0;
  
    while (index < encoded.length) {
      let b, shift = 0, result = 0;
  
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
  
      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;
  
      shift = 0;
      result = 0;
  
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
  
      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;
  
      coords.push([lat / 1e6, lng / 1e6]);
    }
  
    return coords;
  }  