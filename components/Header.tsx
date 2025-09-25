
import React from 'react';
import { SearchIcon, BellIcon } from '../constants';

interface HeaderProps {
    onProfileClick: () => void;
    onSearchClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onProfileClick, onSearchClick }) => {
  return (
    <header className="bg-white sticky top-0 z-30 shadow-sm p-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <button onClick={onProfileClick} className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
          R
        </button>
        <div>
          <h1 className="font-bold text-lg text-dark">Citizen's Voice</h1>
          <p className="text-sm text-gray-500">Guyana</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button onClick={onSearchClick} className="text-gray-600 hover:text-primary">
          <SearchIcon className="w-6 h-6" />
        </button>
        <button className="relative text-gray-600 hover:text-primary">
          <BellIcon className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 bg-accent text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">3</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
