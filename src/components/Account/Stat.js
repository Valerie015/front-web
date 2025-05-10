import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { processRouteData } from '../../utils/routeUtils';
import './Stat.css';

const Stat = () => {
  const [dailyData, setDailyData] = useState([]);
  const [error, setError] = useState('');
  const [modeData, setModeData] = useState([]);
  const [isDistanceByDay, setIsDistanceByDay] = useState(true); // Etat pour savoir quel graphique afficher
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAndProcessData = async () => {
      if (!token) {
        navigate('/auth');
        return;
      }

      let decoded;
      try {
        decoded = jwtDecode(token);
      } catch {
        navigate('/auth');
        return;
      }

      const userId = decoded.userId;
      if (!userId) {
        navigate('/auth');
        return;
      }

      try {
        const response = await fetch(`/api/route/user/${userId}/recent?limit=100`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Erreur lors du chargement des itinéraires');

        const routes = await response.json();

        const { routesWithDistance, distancePerMode } = processRouteData(routes);

        const aggregatedData = {};

        routesWithDistance.forEach(route => {
          const date = new Date(route.createdAt).toLocaleDateString('fr-FR');
          aggregatedData[date] = (aggregatedData[date] || 0) + route.distance;
        });

        const formattedData = Object.entries(aggregatedData).map(([date, distance]) => ({
          date,
          distance: Number(distance.toFixed(2)),
        })).sort((a, b) => new Date(a.date.split('/').reverse().join('-')) - new Date(b.date.split('/').reverse().join('-')));

        const modeData = Object.entries(distancePerMode).map(([mode, distance]) => ({
          mode,
          distance: Number(distance.toFixed(2)),
        }));

        setDailyData(formattedData);
        setModeData(modeData);

      } catch (err) {
        console.error(err);
        setError('Erreur lors de la récupération des données.');
      }
    };

    fetchAndProcessData();
  }, [token, navigate]);

  if (error) return <div className="error">{error}</div>;

  return (
    <div className="stat-container">
      <h2>{isDistanceByDay ? 'Distance parcourue par jour' : 'Distance par mode de transport'}</h2>

      <button 
        onClick={() => setIsDistanceByDay(!isDistanceByDay)} 
        style={{ marginBottom: '20px' }}
      >
        {isDistanceByDay ? 'Afficher par mode de transport' : 'Afficher par jour'}
      </button>

      {isDistanceByDay ? (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={dailyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis label={{ value: 'km', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value) => `${value} km`} />
            <Bar dataKey="distance" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={modeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mode" />
            <YAxis label={{ value: 'km', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value) => `${value} km`} />
            <Bar dataKey="distance" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default Stat;
