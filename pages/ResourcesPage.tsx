
import React from 'react';
import { ResourcesIcon } from '../constants';

const ResourcesPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center pt-16">
      <ResourcesIcon className="w-20 h-20 text-gray-300 mb-4" />
      <h2 className="text-2xl font-bold text-dark">Resource Tracking</h2>
      <p className="text-lg text-gray-500 mt-2">Coming Soon!</p>
      <p className="mt-4 text-gray-600 max-w-sm text-justify">
        This section will provide transparency on government resources, projects, and initiatives, including budget allocations and progress updates.
      </p>
    </div>
  );
};

export default ResourcesPage;