import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Account = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Token manquant. Veuillez vous reconnecter.");
        return;
      }

      try {
        const response = await axios.get("/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfile(response.data);
      } catch (err) {
        setError("Erreur lors du chargement du profil.");
      }
    };

    fetchProfile();
  }, []);

  if (error) return <div className="error">{error}</div>;
  if (!profile) return <div>Chargement du profil...</div>;

  return (
    <div className="account-container">
      <h2>Mon Profil</h2>
      <ul>
        <li><strong>ID :</strong> {profile.id}</li>
        <li><strong>Nom d'utilisateur :</strong> {profile.userName}</li>
        <li><strong>Email :</strong> {profile.email}</li>
        <li><strong>Rôle :</strong> {profile.role}</li>
      </ul>
    </div>
  );
};

export default Account;
