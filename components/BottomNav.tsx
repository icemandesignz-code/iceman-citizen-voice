
import React from 'react';
import { Page } from '../types';
import { HomeIcon, MinistryIcon, DistrictsIcon, ResourcesIcon, SOSIcon } from '../constants';

interface BottomNavProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const navItems = [
  { page: Page.Home, icon: HomeIcon, label: 'Home' },
  { page: Page.Ministry, icon: MinistryIcon, label: 'Ministry' },
  { page: Page.Districts, icon: DistrictsIcon, label: 'Districts' },
  { page: Page.Resources, icon: ResourcesIcon, label: 'Resources' },
  { page: Page.SOS, icon: SOSIcon, label: 'SOS' },
];

const NavItem: React.FC<{
  item: typeof navItems[0];
  isActive: boolean;
  onClick: () => void;
}> = ({ item, isActive, onClick }) => {
  const activeClasses = 'bg-light text-primary';
  const inactiveClasses = 'text-gray-500';

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center space-y-1 w-1/5 p-2 rounded-lg transition-colors duration-200 ${isActive ? '' : 'hover:bg-gray-100'}`}
    >
      <div className={`p-3 rounded-full transition-colors duration-200 ${isActive ? activeClasses : ''}`}>
        <item.icon className={`w-6 h-6 ${isActive ? 'text-primary' : 'text-gray-500'}`} />
      </div>
      <span className={`text-xs font-medium ${isActive ? 'text-primary' : inactiveClasses}`}>
        {item.label}
      </span>
    </button>
  );
};


const BottomNav: React.FC<BottomNavProps> = ({ currentPage, setCurrentPage }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)] flex justify-around items-center p-2 max-w-lg mx-auto z-40 border-t border-gray-200">
      {navItems.map((item) => (
        <NavItem
          key={item.page}
          item={item}
          isActive={currentPage === item.page}
          onClick={() => setCurrentPage(item.page)}
        />
      ))}
    </nav>
  );
};

export default BottomNav;
