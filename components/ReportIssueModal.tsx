import { GoogleGenAI, Type } from "@google/genai";
import React, { useState, useRef, useEffect } from 'react';
import { Issue, IssueCategory, IssuePriority, User } from '../types';
import { XIcon, CameraIcon, VideoIcon, AudioIcon, CrosshairIcon, MicIcon, ZapIcon as MagicIcon, MapPinIcon, FileTextIcon } from '../constants';

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
  currentUser: User | null;
}

// Helper to convert a file blob to a base64 string
const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result.split(',')[1]);
            } else {
                reject(new Error("Failed to convert blob to base64"));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

// Helper to extract the first frame of a video as a base64 string
const getVideoFrame = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = URL.createObjectURL(file);
    video.muted = true;

    video.onloadeddata = () => {
      // Seek to a position that's likely to have content
      video.currentTime = Math.min(1, video.duration / 2); 
    };

    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Data = canvas.toDataURL('image/jpeg').split(',')[1];
      URL.revokeObjectURL(video.src);
      video.remove();
      resolve(base64Data);
    };

    video.onerror = (e) => {
      URL.revokeObjectURL(video.src);
      video.remove();
      reject(new Error('Failed to load video frame'));
    };
  });
};


const ReportIssueModal: React.FC<ReportIssueModalProps> = ({ isOpen, onClose, onAddIssue, currentUser }) => {
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
  
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'photo' | 'video' | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState('');


  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);


  useEffect(() => {
    return () => {
      if (mediaPreviewUrl) URL.revokeObjectURL(mediaPreviewUrl);
      if (recognitionRef.current) recognitionRef.current.stop();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mediaPreviewUrl]);

  useEffect(() => {
    if (isOpen && isMapView && mapContainerRef.current && !mapInstanceRef.current) {
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
        setTimeout(() => map.invalidateSize(), 100);
    }
  }, [isOpen, isMapView]);

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
      let newTranscript = Array.from(event.results).map((result: any) => result[0].transcript).join('');
      if (newTranscript) {
        setDescription(prev => (prev ? prev + ' ' : '') + newTranscript);
      }
    };
    recognition.onerror = (event: any) => setError(`Speech recognition error: ${event.error}`);
    recognition.onend = () => setIsRecording(false);
    recognition.start();
    setIsRecording(true);
  };
  
  const handleSuggestPriority = async () => {
    if (!title.trim() || !description.trim()) {
      setError("Please provide a title and description first.");
      return;
    }
    setError('');
    setIsSuggestingPriority(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Analyze the priority of this civic issue: Title: "${title}". Description: "${description}".`,
        config: {
          responseMimeType: "application/json",
          responseSchema: { type: Type.OBJECT, properties: { priority: { type: Type.STRING, enum: Object.values(IssuePriority) } } },
        },
      });
      const result = JSON.parse(response.text);
      if (result.priority) setPriority(result.priority);
    } catch (e) {
      setError("Could not get an AI suggestion.");
    } finally {
      setIsSuggestingPriority(false);
    }
  };
  
  const handleAnalyzeMedia = async () => {
    if (!mediaFile) {
        setAiError("Please upload a photo or video first.");
        return;
    }
    setIsAnalyzing(true);
    setAiError('');
    try {
        let base64Data: string;
        let mimeType: string;

        if (mediaType === 'video') {
            base64Data = await getVideoFrame(mediaFile);
            mimeType = 'image/jpeg';
        } else {
            base64Data = await blobToBase64(mediaFile);
            mimeType = mediaFile.type;
        }
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const imagePart = { inlineData: { data: base64Data, mimeType } };
        const textPart = {
            text: `You are a helpful assistant for a civic reporting app in Guyana. Analyze the attached media. Based ONLY on the visual information, generate a concise and descriptive title, a summary (under 150 characters), a detailed description for a civic issue report, and identify a likely location (e.g., street name, landmark, city) if visible. If no location is identifiable, return an empty string for location.`,
        };

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        summary: { type: Type.STRING },
                        description: { type: Type.STRING },
                        location: { type: Type.STRING },
                    },
                    required: ['title', 'summary', 'description', 'location'],
                },
            },
        });
        
        const result = JSON.parse(response.text);
        setTitle(result.title || '');
        setGeneratedSummary(result.summary || '');
        setDescription(result.description || '');
        if (result.location) {
            setLocation(result.location);
        }

    } catch (err) {
        console.error("AI analysis failed:", err);
        setAiError("Sorry, the AI analysis failed. Please fill out the form manually.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported.");
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
            const data = await response.json();
            setLocation(data.display_name || `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`);
        } catch (err) {
            setLocation(`${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`);
        } finally {
            setIsFetchingLocation(false);
        }
      },
      () => {
        setError("Unable to retrieve your location.");
        setIsFetchingLocation(false);
      }
    );
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (mediaPreviewUrl) URL.revokeObjectURL(mediaPreviewUrl);

    setMediaFile(file);
    setMediaPreviewUrl(URL.createObjectURL(file));
    setMediaType(file.type.startsWith('video/') ? 'video' : 'photo');
  };

  const clearMedia = () => {
    if (mediaPreviewUrl) URL.revokeObjectURL(mediaPreviewUrl);
    setMediaFile(null);
    setMediaPreviewUrl(null);
    setMediaType(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  
  const resetForm = () => {
    setTitle(''); setDescription(''); setGeneratedSummary('');
    setCategory(IssueCategory.Infrastructure); setLocation(''); setCoordinates(null);
    setTempCoords(null); setIsMapView(false);
    if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; markerRef.current = null; }
    setPriority(IssuePriority.Medium); setIsAnonymous(false); setError('');
    setAiError('');
    clearMedia();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !location || !coordinates) {
      setError('Please fill in title, description, and set a location.');
      return;
    }
    onAddIssue({
      title, summary: generatedSummary || description.substring(0, 100) + '...',
      description, category, location, coordinates, priority, isAnonymous,
      media: { photos: [], videos: [], audio: [] } // Media handling would be complex, simplified for now
    });
    resetForm();
    onClose();
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
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Media</label>
             <input type="file" accept="image/*,video/*" ref={fileInputRef} onChange={handleFileSelected} className="hidden" />
              {mediaPreviewUrl ? (
                <div className="space-y-3">
                    <div className="w-full aspect-video bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden relative">
                        {mediaType === 'video' ? (
                            <video src={mediaPreviewUrl} controls className="w-full h-full object-cover"></video>
                        ) : (
                            <img src={mediaPreviewUrl} alt="Media preview" className="w-full h-full object-cover" />
                        )}
                    </div>
                    <button type="button" onClick={clearMedia} className="w-full border border-red-500 text-red-500 font-semibold py-2 px-4 rounded-lg hover:bg-red-50">
                        Remove Media
                    </button>
                </div>
              ) : (
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full flex flex-col items-center justify-center space-y-2 border-2 border-dashed py-6 rounded-lg text-gray-500 hover:border-primary hover:text-primary">
                    <CameraIcon className="w-8 h-8" />
                    <span className="font-semibold">Upload Photo or Video</span>
                </button>
              )}
          </div>
          
          {mediaFile && (
            <div>
                 <button type="button" onClick={handleAnalyzeMedia} disabled={isAnalyzing} className="w-full flex items-center justify-center space-x-2 bg-accent text-white font-bold py-3 px-6 rounded-xl shadow-md hover:bg-orange-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                    <MagicIcon className={`w-6 h-6 ${isAnalyzing ? 'animate-pulse' : ''}`} />
                    <span>{isAnalyzing ? 'Analyzing Media...' : 'Generate with AI ✨'}</span>
                </button>
                {aiError && <p className="text-sm text-red-600 mt-2 text-center">{aiError}</p>}
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" placeholder="e.g., Pothole on Main Street" />
          </div>
          
          {generatedSummary && <div className="p-3 bg-gray-100 dark:bg-gray-700/50 rounded-md">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">AI Generated Summary</label>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-200">{generatedSummary}</p>
          </div>}

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
             <div className="relative mt-1">
                <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm pr-10" placeholder="Provide details or use the mic."/>
                <button type="button" onClick={handleToggleRecording} className={`absolute top-2 right-2 p-1 rounded-full ${isRecording ? 'bg-red-100 text-danger' : 'text-gray-500 hover:bg-gray-100'}`}><MicIcon className="w-5 h-5" /></button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
              <select id="category" value={category} onChange={(e) => setCategory(e.target.value as IssueCategory)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary focus:border-primary">
                {Object.values(IssueCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
             <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
                <div className="relative mt-1">
                    <select id="priority" value={priority} onChange={(e) => setPriority(e.target.value as IssuePriority)} className="block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary focus:border-primary">
                        {Object.values(IssuePriority).map(level => <option key={level} value={level}>{level}</option>)}
                    </select>
                     <button type="button" onClick={handleSuggestPriority} disabled={isSuggestingPriority || !title || !description} className="absolute inset-y-0 right-0 flex items-center pr-2 text-primary disabled:opacity-50"><MagicIcon className={`w-5 h-5 ${isSuggestingPriority ? 'animate-pulse' : ''}`} /></button>
                </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
            {isMapView ? (
                <div className="mt-2">
                    <div ref={mapContainerRef} className="h-64 w-full rounded-lg z-0 border dark:border-gray-600"></div>
                    <div className="flex justify-end space-x-2 mt-2">
                        <button type="button" onClick={() => setIsMapView(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                        <button type="button" onClick={handleConfirmLocation} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md disabled:opacity-50" disabled={!tempCoords || isGeocoding}>{isGeocoding ? 'Locating...' : 'Confirm'}</button>
                    </div>
                </div>
            ) : (
                <div className="mt-1">
                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" placeholder={isFetchingLocation ? "Getting location..." : "Type address or use buttons"}/>
                    <div className="flex space-x-2 mt-2 text-sm">
                        <button type="button" onClick={handleGetLocation} disabled={isFetchingLocation} className="flex-1 flex items-center justify-center space-x-2 border border-gray-300 py-2 rounded-md hover:bg-gray-50 disabled:opacity-50"><CrosshairIcon className="w-4 h-4" /><span>Current</span></button>
                        <button type="button" onClick={() => setIsMapView(true)} className="flex-1 flex items-center justify-center space-x-2 border border-gray-300 py-2 rounded-md hover:bg-gray-50"><MapPinIcon className="w-4 h-4" /><span>On Map</span></button>
                    </div>
                </div>
            )}
          </div>
          
          <div className="relative flex items-start">
            <div className="flex items-center h-5"><input id="anonymous" type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"/></div>
            <div className="ml-3 text-sm"><label htmlFor="anonymous" className="font-medium text-gray-700 dark:text-gray-300">Report Anonymously</label><p className="text-gray-500 dark:text-gray-400">Your identity will be hidden.</p></div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
        
        <footer className="p-4 border-t dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800">
          <button onClick={handleSubmit} className="w-full bg-primary text-white font-bold py-3 px-6 rounded-xl shadow-md hover:bg-secondary">Submit Report</button>
        </footer>
      </div>
       <style>{`
        .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
        @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default ReportIssueModal;