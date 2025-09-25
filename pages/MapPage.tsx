import React, { useEffect, useRef, useState } from 'react';
import { Issue, IssueCategory } from '../types';

// Since Leaflet is loaded from a script tag, we need to declare the 'L' global variable.
declare const L: any;

// Define colors for each issue category
const categoryColors: { [key in IssueCategory]: string } = {
  [IssueCategory.Infrastructure]: '#FB8500', // Accent
  [IssueCategory.Health]: '#D00000',         // Danger
  // FIX: Corrected a typo from `Issue-Category.Education` to `IssueCategory.Education`.
  [IssueCategory.Education]: '#0077B6',      // Primary
  [IssueCategory.Environment]: '#4CAF50',    // Success
  [IssueCategory.Security]: '#03045E',       // Dark
};

// Function to create a custom colored marker icon
const createCustomIcon = (color: string) => {
  const iconHtml = `
    <div class="custom-marker-container">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36" style="filter: drop-shadow(0 4px 3px rgba(0,0,0,0.3));">
        <path fill="${color}" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
        <circle fill="white" cx="12" cy="9" r="2.5"/>
      </svg>
    </div>
  `.trim(); // Trim whitespace to prevent the first child from being a text node.
  return L.divIcon({
    html: iconHtml,
    className: 'custom-leaflet-icon',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });
};

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
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const [isMapLoading, setMapLoading] = useState(true);

  // Effect for map initialization and cleanup
  useEffect(() => {
    let resizeObserver: ResizeObserver;
    let loadingTimer: ReturnType<typeof setTimeout>;
    let isDarkMode = document.documentElement.classList.contains('dark');

    if (mapContainerRef.current && !mapInstanceRef.current) {
        
      const streetLayer = L.tileLayer(
          isDarkMode ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', 
          {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          }
      );

      const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      });
      
      const map = L.map(mapContainerRef.current, {
        center: [6.5, -58.5], // Centered on Guyana
        zoom: 8,
        layers: [streetLayer] // Default layer
      });

      const baseMaps = {
        "Street View": streetLayer,
        "Satellite View": satelliteLayer
      };

      L.control.layers(baseMaps).addTo(map);

      mapInstanceRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);

      // Use a ResizeObserver to reliably call invalidateSize when the container is ready.
      // This is the correct way to handle maps inside animating/dynamic containers.
      resizeObserver = new ResizeObserver(() => {
        mapInstanceRef.current?.invalidateSize();
      });
      resizeObserver.observe(mapContainerRef.current);

      loadingTimer = setTimeout(() => {
        setMapLoading(false);
      }, 400);
    }
    
    // Cleanup function to run when the component unmounts
    return () => {
      clearTimeout(loadingTimer);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Empty dependency array ensures this runs only on mount and unmount


  // This effect handles updating the markers when issues change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const map = mapInstanceRef.current;
    markersLayerRef.current.clearLayers();

    issues.forEach((issue, index) => {
      if (issue.coordinates) {
        const color = categoryColors[issue.category] || '#777'; // Fallback color
        const customIcon = createCustomIcon(color);
        
        const marker = L.marker([issue.coordinates.lat, issue.coordinates.lng], { icon: customIcon });

        const popupContent = `
            <div class="p-1 max-w-xs text-black">
                <h3 class="font-bold text-md text-dark">${issue.title}</h3>
                <p class="text-sm text-gray-600 my-1 text-justify">${issue.summary.substring(0, 70)}...</p>
                <button id="view-issue-${issue.id}" class="w-full mt-2 bg-primary text-white text-sm font-semibold py-1.5 px-3 rounded-lg hover:bg-secondary">
                  View Details
                </button>
            </div>
        `;
        marker.bindPopup(popupContent);
        
        marker.on('add', function() {
            const iconEl = this.getElement();
            // Using querySelector is more robust for finding the animated element.
            if (iconEl) {
                const animatedEl = iconEl.querySelector('.custom-marker-container') as HTMLElement;
                if (animatedEl) {
                    animatedEl.style.animationDelay = `${index * 50}ms`;
                }
            }
        });
        
        markersLayerRef.current.addLayer(marker);
      }
    });

    map.off('popupopen').on('popupopen', (e: any) => {
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

  }, [issues, onSelectIssue]);


  return (
    <div className="relative h-full w-full -mx-4">
        <style>{`
            .custom-leaflet-icon {
                background: transparent;
                border: none;
            }
            .custom-marker-container {
                animation: marker-drop-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                transform-origin: bottom center;
                opacity: 0;
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
        `}</style>
        {isMapLoading && (
            <div className="absolute inset-0 bg-background dark:bg-gray-900 z-20 flex flex-col items-center justify-center transition-opacity duration-300">
                <LoadingSpinner />
                <p className="mt-4 text-gray-600 dark:text-gray-300 font-semibold">Loading Map...</p>
            </div>
        )}
        <div 
            ref={mapContainerRef} 
            className={`h-full w-full z-10 transition-opacity duration-500 ${isMapLoading ? 'opacity-0' : 'opacity-100'}`} 
            id="map" 
            aria-label="Map of reported issues"
        ></div>
    </div>
  );
};

export default MapPage;