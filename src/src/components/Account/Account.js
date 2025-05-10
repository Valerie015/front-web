import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { processRouteData } from '../../utils/routeUtils';
import TransportPieChart from './TransportPieChart';
import './Account.css';

const Account = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ userName: '', email: '', password: '', confirmPassword: '' });
  const [successMessage, setSuccessMessage] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();
  const [totalDistance, setTotalDistance] = useState(0);
  const [transportCounts, setTransportCounts] = useState({});


  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
            navigate("/auth");
            return;
          }
      
          let decoded;
          try {
            decoded = jwtDecode(token);
          } catch (err) {
            navigate("/auth");
            return;
          }
      
          const userId = decoded.userId;
          if (!userId) {
            navigate("/auth");
            return;
          }
      

      try {
        const response = await fetch(`http://localhost/api/user/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération du profil");
        }

        const data = await response.json();
        setProfile(data);
        setFormData({
          userName: data.userName,
          email: data.email,
        });
      } catch (e) {
        console.error("Erreur complète :", e);
        setError("Erreur lors de la récupération du profil.");
      }
    };

    fetchProfile();
  }, [token]);

  useEffect(() => {
    const fetchRoutes = async () => {
      if (!profile) return;
  
      try {
        const response = await fetch(`/api/route/user/${profile.id}/recent?limit=100`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!response.ok) throw new Error("Erreur lors du chargement des itinéraires");
  
        const data = await response.json();
        const { totalDistance, transportCounts } = processRouteData(data);
  
        setTotalDistance(totalDistance);
        setTransportCounts(transportCounts);
  
      } catch (err) {
        console.error(err);
      }
    };
  
    fetchRoutes();
  }, [profile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    if (!formData.userName || !formData.email) {
      setError("Nom d'utilisateur et email sont obligatoires.");
      return;
    }
    if (!profile) return;
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }


    try {
      const response = await fetch(`http://localhost/api/user/update/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour.");
      }

      setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));

      setSuccessMessage("Profil mis à jour avec succès.");
      setProfile((prev) => ({ ...prev, ...formData }));
      setShowModal(false);
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la mise à jour du profil.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!profile) return;

    try {
      const response = await fetch(`http://localhost/api/user//delete/me`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du compte.");
      }

      localStorage.removeItem("token");
      alert("Compte supprimé avec succès.");
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la suppression du compte.");
      setShowDeleteConfirm(false);
    }
  };

  if (error) return <div className="error">{error}</div>;
  if (!profile) return <div>Chargement du profil...</div>;

  return (
    <div className="account-container">
      <h2>Mon Profil</h2>
      <ul>
        <li><strong>Nom d'utilisateur :</strong> {profile.userName}</li>
        <li><strong>Email :</strong> {profile.email}</li>
      </ul>
      <div className="travel-stats">
        <h3>Statistiques de déplacement</h3>
        <p><strong>Distance totale parcourue :</strong> {totalDistance.toFixed(2)} km</p>
        <TransportPieChart transportCounts={transportCounts} />
      </div>
      <div className="button-group">
        <button onClick={() => setShowModal(true)}>Modifier</button>
        <button onClick={() => setShowDeleteConfirm(true)} className="delete-button">
          Supprimer mon compte
        </button>
      </div>

      {successMessage && <p className="success">{successMessage}</p>}

      {showModal && (
        <div className="modal">
        <div className="modal-content">
          <h3>Modifier le profil</h3>
          <div className="form-group">
            <label>Nom d'utilisateur :</label>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Email :</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Mot de passe (laisser vide si inchangé) :</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Confirmer le mot de passe :</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
            />
          </div>
      
          {formData.password && formData.confirmPassword && (
            <p style={{ color: formData.password === formData.confirmPassword ? 'green' : 'red' }}>
              {formData.password === formData.confirmPassword
                ? '✔ Les mots de passe correspondent.'
                : '❌ Les mots de passe ne correspondent pas.'}
            </p>
          )}
      
          <div className="modal-actions">
            <button onClick={handleUpdate}>Enregistrer</button>
            <button onClick={() => setShowModal(false)}>Annuler</button>
          </div>
        </div>
      </div>      
      )}

      {showDeleteConfirm && (
        <div className="modal">
          <div className="modal-content">
            <h3>Confirmer la suppression</h3>
            <p>Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.</p>
            <div className="modal-actions">
              <button onClick={handleDeleteAccount} style={{ backgroundColor: '#e74c3c' }}>Oui, supprimer</button>
              <button onClick={() => setShowDeleteConfirm(false)}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
    
  );
};

export default Account;
