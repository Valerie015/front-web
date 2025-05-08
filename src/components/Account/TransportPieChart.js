// src/components/TransportPieChart.js
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA46BE', '#FF6666'];

const TransportPieChart = ({ transportCounts }) => {
  const data = Object.entries(transportCounts).map(([mode, count]) => ({
    name: mode.charAt(0).toUpperCase() + mode.slice(1),
    value: count,
  }));

  if (data.length === 0) return null;

  return (
    <div className="chart-container" style={{ width: '100%', height: 300 }}>
      <h4>Répartition par mode de transport</h4>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            label
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TransportPieChart;
