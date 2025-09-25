import React, { useState, useMemo } from 'react';
import { XIcon, SearchIcon, FilterIcon, FileTextIcon, MinistryIcon, DistrictsIcon } from '../constants';
import { Issue, Ministry, District, IssueCategory, IssueStatus } from '../types';

interface SearchModalProps {
    onClose: () => void;
    issues: Issue[];
    ministries: Ministry[];
    districts: District[];
    onSelectIssue: (issue: Issue) => void;
}

const FilterButton: React.FC<{ label: string; isActive: boolean; onClick: () => void;}> = ({ label, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                isActive
                    ? 'bg-primary border-primary text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
        >
            {label}
        </button>
    )
}

const SearchModal: React.FC<SearchModalProps> = ({ onClose, issues, ministries, districts, onSelectIssue }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'issues' | 'districts' | 'ministries'>('all');
    
    // Advanced filters state
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [selectedStatuses, setSelectedStatuses] = useState<IssueStatus[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<IssueCategory[]>([]);
    const [dateRange, setDateRange] = useState({ from: '', to: '' });

    const handleStatusToggle = (status: IssueStatus) => {
        setSelectedStatuses(prev => prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]);
    };
    
    const handleCategoryToggle = (category: IssueCategory) => {
        // FIX: The variable 'c' was undefined here. It should be 'category'.
        setSelectedCategories(prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]);
    };

    const searchResults = useMemo(() => {
        if (!searchTerm.trim()) return [];

        const lowercasedTerm = searchTerm.toLowerCase();
        
        let results: (Issue | Ministry | District)[] = [];

        // Filter issues
        if (activeTab === 'all' || activeTab === 'issues') {
            const foundIssues = issues
                .filter(issue => {
                    const termMatch =
                        issue.title.toLowerCase().includes(lowercasedTerm) ||
                        issue.summary.toLowerCase().includes(lowercasedTerm) ||
                        issue.description.toLowerCase().includes(lowercasedTerm);

                    const statusMatch = selectedStatuses.length === 0 || selectedStatuses.includes(issue.status);
                    const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(issue.category);

                    // Note: Date filtering is omitted as mock `timestamp` is a string like "2 hours ago"
                    return termMatch && statusMatch && categoryMatch;
                })
                .map(issue => ({ ...issue, resultType: 'issue' as const }));
            results.push(...foundIssues);
        }

        // Filter ministries
        if (activeTab === 'all' || activeTab === 'ministries') {
            const foundMinistries = ministries
                .filter(ministry => 
                    ministry.name.toLowerCase().includes(lowercasedTerm) || 
                    ministry.description.toLowerCase().includes(lowercasedTerm)
                )
                .map(ministry => ({ ...ministry, resultType: 'ministry' as const }));
            results.push(...foundMinistries);
        }

        // Filter districts
        if (activeTab === 'all' || activeTab === 'districts') {
            const foundDistricts = districts
                .filter(district => 
                    district.name.toLowerCase().includes(lowercasedTerm) || 
                    district.region.toLowerCase().includes(lowercasedTerm)
                )
                .map(district => ({ ...district, resultType: 'district' as const }));
            results.push(...foundDistricts);
        }

        return results;
    }, [searchTerm, activeTab, issues, ministries, districts, selectedStatuses, selectedCategories]);
    
    const tabs: {key: typeof activeTab, label: string}[] = [
        { key: 'all', label: 'All' },
        { key: 'issues', label: 'Issues' },
        { key: 'districts', label: 'Districts' },
        { key: 'ministries', label: 'Ministries' },
    ];

    const renderResult = (item: any) => {
        switch (item.resultType) {
            case 'issue':
                const issue = item as Issue;
                return (
                     <div key={`issue-${issue.id}`} onClick={() => { onSelectIssue(issue); onClose(); }} className="p-3 my-1 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors flex items-start space-x-3">
                        <FileTextIcon className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-dark leading-tight">{issue.title}</p>
                            <p className="text-xs text-gray-500">{issue.category} &bull; {issue.status}</p>
                        </div>
                    </div>
                )
            case 'ministry':
                 const ministry = item as Ministry;
                 return (
                    <div key={`ministry-${ministry.id}`} className="p-3 my-1 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors flex items-start space-x-3">
                        <MinistryIcon className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-dark leading-tight">{ministry.name}</p>
                             <p className="text-xs text-gray-500 line-clamp-1">{ministry.description}</p>
                        </div>
                    </div>
                 )
            case 'district':
                const district = item as District;
                return (
                    <div key={`district-${district.id}`} className="p-3 my-1 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors flex items-start space-x-3">
                        <DistrictsIcon className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-dark leading-tight">{district.name}</p>
                             <p className="text-xs text-gray-500">{district.region}</p>
                        </div>
                    </div>
                )
            default:
                return null;
        }
    }

    const showAdvancedFilterButton = activeTab === 'all' || activeTab === 'issues';


    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col animate-fade-in">
            <header className="p-4 flex-shrink-0 flex items-center space-x-2 border-b">
                <div className="relative flex-grow">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search issues, districts, etc..."
                        className="w-full bg-gray-100 border-2 border-transparent rounded-full py-2 pl-12 pr-4 text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        autoFocus
                    />
                </div>
                <button onClick={onClose} className="text-gray-600 hover:text-primary font-medium px-2">
                    Cancel
                </button>
            </header>
            
            <div className="p-4 flex-shrink-0 border-b">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${
                                    activeTab === tab.key
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                     {showAdvancedFilterButton && <button onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} className={`p-2 rounded-full transition-colors ml-2 ${showAdvancedFilters ? 'bg-light text-primary' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                        <FilterIcon className="w-5 h-5" />
                    </button>}
                </div>
                {showAdvancedFilters && showAdvancedFilterButton && (
                    <div className="mt-4 pt-4 border-t space-y-4 animate-fade-in-slow">
                        <div>
                            <h4 className="text-sm font-semibold text-gray-600 mb-2">Status</h4>
                            <div className="flex flex-wrap gap-2">
                                {Object.values(IssueStatus).map(status => (
                                    <FilterButton key={status} label={status} isActive={selectedStatuses.includes(status)} onClick={() => handleStatusToggle(status)} />
                                ))}
                            </div>
                        </div>
                         <div>
                            <h4 className="text-sm font-semibold text-gray-600 mb-2">Category</h4>
                            <div className="flex flex-wrap gap-2">
                                {Object.values(IssueCategory).map(category => (
                                    <FilterButton key={category} label={category} isActive={selectedCategories.includes(category)} onClick={() => handleCategoryToggle(category)} />
                                ))}
                            </div>
                        </div>
                        <div>
                             <h4 className="text-sm font-semibold text-gray-600 mb-2">Date Range</h4>
                             <div className="flex items-center gap-2">
                                <input type="date" value={dateRange.from} onChange={e => setDateRange(p => ({...p, from: e.target.value}))} className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm text-sm" placeholder="From" aria-label="From Date" />
                                <span className="text-gray-500">-</span>
                                <input type="date" value={dateRange.to} onChange={e => setDateRange(p => ({...p, to: e.target.value}))} className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm text-sm" placeholder="To" aria-label="To Date" />
                             </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex-grow overflow-y-auto p-2">
                {searchTerm.trim() ? (
                    searchResults.length > 0 ? (
                        <div>{searchResults.map(item => renderResult(item))}</div>
                    ) : (
                        <div className="text-center text-gray-500 pt-16">
                            <p className="font-semibold">No results found</p>
                            <p className="text-sm">Try adjusting your search term or filters.</p>
                        </div>
                    )
                ) : (
                    <div className="text-center text-gray-500 pt-16">
                        <p>Search for public issues, government bodies, and more.</p>
                    </div>
                )}
            </div>
             <style>{`
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                .animate-fade-in-slow { animation: fade-in 0.5s ease-out forwards; }
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .line-clamp-1 {
                    overflow: hidden;
                    display: -webkit-box;
                    -webkit-box-orient: vertical;
                    -webkit-line-clamp: 1;
                }
             `}</style>
        </div>
    );
};

export default SearchModal;