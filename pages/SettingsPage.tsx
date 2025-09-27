import React from 'react';
import { SettingsIcon } from '../constants';

interface SettingsPageProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ isDarkMode, onToggleDarkMode }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center pt-16">
      <SettingsIcon className="w-20 h-20 text-gray-300 dark:text-gray-600 mb-4" />
      <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">Manage your app preferences.</p>
      <div className="mt-8 text-left w-full max-w-sm space-y-4">
        <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
          <span className="font-medium text-gray-700 dark:text-gray-200">Enable Notifications</span>
          <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
              <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
              <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
          </div>
        </div>
        <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
          <span className="font-medium text-gray-700 dark:text-gray-200">Dark Mode</span>
           <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
              <input 
                type="checkbox" 
                name="toggleDarkMode" 
                id="toggleDarkMode" 
                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                checked={isDarkMode}
                onChange={onToggleDarkMode}
              />
              <label htmlFor="toggleDarkMode" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 dark:bg-gray-600 cursor-pointer"></label>
          </div>
        </div>
         <p className="text-sm text-gray-400 dark:text-gray-500 text-center pt-4">More settings coming soon.</p>
      </div>
      <style>{`
          .toggle-checkbox:checked {
              right: 0;
              border-color: #0077B6;
          }
          .toggle-checkbox:checked + .toggle-label {
              background-color: #0077B6;
          }
      `}</style>
    </div>
  );
};

export default SettingsPage;