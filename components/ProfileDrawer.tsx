
import React from 'react';
import { UserIcon, MessageSquareIcon, UsersIcon, FileTextIcon, XIcon } from '../constants';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileDrawer: React.FC<ProfileDrawerProps> = ({ isOpen, onClose }) => {
  return (
    <>
      <div 
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${isOpen ? 'bg-opacity-50' : 'bg-opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      />
      <div 
        className={`fixed top-0 left-0 h-full bg-white w-80 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-bold text-lg">Profile & Activity</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <XIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        
        <div className="p-4">
            <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-bold text-3xl">R</div>
                <div>
                    <h3 className="text-xl font-bold">Ravi Kumar</h3>
                    <p className="text-gray-500">Georgetown, Region 4</p>
                </div>
            </div>
        </div>

        <nav className="p-2 space-y-1">
            <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700">
                <UserIcon className="w-6 h-6 text-primary" />
                <span className="font-semibold">My Reports</span>
            </a>
            <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700">
                <MessageSquareIcon className="w-6 h-6 text-primary" />
                <span className="font-semibold">Inbox</span>
            </a>
            <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700">
                <UsersIcon className="w-6 h-6 text-primary" />
                <span className="font-semibold">Communities</span>
            </a>
            <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700">
                <FileTextIcon className="w-6 h-6 text-primary" />
                <span className="font-semibold">Surveys</span>
            </a>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
            <button className="w-full bg-red-50 text-red-600 font-bold py-3 px-6 rounded-xl hover:bg-red-100 transition-colors">
              Log Out
            </button>
        </div>

      </div>
    </>
  );
};

export default ProfileDrawer;
