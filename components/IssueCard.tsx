import React, { useState, useEffect, useRef } from 'react';
import { Issue, IssuePriority } from '../types';
import { MapPinIcon, CheckCircleIcon, AlertTriangleIcon, SoundIcon, ZapIcon, VideoIcon, AudioIcon as IndicatorAudioIcon } from '../constants';
import { ANONYMOUS_USER } from '../constants';

const PriorityIndicator: React.FC<{ level: IssuePriority }> = ({ level }) => {
    const priorityStyles = {
        [IssuePriority.Critical]: {
            icon: <ZapIcon className="w-4 h-4" />,
            text: 'Critical',
            className: 'text-red-600 font-bold',
        },
        [IssuePriority.High]: {
            icon: <AlertTriangleIcon className="w-4 h-4" />,
            text: 'High',
            className: 'text-orange-500 font-semibold',
        },
        [IssuePriority.Medium]: {
            icon: null,
            text: 'Medium',
            className: 'text-blue-500 font-semibold',
        },
        [IssuePriority.Low]: {
            icon: null,
            text: 'Low',
            className: 'text-gray-500 font-semibold',
        },
    };

    const style = priorityStyles[level];

    return (
        <div className={`flex items-center space-x-1 text-sm ${style.className}`}>
            {style.icon}
            <span>{style.text}</span>
        </div>
    );
};

// Component for a single media item in the collage
const MediaItem: React.FC<{ type: 'photo' | 'video', url: string, isOverlay?: boolean, remainingCount?: number }> = ({ type, url, isOverlay, remainingCount }) => {
  return (
    <div className="relative w-full h-full bg-gray-200" onClick={e => e.stopPropagation()}>
      {type === 'video' ? (
        <>
          <video src={url} className="w-full h-full object-cover" muted playsInline loop />
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 group-hover:bg-opacity-40 transition-colors pointer-events-none">
            <VideoIcon className="w-8 h-8 text-white drop-shadow-lg" />
          </div>
        </>
      ) : (
        <img src={url} alt="Issue evidence" className="w-full h-full object-cover" />
      )}
      {isOverlay && remainingCount > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 pointer-events-none">
          <span className="text-white text-3xl font-bold">+{remainingCount}</span>
        </div>
      )}
    </div>
  );
};

// Component for creating the media collage
const MediaCollage: React.FC<{ media: Issue['media'] }> = ({ media }) => {
    const allMedia = [
      ...(media.photos || []).map(url => ({ type: 'photo' as const, url })),
      ...(media.videos || []).map(url => ({ type: 'video' as const, url })),
    ];

    if (allMedia.length === 0) return null;

    const displayMedia = allMedia.slice(0, 4);
    const remainingCount = allMedia.length - displayMedia.length;
    const baseClasses = "mt-3 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 group";

    if (displayMedia.length === 1) {
        return (
            <div className={`${baseClasses} max-h-80`}>
                <MediaItem type={displayMedia[0].type} url={displayMedia[0].url} />
            </div>
        );
    }
    
    const layoutClasses: {[key: number]: string} = {
        2: "grid grid-cols-2 gap-0.5 aspect-[16/9]",
        3: "grid grid-cols-2 grid-rows-2 gap-0.5 aspect-[16/9]",
        4: "grid grid-cols-2 grid-rows-2 gap-0.5 aspect-[16/9]",
    };

    const numItems = Math.min(displayMedia.length, 4);

    return (
        <div className={`${baseClasses} ${layoutClasses[numItems]}`}>
            {numItems === 3 ? (
                <>
                    <div className="row-span-2 h-full">
                        <MediaItem type={displayMedia[0].type} url={displayMedia[0].url} />
                    </div>
                    <MediaItem type={displayMedia[1].type} url={displayMedia[1].url} />
                    <MediaItem type={displayMedia[2].type} url={displayMedia[2].url} />
                </>
            ) : (
                displayMedia.map((item, index) => (
                    <MediaItem 
                        key={index} 
                        type={item.type} 
                        url={item.url} 
                        isOverlay={index === 3 && remainingCount > 0} 
                        remainingCount={remainingCount} 
                    />
                ))
            )}
        </div>
    );
};


interface IssueCardProps {
  issue: Issue;
  onSelectIssue: (issue: Issue) => void;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue, onSelectIssue }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [highlightedText, setHighlightedText] = useState({ title: '', summary: '' });
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const summaryLimit = 120;
  const isLongSummary = issue.summary.length > summaryLimit;
  
  const displaySummary = isLongSummary && !isExpanded 
    ? `${issue.summary.substring(0, summaryLimit)}...` 
    : issue.summary;
    
  // Cleanup speech synthesis on component unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpeaking) {
      window.speechSynthesis.cancel(); // This will trigger onend
      return;
    }

    if ('speechSynthesis' in window) {
      if (isLongSummary && !isExpanded) {
        setIsExpanded(true); // Expand summary to read the full text
      }
      
      const textToRead = `${issue.title}. ${issue.summary}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utteranceRef.current = utterance;

      utterance.onboundary = (event) => {
        const titleLength = issue.title.length + 2; // title + ". "
        if (event.charIndex < titleLength) {
            setHighlightedText({ title: textToRead.substring(0, event.charIndex), summary: '' });
        } else {
            setHighlightedText({ title: issue.title, summary: issue.summary.substring(0, event.charIndex - titleLength) });
        }
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setHighlightedText({ title: '', summary: '' });
        utteranceRef.current = null;
      };
      
      utterance.onerror = (err) => {
        console.error("Speech synthesis error", err);
        setIsSpeaking(false);
        setHighlightedText({ title: '', summary: '' });
      };

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    } else {
      alert("Text-to-speech is not supported in your browser.");
    }
  };
  
  const displayAuthor = issue.isAnonymous ? ANONYMOUS_USER : issue.author;
  const hasAudio = issue.media.audio && issue.media.audio.length > 0;

  return (
    <div onClick={() => onSelectIssue(issue)} className="bg-white p-4 rounded-xl shadow-md border border-gray-100 cursor-pointer hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-dark">
            {displayAuthor.avatar}
          </div>
          <div>
            <div className="flex items-center space-x-1">
              <p className="font-semibold text-dark">{displayAuthor.name}</p>
              {displayAuthor.isVerified && <CheckCircleIcon className="w-4 h-4 text-green-500" />}
            </div>
            <div className="flex items-center text-xs text-gray-500 space-x-2">
              <div className="flex items-center">
                <MapPinIcon className="w-3 h-3 mr-1" />
                <span>{displayAuthor.location}</span>
              </div>
              <span>• {issue.timestamp}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full text-white bg-primary`}>
              {issue.category}
            </span>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-lg font-bold text-dark">
            <span className="bg-primary/20 rounded">{highlightedText.title}</span>
            <span>{issue.title.substring(highlightedText.title.length)}</span>
        </h4>
        <p className="text-gray-600 mt-1 text-sm whitespace-pre-wrap">
            <span className="bg-primary/20 rounded">{highlightedText.summary}</span>
            <span>{(isExpanded ? issue.summary : displaySummary).substring(highlightedText.summary.length)}</span>
        </p>
         {isLongSummary && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }} 
            className="text-primary font-semibold text-sm hover:underline mt-1"
          >
            {isExpanded ? 'Read Less' : 'Read More'}
          </button>
        )}
      </div>
      
      <MediaCollage media={issue.media} />

      <div className="mt-4 flex justify-between items-center">
        <PriorityIndicator level={issue.priority} />
        <div className="flex items-center space-x-4">
           {hasAudio && (
             <div className="flex items-center space-x-1 text-gray-500" title="This report contains audio">
                <IndicatorAudioIcon className="w-5 h-5" />
             </div>
          )}
          <button onClick={handleRead} className="flex items-center space-x-2 text-primary hover:text-secondary font-semibold text-sm">
            <SoundIcon className="w-5 h-5" />
            <span>{isSpeaking ? 'Stop' : 'Read'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default IssueCard;
