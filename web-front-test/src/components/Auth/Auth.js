import React from "react";
import { Link } from "react-router-dom";
import "./Auth.css";

function Auth() {
  return (
    <div className="home-container">
      <div className="home-box">
        <h1 className="home-title">Bienvenue sur notre application de navigation</h1>
        <p className="home-text">
          Connectez-vous pour accéder à votre espace personnel ou créez un compte pour commencer.
        </p>
        <div className="home-buttons">
          <Link to="/login" className="btn btn-primary">
            Se connecter
          </Link>
          <Link to="/register" className="btn btn-secondary">
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Auth;
