
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MOCK_DISTRICTS } from '../constants';
import { District } from '../types';

const DistrictCard: React.FC<{ district: District }> = ({ district }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="font-bold text-lg text-primary">{district.name}</h3>
        <p className="text-sm text-gray-600 mt-1">{district.region}</p>
        <p className="text-sm text-gray-500 mt-2">Population: {district.population.toLocaleString()}</p>
        <div className="flex justify-between mt-3 text-sm">
            <span className="font-semibold text-gray-700">Reported: {district.issuesReported}</span>
            <span className="font-semibold text-success">Resolved: {district.issuesResolved}</span>
        </div>
    </div>
);

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const DistrictsPage: React.FC = () => {
  const chartData = MOCK_DISTRICTS.map(d => ({
      name: d.name,
      value: d.issuesReported,
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-dark">Administrative Districts</h2>

       <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="font-bold text-md text-gray-800 mb-4">Issues Reported by District</h3>
        <div style={{ width: '100%', height: 250 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                  {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-4">
        {MOCK_DISTRICTS.map(district => (
            <DistrictCard key={district.id} district={district} />
        ))}
      </div>
    </div>
  );
};

export default DistrictsPage;
