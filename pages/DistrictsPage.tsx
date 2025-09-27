
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_DISTRICTS } from '../constants';
import { District } from '../types';

const DistrictCard: React.FC<{ district: District }> = ({ district }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-lg text-primary">{district.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{district.region}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Population: {district.population.toLocaleString()}</p>
        <div className="flex justify-between mt-3 text-sm">
            <span className="font-semibold text-gray-700 dark:text-gray-200">Reported: {district.issuesReported}</span>
            <span className="font-semibold text-success">Resolved: {district.issuesResolved}</span>
        </div>
    </div>
);

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560', '#775DD0', '#00E396', '#FEB019', '#3F51B5'];

const DistrictsPage: React.FC = () => {
  const chartData = MOCK_DISTRICTS.map(d => ({
      name: d.name,
      value: d.issuesReported,
  }));

  return (
    <div className="space-y-6">

       <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-md text-gray-800 dark:text-gray-200 mb-2 text-center">Issues Reported by District</h3>
        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie 
                data={chartData} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                outerRadius={80} 
                fill="#8884d8"
                label={false}
                labelLine={false}
              >
                  {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(31, 41, 55, 0.8)',
                  borderColor: '#4B5563',
                  color: '#F9FAFB'
                }}
                labelStyle={{ color: '#D1D5DB' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-5 gap-x-2 gap-y-3 mt-4">
            {MOCK_DISTRICTS.map((district, index) => (
                <div key={district.id} className="flex items-center justify-center space-x-2 text-sm" title={district.name}>
                    <div className="w-3 h-3" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{index + 1}</span>
                </div>
            ))}
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