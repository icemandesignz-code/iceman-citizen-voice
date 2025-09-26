import React from 'react';
import { SearchIcon, BellIcon, ChevronLeftIcon } from '../constants';
import { User } from '../types';

interface HeaderProps {
    user: User;
    onProfileClick: () => void;
    onSearchClick: () => void;
    showBackButton?: boolean;
    onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onProfileClick, onSearchClick, showBackButton, onBack }) => {
  return (
    <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md sticky top-0 z-30 p-4 flex items-center justify-between border-b border-gray-200/50 dark:border-gray-700/50">
      <div className="flex items-center space-x-3">
        {showBackButton && onBack ? (
            <button onClick={onBack} className="text-gray-600 dark:text-gray-300 hover:text-primary">
                <ChevronLeftIcon className="w-6 h-6" />
            </button>
        ) : (
            <button onClick={onProfileClick} className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
              {user.avatar}
            </button>
        )}
        <div>
          <h1 className="font-bold text-xl text-dark dark:text-white leading-tight">Citizen's Voice</h1>
          <p className="text-base text-gray-500 dark:text-gray-400">Guyana</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button onClick={onSearchClick} className="text-gray-600 dark:text-gray-300 hover:text-primary">
          <SearchIcon className="w-6 h-6" />
        </button>
        <button className="relative text-gray-600 dark:text-gray-300 hover:text-primary">
          <BellIcon className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 bg-accent text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">3</span>
        </button>
      </div>
    </header>
  );
};

export default Header;