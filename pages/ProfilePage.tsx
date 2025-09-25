import React, { useState, useMemo } from 'react';
import { User, Issue, Comment } from '../types';
import { MapPinIcon, EditIcon, MessageSquareIcon } from '../constants';
import IssueCard from '../components/IssueCard';
import EditProfileModal from '../components/EditProfileModal';

interface CommentWithIssue extends Comment {
  issueTitle: string;
  issueId: string;
}

const CommentCard: React.FC<{ comment: CommentWithIssue, onSelectIssue: (issue: Issue) => void, allIssues: Issue[] }> = ({ comment, onSelectIssue, allIssues }) => {
    const onCommentClick = () => {
        const issue = allIssues.find(i => i.id === comment.issueId);
        if (issue) {
            onSelectIssue(issue);
        }
    };
    
    return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-gray-700 dark:text-gray-200 text-justify">"{comment.text}"</p>
            <button onClick={onCommentClick} className="text-sm text-gray-500 dark:text-gray-400 mt-2 hover:underline">
                Commented on: <span className="font-semibold text-primary">{comment.issueTitle}</span>
            </button>
        </div>
    );
};


interface ProfilePageProps {
    user: User;
    userIssues: Issue[];
    allIssues: Issue[];
    onUpdateUser: (user: User) => void;
    onSelectIssue: (issue: Issue) => void;
    onBack: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, userIssues, allIssues, onUpdateUser, onSelectIssue }) => {
    const [activeTab, setActiveTab] = useState<'reports' | 'comments'>('reports');
    const [isEditModalOpen, setEditModalOpen] = useState(false);

    const userComments = useMemo(() => {
        const comments: CommentWithIssue[] = [];
        allIssues.forEach(issue => {
            issue.comments.forEach(comment => {
                if (comment.user.id === user.id) {
                    comments.push({ ...comment, issueTitle: issue.title, issueId: issue.id });
                }
            });
        });
        return comments;
    }, [allIssues, user.id]);
    
    return (
        <div className="space-y-4">
            {isEditModalOpen && (
                <EditProfileModal 
                    user={user} 
                    onClose={() => setEditModalOpen(false)} 
                    onSave={onUpdateUser}
                />
            )}
            
            {/* Profile Header */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center relative">
                <button 
                    onClick={() => setEditModalOpen(true)} 
                    className="absolute top-3 right-3 p-2 text-gray-500 hover:text-primary hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-full"
                    aria-label="Edit profile"
                >
                    <EditIcon className="w-5 h-5" />
                </button>
                <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white font-bold text-4xl mb-3">
                    {user.avatar}
                </div>
                <h2 className="text-2xl font-bold text-dark dark:text-white">{user.name}</h2>
                <div className="flex items-center text-gray-500 dark:text-gray-400 mt-1">
                    <MapPinIcon className="w-4 h-4 mr-1" />
                    <span>{user.location}</span>
                </div>
            </div>

            {/* Activity Tabs */}
            <div>
                <div className="flex border-b dark:border-gray-700">
                    <button 
                        onClick={() => setActiveTab('reports')}
                        className={`flex-1 py-3 text-center font-semibold transition-colors ${activeTab === 'reports' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        My Reports ({userIssues.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('comments')}
                        className={`flex-1 py-3 text-center font-semibold transition-colors ${activeTab === 'comments' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        My Comments ({userComments.length})
                    </button>
                </div>

                <div className="mt-4 space-y-4">
                    {activeTab === 'reports' && (
                        userIssues.length > 0 ? userIssues.map(issue => (
                            <IssueCard key={issue.id} issue={issue} onSelectIssue={onSelectIssue} />
                        )) : (
                            <p className="text-center text-gray-500 dark:text-gray-400 pt-8">You haven't reported any issues yet.</p>
                        )
                    )}
                    {activeTab === 'comments' && (
                         userComments.length > 0 ? userComments.map(comment => (
                            <CommentCard key={comment.id} comment={comment} onSelectIssue={onSelectIssue} allIssues={allIssues}/>
                        )) : (
                             <p className="text-center text-gray-500 dark:text-gray-400 pt-8">You haven't made any comments yet.</p>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;