import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { XIcon, CameraIcon } from '../constants';

interface EditProfileModalProps {
  isOpen: boolean;
  user: User;
  onClose: () => void;
  onSave: (updatedUser: Partial<User>) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, onClose, onSave, isOpen }) => {
  const [name, setName] = useState(user.name);
  const [location, setLocation] = useState(user.location);
  const [avatar, setAvatar] = useState(user.avatar);
  const [imagePreview, setImagePreview] = useState<string | null>(user.avatarUrl || null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up blob URL on component unmount
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // FIX: This effect syncs the component's state with the user prop,
  // and resets the form when the modal is opened.
  useEffect(() => {
    if (isOpen) {
      setName(user.name);
      setLocation(user.location);
      setAvatar(user.avatar);
      setImagePreview(user.avatarUrl || null);
      setError('');
    }
  }, [isOpen, user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      const newPreviewUrl = URL.createObjectURL(file);
      setImagePreview(newPreviewUrl);
    }
  };

  const handleSave = () => {
    if (!name.trim() || !location.trim() || !avatar.trim()) {
      setError('All text fields are required.');
      return;
    }
    
    const updatedUserData: Partial<User> = {
      name,
      location,
      avatar: avatar.toUpperCase(),
    };

    // Only include avatarUrl if it has changed to a new blob URL
    if (imagePreview && imagePreview.startsWith('blob:')) {
      updatedUserData.avatarUrl = imagePreview;
    } else if (imagePreview === null && user.avatarUrl) {
      // Handle image removal if we add that feature
      updatedUserData.avatarUrl = undefined;
    }
    
    onSave(updatedUserData);
    onClose();
  };

  // FIX: Conditionally render the modal based on the isOpen prop.
  if (!isOpen) {
    return null;
  }

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
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white font-bold text-4xl overflow-hidden">
                {imagePreview ? (
                    <img src={imagePreview} alt="Profile Preview" className="w-full h-full object-cover" />
                ) : (
                    avatar
                )}
              </div>
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-700 p-2 rounded-full shadow-md border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                aria-label="Upload profile picture"
              >
                  <CameraIcon className="w-5 h-5 text-gray-600 dark:text-gray-300"/>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*" 
              />
            </div>
          </div>

          <div>
            <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Avatar Initial (Fallback)</label>
            <input 
              type="text" 
              id="avatar" 
              value={avatar} 
              onChange={(e) => setAvatar(e.target.value.slice(0, 1))} 
              maxLength={1}
              className="mt-1 block w-full px-3 py-2 text-center text-lg font-bold border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
