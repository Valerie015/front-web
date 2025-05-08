import React, { useState, useRef, useEffect } from 'react';
import { User, ChevronDown, LogOut, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserMenu = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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

  const handleProfileClick = () => {
    const token = localStorage.getItem('token'); // ou sessionStorage

    if (token) {
      navigate('/account');
    } else {
      alert('Session expirée. Veuillez vous reconnecter.');
      navigate('/login');
    }
  };

  const handleHistoriqueClick = () => {
    navigate('/historiques');
  };

  return (
    <div className="user-menu" ref={dropdownRef}>
      <button className="user-button" onClick={toggleDropdown}>
        <User size={18} />
        <span>Compte</span>
        <ChevronDown size={16} />
      </button>

      <div className={`user-dropdown ${isOpen ? 'open' : ''}`}>
        <div className="user-option" onClick={handleProfileClick}>
          <User size={16} className="user-option-icon" />
          <span>Mon profil</span>
        </div>
        <div className="user-option" onClick={handleHistoriqueClick}>
          <MapPin size={16} className="user-option-icon" />
          <span>Mes historiques</span>
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
