import React, { useState, useMemo } from 'react';
import { Issue, IssueCategory } from '../types';
import IssueCard from '../components/IssueCard';

interface HomePageProps {
  issues: Issue[];
  onSelectIssue: (issue: Issue) => void;
  onReportIssue: () => void;
}

const categories = [IssueCategory.Infrastructure, IssueCategory.Health, IssueCategory.Education, IssueCategory.Environment, IssueCategory.Security];

const HomePage: React.FC<HomePageProps> = ({ issues, onSelectIssue, onReportIssue }) => {
  const [activeCategory, setActiveCategory] = useState<IssueCategory | 'All'>('All');

  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
        const categoryMatch = activeCategory === 'All' || issue.category === activeCategory;
        return categoryMatch;
    });
  }, [issues, activeCategory]);
  
  const getCategoryCount = (category: IssueCategory | 'All') => {
      if (category === 'All') return issues.length;
      return issues.filter(issue => issue.category === category).length;
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-primary to-secondary text-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold">Your Voice, Your Community</h2>
        <p className="mt-2 text-blue-100">Report issues, track progress, build a stronger Guyana together</p>
        <button onClick={onReportIssue} className="mt-4 bg-accent text-white font-bold py-3 px-6 rounded-xl shadow-md hover:bg-orange-600 transition-colors w-full">
          Report an Issue
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
            <div className="flex space-x-2 overflow-x-auto pt-2 pb-3 -mx-4 px-4">
              <button onClick={() => setActiveCategory('All')} className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${activeCategory === 'All' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}>
                All <span className="ml-1 bg-black/10 text-xs px-2 py-0.5 rounded-full">{getCategoryCount('All')}</span>
              </button>
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${activeCategory === cat ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}>
                  {cat} <span className="ml-1 bg-black/10 text-xs px-2 py-0.5 rounded-full">{getCategoryCount(cat)}</span>
                </button>
              ))}
            </div>
        </div>
      </div>

      <div className="bg-green-100 text-green-800 p-3 rounded-lg flex items-center space-x-2 text-sm">
        <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
        <p>5 new reports in the last 24 hours</p>
      </div>

      <div>
        <div className="space-y-4">
           {filteredIssues.length > 0 ? (
            filteredIssues.map(issue => (
              <IssueCard key={issue.id} issue={issue} onSelectIssue={onSelectIssue} />
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-600 font-semibold">No issues found</p>
              <p className="text-sm text-gray-500">Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;