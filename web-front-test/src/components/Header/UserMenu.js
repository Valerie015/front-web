import React, { useState, useRef, useEffect } from 'react';
import { User, ChevronDown, LogOut, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const UserMenu = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="user-menu" ref={dropdownRef}>
      <button className="user-button" onClick={toggleDropdown}>
        <User size={18} />
        <span>Compte</span>
        <ChevronDown size={16} />
      </button>
      
      <div className={`user-dropdown ${isOpen ? 'open' : ''}`}>
        <div className="user-option">
          <User size={16} className="user-option-icon" />
          <Link to="/account">Mon profil</Link>
        </div>
        <div className="user-option">
          <MapPin size={16} className="user-option-icon" />
          <span>Mes itinéraires</span>
        </div>
        <div className="user-option" onClick={onLogout}>
          <LogOut size={16} className="user-option-icon" />
          <span>Déconnexion</span>
        </div>
      </div>
    </div>
  );
};

export default UserMenu;