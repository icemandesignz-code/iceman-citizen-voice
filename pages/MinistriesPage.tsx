
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { MOCK_MINISTRIES } from '../constants';
import { Ministry } from '../types';

const MinistryCard: React.FC<{ ministry: Ministry }> = ({ ministry }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="font-bold text-lg text-primary">{ministry.name}</h3>
        <p className="text-sm text-gray-600 mt-1 text-justify">{ministry.description}</p>
        <p className="text-sm text-gray-500 mt-2 font-mono">{ministry.contact}</p>
        <div className="flex justify-between mt-3 text-sm">
            <span className="font-semibold text-gray-700">Managed: {ministry.issuesManaged}</span>
            <span className="font-semibold text-success">Resolved: {ministry.issuesResolved}</span>
        </div>
    </div>
);

const MinistriesPage: React.FC = () => {
    const chartData = MOCK_MINISTRIES.map(m => ({
        name: m.name.split(' ').slice(-1)[0], // Abbreviate name
        Managed: m.issuesManaged,
        Resolved: m.issuesResolved
    }));
    
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-dark">Government Ministries</h2>
      
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="font-bold text-md text-gray-800 mb-4">Issue Resolution Rate</h3>
        <div style={{ width: '100%', height: 250 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Managed" fill="#0077B6" />
              <Bar dataKey="Resolved" fill="#4CAF50" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="space-y-4">
        {MOCK_MINISTRIES.map(ministry => (
            <MinistryCard key={ministry.id} ministry={ministry} />
        ))}
      </div>
    </div>
  );
};

export default MinistriesPage;