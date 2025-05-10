import React, { useState } from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ isMobile = false, onLocationFound, placeholder }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || typeof onLocationFound !== 'function') return;

    setIsLoading(true);
    
    const auvergneRhoneAlpesBoundingBox = "4.0,46.8,8.5,44.0"; 

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&bounded=1&viewbox=${auvergneRhoneAlpesBoundingBox}`
    );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const firstResult = data[0];
        const location = {
          address: firstResult.display_name,
          lat: parseFloat(firstResult.lat),
          lng: parseFloat(firstResult.lon)
        };
        
        console.log('Location found:', location);
        onLocationFound(location);
      } else {
        console.log('No results found');
        onLocationFound && onLocationFound(null);
      }
    } catch (error) {
      console.error('Error during geocoding:', error);
      onLocationFound && onLocationFound(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`search-container ${isMobile ? 'mobile-search-container' : ''}`}>
      <form onSubmit={handleSearch}>
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="search-bar"
          placeholder={placeholder || "Rechercher un lieu ..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={isLoading}
        />
        {isLoading && <span className="loading-indicator">Chargement...</span>}
      </form>
    </div>
  );
};

export default SearchBar;