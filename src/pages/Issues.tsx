import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Map as MapIcon, List, AlertCircle } from 'lucide-react';
import { Issue } from '../mockData';
import { IssueCard } from '../components/IssueCard';
import { GoogleMapContainer } from '../components/GoogleMapContainer';

interface IssuesProps {
  issues: Issue[];
  onUpvote: (id: string, e: React.MouseEvent) => void;
  hasUpvoted: (id: string) => boolean;
}

export const Issues: React.FC<IssuesProps> = ({ issues, onUpvote, hasUpvoted }) => {
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  
  // View states (toggle map vs list on mobile)
  const [mobileView, setMobileView] = useState<'both' | 'map' | 'list'>('both');

  // Map coordinates focus
  const [mapCenter, setMapCenter] = useState<{ lat: number, lng: number }>({ lat: 37.7749, lng: -122.4194 });
  const [mapZoom, setMapZoom] = useState<number>(13);
  const [mapTheme, setMapTheme] = useState<'dark' | 'light'>('dark');

  // Watch document class for dynamic map styles sync
  useEffect(() => {
    const checkTheme = () => {
      const isLight = document.documentElement.classList.contains('light');
      setMapTheme(isLight ? 'light' : 'dark');
    };
    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Apply filters
  const filteredIssues = issues.filter((issue) => {
    const matchesSearch = 
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'All' || issue.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || issue.status === statusFilter;
    const matchesSeverity = severityFilter === 'All' || issue.severity === severityFilter;

    return matchesSearch && matchesCategory && matchesStatus && matchesSeverity;
  });

  const handleFocusIssueOnMap = (issue: Issue) => {
    setMapCenter({ lat: issue.latitude, lng: issue.longitude });
    setMapZoom(16);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categories = ['All', 'Infrastructure', 'Sanitation', 'Utilities', 'Public Safety', 'Environment', 'Mobility'];
  const statuses = [
    { value: 'All', label: 'All Statuses' },
    { value: 'reported', label: 'Reported' },
    { value: 'verified', label: 'AI Verified' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' }
  ];
  const severities = ['All', 'Low', 'Medium', 'High', 'Critical'];

  return (
    <div className="space-y-6 page-entrance font-inter">
      {/* Header */}
      <div className="border-b border-[rgba(255,255,255,0.04)] pb-4 flex justify-between items-baseline">
        <div>
          <span className="text-[10px] font-mono text-[#8B8175] uppercase tracking-wider">CIVIC TELEMETRY</span>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-[#F5F5F7]">Report Directory</h1>
        </div>
        <p className="text-[10px] font-mono text-[#8B8175] uppercase">
          Listing {filteredIssues.length} of {issues.length} cases
        </p>
      </div>

      {/* View Toggle on Mobile */}
      <div className="md:hidden flex bg-[#141416] border border-[rgba(255,255,255,0.06)] rounded-lg p-0.5 text-xs">
        <button
          onClick={() => setMobileView('map')}
          className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 cursor-pointer font-medium ${
            mobileView === 'map' ? 'bg-[#D6C3A5] text-[#0B0B0C]' : 'text-[#A1A1AA]'
          }`}
        >
          <MapIcon className="h-3.5 w-3.5" /> Map
        </button>
        <button
          onClick={() => setMobileView('list')}
          className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 cursor-pointer font-medium ${
            mobileView === 'list' ? 'bg-[#D6C3A5] text-[#0B0B0C]' : 'text-[#A1A1AA]'
          }`}
        >
          <List className="h-3.5 w-3.5" /> List
        </button>
      </div>

      {/* Search & Filter Header Bar */}
      <div className="bg-[rgba(20,20,22,0.4)] border border-[rgba(255,255,255,0.04)] rounded-xl p-4 space-y-4 backdrop-blur-md">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search box */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8B8175]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by title, address, or details..."
              className="w-full glass-input pl-9 text-xs py-2"
            />
          </div>

          {/* Select Category */}
          <div className="md:w-44">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full glass-input text-xs py-2 bg-[#141416] cursor-pointer"
            >
              <option value="All">All Categories</option>
              {categories.slice(1).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Select Status */}
          <div className="md:w-44">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full glass-input text-xs py-2 bg-[#141416] cursor-pointer"
            >
              {statuses.map((st) => (
                <option key={st.value} value={st.value}>{st.label}</option>
              ))}
            </select>
          </div>

          {/* Select Severity */}
          <div className="md:w-36">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full glass-input text-xs py-2 bg-[#141416] cursor-pointer"
            >
              <option value="All">All Severities</option>
              {severities.slice(1).map((sev) => (
                <option key={sev} value={sev}>{sev}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Tags Filter pill row */}
        <div className="hidden lg:flex items-center gap-2 pt-3 border-t border-[rgba(255,255,255,0.03)] font-mono text-[9px] uppercase tracking-wider text-[#8B8175]">
          <SlidersHorizontal className="h-3 w-3" />
          <span>Quick Filters:</span>
          <button
            onClick={() => { setCategoryFilter('All'); setStatusFilter('All'); setSeverityFilter('All'); setSearchTerm(''); }}
            className="px-2 py-0.5 border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.01)] text-[#F5F5F7] hover:border-[#D6C3A5] transition-all cursor-pointer rounded"
          >
            Reset Filters
          </button>
          <button
            onClick={() => setSeverityFilter('Critical')}
            className="px-2 py-0.5 border border-[#A86666]/30 bg-[#A86666]/5 text-[#A86666] hover:bg-[#A86666]/10 transition-all cursor-pointer rounded"
          >
            Critical Only
          </button>
          <button
            onClick={() => setStatusFilter('resolved')}
            className="px-2 py-0.5 border border-[#7C9A7A]/30 bg-[#7C9A7A]/5 text-[#7C9A7A] hover:bg-[#7C9A7A]/10 transition-all cursor-pointer rounded"
          >
            Resolved Only
          </button>
        </div>
      </div>

      {/* Main Dual Pane Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch min-h-[500px]">
        {/* Map Container Pane */}
        <div
          className={`md:col-span-6 lg:col-span-7 h-[450px] md:h-auto overflow-hidden rounded-2xl ${
            mobileView === 'list' ? 'hidden md:block' : ''
          }`}
        >
          <GoogleMapContainer
            issues={filteredIssues}
            center={mapCenter}
            zoom={mapZoom}
            theme={mapTheme}
          />
        </div>

        {/* Issue Cards List Pane */}
        <div
          className={`md:col-span-6 lg:col-span-5 max-h-[650px] md:overflow-y-auto pr-1 space-y-4 ${
            mobileView === 'map' ? 'hidden md:block' : ''
          }`}
        >
          {filteredIssues.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center justify-center bg-[#141416] border border-[rgba(255,255,255,0.05)] rounded-2xl">
              <AlertCircle className="h-8 w-8 text-[#8B8175] mb-2" />
              <h3 className="font-semibold text-xs text-[#F5F5F7] uppercase tracking-wider">No matching records</h3>
              <p className="text-[11px] text-[#A1A1AA] mt-1">Try relaxing filters or adjusting search queries.</p>
              <button
                onClick={() => { setCategoryFilter('All'); setStatusFilter('All'); setSeverityFilter('All'); setSearchTerm(''); }}
                className="mt-4 px-3 py-1.5 bg-[#D6C3A5] text-[#0B0B0C] font-semibold text-[10px] rounded transition-all cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredIssues.map((issue) => (
              <div key={issue.id} className="relative group">
                {/* Floating "Center Map" Quick-Button */}
                <button
                  onClick={() => handleFocusIssueOnMap(issue)}
                  className="absolute top-4 right-4 z-10 px-2 py-0.5 bg-[#1A1A1D] border border-[rgba(255,255,255,0.08)] hover:border-[#D6C3A5] text-[#A1A1AA] hover:text-[#D6C3A5] text-[8px] font-mono font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer hidden group-hover:block rounded"
                  title="Focus on Map"
                >
                  Locate &bull; 🎯
                </button>
                <IssueCard
                  issue={issue}
                  onUpvote={onUpvote}
                  hasUpvoted={hasUpvoted(issue.id)}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
