import React, { useState, useEffect, useRef } from 'react';
import { Issue, IssueStatus, IssuePriority } from '../types';
import { XIcon, MapPinIcon, CheckCircleIcon, MessageSquareIcon, AudioIcon, VideoIcon, SearchIcon, AlertTriangleIcon, ZapIcon, ShareIcon, SoundIcon, EditIcon } from '../constants';
import { ANONYMOUS_USER } from '../constants';
import { useAuth } from '../contexts/AuthContext';

declare const L: any;

interface IssueDetailModalProps {
  issue: Issue | null;
  onClose: () => void;
  onUpdateIssue: (updatedIssue: Issue) => void;
  onRequireAuth: () => void;
}

const StatusBadge: React.FC<{ status: IssueStatus }> = ({ status }) => {
    const colorClasses = {
        [IssueStatus.Pending]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        [IssueStatus.Approved]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        [IssueStatus.Resolved]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    };
    return <span className={`px-3 py-1 text-xs font-bold rounded-full ${colorClasses[status]}`}>{status}</span>
}

const PriorityBadge: React.FC<{ priority: IssuePriority }> = ({ priority }) => {
    const priorityConfig = {
        [IssuePriority.Critical]: {
            icon: <ZapIcon className="w-4 h-4 mr-1.5" />,
            text: 'Critical Priority',
            className: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        },
        [IssuePriority.High]: {
            icon: <AlertTriangleIcon className="w-4 h-4 mr-1.5" />,
            text: 'High Priority',
            className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
        },
        [IssuePriority.Medium]: {
            icon: null,
            text: 'Medium Priority',
            className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        },
        [IssuePriority.Low]: {
            icon: null,
            text: 'Low Priority',
            className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
        },
    }
    const config = priorityConfig[priority];

    return (
        <div className={`flex items-center px-3 py-1 text-xs font-bold rounded-full ${config.className}`}>
            {config.icon}
            {config.text}
        </div>
    )
}

const IssueDetailModal: React.FC<IssueDetailModalProps> = ({ issue, onClose, onUpdateIssue, onRequireAuth }) => {
  const [playingVideoUrl, setPlayingVideoUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [highlightedDescription, setHighlightedDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(issue?.title || '');
  const [editedDescription, setEditedDescription] = useState(issue?.description || '');
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const { isAuthenticated, isAdmin } = useAuth();
  
  useEffect(() => {
    if (issue) {
        setEditedTitle(issue.title);
        setEditedDescription(issue.description);
    }
  }, [issue]);

  // Effect to find a better voice and cleanup speech synthesis on unmount
  useEffect(() => {
    const getVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const priorityKeywords = ['Google', 'Microsoft', 'Samantha', 'Alex', 'Daniel', 'Zira'];
        const englishVoices = voices.filter(voice => voice.lang.startsWith('en-'));
        
        let bestVoice: SpeechSynthesisVoice | null = null;

        for (const keyword of priorityKeywords) {
          bestVoice = englishVoices.find(voice => voice.name.includes(keyword)) || null;
          if (bestVoice) break;
        }

        if (!bestVoice) {
            bestVoice = englishVoices.find(voice => voice.lang === 'en-US') || null;
        }
        
        if (!bestVoice) {
            bestVoice = englishVoices[0] || null;
        }

        setSelectedVoice(bestVoice);
      }
    };

    getVoices();
    window.speechSynthesis.onvoiceschanged = getVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (issue && issue.coordinates && mapContainerRef.current && typeof L !== 'undefined' && !mapInstanceRef.current) {
        const { lat, lng } = issue.coordinates;
        const map = L.map(mapContainerRef.current).setView([lat, lng], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
        L.marker([lat, lng]).addTo(map);
        mapInstanceRef.current = map;
        setTimeout(() => map.invalidateSize(), 100);
    }
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [issue]);

  if (!issue) return null;
  
  const handleSaveEdit = () => {
    onUpdateIssue({ ...issue, title: editedTitle, description: editedDescription });
    setIsEditing(false);
  };
  
  const displayAuthor = issue.isAnonymous ? ANONYMOUS_USER : issue.author;

  const handleShare = () => {
    const shareUrl = `${window.location.origin}?issueId=${issue.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleReadDescription = () => {
    if (isSpeaking) {
        window.speechSynthesis.cancel();
        return;
    }
    const textToRead = isEditing ? editedDescription : issue.description;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utteranceRef.current = utterance;

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onboundary = (event) => setHighlightedDescription(textToRead.substring(0, event.charIndex));
    utterance.onend = () => { setIsSpeaking(false); setHighlightedDescription(''); };
    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
        if (event.error !== 'canceled' && event.error !== 'interrupted') {
            console.error("Speech synthesis error:", event.error);
        }
        setIsSpeaking(false);
        setHighlightedDescription('');
    };
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <>
      {playingVideoUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-[60] flex items-center justify-center" onClick={() => setPlayingVideoUrl(null)}>
            <video src={playingVideoUrl} controls autoPlay className="max-w-full max-h-full rounded-lg shadow-2xl"></video>
        </div>
      )}

      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-t-2xl absolute bottom-0 max-h-[95vh] w-full max-w-lg flex flex-col animate-slide-up">
          <header className="p-4 border-b dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 rounded-t-2xl">
            <h2 className="text-lg font-bold text-dark dark:text-white">Issue Details</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <XIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
          </header>

          <div className="overflow-y-auto p-4 space-y-6">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                      <StatusBadge status={issue.status} />
                      <PriorityBadge priority={issue.priority} />
                  </div>
                  {isAdmin && (
                    <div className="flex items-center space-x-2">
                        <label htmlFor="status-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">Change Status:</label>
                        <select
                            id="status-select"
                            value={issue.status}
                            onChange={(e) => onUpdateIssue({ ...issue, status: e.target.value as IssueStatus })}
                            className="block w-full pl-3 pr-8 py-1.5 text-base bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                        >
                            {Object.values(IssueStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                  )}
              </div>
              {isEditing ? (
                <input type="text" value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} className="text-2xl font-bold text-dark dark:text-white bg-transparent border-b-2 border-primary w-full focus:outline-none"/>
              ) : (
                <h3 className="text-2xl font-bold text-dark dark:text-white">{issue.title}</h3>
              )}
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-2 space-x-4">
                <div className="flex items-center"><MapPinIcon className="w-4 h-4 mr-1" /> {issue.location}</div>
                <span>{issue.timestamp}</span>
              </div>
            </div>
            
            {issue.coordinates && <div ref={mapContainerRef} className="h-48 w-full rounded-lg z-0 border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900"></div>}

            <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center font-bold text-dark dark:text-white">{displayAuthor.avatar}</div>
              <div>
                <div className="flex items-center space-x-1"><p className="font-semibold text-dark dark:text-white">{displayAuthor.name}</p>{displayAuthor.isVerified && <CheckCircleIcon className="w-4 h-4 text-green-500" />}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{displayAuthor.location}</p>
              </div>
            </div>

             <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex space-x-2">
                <button onClick={handleShare} className={`w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg font-semibold transition-colors duration-200 ${isCopied ? 'bg-green-100 text-success dark:bg-green-900/50 dark:text-green-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}`}>
                    <ShareIcon className="w-5 h-5" /><span>{isCopied ? 'Link Copied!' : 'Share'}</span>
                </button>
                {isAdmin && ( isEditing ? (
                    <button onClick={handleSaveEdit} className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg font-semibold bg-primary text-white hover:bg-secondary">
                        <span>Save Changes</span>
                    </button>
                    ) : (
                    <button onClick={() => setIsEditing(true)} className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg font-semibold bg-accent text-white hover:bg-orange-600">
                        <EditIcon className="w-5 h-5" /><span>Edit Issue</span>
                    </button>
                ))}
            </div>

            <div>
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-dark dark:text-white">Description</h4>
                <button onClick={handleReadDescription} className="flex items-center space-x-2 text-primary hover:text-secondary font-semibold text-sm">
                    <SoundIcon className="w-5 h-5" /><span>{isSpeaking ? 'Stop' : 'Read Aloud'}</span>
                </button>
              </div>
              {isEditing ? (
                 <textarea value={editedDescription} onChange={(e) => setEditedDescription(e.target.value)} rows={5} className="mt-1 w-full p-2 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
              ) : (
                <p className="text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap text-justify">
                    <span className="bg-primary/20 rounded">{highlightedDescription}</span><span>{issue.description.substring(highlightedDescription.length)}</span>
                </p>
              )}
            </div>

            {(issue.media.photos.length > 0 || issue.media.videos.length > 0 || issue.media.audio.length > 0) && (
              <div>
                <h4 className="font-bold text-dark dark:text-white mb-2">Media Gallery</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {issue.media.photos.map((photo, index) => (<a key={index} href={photo} target="_blank" rel="noopener noreferrer" className="block relative group"><img src={photo} alt={`issue media ${index + 1}`} className="rounded-lg object-cover w-full h-32" /><div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center"><SearchIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" /></div></a>))}
                  {issue.media.videos.map((video, index) => (<div key={index} className="rounded-lg bg-slate-800 w-full h-32 flex items-center justify-center relative cursor-pointer group" onClick={() => setPlayingVideoUrl(video)}><VideoIcon className="w-12 h-12 text-white/80 group-hover:scale-110 transition-transform" /><div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all"></div><div className="absolute bottom-2 left-2 text-white text-xs bg-black/50 px-2 py-1 rounded">Video</div></div>))}
                  {issue.media.audio.map((audio, index) => (<div key={index} className="rounded-lg bg-gray-200 dark:bg-gray-700 w-full h-32 flex flex-col items-center justify-center relative cursor-pointer group" onClick={() => alert('Audio playback coming soon!')}><AudioIcon className="w-12 h-12 text-gray-600 dark:text-gray-300 group-hover:scale-110 transition-transform" /><div className="absolute bottom-2 left-2 text-gray-800 dark:text-white text-xs bg-white/70 dark:bg-black/50 px-2 py-1 rounded">Audio</div></div>))}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-bold text-dark dark:text-white mb-2 flex items-center"><MessageSquareIcon className="w-5 h-5 mr-2" /> Community Discussion</h4>
              <div className="space-y-4">
                {issue.comments.map(comment => (<div key={comment.id} className="flex items-start space-x-3"><div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-sm font-bold text-dark dark:text-white shrink-0">{comment.user.avatar}</div><div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg w-full"><div className="flex justify-between items-baseline"><p className="font-semibold text-sm text-dark dark:text-white">{comment.user.name}</p><p className="text-xs text-gray-400 dark:text-gray-500">{comment.timestamp}</p></div><p className="text-sm text-gray-800 dark:text-gray-200 mt-1 text-justify">{comment.text}</p></div></div>))}
                {issue.comments.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400 italic">No comments yet.</p>}
              </div>
            </div>
          </div>
          
          <footer className="p-4 border-t dark:border-gray-700 flex items-center space-x-2 sticky bottom-0 bg-white dark:bg-gray-800">
            {isAuthenticated ? (
                <>
                <input type="text" placeholder="Add a comment..." className="flex-grow bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary dark:placeholder-gray-400"/>
                <button className="bg-primary text-white font-semibold py-2 px-4 rounded-full hover:bg-secondary">Post</button>
                </>
            ) : (
                <button onClick={onRequireAuth} className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold py-3 px-6 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                    Sign in to comment
                </button>
            )}
          </footer>
        </div>
        <style>{`
          .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
          @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        `}</style>
      </div>
    </>
  );
};

export default IssueDetailModal;
