import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./Register.css";

function Register() {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role] = useState("User");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas !");
      return;
    }

    try {
      const response = await fetch("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName,
          email,
          password,
          role,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }

      toast.success("Inscription réussie ! 🎉 Redirection vers la connexion...", {
        position: "top-center",
        autoClose: 1000, // 1 secondes
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      toast.error(err.message || "Erreur lors de l'inscription.", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="container">
      <div className="register-box">
        <h2 className="title">Créer un compte</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          {/* Formulaire ici */}
          <div className="form-group">
            <label className="label">Nom d'utilisateur</label>
            <input
              type="text"
              className="input"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
          </div>
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
          <div className="form-group">
            <label className="label">Confirmer mot de passe</label>
            <input
              type="password"
              className="input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="button">
            Créer un compte
          </button>
        </form>
        <p className="footer-text">
          Déjà inscrit ?{" "}
          <Link to="/login" className="footer-link">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
