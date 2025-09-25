import React, { useEffect, useRef, useState } from 'react';
import { Issue } from '../types';

// Since Leaflet is loaded from a script tag, we need to declare the 'L' global variable.
declare const L: any;

interface MapPageProps {
  issues: Issue[];
  onSelectIssue: (issue: Issue) => void;
}

const LoadingSpinner: React.FC = () => (
    <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const MapPage: React.FC<MapPageProps> = ({ issues, onSelectIssue }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isMapLoading, setMapLoading] = useState(true);

  useEffect(() => {
    // Initialize map only once
    if (mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([6.5, -58.5], 8); // Centered on Guyana

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance.current);

      // whenReady executes the callback when the map is ready
      mapInstance.current.whenReady(() => {
          setMapLoading(false);
      });
    }

    // Add markers for issues
    if (mapInstance.current) {
      // Clear existing markers before adding new ones to avoid duplicates
      markersRef.current.forEach(marker => mapInstance.current.removeLayer(marker));
      markersRef.current = [];

      issues.forEach((issue, index) => {
        if (issue.coordinates) {
          const iconHtml = `
            <div style="animation-delay: ${index * 50}ms;" class="marker-animation">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36">
                <path fill="#0077B6" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                <circle fill="white" cx="12" cy="9" r="2.5"/>
              </svg>
            </div>
          `;
          
          const customIcon = L.divIcon({
              html: iconHtml,
              className: 'leaflet-animated-marker',
              iconSize: [36, 36],
              iconAnchor: [18, 36],
              popupAnchor: [0, -36]
          });

          const marker = L.marker([issue.coordinates.lat, issue.coordinates.lng], { icon: customIcon })
            .addTo(mapInstance.current);

          const popupContent = `
            <div class="p-1" style="width: 200px;">
              <h3 class="font-bold text-md text-dark">${issue.title}</h3>
              <p class="text-sm text-gray-600 my-1">${issue.summary.substring(0, 70)}...</p>
              <button id="view-issue-${issue.id}" class="w-full mt-2 bg-primary text-white text-sm font-semibold py-1.5 px-3 rounded-lg hover:bg-secondary">
                View Details
              </button>
            </div>
          `;
          marker.bindPopup(popupContent);
          markersRef.current.push(marker);
        }
      });
      
      mapInstance.current.off('popupopen').on('popupopen', (e: any) => {
        const content = e.popup.getContent();
        if (typeof content === 'string') {
            const match = content.match(/id="view-issue-(.*?)"/);
            if (match && match[1]) {
                const issueId = match[1];
                const issue = issues.find(i => i.id === issueId);
                const btn = document.getElementById(`view-issue-${issueId}`);
                if (btn && issue) {
                    btn.onclick = () => onSelectIssue(issue);
                }
            }
        }
      });
    }
    
    return () => {
        if (mapInstance.current) {
            mapInstance.current.off('popupopen');
        }
    };

  }, [issues, onSelectIssue]);

  return (
    <div className="relative h-[calc(100vh-140px)] w-full -mx-4">
        <style>{`
            .leaflet-animated-marker {
                background: transparent;
                border: none;
            }
            @keyframes marker-drop-in {
                from {
                    opacity: 0;
                    transform: translateY(-30px) scale(0.3);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
            .marker-animation {
                animation: marker-drop-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                transform-origin: bottom center;
                opacity: 0; /* Start invisible */
            }
            .marker-animation svg {
                filter: drop-shadow(0 4px 3px rgba(0,0,0,0.2));
            }
        `}</style>
        {isMapLoading && (
            <div className="absolute inset-0 bg-background z-10 flex flex-col items-center justify-center transition-opacity duration-300">
                <LoadingSpinner />
                <p className="mt-4 text-gray-600 font-semibold">Loading Map...</p>
            </div>
        )}
        <div 
            ref={mapRef} 
            className={`h-full w-full transition-opacity duration-500 ${isMapLoading ? 'opacity-0' : 'opacity-100'}`} 
            id="map" 
            aria-label="Map of reported issues"
        ></div>
    </div>
  );
};

export default MapPage;