import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { XIcon, GoogleIcon, FacebookIcon } from '../constants';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [view, setView] = useState<'signin' | 'signup'>('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleClose = () => {
    onClose();
    // Reset state on close after animation
    setTimeout(() => {
        setView('signin');
        setUsername('');
        setPassword('');
        setFullName('');
        setError('');
    }, 300);
  }

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter a username and password.');
      return;
    }
    setError('');

    if (username === 'admin' && password === 'password') {
      login('admin');
      handleClose();
      return;
    }

    login(username);
    handleClose();
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
     if (!fullName.trim() || !username.trim() || !password.trim()) {
      setError('Please fill out all fields.');
      return;
    }
    setError('');
    login(username);
    handleClose();
  }
  
  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    login(`social_${provider}_user`);
    handleClose();
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-sm m-4 flex flex-col shadow-xl animate-fade-in">
        <header className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-bold text-dark dark:text-white">
            {view === 'signin' ? 'Sign In' : 'Create Account'}
          </h2>
          <button onClick={handleClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <XIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
        </header>
        
        {view === 'signin' ? (
            <form onSubmit={handleSignIn} className="p-6 space-y-4">
              <div>
                <label htmlFor="username-signin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                <input 
                  type="text" 
                  id="username-signin" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="user or 'admin'"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                />
              </div>
              <div>
                <label htmlFor="password-signin"  className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <input 
                  type="password" 
                  id="password-signin" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="any or 'password' for admin"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
               <button type="submit" className="w-full bg-primary text-white font-bold py-3 px-6 rounded-xl shadow-md hover:bg-secondary transition-colors">
                  Sign In
              </button>
            </form>
        ) : (
            <div className="p-6 space-y-4">
                <button onClick={() => handleSocialLogin('google')} className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg font-semibold transition-colors duration-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <GoogleIcon className="w-5 h-5" />
                    <span>Continue with Google</span>
                </button>
                 <button onClick={() => handleSocialLogin('facebook')} className="w-full flex items-center justify-center space-x-3 py-2.5 px-4 rounded-lg font-semibold transition-colors duration-200 bg-[#1877F2] text-white hover:bg-blue-700">
                    <FacebookIcon className="w-5 h-5 text-white" />
                    <span>Continue with Facebook</span>
                </button>
                <div className="flex items-center">
                    <hr className="flex-grow border-gray-300 dark:border-gray-600" />
                    <span className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400">OR</span>
                    <hr className="flex-grow border-gray-300 dark:border-gray-600" />
                </div>
                <form onSubmit={handleSignUp} className="space-y-4">
                    <div>
                        <label htmlFor="fullName-signup" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                        <input type="text" id="fullName-signup" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                    <div>
                        <label htmlFor="username-signup" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                        <input type="text" id="username-signup" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="johndoe" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                    <div>
                        <label htmlFor="password-signup" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                        <input type="password" id="password-signup" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <button type="submit" className="w-full bg-primary text-white font-bold py-3 px-6 rounded-xl shadow-md hover:bg-secondary transition-colors">
                        Create Account
                    </button>
                </form>
            </div>
        )}
        
        <footer className="p-4 border-t dark:border-gray-700 text-center text-sm bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
            {view === 'signin' ? (
                <p className="text-gray-600 dark:text-gray-300">
                    Don't have an account?{' '}
                    <button onClick={() => { setError(''); setView('signup'); }} className="font-semibold text-primary hover:underline">
                        Sign Up
                    </button>
                </p>
            ) : (
                <p className="text-gray-600 dark:text-gray-300">
                    Already have an account?{' '}
                    <button onClick={() => { setError(''); setView('signin'); }} className="font-semibold text-primary hover:underline">
                        Sign In
                    </button>
                </p>
            )}
        </footer>
         <style>{`
          .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
          @keyframes fade-in {
              from { opacity: 0; transform: scale(0.95); }
              to { opacity: 1; transform: scale(1); }
          }
         `}</style>
      </div>
    </div>
  );
};

export default LoginModal;
