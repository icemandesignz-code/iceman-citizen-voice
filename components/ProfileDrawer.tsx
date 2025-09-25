import React from 'react';
import { User, Page } from '../types';
import { XIcon, FileTextIcon, UsersIcon, MapIcon } from '../constants';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onNavigate: (page: Page) => void;
}

const DrawerLink: React.FC<{
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}> = ({ icon: Icon, label, onClick }) => (
  <button onClick={onClick} className="flex items-center space-x-4 p-3 text-lg text-gray-700 rounded-lg hover:bg-gray-100 w-full text-left">
    <Icon className="w-6 h-6 text-gray-500" />
    <span>{label}</span>
  </button>
);

const ProfileDrawer: React.FC<ProfileDrawerProps> = ({ isOpen, onClose, user, onNavigate }) => {
  return (
    <>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div 
        className={`fixed top-0 left-0 h-full bg-white w-80 max-w-[80vw] shadow-2xl z-[60] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <header className="p-4 border-b flex items-center justify-between">
            <h2 id="drawer-title" className="text-lg font-bold text-dark">Profile & Menu</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100" aria-label="Close menu">
              <XIcon className="w-6 h-6 text-gray-600" />
            </button>
          </header>

          {/* User Info */}
          <div className="p-4 flex items-center space-x-3 bg-light">
            <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white font-bold text-2xl">
              {user.avatar}
            </div>
            <div>
              <p className="font-bold text-lg text-dark">{user.name}</p>
              <p className="text-sm text-gray-600">{user.location}</p>
            </div>
          </div>
          
          {/* Navigation Links */}
          <nav className="flex-grow p-4 space-y-2">
            <DrawerLink icon={FileTextIcon} label="My Reports" onClick={() => onNavigate(Page.Profile)} />
            <DrawerLink icon={UsersIcon} label="Communities" onClick={() => onNavigate(Page.Communities)} />
            <DrawerLink icon={MapIcon} label="Issues Map" onClick={() => onNavigate(Page.Map)} />
          </nav>
          
          {/* Footer */}
          <footer className="p-4 border-t">
              <button className="w-full text-left text-gray-600 hover:text-danger font-semibold py-2 px-3 rounded-md hover:bg-red-50">
                  Log Out
              </button>
          </footer>
        </div>
      </div>
    </>
  );
};

export default ProfileDrawer;