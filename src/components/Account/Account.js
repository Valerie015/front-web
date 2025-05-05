import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import './Account.css';

const Account = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ userName: '', email: '' });
  const [successMessage, setSuccessMessage] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);


  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setError("Token manquant.");
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const userId = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
        const response = await axios.get(`http://localhost/api/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProfile(response.data);
        setFormData({
          userName: response.data.userName,
          email: response.data.email
        });
      } catch (e) {
        setError("Erreur lors du décodage ou de la récupération du profil.");
      }
    };

    fetchProfile();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    if (!profile) return;

    try {
      await axios.put(`http://localhost/api/user/${profile.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccessMessage("Profil mis à jour avec succès.");
      setProfile((prev) => ({ ...prev, ...formData }));
      setShowModal(false);
    } catch (err) {
      setError("Erreur lors de la mise à jour du profil.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!profile) return;
  
    try {
      await axios.delete(`http://localhost/api/user/delete/${profile.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      localStorage.removeItem("token"); // déconnecte l'utilisateur
      alert("Compte supprimé avec succès.");
      window.location.href = "/"; // ou redirige vers page de login
    } catch (err) {
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

      <button onClick={() => setShowModal(true)}>Modifier</button>
      <button onClick={() => setShowDeleteConfirm(true)} style={{ backgroundColor: '#e74c3c', marginTop: '20px' }}>
      Supprimer mon compte
      </button>


      {successMessage && <p className="success">{successMessage}</p>}

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Modifier le profil</h3>
            <label>Nom d'utilisateur :</label>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleInputChange}
            />
            <label>Email :</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
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
