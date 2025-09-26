import React, { useState, useRef } from 'react';
import { Issue, HeroContent } from '../types';
import IssueCard from '../components/IssueCard';
import { EditIcon, ZapIcon, SoundIcon, VolumeXIcon, XIcon } from '../constants';
import { useAuth } from '../contexts/AuthContext';

interface HomePageProps {
  issues: Issue[];
  onSelectIssue: (issue: Issue) => void;
  onReportIssue: () => void;
  heroContent: HeroContent;
  onEditHero: () => void;
}

const Hero: React.FC<{ content: HeroContent, onEdit: () => void }> = ({ content, onEdit }) => {
    const { isAdmin } = useAuth();
    const [isMuted, setIsMuted] = useState(true);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const fullscreenVideoRef = useRef<HTMLVideoElement>(null);

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMuted(!isMuted);
    };
    
    const openFullScreen = () => {
        if (content.type === 'video' && content.url) {
            setIsFullScreen(true);
            if (videoRef.current) {
                videoRef.current.pause();
            }
        }
    };

    const closeFullScreen = () => {
        setIsFullScreen(false);
        if (videoRef.current) {
            videoRef.current.play();
        }
    };

    return (
        <>
            <div 
                className="relative rounded-xl overflow-hidden mb-6 text-white p-6 flex flex-col justify-end min-h-[200px] shadow-lg cursor-pointer"
                onClick={openFullScreen}
            >
                {content.type === 'image' && content.url && (
                    <img src={content.url} alt="Hero background" className="absolute inset-0 w-full h-full object-cover" />
                )}
                {content.type === 'video' && content.url && (
                    <video 
                        ref={videoRef}
                        src={content.url} 
                        autoPlay 
                        loop 
                        muted={isMuted} 
                        playsInline 
                        className="absolute inset-0 w-full h-full object-cover" 
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
                {content.type === 'gradient' && (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary"></div>
                )}
                
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold leading-tight drop-shadow-md">{content.title}</h1>
                    <p className="mt-1 text-lg drop-shadow">{content.subtitle}</p>
                </div>

                {isAdmin && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        className="absolute top-3 right-3 p-2 bg-white/20 hover:bg-white/40 rounded-full backdrop-blur-sm transition-colors"
                        aria-label="Edit hero section"
                    >
                        <EditIcon className="w-5 h-5" />
                    </button>
                )}

                {content.type === 'video' && (
                     <button
                        onClick={toggleMute}
                        className="absolute bottom-3 right-3 p-2 bg-black/30 hover:bg-black/50 rounded-full backdrop-blur-sm transition-colors"
                        aria-label={isMuted ? "Unmute video" : "Mute video"}
                    >
                        {isMuted ? <VolumeXIcon className="w-5 h-5" /> : <SoundIcon className="w-5 h-5" />}
                    </button>
                )}
            </div>
            
            {isFullScreen && content.type === 'video' && content.url && (
                <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
                    <video
                        ref={fullscreenVideoRef}
                        src={content.url}
                        autoPlay
                        loop
                        controls
                        className="w-full h-full object-contain"
                    />
                    <button
                        onClick={closeFullScreen}
                        className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white"
                        aria-label="Close fullscreen video"
                    >
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
            )}
        </>
    );
};

const HomePage: React.FC<HomePageProps> = ({ issues, onSelectIssue, onReportIssue, heroContent, onEditHero }) => {
  return (
    <div className="space-y-4">
      <Hero content={heroContent} onEdit={onEditHero} />
      
      <button
        onClick={onReportIssue}
        className="w-full bg-accent text-white font-bold py-3 px-6 rounded-xl shadow-md hover:bg-orange-600 transition-all duration-150 ease-in-out active:scale-95 flex items-center justify-center space-x-2 text-lg"
      >
        <ZapIcon className="w-6 h-6" />
        <span>Report a New Issue</span>
      </button>

      <div className="pt-4">
        <h2 className="text-xl font-bold text-dark dark:text-white mb-3">Recent Issues</h2>
        <div className="space-y-4">
          {issues.map(issue => (
            <IssueCard key={issue.id} issue={issue} onSelectIssue={onSelectIssue} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;