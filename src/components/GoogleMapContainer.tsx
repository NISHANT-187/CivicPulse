import React, { useEffect, useRef, useState } from 'react';
import { Issue } from '../mockData';
import { Loader } from '@googlemaps/js-api-loader';

interface GoogleMapContainerProps {
  issues: Issue[];
  center?: { lat: number; lng: number };
  zoom?: number;
  reportMode?: boolean;
  selectedLocation?: { lat: number; lng: number } | null;
  onLocationSelect?: (lat: number, lng: number) => void;
  showHeatmap?: boolean;
  theme?: 'dark' | 'light';
}

export const GoogleMapContainer: React.FC<GoogleMapContainerProps> = ({
  issues,
  center = { lat: 37.7749, lng: -122.4194 }, // SF default
  zoom = 13,
  reportMode = false,
  selectedLocation = null,
  onLocationSelect,
  showHeatmap = false,
  theme = 'dark'
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [heatmapLayer, setHeatmapLayer] = useState<any | null>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const isMockMode = !apiKey || apiKey === 'mock-key' || apiKey.startsWith('YOUR_');

  // Google Maps Dynamic Loader
  useEffect(() => {
    if (isMockMode) return;

    const loader = new Loader({
      apiKey: apiKey,
      version: 'weekly',
      libraries: ['visualization']
    });

    (loader as any).load().then(() => {
      setGoogleMapsLoaded(true);
    }).catch((err: any) => {
      console.warn("Failed to load Google Maps script. Defaulting to mock canvas:", err);
      setGoogleMapsLoaded(false);
    });
  }, [isMockMode, apiKey]);

  // Obsidian Dark Theme configuration styled like Apple Maps
  const darkMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#0B0B0C" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#0B0B0C" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#8E8E93" }] },
    { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#1C1C1E" }] },
    { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#0B0B0C" }] },
    { featureType: "poi", stylers: [{ visibility: "off" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#141416" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "rgba(255,255,255,0.03)" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#1C1C1E" }] },
    { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "rgba(255,255,255,0.06)" }] },
    { featureType: "transit", stylers: [{ visibility: "off" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#1C2430" }] }
  ];

  // Light Mode Map Style (Calm, minimalist Apple style)
  const lightMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#F5F5F7" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#F5F5F7" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#6E6E73" }] },
    { featureType: "poi", stylers: [{ visibility: "off" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#FFFFFF" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#E5E5EA" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#E5E5EA" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#D1D1D6" }] }
  ];

  // Map Initialization
  useEffect(() => {
    if (!googleMapsLoaded || !mapRef.current || isMockMode) return;

    const map = new google.maps.Map(mapRef.current, {
      center: center,
      zoom: zoom,
      styles: theme === 'dark' ? darkMapStyle : lightMapStyle,
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: 'cooperative',
      backgroundColor: '#0B0B0C'
    });

    setMapInstance(map);

    // Listen to map click in reportMode
    map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (reportMode && onLocationSelect && e.latLng) {
        onLocationSelect(e.latLng.lat(), e.latLng.lng());
      }
    });

    return () => {
      google.maps.event.clearInstanceListeners(map);
    };
  }, [googleMapsLoaded, isMockMode]);

  // Synchronize Theme Style on maps instance
  useEffect(() => {
    if (!mapInstance) return;
    mapInstance.setOptions({
      styles: theme === 'dark' ? darkMapStyle : lightMapStyle
    });
  }, [theme, mapInstance]);

  // Update center when props change
  useEffect(() => {
    if (!mapInstance) return;
    mapInstance.panTo(center);
  }, [center, mapInstance]);

  // Manage Markers
  useEffect(() => {
    if (!mapInstance || isMockMode) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    const newMarkers: google.maps.Marker[] = [];

    if (reportMode) {
      if (selectedLocation) {
        const marker = new google.maps.Marker({
          position: selectedLocation,
          map: mapInstance,
          title: "Selected Location",
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#D6C3A5',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#0B0B0C'
          }
        });
        newMarkers.push(marker);
      }
    } else {
      issues.forEach(issue => {
        let pinColor = '#8B8175'; // Warm Stone Default
        if (issue.severity === 'Critical' || issue.isEmergency) {
          pinColor = '#A86666'; // Danger
        } else if (issue.severity === 'High') {
          pinColor = '#B78C52'; // Warning
        } else if (issue.category === 'Environment') {
          pinColor = '#7C9A7A'; // Success
        }

        const marker = new google.maps.Marker({
          position: { lat: issue.latitude, lng: issue.longitude },
          map: mapInstance,
          title: issue.title,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 6,
            fillColor: pinColor,
            fillOpacity: 0.9,
            strokeWeight: 1.5,
            strokeColor: '#0B0B0C'
          }
        });

        // Info Window on click
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="color: #F5F5F7; background: #141416; padding: 10px; border-radius: 8px; font-family: 'Inter', sans-serif; font-size: 12px; border: 1px solid rgba(255,255,255,0.06); max-width: 220px;">
              <span style="font-size: 8px; font-weight: bold; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 2px 6px; text-transform: uppercase; color: #D6C3A5; border-radius: 4px;">${issue.category}</span>
              <h4 style="margin: 6px 0 3px; font-weight: 600; text-transform: uppercase;">${issue.title}</h4>
              <p style="margin: 0; color: #A1A1AA; font-size: 10px;">${issue.address}</p>
              <a href="#/issues/${issue.id}" style="display: inline-block; margin-top: 8px; color: #D6C3A5; text-decoration: none; font-weight: 500; font-size: 10px;">Details →</a>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(mapInstance, marker);
        });

        newMarkers.push(marker);
      });
    }

    setMarkers(newMarkers);
  }, [issues, mapInstance, reportMode, selectedLocation]);

  // Manage Heatmap Layer
  useEffect(() => {
    if (!mapInstance || isMockMode) return;

    if (heatmapLayer) {
      (heatmapLayer as any).setMap(null);
    }

    if (showHeatmap && !reportMode) {
      const heatmapPoints = issues.map(issue => {
        return new google.maps.LatLng(issue.latitude, issue.longitude);
      });

      const heatmap = new (google.maps.visualization.HeatmapLayer as any)({
        data: heatmapPoints,
        map: mapInstance,
        radius: 30
      });

      setHeatmapLayer(heatmap);
    }
  }, [showHeatmap, mapInstance, issues, reportMode]);

  // --- Vector SVG / Canvas Interactive Map Fallback (Offline Mode) ---
  const [activePopup, setActivePopup] = useState<Issue | null>(null);

  // Convert lat/lng to local viewport percentages centered around center prop
  const getPositionCoords = (lat: number, lng: number) => {
    const latSpan = 0.08; // width of simulated scope
    const lngSpan = 0.12;

    const latDelta = lat - center.lat;
    const lngDelta = lng - center.lng;

    // percentage coordinates
    const left = 50 + (lngDelta / lngSpan) * 100;
    const top = 50 - (latDelta / latSpan) * 100;

    return { left: `${left}%`, top: `${top}%` };
  };

  const handleMockMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!reportMode || !onLocationSelect) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const pctX = (x / rect.width) * 100;
    const pctY = (y / rect.height) * 100;

    const latSpan = 0.08;
    const lngSpan = 0.12;

    // Inverse projection formula
    const clickLng = center.lng + ((pctX - 50) / 100) * lngSpan;
    const clickLat = center.lat - ((pctY - 50) / 100) * latSpan;

    onLocationSelect(clickLat, clickLng);
  };

  if (isMockMode || !googleMapsLoaded) {
    return (
      <div 
        onClick={handleMockMapClick}
        className={`w-full h-full relative overflow-hidden select-none cursor-default transition-all duration-300 ${
          theme === 'dark' ? 'bg-[#0B0B0C] border-[rgba(255,255,255,0.05)]' : 'bg-[#F5F5F7] border-[rgba(0,0,0,0.05)]'
        } border rounded-2xl flex flex-col justify-end`}
      >
        {/* Dynamic Map Grid System */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="w-full h-full" style={{ 
            backgroundImage: `radial-gradient(circle, ${theme === 'dark' ? '#F5F5F7' : '#0B0B0C'} 1px, transparent 1px)`, 
            backgroundSize: '24px 24px' 
          }} />
        </div>

        {/* Mock Streets / Topography */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" pointerEvents="none">
          <line x1="10%" y1="0%" x2="10%" y2="100%" stroke="currentColor" strokeWidth="2" />
          <line x1="45%" y1="0%" x2="45%" y2="100%" stroke="currentColor" strokeWidth="3" />
          <line x1="75%" y1="0%" x2="75%" y2="100%" stroke="currentColor" strokeWidth="1" />
          <line x1="0%" y1="35%" x2="100%" y2="35%" stroke="currentColor" strokeWidth="3" />
          <line x1="0%" y1="70%" x2="100%" y2="70%" stroke="currentColor" strokeWidth="2" />
          <circle cx="45%" cy="35%" r="150" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M -20,200 Q 150,150 400,280 T 800,220" fill="none" stroke="currentColor" strokeWidth="20" className="opacity-20" />
        </svg>

        {/* Heatmap Overlay Simulation */}
        {showHeatmap && !reportMode && (
          <div className="absolute inset-0 pointer-events-none transition-all duration-300">
            {issues.map(issue => {
              const coords = getPositionCoords(issue.latitude, issue.longitude);
              return (
                <div
                  key={`heat-${issue.id}`}
                  className="absolute w-24 h-24 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.12] filter blur-xl transition-all duration-300"
                  style={{
                    left: coords.left,
                    top: coords.top,
                    background: 'radial-gradient(circle, #D6C3A5 0%, transparent 70%)'
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Dynamic Pins */}
        {!reportMode ? (
          issues.map(issue => {
            const coords = getPositionCoords(issue.latitude, issue.longitude);
            let color = '#8B8175'; // Warm Stone
            if (issue.severity === 'Critical' || issue.isEmergency) {
              color = '#A86666'; // Muted Crimson
            } else if (issue.severity === 'High') {
              color = '#B78C52'; // Burnt Amber
            } else if (issue.category === 'Environment') {
              color = '#7C9A7A'; // Muted Green
            }

            return (
              <div
                key={issue.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 group z-20 cursor-pointer"
                style={{ left: coords.left, top: coords.top }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePopup(issue);
                }}
              >
                {/* Visual Ring */}
                <div 
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border transition-transform duration-200 group-hover:scale-125`}
                  style={{ 
                    backgroundColor: color, 
                    borderColor: theme === 'dark' ? '#0B0B0C' : '#FFFFFF',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }}
                />

                {/* Pulsing circle on Emergencies */}
                {(issue.severity === 'Critical' || issue.isEmergency) && (
                  <div 
                    className="absolute inset-0 rounded-full animate-ping opacity-60 pointer-events-none"
                    style={{ backgroundColor: color }}
                  />
                )}
              </div>
            );
          })
        ) : (
          selectedLocation && (
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
              style={getPositionCoords(selectedLocation.lat, selectedLocation.lng)}
            >
              <div className="w-5 h-5 rounded-full bg-[#D6C3A5] border-2 border-white flex items-center justify-center shadow-lg relative animate-pulse">
                <span className="text-[10px] text-black">📍</span>
              </div>
            </div>
          )
        )}

        {/* Selected Coordinates Overlay */}
        {reportMode && (
          <div className="absolute bottom-4 left-4 right-4 glass-card p-3 border border-[rgba(255,255,255,0.06)] text-center font-mono text-[10px] text-[#A1A1AA] z-40 pointer-events-none bg-[#141416]/90">
            {selectedLocation ? (
              <span className="text-[#D6C3A5] font-semibold">
                Pin Location Set: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
              </span>
            ) : (
              <span>Click anywhere on the map grid to drop the report pin.</span>
            )}
          </div>
        )}

        {/* Interactive Popup Details Drawer */}
        {activePopup && (
          <div 
            className="absolute bottom-4 left-4 right-4 bg-[#141416] border border-[rgba(255,255,255,0.06)] rounded-xl p-4 shadow-premium z-50 animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-[9px] font-semibold bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] px-2 py-0.5 rounded text-[#D6C3A5] uppercase tracking-wider">
                {activePopup.category}
              </span>
              <button 
                onClick={() => setActivePopup(null)}
                className="text-[#A1A1AA] hover:text-[#F5F5F7] text-xs font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <h4 className="text-sm font-semibold uppercase tracking-tight text-[#F5F5F7] mb-1">
              {activePopup.title}
            </h4>
            <p className="text-[11px] text-[#A1A1AA] mb-3">{activePopup.address}</p>
            <div className="flex justify-between items-center">
              <span className={`text-[10px] font-semibold uppercase ${
                activePopup.severity === 'Critical' ? 'text-[#A86666]' : 'text-[#8B8175]'
              }`}>
                {activePopup.severity} Priority
              </span>
              <a
                href={`#/issues/${activePopup.id}`}
                className="px-3 py-1 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.08)] text-xs text-[#F5F5F7] rounded transition-all"
              >
                Open Timeline &rarr;
              </a>
            </div>
          </div>
        )}

        {/* Google Maps Logo Fallback Brand Sign */}
        <div className="absolute top-4 left-4 z-40 bg-[#141416]/85 backdrop-blur border border-[rgba(255,255,255,0.05)] rounded px-2.5 py-1 text-[9px] font-mono text-[#8B8175] flex items-center gap-1.5 shadow">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7C9A7A] animate-pulse" />
          <span>SIMULATED OPERATIONS ENGINE (OFFLINE)</span>
        </div>
      </div>
    );
  }

  // Real Google Maps container Element
  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="google-map-premium" />
    </div>
  );
};
