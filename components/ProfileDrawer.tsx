import React from 'react';
import { User, Page } from '../types';
import { XIcon, FileTextIcon, UsersIcon, MapIcon, SettingsIcon, LogOutIcon, UserIcon, EditIcon } from '../constants';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  onEditProfile: () => void;
}

const DrawerLink: React.FC<{
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  className?: string;
}> = ({ icon: Icon, label, onClick, className = '' }) => (
  <button onClick={onClick} className={`flex items-center space-x-4 p-3 text-lg text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left transition-colors ${className}`}>
    <Icon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
    <span>{label}</span>
  </button>
);

const ProfileDrawer: React.FC<ProfileDrawerProps> = ({ isOpen, onClose, user, onNavigate, onLogout, onEditProfile }) => {
  return (
    <>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div 
        className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-800 w-80 max-w-[80vw] shadow-2xl z-[60] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <header className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
            <h2 id="drawer-title" className="text-lg font-bold text-dark dark:text-white">Profile & Menu</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Close menu">
              <XIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
          </header>

          {/* User Info */}
          {user ? (
            <div className="p-4 bg-light dark:bg-primary/20">
              <div className="flex items-start justify-between">
                 <div className="flex items-center space-x-3">
                    <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white font-bold text-2xl overflow-hidden">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user.avatar
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-lg text-dark dark:text-white">{user.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{user.location}</p>
                    </div>
                 </div>
                 <button
                    onClick={() => {
                        onEditProfile();
                        onClose();
                    }}
                    className="p-2 text-gray-500 hover:text-primary hover:bg-black/5 dark:text-gray-300 dark:hover:bg-white/10 rounded-full"
                    aria-label="Edit profile"
                 >
                    <EditIcon className="w-5 h-5" />
                 </button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-light dark:bg-primary/20">
                <p className="text-center text-gray-700 dark:text-gray-200">Sign in to participate.</p>
            </div>
          )}
          
          {/* Navigation Links */}
          <nav className="flex-grow p-4 space-y-2">
            {user && <DrawerLink icon={FileTextIcon} label="My Profile" onClick={() => onNavigate(Page.Profile)} />}
            <DrawerLink icon={UsersIcon} label="Communities" onClick={() => onNavigate(Page.Communities)} />
            <DrawerLink icon={MapIcon} label="Issues Map" onClick={() => onNavigate(Page.Map)} />
          </nav>
          
          {/* Footer */}
          <footer className="p-4 border-t dark:border-gray-700">
              <div className="space-y-2">
                <DrawerLink icon={SettingsIcon} label="Settings" onClick={() => onNavigate(Page.Settings)} />
                {user ? (
                    <button onClick={onLogout} className="group flex w-full items-center space-x-4 rounded-lg p-3 text-left text-lg text-gray-700 dark:text-gray-200 transition-colors hover:bg-red-50 dark:hover:bg-red-900/40 hover:text-danger dark:hover:text-red-400">
                      <LogOutIcon className="h-6 w-6 text-gray-500 dark:text-gray-400 transition-colors group-hover:text-danger dark:group-hover:text-red-400" />
                      <span>Log Out</span>
                    </button>
                ) : (
                     <DrawerLink icon={UserIcon} label="Sign In" onClick={() => onNavigate(Page.Profile)} />
                )}
              </div>
          </footer>
        </div>
      </div>
    </>
  );
};

export default ProfileDrawer;