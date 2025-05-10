import React from 'react';
import { MapPin } from 'lucide-react';

const Logo = () => {
  return (
    <div className="logo">
      <a href="/">
        <MapPin className="logo-icon" size={30} />
        <span>SupMap</span>
      </a>
    </div>
  );
};

export default Logo;