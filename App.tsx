import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Page, Issue, User, IssueStatus, HeroContent } from './types';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import HomePage from './pages/HomePage';
import MinistriesPage from './pages/MinistriesPage';
import DistrictsPage from './pages/DistrictsPage';
import MapPage from './pages/MapPage';
import EmergencyPage from './pages/EmergencyPage';
import ProfilePage from './pages/ProfilePage';
import IssueDetailModal from './components/IssueDetailModal';
import { MOCK_ISSUES, MOCK_MINISTRIES, MOCK_DISTRICTS, ANONYMOUS_USER } from './constants';
import SearchModal from './components/SearchModal';
import ReportIssueModal from './components/ReportIssueModal';
import ProfileDrawer from './components/ProfileDrawer';
import ResourcesPage from './pages/ResourcesPage';
import CommunitiesPage from './pages/CommunitiesPage';
import SettingsPage from './pages/SettingsPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginModal from './components/LoginModal';
import EditProfileModal from './components/EditProfileModal';
import EditHeroModal from './components/EditHeroModal';

const CitizenVoiceApp: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Home);
  const [previousPage, setPreviousPage] = useState<Page>(Page.Home);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isReportModalOpen, setReportModalOpen] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isEditHeroModalOpen, setEditHeroModalOpen] = useState(false);
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  
  const [issues, setIssues] = useState<Issue[]>(MOCK_ISSUES);
  const [heroContent, setHeroContent] = useState<HeroContent>({
    title: 'Your Voice, Your Community',
    subtitle: 'Report issues, track progress, build a stronger Guyana together',
    type: 'gradient',
    url: null,
  });

  const { user, isAuthenticated, logout, updateUser, isAdmin } = useAuth();

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  const requireAuth = (action: () => void) => {
    if (isAuthenticated) {
      action();
    } else {
      setLoginModalOpen(true);
    }
  };
  
  const handleEditProfile = () => {
    setDrawerOpen(false); // Close drawer if open
    setEditModalOpen(true);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const issueId = urlParams.get('issueId');
    if (issueId) {
      const issueToOpen = issues.find(issue => issue.id === issueId);
      if (issueToOpen) {
        setSelectedIssue(issueToOpen);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [issues]);

  const navigateTo = (page: Page) => {
    if (page === Page.Profile && !isAuthenticated) {
        requireAuth(() => {
            if (page !== currentPage) {
                setPreviousPage(currentPage);
                setCurrentPage(page);
            }
        });
    } else if (page !== currentPage) {
      setPreviousPage(currentPage);
      setCurrentPage(page);
    }
    setDrawerOpen(false);
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
      author: newIssueData.isAnonymous ? ANONYMOUS_USER : user!,
      timestamp: 'Just now',
      status: IssueStatus.Pending,
      comments: [],
    };
    setIssues(prevIssues => [newIssue, ...prevIssues]);
    setReportModalOpen(false);
  };
  
  const handleUpdateIssue = useCallback((updatedIssue: Issue) => {
     setIssues(prevIssues => 
        prevIssues.map(issue => 
            issue.id === updatedIssue.id ? updatedIssue : issue
        )
    );
     if (selectedIssue && selectedIssue.id === updatedIssue.id) {
        setSelectedIssue(updatedIssue);
    }
  }, [selectedIssue]);

  const handleSelectIssueFromSearch = useCallback((issue: Issue) => {
    setTimeout(() => {
        handleSelectIssue(issue);
    }, 100);
  }, [handleSelectIssue]);

  const userIssues = useMemo(() => {
    if (!user) return [];
    return issues.filter(issue => !issue.isAnonymous && issue.author.id === user.id)
  }, [issues, user]);

  const renderPage = () => {
    switch (currentPage) {
      case Page.Home:
        return <HomePage 
                  issues={issues} 
                  onSelectIssue={handleSelectIssue} 
                  onReportIssue={() => requireAuth(() => setReportModalOpen(true))} 
                  heroContent={heroContent}
                  onEditHero={() => setEditHeroModalOpen(true)}
                />;
      case Page.Ministry:
        return <MinistriesPage />;
      case Page.Districts:
        return <DistrictsPage />;
      case Page.Resources:
        return <ResourcesPage />;
      case Page.SOS:
        return <EmergencyPage />;
      case Page.Profile:
        if (!user) return <HomePage 
            issues={issues} 
            onSelectIssue={handleSelectIssue} 
            onReportIssue={() => requireAuth(() => setReportModalOpen(true))}
            heroContent={heroContent}
            onEditHero={() => setEditHeroModalOpen(true)}
            />;
        return <ProfilePage 
                  user={user} 
                  userIssues={userIssues}
                  allIssues={issues}
                  onSelectIssue={handleSelectIssue}
                  onBack={() => navigateTo(previousPage)}
                  onEditProfile={handleEditProfile}
                />;
      case Page.Map:
        return <MapPage issues={issues} onSelectIssue={handleSelectIssue} />;
      case Page.Communities:
        return <CommunitiesPage />;
      case Page.Settings:
        return <SettingsPage isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />;
      default:
        return <HomePage 
                  issues={issues} 
                  onSelectIssue={handleSelectIssue} 
                  onReportIssue={() => requireAuth(() => setReportModalOpen(true))} 
                  heroContent={heroContent}
                  onEditHero={() => setEditHeroModalOpen(true)}
                />;
    }
  };
  
  const isBottomNavVisible = [Page.Home, Page.Ministry, Page.Districts, Page.Resources, Page.SOS].includes(currentPage);

  return (
    <div className="min-h-screen font-sans bg-background text-gray-800 flex flex-col max-w-lg mx-auto shadow-2xl relative dark:bg-gray-900 dark:text-gray-200">
      <ProfileDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        user={user} 
        onNavigate={navigateTo}
        onLogout={() => {
          logout();
          setDrawerOpen(false);
          navigateTo(Page.Home);
        }}
        onEditProfile={handleEditProfile}
      />
      <Header 
        user={user}
        onAvatarClick={() => setDrawerOpen(true)}
        onLoginClick={() => setLoginModalOpen(true)}
        onSearchClick={() => setSearchOpen(true)}
        showBackButton={!isBottomNavVisible}
        onBack={() => navigateTo(previousPage)}
      />
      <main className={`flex-grow px-4 ${isBottomNavVisible ? 'pb-20' : ''}`}>
        {renderPage()}
      </main>
      {isBottomNavVisible && <BottomNav currentPage={currentPage} setCurrentPage={navigateTo} />}
      
      {selectedIssue && <IssueDetailModal 
        issue={selectedIssue} 
        onClose={handleCloseModal} 
        onUpdateIssue={handleUpdateIssue} 
        onRequireAuth={() => setLoginModalOpen(true)}
      />}
      {isSearchOpen && <SearchModal 
        onClose={() => setSearchOpen(false)}
        issues={issues}
        ministries={MOCK_MINISTRIES}
        districts={MOCK_DISTRICTS}
        onSelectIssue={handleSelectIssueFromSearch}
      />}
      <ReportIssueModal isOpen={isReportModalOpen} onClose={() => setReportModalOpen(false)} onAddIssue={handleAddIssue} currentUser={user} />
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setLoginModalOpen(false)} />
       {user && <EditProfileModal
        isOpen={isEditModalOpen}
        user={user}
        onClose={() => setEditModalOpen(false)}
        onSave={updateUser}
      />}
      {isAdmin && <EditHeroModal 
        isOpen={isEditHeroModalOpen}
        onClose={() => setEditHeroModalOpen(false)}
        heroContent={heroContent}
        onSave={(newContent) => {
            setHeroContent(newContent);
            setEditHeroModalOpen(false);
        }}
      />}
    </div>
  );
};


const App: React.FC = () => {
  return (
    <AuthProvider>
      <CitizenVoiceApp />
    </AuthProvider>
  );
};


export default App;
