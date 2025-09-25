import React, { useState } from 'react';
import { User } from '../types';
import { XIcon } from '../constants';

interface EditProfileModalProps {
  user: User;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, onClose, onSave }) => {
  const [name, setName] = useState(user.name);
  const [location, setLocation] = useState(user.location);
  const [avatar, setAvatar] = useState(user.avatar);
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!name.trim() || !location.trim() || !avatar.trim()) {
      setError('All fields are required.');
      return;
    }
    
    const updatedUser = {
      ...user,
      name,
      location,
      avatar: avatar.toUpperCase(),
    };
    onSave(updatedUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-sm m-4 flex flex-col shadow-xl">
        <header className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-bold text-dark dark:text-white">Edit Profile</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <XIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
        </header>
        
        <div className="p-4 space-y-4">
          <div>
            <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Avatar Initial</label>
            <input 
              type="text" 
              id="avatar" 
              value={avatar} 
              onChange={(e) => setAvatar(e.target.value.slice(0, 1))} 
              maxLength={1}
              className="mt-1 block w-full px-3 py-2 text-center text-2xl font-bold border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
            <input 
              type="text" 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
            />
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
            <input 
              type="text" 
              id="location" 
              value={location} 
              onChange={(e) => setLocation(e.target.value)} 
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <footer className="p-4 border-t dark:border-gray-700 flex justify-end space-x-2 bg-gray-50 dark:bg-gray-800 rounded-b-lg">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            Save Changes
          </button>
        </footer>
      </div>
    </div>
  );
};

export default EditProfileModal;