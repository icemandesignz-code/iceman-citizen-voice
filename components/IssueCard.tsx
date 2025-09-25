import React from 'react';
import { Issue, IssuePriority } from '../types';
import { MapPinIcon, CheckCircleIcon, AlertTriangleIcon, SoundIcon, PhotoIcon, VideoIcon, AudioIcon, ZapIcon } from '../constants';

interface IssueCardProps {
  issue: Issue;
  onSelectIssue: (issue: Issue) => void;
}

const MediaIndicator: React.FC<{ issue: Issue }> = ({ issue }) => (
    <div className="flex items-center space-x-2 text-gray-400">
        {issue.media.photos.length > 0 && <PhotoIcon />}
        {issue.media.videos.length > 0 && <VideoIcon />}
        {issue.media.audio.length > 0 && <AudioIcon />}
    </div>
);

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

const IssueCard: React.FC<IssueCardProps> = ({ issue, onSelectIssue }) => {
  const handleRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(`${issue.title}. ${issue.summary}`);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech is not supported in your browser.");
    }
  };

  return (
    <div onClick={() => onSelectIssue(issue)} className="bg-white p-4 rounded-xl shadow-md border border-gray-100 cursor-pointer hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-dark">
            {issue.author.avatar}
          </div>
          <div>
            <div className="flex items-center space-x-1">
              <p className="font-semibold text-dark">{issue.author.name}</p>
              {issue.author.isVerified && <CheckCircleIcon className="w-4 h-4 text-green-500" />}
            </div>
            <div className="flex items-center text-xs text-gray-500 space-x-2">
              <div className="flex items-center">
                <MapPinIcon className="w-3 h-3 mr-1" />
                <span>{issue.location}</span>
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
        <h4 className="text-lg font-bold text-dark">{issue.title}</h4>
        <p className="text-gray-600 mt-1 text-sm">{issue.summary}</p>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <MediaIndicator issue={issue} />
          <PriorityIndicator level={issue.priority} />
        </div>
        <button onClick={handleRead} className="flex items-center space-x-2 text-primary hover:text-secondary font-semibold text-sm">
          <SoundIcon className="w-5 h-5" />
          <span>Read</span>
        </button>
      </div>
    </div>
  );
};

export default IssueCard;