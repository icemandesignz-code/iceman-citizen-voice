import React from 'react';
import { UsersIcon } from '../constants';

const CommunitiesPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center pt-16">
      <UsersIcon className="w-20 h-20 text-gray-300 dark:text-gray-600 mb-4" />
      <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">Coming Soon!</p>
      <p className="mt-4 text-gray-600 dark:text-gray-300 max-w-sm text-justify">
        This section will allow you to join local groups, participate in discussions, and collaborate with fellow citizens on community projects.
      </p>
    </div>
  );
};

export default CommunitiesPage;