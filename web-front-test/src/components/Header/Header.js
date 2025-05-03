import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Header.css';
import SearchBar from './SearchBar';
import UserMenu from './UserMenu';
import Logo from './Logo';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className={`header ${isScrolled ? 'header-scrolled' : ''}`}>
      <div className="header-container">
        <div className="header-left">
          <Logo />
          <nav className="main-nav">
            <ul>
              <li className="nav-item active"><Link to="/">Itinéraires</Link></li>
              <li className="nav-item"><Link to="/favorites">Favoris</Link></li>
              <li className="nav-item"><Link to="/about">À propos</Link></li>
            </ul>
          </nav>
        </div>

        <div className="header-right">
          <SearchBar />
          
          {!token ? (
            <div className="auth-buttons">
              <Link to="/login" className="auth-link">Connexion</Link>
              <Link to="/register" className="auth-link">Inscription</Link>
            </div>
          ) : (
            <UserMenu onLogout={handleLogout} />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
