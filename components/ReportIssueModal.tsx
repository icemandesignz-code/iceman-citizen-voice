import { GoogleGenAI, Type } from "@google/genai";
import React, { useState, useRef, useEffect } from 'react';
import { Issue, IssueCategory, IssuePriority } from '../types';
import { XIcon, CameraIcon, VideoIcon, AudioIcon, CrosshairIcon, MicIcon, ZapIcon as MagicIcon, MapPinIcon } from '../constants';

// For SpeechRecognition API, which might not be on the window type
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
  const L: any;
}

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddIssue: (newIssue: Omit<Issue, 'id' | 'author' | 'timestamp' | 'status' | 'comments'> & { isAnonymous: boolean }) => void;
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
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [priority, setPriority] = useState<IssuePriority>(IssuePriority.Medium);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState('');
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSuggestingPriority, setIsSuggestingPriority] = useState(false);
  const [isMapView, setIsMapView] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [tempCoords, setTempCoords] = useState<{lat: number, lng: number} | null>(null);
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);


  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [audio, setAudio] = useState<File | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);


  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);


  // Effect to clean up object URLs and other resources
  useEffect(() => {
    return () => {
      photos.forEach(photo => URL.revokeObjectURL(photo.url));
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
      if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
      if (recognitionRef.current) recognitionRef.current.stop();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [photos, videoPreviewUrl, audioPreviewUrl]);

  useEffect(() => {
    if (isMapView && mapContainerRef.current && !mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current).setView([6.5, -58.5], 8);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        map.on('click', (e: any) => {
            const { lat, lng } = e.latlng;
            setTempCoords({ lat, lng });
            if (!markerRef.current) {
                markerRef.current = L.marker(e.latlng).addTo(map);
            } else {
                markerRef.current.setLatLng(e.latlng);
            }
        });
        
        mapInstanceRef.current = map;
        setTimeout(() => map.invalidateSize(), 0);
    }
  }, [isMapView]);

  const handleConfirmLocation = async () => {
    if (!tempCoords) return;

    setIsGeocoding(true);
    setError('');

    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${tempCoords.lat}&lon=${tempCoords.lng}`);
        if (!response.ok) throw new Error('Failed to fetch address');
        const data = await response.json();
        
        const displayName = data.display_name || `Lat: ${tempCoords.lat.toFixed(4)}, Lng: ${tempCoords.lng.toFixed(4)}`;
        
        setLocation(displayName);
        setCoordinates(tempCoords);
        setIsMapView(false);
    } catch (err) {
        console.error("Reverse geocoding error:", err);
        setLocation(`Lat: ${tempCoords.lat.toFixed(4)}, Lng: ${tempCoords.lng.toFixed(4)}`);
        setCoordinates(tempCoords);
        setIsMapView(false);
    } finally {
        setIsGeocoding(false);
    }
  };


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
  
  const handleGenerateSummary = async () => {
    if (!description.trim()) {
      setError("Please provide a description before generating a summary.");
      return;
    }
    setError('');
    setIsGeneratingSummary(true);
    setGeneratedSummary('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Based on the following civic issue report, generate a concise, one-sentence summary of 100 characters or less. The summary should capture the main problem. Description: "${description}"`,
      });
      const summaryText = response.text;
      
      if (summaryText) {
        setGeneratedSummary(summaryText.trim());
      } else {
        setError("AI could not generate a summary. You can write one manually or try again.");
      }
    } catch (e) {
      console.error("Error generating summary with AI:", e);
      setError("Failed to generate summary. Please try again or proceed without it.");
    } finally {
      setIsGeneratingSummary(false);
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
      async (position) => {
        const { latitude, longitude } = position.coords;
        const coords = { lat: latitude, lng: longitude };
        setCoordinates(coords);
        
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`);
            if (!response.ok) throw new Error('Reverse geocoding failed');
            const data = await response.json();
            setLocation(data.display_name || `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`);
        } catch (err) {
            console.error("Error fetching location name:", err);
            setLocation(`${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`);
        } finally {
            setIsFetchingLocation(false);
        }
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
    setGeneratedSummary('');
    setCategory(IssueCategory.Infrastructure);
    setLocation('');
    setCoordinates(null);
    setTempCoords(null);
    setIsMapView(false);
    if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
    }
    setPriority(IssuePriority.Medium);
    setIsAnonymous(false);
    setError('');
    setPhotos([]);
    clearVideo();
    clearAudio();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !location) {
      setError('Please fill in the title, description, and location.');
      return;
    }
    if (!coordinates) {
      setError('Please set a location on the map or use your current location for accurate reporting.');
      return;
    }
    
    onAddIssue({
      title,
      summary: generatedSummary || description.substring(0, 100) + '...',
      description,
      category,
      location,
      coordinates,
      priority,
      isAnonymous,
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
      <div className="bg-white dark:bg-gray-800 rounded-t-2xl absolute bottom-0 max-h-[95vh] w-full max-w-lg flex flex-col animate-slide-up">
        <header className="p-4 border-b dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 rounded-t-2xl">
          <h2 className="text-lg font-bold text-dark dark:text-white">Report a New Issue</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <XIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="e.g., Pothole on Main Street" />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
             <div className="relative mt-1">
                <textarea 
                    id="description" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    rows={4} 
                    className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm pr-10" 
                    placeholder="Provide details or use the mic to dictate."
                />
                <button
                    type="button"
                    onClick={handleToggleRecording}
                    className={`absolute top-2 right-2 p-1 rounded-full transition-colors ${isRecording ? 'bg-red-100 text-danger' : 'text-gray-500 hover:text-primary hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600'}`}
                    aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                >
                    <MicIcon className="w-5 h-5" />
                </button>
            </div>
            {isRecording && <p className="text-sm text-danger mt-1 animate-pulse">Listening...</p>}
            <button
                type="button"
                onClick={handleGenerateSummary}
                disabled={isGeneratingSummary || !description.trim()}
                className="mt-2 flex items-center justify-center space-x-2 w-full border border-primary text-primary font-semibold py-2 px-4 rounded-lg hover:bg-light dark:hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <MagicIcon className={`w-5 h-5 ${isGeneratingSummary ? 'animate-pulse' : ''}`} />
                <span>{isGeneratingSummary ? 'Generating Summary...' : 'Generate Summary with AI'}</span>
            </button>
            {generatedSummary && (
                <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Suggested Summary:</label>
                    <p className="mt-1 p-3 bg-gray-100 dark:bg-gray-700 rounded-md text-sm text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 text-justify">{generatedSummary}</p>
                </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
              <select id="category" value={category} onChange={(e) => setCategory(e.target.value as IssueCategory)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                {Object.values(IssueCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
             <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
                <div className="relative mt-1">
                    <select id="priority" value={priority} onChange={(e) => setPriority(e.target.value as IssuePriority)} className="block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
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
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
            {isMapView ? (
                <div className="mt-2">
                    <div ref={mapContainerRef} className="h-64 w-full rounded-lg z-0 border dark:border-gray-600"></div>
                    {isGeocoding && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 animate-pulse">Fetching address...</p>}
                    <div className="flex justify-end space-x-2 mt-2">
                        <button type="button" onClick={() => setIsMapView(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">Cancel</button>
                        <button type="button" onClick={handleConfirmLocation} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-secondary disabled:opacity-50" disabled={!tempCoords || isGeocoding}>
                          {isGeocoding ? 'Locating...' : 'Confirm Location'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="mt-1">
                    <input 
                        type="text" 
                        id="location" 
                        value={location} 
                        onChange={(e) => {
                            setLocation(e.target.value);
                            setCoordinates(null);
                        }}
                        className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder={isFetchingLocation ? "Getting current location..." : "Type an address or use buttons"}
                    />
                    <div className="flex space-x-2 mt-2 text-sm">
                        <button type="button" onClick={handleGetLocation} disabled={isFetchingLocation} className="flex-1 flex items-center justify-center space-x-2 border border-gray-300 dark:border-gray-600 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:opacity-50">
                            <CrosshairIcon className="w-4 h-4" />
                            <span>Current Location</span>
                        </button>
                        <button type="button" onClick={() => setIsMapView(true)} className="flex-1 flex items-center justify-center space-x-2 border border-gray-300 dark:border-gray-600 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <MapPinIcon className="w-4 h-4" />
                            <span>Select on Map</span>
                        </button>
                    </div>
                </div>
            )}
          </div>
          
          <div className="relative flex items-start">
            <div className="flex items-center h-5">
              <input
                id="anonymous"
                name="anonymous"
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="focus:ring-primary h-4 w-4 text-primary border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="anonymous" className="font-medium text-gray-700 dark:text-gray-300">
                Report Anonymously
              </label>
              <p className="text-gray-500 dark:text-gray-400 text-justify">Your identity will be hidden from the public if you check this box.</p>
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Add Media (Optional)</label>
             <input type="file" accept="image/*" multiple ref={photoInputRef} onChange={handlePhotoChange} className="hidden" />
             <input type="file" accept="video/*" ref={videoInputRef} onChange={handleVideoChange} className="hidden" />
             <input type="file" accept="audio/*" ref={audioInputRef} onChange={handleAudioChange} className="hidden" />
             <div className="flex space-x-2">
                <button type="button" onClick={() => photoInputRef.current?.click()} className="flex-1 flex items-center justify-center space-x-2 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 font-semibold py-3 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <CameraIcon className="w-5 h-5" />
                    <span>Photo(s)</span>
                </button>
                <button type="button" onClick={() => videoInputRef.current?.click()} className="flex-1 flex items-center justify-center space-x-2 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 font-semibold py-3 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <VideoIcon className="w-5 h-5" />
                    <span>Video</span>
                </button>
                <button type="button" onClick={() => audioInputRef.current?.click()} className="flex-1 flex items-center justify-center space-x-2 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 font-semibold py-3 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <AudioIcon className="w-5 h-5" />
                    <span>Audio</span>
                </button>
             </div>
              <div className="mt-4 space-y-4">
                {photos.length > 0 && (
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Photo Previews</h4>
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
                           <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Video Preview</h4>
                           <button type="button" onClick={clearVideo} className="text-xs text-red-600 hover:underline">Remove</button>
                        </div>
                        <video src={videoPreviewUrl} controls className="w-full rounded-md bg-gray-100 dark:bg-gray-900"></video>
                    </div>
                )}
                {audioPreviewUrl && (
                     <div>
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Audio Preview</h4>
                             <button type="button" onClick={clearAudio} className="text-xs text-red-600 hover:underline">Remove</button>
                        </div>
                        <audio src={audioPreviewUrl} controls className="w-full"></audio>
                    </div>
                )}
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
        
        <footer className="p-4 border-t dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800">
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