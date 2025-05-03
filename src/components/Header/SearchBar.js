import React, { useState } from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ isMobile = false }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    // Here you would implement actual search functionality
  };

  return (
    <div className={`search-container ${isMobile ? 'mobile-search-container' : ''}`}>
      <form onSubmit={handleSearch}>
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="search-bar"
          placeholder="Rechercher un lieu ou un itinéraire..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>
    </div>
  );
};

export default SearchBar;