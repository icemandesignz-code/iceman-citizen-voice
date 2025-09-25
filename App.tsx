import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Page, Issue, User, IssueStatus, Ministry, District } from './types';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import HomePage from './pages/HomePage';
import MinistriesPage from './pages/MinistriesPage';
import DistrictsPage from './pages/DistrictsPage';
import MapPage from './pages/MapPage';
import EmergencyPage from './pages/EmergencyPage';
import ProfilePage from './pages/ProfilePage';
import IssueDetailModal from './components/IssueDetailModal';
import { MOCK_ISSUES, MOCK_MINISTRIES, MOCK_DISTRICTS, MOCK_CURRENT_USER } from './constants';
import SearchModal from './components/SearchModal';
import ReportIssueModal from './components/ReportIssueModal';
import ProfileDrawer from './components/ProfileDrawer';
import ResourcesPage from './pages/ResourcesPage';
import CommunitiesPage from './pages/CommunitiesPage';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Home);
  const [previousPage, setPreviousPage] = useState<Page>(Page.Home);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isReportModalOpen, setReportModalOpen] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  
  const [issues, setIssues] = useState<Issue[]>(MOCK_ISSUES);
  const [currentUser, setCurrentUser] = useState<User>(MOCK_CURRENT_USER);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const issueId = urlParams.get('issueId');
    if (issueId) {
      const issueToOpen = issues.find(issue => issue.id === issueId);
      if (issueToOpen) {
        setSelectedIssue(issueToOpen);
        // Optional: Clean up the URL to prevent re-opening on refresh
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [issues]);

  const navigateTo = (page: Page) => {
    if (page !== currentPage) {
      setPreviousPage(currentPage);
      setCurrentPage(page);
    }
    setDrawerOpen(false); // Close drawer on any navigation
  };

  const handleSelectIssue = useCallback((issue: Issue) => {
    setSelectedIssue(issue);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedIssue(null);
  }, []);
  
  const handleAddIssue = (newIssueData: Omit<Issue, 'id' | 'author' | 'timestamp' | 'status' | 'comments'> & { isAnonymous: boolean }) => {
    const newIssue: Issue = {
      ...newIssueData,
      id: new Date().toISOString(),
      author: newIssueData.isAnonymous ? MOCK_CURRENT_USER : currentUser,
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

  const userIssues = useMemo(() => issues.filter(issue => !issue.isAnonymous && issue.author.id === currentUser.id), [issues, currentUser.id]);

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
      case Page.Map:
        return <MapPage issues={issues} onSelectIssue={handleSelectIssue} />;
      case Page.Communities:
        return <CommunitiesPage />;
      default:
        return <HomePage issues={issues} onSelectIssue={handleSelectIssue} onReportIssue={() => setReportModalOpen(true)} />;
    }
  };
  
  const isBottomNavVisible = [Page.Home, Page.Ministry, Page.Districts, Page.Resources, Page.SOS].includes(currentPage);

  return (
    <div className="min-h-screen font-sans bg-background text-gray-800 flex flex-col max-w-lg mx-auto shadow-2xl relative">
      <ProfileDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        user={currentUser} 
        onNavigate={navigateTo}
      />
      <Header 
        user={currentUser}
        onProfileClick={() => setDrawerOpen(true)}
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