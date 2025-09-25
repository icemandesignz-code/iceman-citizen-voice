import { GoogleGenAI, Type } from "@google/genai";
import React, { useState, useRef, useEffect } from 'react';
import { Issue, IssueCategory, IssuePriority } from '../types';
import { XIcon, CameraIcon, VideoIcon, AudioIcon, CrosshairIcon, MicIcon, ZapIcon as MagicIcon } from '../constants';

// For SpeechRecognition API, which might not be on the window type
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddIssue: (newIssue: Omit<Issue, 'id' | 'author' | 'timestamp' | 'status' | 'comments'>) => void;
}

interface PhotoPreview {
  file: File;
  url: string;
}

const ReportIssueModal: React.FC<ReportIssueModalProps> = ({ isOpen, onClose, onAddIssue }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IssueCategory>(IssueCategory.Infrastructure);
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState<IssuePriority>(IssuePriority.Medium);
  const [error, setError] = useState('');
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSuggestingPriority, setIsSuggestingPriority] = useState(false);

  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [audio, setAudio] = useState<File | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);


  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any | null>(null);


  // Effect to clean up object URLs
  useEffect(() => {
    return () => {
      photos.forEach(photo => URL.revokeObjectURL(photo.url));
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
      if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
      // Clean up speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [photos, videoPreviewUrl, audioPreviewUrl]);

  const handleToggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in your browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let newTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        newTranscript += event.results[i][0].transcript;
      }
      
      if (newTranscript) {
        setDescription(prev => (prev.trim() ? prev.trim() + ' ' : '') + newTranscript.trim());
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setError(`Speech recognition error: ${event.error}`);
      setIsRecording(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };

    recognition.start();
    setIsRecording(true);
  };
  
  const handleSuggestPriority = async () => {
    if (!title.trim() || !description.trim()) {
      setError("Please provide a title and description before suggesting priority.");
      return;
    }
    setError('');
    setIsSuggestingPriority(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Analyze the following civic issue report and determine its priority level. Consider factors like safety risks, number of people affected, and impact on daily life. Title: "${title}". Description: "${description}".`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              priority: {
                type: Type.STRING,
                enum: [IssuePriority.Low, IssuePriority.Medium, IssuePriority.High, IssuePriority.Critical],
                description: 'The priority of the issue.',
              },
            },
            required: ["priority"],
          },
        },
      });

      const jsonStr = response.text.trim();
      const result = JSON.parse(jsonStr);
      
      if (result.priority && Object.values(IssuePriority).includes(result.priority as IssuePriority)) {
        setPriority(result.priority as IssuePriority);
      } else {
        setError("AI suggestion was in an invalid format. Please choose manually.");
      }
    } catch (e) {
      console.error("Error fetching AI priority suggestion:", e);
      setError("Could not get an AI suggestion. Please select a priority manually.");
    } finally {
      setIsSuggestingPriority(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setIsFetchingLocation(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        setIsFetchingLocation(false);
      },
      (geoError) => {
        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            setError("Location access was denied. Please enable it in your browser settings.");
            break;
          case geoError.POSITION_UNAVAILABLE:
            setError("Location information is unavailable.");
            break;
          case geoError.TIMEOUT:
            setError("The request to get user location timed out.");
            break;
          default:
            setError("An unknown error occurred while fetching location.");
            break;
        }
        setIsFetchingLocation(false);
      }
    );
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files).map(file => ({
        file,
        url: URL.createObjectURL(file as Blob)
      }));
      setPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    const photoToRemove = photos[indexToRemove];
    URL.revokeObjectURL(photoToRemove.url);
    setPhotos(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideo(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
    }
  };
  
  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAudio(file);
      setAudioPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearVideo = () => {
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideo(null);
    setVideoPreviewUrl(null);
    if(videoInputRef.current) videoInputRef.current.value = "";
  };
  
  const clearAudio = () => {
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    setAudio(null);
    setAudioPreviewUrl(null);
    if(audioInputRef.current) audioInputRef.current.value = "";
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory(IssueCategory.Infrastructure);
    setLocation('');
    setPriority(IssuePriority.Medium);
    setError('');
    setPhotos([]);
    clearVideo();
    clearAudio();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !location) {
      setError('Please fill in all required fields.');
      return;
    }
    
    onAddIssue({
      title,
      summary: description.substring(0, 100) + '...', // Auto-generate summary
      description,
      category,
      location,
      priority,
      media: {
        photos: photos.map(p => p.file.name),
        videos: video ? [video.name] : [],
        audio: audio ? [audio.name] : [],
      }
    });
    
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-t-2xl absolute bottom-0 max-h-[95vh] w-full max-w-lg flex flex-col animate-slide-up">
        <header className="p-4 border-b flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-lg font-bold text-dark">Report a New Issue</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <XIcon className="w-6 h-6 text-gray-600" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="e.g., Pothole on Main Street" />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
             <div className="relative mt-1">
                <textarea 
                    id="description" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    rows={4} 
                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm pr-10" 
                    placeholder="Provide details or use the mic to dictate."
                />
                <button
                    type="button"
                    onClick={handleToggleRecording}
                    className={`absolute top-2 right-2 p-1 rounded-full transition-colors ${isRecording ? 'bg-red-100 text-danger' : 'text-gray-500 hover:text-primary hover:bg-gray-100'}`}
                    aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                >
                    <MicIcon className="w-5 h-5" />
                </button>
            </div>
            {isRecording && <p className="text-sm text-danger mt-1 animate-pulse">Listening...</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
              <select id="category" value={category} onChange={(e) => setCategory(e.target.value as IssueCategory)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                {Object.values(IssueCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
             <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
                <div className="relative mt-1">
                    <select id="priority" value={priority} onChange={(e) => setPriority(e.target.value as IssuePriority)} className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                        {Object.values(IssuePriority).map(level => <option key={level} value={level}>{level}</option>)}
                    </select>
                     <button
                        type="button"
                        onClick={handleSuggestPriority}
                        disabled={isSuggestingPriority}
                        className="absolute inset-y-0 right-0 flex items-center pr-2 text-primary hover:text-secondary disabled:opacity-50 disabled:cursor-wait"
                        aria-label="Suggest priority with AI"
                        title="Suggest priority with AI"
                    >
                        <MagicIcon className={`w-5 h-5 ${isSuggestingPriority ? 'animate-pulse' : ''}`} />
                    </button>
                </div>
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
            <div className="relative mt-1">
                <input 
                    type="text" 
                    id="location" 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)} 
                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm pr-10" 
                    placeholder={isFetchingLocation ? "Fetching location..." : "e.g., Georgetown, Region 4"}
                    disabled={isFetchingLocation}
                />
                <button 
                    type="button" 
                    onClick={handleGetLocation} 
                    disabled={isFetchingLocation}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-primary disabled:opacity-50 disabled:cursor-wait"
                    aria-label="Get current location"
                >
                    <CrosshairIcon className="w-5 h-5" />
                </button>
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">Add Media (Optional)</label>
             <input type="file" accept="image/*" multiple ref={photoInputRef} onChange={handlePhotoChange} className="hidden" />
             <input type="file" accept="video/*" ref={videoInputRef} onChange={handleVideoChange} className="hidden" />
             <input type="file" accept="audio/*" ref={audioInputRef} onChange={handleAudioChange} className="hidden" />
             <div className="flex space-x-2">
                <button type="button" onClick={() => photoInputRef.current?.click()} className="flex-1 flex items-center justify-center space-x-2 border-2 border-dashed border-gray-300 text-gray-500 font-semibold py-3 px-4 rounded-lg hover:bg-gray-50">
                    <CameraIcon className="w-5 h-5" />
                    <span>Photo(s)</span>
                </button>
                <button type="button" onClick={() => videoInputRef.current?.click()} className="flex-1 flex items-center justify-center space-x-2 border-2 border-dashed border-gray-300 text-gray-500 font-semibold py-3 px-4 rounded-lg hover:bg-gray-50">
                    <VideoIcon className="w-5 h-5" />
                    <span>Video</span>
                </button>
                <button type="button" onClick={() => audioInputRef.current?.click()} className="flex-1 flex items-center justify-center space-x-2 border-2 border-dashed border-gray-300 text-gray-500 font-semibold py-3 px-4 rounded-lg hover:bg-gray-50">
                    <AudioIcon className="w-5 h-5" />
                    <span>Audio</span>
                </button>
             </div>
              <div className="mt-4 space-y-4">
                {photos.length > 0 && (
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Photo Previews</h4>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {photos.map((photo, index) => (
                                <div key={index} className="relative group">
                                    <img src={photo.url} alt={`preview ${index}`} className="w-full h-24 object-cover rounded-md" />
                                    <button
                                        type="button"
                                        onClick={() => handleRemovePhoto(index)}
                                        className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                        aria-label="Remove photo"
                                    >
                                        <XIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {videoPreviewUrl && (
                     <div>
                        <div className="flex items-center justify-between mb-2">
                           <h4 className="text-sm font-medium text-gray-700">Video Preview</h4>
                           <button type="button" onClick={clearVideo} className="text-xs text-red-600 hover:underline">Remove</button>
                        </div>
                        <video src={videoPreviewUrl} controls className="w-full rounded-md bg-gray-100"></video>
                    </div>
                )}
                {audioPreviewUrl && (
                     <div>
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-gray-700">Audio Preview</h4>
                             <button type="button" onClick={clearAudio} className="text-xs text-red-600 hover:underline">Remove</button>
                        </div>
                        <audio src={audioPreviewUrl} controls className="w-full"></audio>
                    </div>
                )}
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
        
        <footer className="p-4 border-t sticky bottom-0 bg-white">
          <button onClick={handleSubmit} className="w-full bg-primary text-white font-bold py-3 px-6 rounded-xl shadow-md hover:bg-secondary transition-colors">
              Submit Report
          </button>
        </footer>
      </div>
       <style>{`
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-pulse {
            animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
            0%, 100% {
                opacity: 1;
            }
            50% {
                opacity: .5;
            }
        }
      `}</style>
    </div>
  );
};

export default ReportIssueModal;