import React, { useState, useRef, useEffect } from 'react';
import { HeroContent } from '../types';
import { XIcon, CameraIcon, VideoIcon } from '../constants';

interface EditHeroModalProps {
  isOpen: boolean;
  onClose: () => void;
  heroContent: HeroContent;
  onSave: (newContent: HeroContent) => void;
}

const EditHeroModal: React.FC<EditHeroModalProps> = ({ isOpen, onClose, heroContent, onSave }) => {
  const [title, setTitle] = useState(heroContent.title);
  const [subtitle, setSubtitle] = useState(heroContent.subtitle);
  const [type, setType] = useState(heroContent.type);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(heroContent.url);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(heroContent.title);
      setSubtitle(heroContent.subtitle);
      setType(heroContent.type);
      setPreviewUrl(heroContent.url);
      setMediaFile(null);
    }
  }, [isOpen, heroContent]);

  useEffect(() => {
    return () => {
      if (previewUrl && mediaFile) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, mediaFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (previewUrl && mediaFile) {
        URL.revokeObjectURL(previewUrl);
      }
      setMediaFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    onSave({
      title,
      subtitle,
      type,
      url: type === 'gradient' ? null : previewUrl
    });
  };
  
  const handleTypeChange = (newType: HeroContent['type']) => {
    setType(newType);
    if (newType === 'gradient') {
      if (previewUrl && mediaFile) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setMediaFile(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md flex flex-col shadow-xl animate-fade-in">
        <header className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-bold text-dark dark:text-white">Edit Hero Section</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <XIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
        </header>

        <div className="p-4 space-y-4 overflow-y-auto max-h-[70vh]">
          <div>
            <label htmlFor="hero-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
            <input type="text" id="hero-title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" />
          </div>
          <div>
            <label htmlFor="hero-subtitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subtitle</label>
            <textarea id="hero-subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} rows={2} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Background Type</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <button type="button" onClick={() => handleTypeChange('gradient')} className={`py-2 rounded-md font-semibold ${type === 'gradient' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Gradient</button>
              <button type="button" onClick={() => handleTypeChange('image')} className={`py-2 rounded-md font-semibold ${type === 'image' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Image</button>
              <button type="button" onClick={() => handleTypeChange('video')} className={`py-2 rounded-md font-semibold ${type === 'video' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Video</button>
            </div>
          </div>
          
          {type !== 'gradient' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Upload Media</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {type === 'image' ? <CameraIcon className="mx-auto h-12 w-12 text-gray-400" /> : <VideoIcon className="mx-auto h-12 w-12 text-gray-400" />}
                  <div className="flex text-sm text-gray-600 dark:text-gray-400">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary hover:text-secondary focus-within:outline-none">
                      <span>Upload a file</span>
                      <input id="file-upload" ref={fileInputRef} name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept={type === 'image' ? 'image/*,.gif' : 'video/*'} />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{type === 'image' ? 'PNG, JPG, GIF up to 10MB' : 'MP4, WEBM up to 50MB'}</p>
                </div>
              </div>
            </div>
          )}

          {previewUrl && type !== 'gradient' && (
            <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview</h4>
                <div className="relative w-full aspect-video bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden">
                    {type === 'image' ? (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <video src={previewUrl} controls className="w-full h-full object-cover"></video>
                    )}
                </div>
            </div>
          )}
        </div>
        
        <footer className="p-4 border-t dark:border-gray-700 flex justify-end space-x-2 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-secondary">Save Changes</button>
        </footer>
         <style>{`
          .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
          @keyframes fade-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        `}</style>
      </div>
    </div>
  );
};

export default EditHeroModal;
