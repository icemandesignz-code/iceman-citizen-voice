
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { MOCK_MINISTRIES } from '../constants';
import { Ministry } from '../types';

const MinistryCard: React.FC<{ ministry: Ministry }> = ({ ministry }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-lg text-primary">{ministry.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 text-justify">{ministry.description}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-mono">{ministry.contact}</p>
        <div className="flex justify-between mt-3 text-sm">
            <span className="font-semibold text-gray-700 dark:text-gray-200">Managed: {ministry.issuesManaged}</span>
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
      <h2 className="text-2xl font-bold text-dark dark:text-white">Government Ministries</h2>
      
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-md text-gray-800 dark:text-gray-200 mb-4">Issue Resolution Rate</h3>
        <div style={{ width: '100%', height: 250 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="name" fontSize={12} tick={{ fill: 'currentColor', opacity: 0.6 }} />
              <YAxis tick={{ fill: 'currentColor', opacity: 0.6 }}/>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(31, 41, 55, 0.8)', // bg-gray-800 with opacity
                  borderColor: '#4B5563', // border-gray-600
                  color: '#F9FAFB' // text-gray-50
                }}
                labelStyle={{ color: '#D1D5DB' }} // text-gray-300
              />
              <Legend wrapperStyle={{ color: 'currentColor', opacity: 0.8 }} />
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