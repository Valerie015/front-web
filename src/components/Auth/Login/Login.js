import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");  // Rediriger vers la page d'accueil si déjà connecté
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");  // Réinitialiser l'erreur
    setLoading(true);  // Mettre l'état de chargement à true
  
    try {
      const response = await fetch("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);  // Si la réponse n'est pas ok, gérer l'erreur
      }
  
      const data = await response.json();  // Analyser la réponse JSON
      console.log(data);  // Afficher la réponse pour le débogage
  
      // Vérifier si la réponse contient un token
      if (data.token) {
        localStorage.setItem("token", data.token);  // Stocker le token
  
        navigate("/");  // Rediriger vers la page d'accueil après la connexion
      } else {
        setError("Données de connexion invalides.");
      }
    } catch (err) {
      setError(err.message || "Une erreur s'est produite lors de la connexion.");
    } finally {
      setLoading(false);  // Réinitialiser l'état de chargement
    }
  };

  return (
    <div className="container">
      <div className="login-box">
        <h2 className="title">Connexion</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="label">Mot de passe</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="button" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
        <p className="footer-text">
          Pas encore inscrit ?{" "}
          <Link to="/register" className="footer-link">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
