import React, { useState, useCallback } from 'react';
import { Page, Issue, User, IssueStatus, Ministry, District } from './types';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import HomePage from './pages/HomePage';
import MinistriesPage from './pages/MinistriesPage';
import DistrictsPage from './pages/DistrictsPage';
import ResourcesPage from './pages/ResourcesPage';
import EmergencyPage from './pages/EmergencyPage';
import IssueDetailModal from './components/IssueDetailModal';
import { MOCK_ISSUES, MOCK_MINISTRIES, MOCK_DISTRICTS } from './constants';
import ProfileDrawer from './components/ProfileDrawer';
import SearchModal from './components/SearchModal';
import ReportIssueModal from './components/ReportIssueModal';

// Mock user for new reports
const currentUser: User = { id: 'u5', name: 'Ravi Kumar', avatar: 'R', location: 'Georgetown, Region 4', isVerified: true };

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Home);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isReportModalOpen, setReportModalOpen] = useState(false);
  const [issues, setIssues] = useState<Issue[]>(MOCK_ISSUES);

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
    // A small delay to allow the search modal to close before the issue modal opens
    setTimeout(() => {
        handleSelectIssue(issue);
    }, 100);
  }, [handleSelectIssue]);


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
      default:
        return <HomePage issues={issues} onSelectIssue={handleSelectIssue} onReportIssue={() => setReportModalOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen font-sans bg-background text-gray-800 flex flex-col max-w-lg mx-auto shadow-2xl relative">
      <Header 
        onProfileClick={() => setProfileOpen(true)}
        onSearchClick={() => setSearchOpen(true)}
      />
      <main className="flex-grow pb-20 px-4">
        {renderPage()}
      </main>
      <BottomNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      {selectedIssue && <IssueDetailModal issue={selectedIssue} onClose={handleCloseModal} onUpdateStatus={handleUpdateIssueStatus} />}
      <ProfileDrawer isOpen={isProfileOpen} onClose={() => setProfileOpen(false)} />
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