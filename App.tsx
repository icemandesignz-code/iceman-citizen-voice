import React, { useState, useCallback, useMemo } from 'react';
import { Page, Issue, User, IssueStatus, Ministry, District, IssuePriority } from './types';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import HomePage from './pages/HomePage';
import MinistriesPage from './pages/MinistriesPage';
import DistrictsPage from './pages/DistrictsPage';
import ResourcesPage from './pages/ResourcesPage';
import EmergencyPage from './pages/EmergencyPage';
import ProfilePage from './pages/ProfilePage';
import IssueDetailModal from './components/IssueDetailModal';
import { MOCK_ISSUES, MOCK_MINISTRIES, MOCK_DISTRICTS, MOCK_CURRENT_USER } from './constants';
import SearchModal from './components/SearchModal';
import ReportIssueModal from './components/ReportIssueModal';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Home);
  const [previousPage, setPreviousPage] = useState<Page>(Page.Home);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isReportModalOpen, setReportModalOpen] = useState(false);
  
  const [issues, setIssues] = useState<Issue[]>(MOCK_ISSUES);
  const [currentUser, setCurrentUser] = useState<User>(MOCK_CURRENT_USER);

  const navigateTo = (page: Page) => {
    if (page !== currentPage) {
      setPreviousPage(currentPage);
      setCurrentPage(page);
    }
  };

  const handleSelectIssue = useCallback((issue: Issue) => {
    setSelectedIssue(issue);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedIssue(null);
  }, []);
  
  const handleAddIssue = (newIssueData: Omit<Issue, 'id' | 'author' | 'timestamp' | 'status' | 'comments'>) => {
    const newIssue: Issue = {
      ...newIssueData,
      id: new Date().toISOString(),
      author: currentUser,
      timestamp: 'Just now',
      status: IssueStatus.Pending,
      comments: [],
    };
    setIssues(prevIssues => [newIssue, ...prevIssues]);
    setReportModalOpen(false);
  };
  
  const handleUpdateIssueStatus = useCallback((issueId: string, newStatus: IssueStatus) => {
    setIssues(prevIssues => 
        prevIssues.map(issue => 
            issue.id === issueId ? { ...issue, status: newStatus } : issue
        )
    );

    if (selectedIssue && selectedIssue.id === issueId) {
        setSelectedIssue(prevSelected => 
            prevSelected ? { ...prevSelected, status: newStatus } : null
        );
    }
  }, [selectedIssue]);

  const handleSelectIssueFromSearch = useCallback((issue: Issue) => {
    setTimeout(() => {
        handleSelectIssue(issue);
    }, 100);
  }, [handleSelectIssue]);

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);

    // Update user details across all issues and comments for consistency
    const updatedIssues = issues.map(issue => {
      const newIssue = { ...issue };
      // Update author
      if (newIssue.author.id === updatedUser.id) {
        newIssue.author = updatedUser;
      }
      // Update comments
      newIssue.comments = newIssue.comments.map(comment => {
        if (comment.user.id === updatedUser.id) {
          return { ...comment, user: updatedUser };
        }
        return comment;
      });
      return newIssue;
    });
    setIssues(updatedIssues);
  };

  const userIssues = useMemo(() => issues.filter(issue => issue.author.id === currentUser.id), [issues, currentUser.id]);

  const renderPage = () => {
    switch (currentPage) {
      case Page.Home:
        return <HomePage issues={issues} onSelectIssue={handleSelectIssue} onReportIssue={() => setReportModalOpen(true)} />;
      case Page.Ministry:
        return <MinistriesPage />;
      case Page.Districts:
        return <DistrictsPage />;
      case Page.Resources:
        return <ResourcesPage />;
      case Page.SOS:
        return <EmergencyPage />;
      case Page.Profile:
        return <ProfilePage 
                  user={currentUser} 
                  userIssues={userIssues}
                  allIssues={issues}
                  onUpdateUser={handleUpdateUser}
                  onSelectIssue={handleSelectIssue}
                  onBack={() => navigateTo(previousPage)}
                />;
      default:
        return <HomePage issues={issues} onSelectIssue={handleSelectIssue} onReportIssue={() => setReportModalOpen(true)} />;
    }
  };
  
  const isBottomNavVisible = [Page.Home, Page.Ministry, Page.Districts, Page.Resources, Page.SOS].includes(currentPage);

  return (
    <div className="min-h-screen font-sans bg-background text-gray-800 flex flex-col max-w-lg mx-auto shadow-2xl relative">
      <Header 
        user={currentUser}
        onProfileClick={() => navigateTo(Page.Profile)}
        onSearchClick={() => setSearchOpen(true)}
        showBackButton={!isBottomNavVisible}
        onBack={() => navigateTo(previousPage)}
      />
      <main className={`flex-grow px-4 ${isBottomNavVisible ? 'pb-20' : ''}`}>
        {renderPage()}
      </main>
      {isBottomNavVisible && <BottomNav currentPage={currentPage} setCurrentPage={navigateTo} />}
      
      {selectedIssue && <IssueDetailModal issue={selectedIssue} onClose={handleCloseModal} onUpdateStatus={handleUpdateIssueStatus} />}
      {isSearchOpen && <SearchModal 
        onClose={() => setSearchOpen(false)}
        issues={issues}
        ministries={MOCK_MINISTRIES}
        districts={MOCK_DISTRICTS}
        onSelectIssue={handleSelectIssueFromSearch}
      />}
      <ReportIssueModal isOpen={isReportModalOpen} onClose={() => setReportModalOpen(false)} onAddIssue={handleAddIssue} />
    </div>
  );
};

export default App;