import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MOCK_RESOURCES } from '../constants';
import { Resource, ResourceCategory } from '../types';
import { RefreshCwIcon, MapPinIcon, EditIcon, XIcon } from '../constants';
import { useAuth } from '../contexts/AuthContext';

const resourceCategories = [
  ResourceCategory.OilAndGas,
  ResourceCategory.Mining,
  ResourceCategory.Agriculture,
  ResourceCategory.Logging,
];

// Initial data for Oil & Gas companies, used as a fallback.
const initialOilCompanies = [
  { name: 'ExxonMobil', logoUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDI0IDQyOSI+PHBhdGggZmlsbD0iI2QwMDAzNyIgZD0ibTMyMyAxNjQgODEgMjY1aDU5TDM0MiAwSDYxTDAgNDI5aDU5bDgxLTI2NWgxODNjLTYwIDAtMTIwIDAtMTI3IDB6Ii8+PHBhdGggZmlsbD0iI2QwMDAzNyIgZD0ibTEwMTcgMjgzLTMyLTEwM2gtMTdsLTMyIDEwM0g4ODVsNTYtMTgxaDUybDU2IDE4MWgtNTF6bS0zMjQtNzRWMEgtOTJ2NDI5aDkyVjMwNWw4MiAxMjRoNzBMODYwIDIzOGwxMjQtMjA4aC03Mkw4MjQgMTc3IDcxNiAzMDNWMjMzej0iLz48L3N2Zz4=' },
  { name: 'CNOOC', logoUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUwIiBoZWlnaHQ9IjcwIiB2aWV3Qm94PSIwIDAgMjUwIDcwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxnIGZpbGw9IiNGRjcwODAyIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNSA3MGMxOS4zMyAwIDM1LTE1LjY3IDM1LTM1UzU0LjMzIDAgMzUgMCAwIDE1LjY3IDAgMzVzMTUuNjcgMzUgMzUgMzV6Ii8+PHBhdGggZD0iTTEyMy4xNSA0OS4yNmMwIDUuNC00LjM5IDkuNzktOS43OSA5Ljc5cy05Ljc5LTQuMzktOS43OS05Ljc5IDQuMzktOS43OSA5Ljc5LTkuNzkgOS43OSA0LjM5IDkuNzkgOS43OXpNMTA4LjUgNDkuMjZjMCAyLjc4IDIuMTcgNS4wNiA0Ljg2IDUuMDZzNC44Ni0yLjI4IDQuODYtNS4wNi0yLjE3LTUuMDUtNC44Ni01LjA1LTMuODYgMi4yNy00Ljg2IDUuMDV6Ii8+PHBhdGggZD0iTTc4LjI2IDQyLjlWMjcuMzloOC45NmMzLjM2IDAgNi41OCAzLjAzIDYuNTggNy43NSAwIDQuNzItMy4yMiA3Ljc2LTYuNTggNy43Nkg3OC4yNnptNC45NC00Ljg2aDMuODhjMS4xMSAwIDEuODEtLjY5IDEuODEtMi44OXMtLjctMi45My0xLjgxLTIuOTNoLTMuODh2NS44MnoiLz48cGF0aCBkPSJNMTg2LjMzIDI3LjM5bC01LjUyIDE1LjUxaC01LjI5bDUuNTItMTUuNTFoLTE1LjRsLjAxIDE1LjUxaC01LjE2VjIyLjU0aDMyLjEydjQuODVoLTYuMjB6Ii8+PHBhdGggZD0iTTE0OC41MiAyNy4zOXYxNS41MWgtNS4xNlYyNy4zOWgtMTEuNzZ2MTUuNTFoLTUuMTZWMjIuNTRoMjcuNHY0Ljg1aC01LjM5eiIvPjxwYXRoIGQ9Ik0yNDUuNyA0Mi45VjI3LjM5SDI1MHYtNC44NWgtMTUuNjF2NC44NWg0LjNWMjcuOWgtNi4yNlYyNy4zOWgtNi4yNnYxNS41MWgtNC4wMVYyNy4zOWgtNi4yN3YxNS41MUgyMTRWMjcuMzloLTYuMjd2MTUuNTFoLTUuMzVWMjcuMzloLTYuNDR2MTUuNTFoLTQuN1YyNy4zOWgtMS42M3YxNS41MWgtNC4wNlYyNy4zOWgtMS41N3YxNS41MWgtNC4wN1YyNy4zOWgtNC44M3YtNC44NWgzMC4wNHY0Ljg1aC00LjAzVjQyLjloOS43M3oiLz48ZyBmaWxsLXJ1bGU9Im5vbnplcm8iPjxwYXRoIGZpbGw9IiNGRkYiIGQ9Ik0xOC45IDM1LjAzYzAgOC43OCA3LjA1IDE1Ljg0IDE1Ljg0IDE1Ljg0IDguNzkgMCAxNS44NC03LjA2IDE1Ljg0LTE1Ljg0IDAtOC43OC03LjA1LTE1Ljg0LTE1Ljg0LTE1Ljg0LTguNzkgMC0xNS44NCA3LjA2LTE1Ljg0IDE1Ljg0eiIvPjxwYXRoIGQ9Ik0zNC42IDUwLjU1YTE1LjUgMTUuNSAwIDEgMSAwLTMxLjEgMTUuNSAxNS41IDAgMCAxIDAgMzEuMXoiLz48cG9seWdvbiBmaWxsPSIjRkZGIiBwb2ludHM9IjM2LjEgMjIuMzMgMzAuODQgMjIuMzMgMzAuODQgNDcuNzYgMzYuMSA0Ny43NiAzNi4xIDQxLjc5IDM4LjQgMzkuNTMgNDIuODYgMzUuMDggMzguNCAzMC41OCAzNi4xIDI4LjMyIi8+PHBvbHlnb24gcG9pbnRzPSI0MC45MyAzMS4yMiA0MC45MyAyOC4zMyAzNi4xIDI4LjMzIDM2LjEgNDEuNzkgNDAuOTMgNDEuNzkgNDAuOTMgMzguOTIgNDUuMjIgMzQuNDQgNDAuOTMgMjkuOTciLz48L2c+PC9nPjwvc3ZnPg==' },
  { name: 'Hess Corporation', logoUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBmaWxsPSIjMDA4MjRhIiBkPSJNNTAuMSAxMDBjLTI3LjYgMC01MC0yMi40LTUwLTUwczIyLjQtNTAgNTAtNTBoLjFjMjcuNiAwIDUwIDIyLjQgNTAgNTBzLTIyLjQgNTAtNTAgNTB6bS0yNS03NS4xYy0xMi40IDAtMTIuNCAxMi40IDAgMTIuNHMyNC45LTEyLjQgMjQuOS0yNC45YzAtMTIuNS0yNC45LTEyLjUtMjQuOSAwem0yNSA0OS45YzEyLjQgMCAyNC45LTEyLjQgMjQuOS0yNC45UzYyLjYgMjUgNTAuMSAyNUMzNy43IDI1IDI1LjIgMzcuNCAyNS4yIDQ5LjljMCAxMi40IDEyLjQgMjQuOSAyNC45IDI0Ljl6Ii8+PC9zdmc+' },
];


// Edit Logos Modal Component
const EditLogosModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  currentCompanies: typeof initialOilCompanies;
  onSave: (updatedCompanies: typeof initialOilCompanies) => void;
}> = ({ isOpen, onClose, currentCompanies, onSave }) => {
  const [editedCompanies, setEditedCompanies] = useState(currentCompanies);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    if (isOpen) {
      setEditedCompanies(currentCompanies);
    }
  }, [isOpen, currentCompanies]);

  const handleFileChange = (companyName: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const newLogoUrl = event.target?.result as string;
      setEditedCompanies(prev => 
        prev.map(c => c.name === companyName ? { ...c, logoUrl: newLogoUrl } : c)
      );
    };
    reader.readAsDataURL(file);
  };

  const handleSaveChanges = () => {
    onSave(editedCompanies);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md flex flex-col shadow-xl max-h-[90vh]">
        <header className="p-4 border-b dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 rounded-lg">
          <h2 className="text-lg font-bold text-dark dark:text-white">Edit Company Logos</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <XIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
        </header>
        
        <div className="p-4 space-y-4 overflow-y-auto">
          {editedCompanies.map(company => (
            <div key={company.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-24 h-16 bg-white dark:bg-gray-800 rounded-md flex items-center justify-center p-1 border dark:border-gray-600">
                  <img src={company.logoUrl} alt={`${company.name} logo preview`} className="max-h-full max-w-full object-contain" />
                </div>
                <span className="font-semibold text-dark dark:text-white">{company.name}</span>
              </div>
              <input 
                type="file" 
                accept="image/*"
                ref={el => { fileInputRefs.current[company.name] = el; }}
                onChange={(e) => handleFileChange(company.name, e)}
                className="hidden" 
              />
              <button 
                onClick={() => fileInputRefs.current[company.name]?.click()}
                className="px-3 py-1.5 text-sm font-medium text-primary bg-light border border-transparent rounded-md hover:bg-primary/20 dark:bg-primary/20 dark:text-light dark:hover:bg-primary/30"
              >
                Change
              </button>
            </div>
          ))}
        </div>

        <footer className="p-4 border-t dark:border-gray-700 flex justify-end space-x-2 bg-gray-50 dark:bg-gray-800/50 sticky bottom-0 rounded-b-lg">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
            Cancel
          </button>
          <button onClick={handleSaveChanges} className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-secondary">
            Save Changes
          </button>
        </footer>
      </div>
    </div>
  );
};


// Card for a specific oil company
const OilCompanyCard: React.FC<{ name: string; logoUrl: string }> = ({ name, logoUrl }) => (
  <button className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 w-full h-32 flex items-center justify-center hover:shadow-lg transition-shadow transform hover:scale-105">
    <img src={logoUrl} alt={`${name} logo`} className="max-h-16 max-w-[80%] object-contain" />
  </button>
);


// Card for individual resource
const ResourceCard: React.FC<{ resource: Resource }> = ({ resource }) => {
    const categoryColors: { [key in ResourceCategory]: string } = {
        [ResourceCategory.OilAndGas]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        [ResourceCategory.Mining]: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300',
        [ResourceCategory.Agriculture]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        [ResourceCategory.Logging]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        [ResourceCategory.Fisheries]: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
    };
    
    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 space-y-3">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-lg text-dark dark:text-white">{resource.title}</h3>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full mr-2 ${categoryColors[resource.category]}`}>
                            {resource.category}
                        </span>
                        <MapPinIcon className="w-3 h-3 mr-1" />
                        <span>{resource.location}</span>
                    </div>
                </div>
                 {resource.isLive && (
                    <span className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                        Live Data
                    </span>
                 )}
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-300">{resource.description}</p>
            
            <div className="grid grid-cols-3 gap-x-4 border-t border-gray-100 dark:border-gray-700 pt-3">
                {resource.dataPoints.map(point => (
                    <div key={point.label}>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{point.label}</p>
                        <p className="font-bold text-sm text-dark dark:text-white">{point.value}</p>
                    </div>
                ))}
            </div>

            <p className="text-right text-xs text-gray-400 dark:text-gray-500">{resource.timestamp}</p>
        </div>
    );
};


const ResourcesPage: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | 'All'>('All');
    const [isLoading, setIsLoading] = useState(false);
    const { isAdmin } = useAuth();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Load companies from localStorage or use initial data
    const [companies, setCompanies] = useState(() => {
        try {
            const savedLogos = localStorage.getItem('oilCompanyLogos');
            return savedLogos ? JSON.parse(savedLogos) : initialOilCompanies;
        } catch (error) {
            console.error("Failed to parse logos from localStorage", error);
            return initialOilCompanies;
        }
    });

    const filteredResources = useMemo(() => {
        if (selectedCategory === 'All') {
            return MOCK_RESOURCES;
        }
        return MOCK_RESOURCES.filter(res => res.category === selectedCategory);
    }, [selectedCategory]);

    const handleRefresh = () => {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 700); // Simulate a network request
    };

    const handleSaveLogos = (updatedCompanies: typeof initialOilCompanies) => {
        try {
            localStorage.setItem('oilCompanyLogos', JSON.stringify(updatedCompanies));
            setCompanies(updatedCompanies);
            setIsEditModalOpen(false);
        } catch (error) {
            console.error("Failed to save logos to localStorage", error);
        }
    };

    const count = selectedCategory === ResourceCategory.OilAndGas ? companies.length : filteredResources.length;
    const countLabel = selectedCategory === ResourceCategory.OilAndGas ? 'companies' : 'resources';

    return (
        <div className="space-y-4">
            {/* Filter Buttons */}
            <div className="flex space-x-2 overflow-x-auto pb-2 -mx-1 px-1">
                <button
                    onClick={() => setSelectedCategory('All')}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${selectedCategory === 'All' ? 'bg-primary text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm'}`}
                >
                    All
                </button>
                {resourceCategories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${selectedCategory === cat ? 'bg-primary text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="space-y-4">
                <div className="flex justify-between items-center pt-2">
                    <h2 className="text-xl font-bold text-dark dark:text-white">
                        {selectedCategory === 'All' ? 'All Resources' : selectedCategory}
                    </h2>
                    <div className="flex items-center space-x-3">
                        <span className="text-sm font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full">{count} total {countLabel}</span>
                        {isAdmin && selectedCategory === ResourceCategory.OilAndGas && (
                            <button onClick={() => setIsEditModalOpen(true)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Edit Logos">
                                <EditIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            </button>
                        )}
                        <button onClick={handleRefresh} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                           <RefreshCwIcon className={`w-5 h-5 text-gray-600 dark:text-gray-300 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {selectedCategory === ResourceCategory.OilAndGas ? (
                    <div className="space-y-4 pt-2">
                        {companies.map((company: {name: string, logoUrl: string}) => (
                            <OilCompanyCard key={company.name} name={company.name} logoUrl={company.logoUrl} />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredResources.length > 0 ? (
                            filteredResources.map(resource => (
                                <ResourceCard key={resource.id} resource={resource} />
                            ))
                        ) : (
                            <div className="text-center text-gray-500 dark:text-gray-400 py-16">
                                <p className="font-semibold">No Resources Found</p>
                                <p className="text-sm mt-1">There are no resources available in this category yet.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <EditLogosModal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                currentCompanies={companies}
                onSave={handleSaveLogos}
            />
        </div>
    );
};

export default ResourcesPage;