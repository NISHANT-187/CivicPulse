import React, { useState, useEffect } from 'react';
import { Radio, Activity, Brain, Filter, Sparkles } from 'lucide-react';
import { Issue } from '../mockData';
import { GoogleMapContainer } from '../components/GoogleMapContainer';
import { GeminiService, PolicyResult } from '../services/geminiService';

interface CommandCenterProps {
  issues: Issue[];
}

export const CommandCenter: React.FC<CommandCenterProps> = ({ issues }) => {
  // Layer Toggles
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showDeptLoad, setShowDeptLoad] = useState(false);
  const [showForecast, setShowForecast] = useState(true);
  const [showEmergencies, setShowEmergencies] = useState(true);

  // Active Category filter
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Policy insights state
  const [policyData, setPolicyData] = useState<PolicyResult | null>(null);
  const [policyLoading, setPolicyLoading] = useState(false);
  const [mapTheme, setMapTheme] = useState<'dark' | 'light'>('dark');

  // Watch theme status sync
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

  useEffect(() => {
    // Generate AI recommendations on mount using the PolicyAgent
    const fetchPolicyRecommendations = async () => {
      setPolicyLoading(true);
      try {
        const recommendations = await GeminiService.generatePolicyRecommendations(issues);
        setPolicyData(recommendations);
      } catch (e) {
        console.error("Failed to generate policy reports:", e);
      } finally {
        setPolicyLoading(false);
      }
    };
    fetchPolicyRecommendations();
  }, [issues]);

  // Calculations
  const emergencyIssues = issues.filter(i => i.isEmergency || i.severity === 'Critical');
  
  // Department workloads
  const deptCounts = issues.reduce((acc, i) => {
    if (i.status !== 'resolved') {
      const dept = i.assignedDepartment || 'Unassigned';
      acc[dept] = (acc[dept] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Neighborhood distribution (mock coordinates tracking for Digital Twin)
  const sfNeighborhoods = [
    { name: 'Mission District', coords: [37.76, -122.42], status: 'Critical Load', load: 'High Sanitation risk' },
    { name: 'SOMA / Downtown', coords: [37.77, -122.41], status: 'Heavy Traffic', load: 'Road utilities hazard' },
    { name: 'Tenderloin', coords: [37.78, -122.415], status: 'Active Dispatch', load: 'Safety infrastructure failure' },
    { name: 'Richmond District', coords: [37.78, -122.46], status: 'Stable', load: 'Low maintenance load' }
  ];

  return (
    <div className="space-y-6 page-entrance font-inter">
      {/* Page Header */}
      <div className="border-b border-[rgba(255,255,255,0.04)] pb-4 flex justify-between items-center">
        <div>
          <span className="text-[10px] font-mono text-[#8B8175] uppercase tracking-wider">SYSTEM CENTRAL</span>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-[#F5F5F7] flex items-center gap-2">
            <Radio className="h-5 w-5 text-[#D6C3A5] animate-pulse" />
            Intelligence Center
          </h1>
        </div>
        <div className="flex gap-2">
          <span className="flex items-center gap-1 bg-[rgba(168,102,102,0.05)] text-[#A86666] border border-[#A86666]/30 px-2 py-0.5 rounded text-[10px] font-mono font-medium animate-pulse">
            🚨 {emergencyIssues.length} CRITICAL ALERTS
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 bg-[rgba(255,255,255,0.02)] text-[#D6C3A5] border border-[rgba(255,255,255,0.05)] px-2 py-0.5 rounded text-[10px] font-mono font-medium">
            📡 LIVE SYNC ACTIVE
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Toggles and Load panels */}
        <div className="lg:col-span-4 space-y-6">
          {/* Visual Layer Toggles */}
          <div className="p-5 bg-[rgba(20,20,22,0.65)] border border-[rgba(255,255,255,0.05)] rounded-xl space-y-4">
            <h3 className="text-xs font-semibold text-[#F5F5F7] mb-3 flex items-center gap-1.5 uppercase tracking-wider">
              <Filter className="h-4 w-4 text-[#8B8175]" /> Map Layer Controls
            </h3>
            <div className="space-y-3 font-mono text-[11px] text-[#A1A1AA]">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showHeatmap}
                  onChange={() => setShowHeatmap(!showHeatmap)}
                  className="rounded bg-[#0B0B0C] border-[rgba(255,255,255,0.08)] text-[#D6C3A5] focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span>Active Heatmap Layer</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showDeptLoad}
                  onChange={() => setShowDeptLoad(!showDeptLoad)}
                  className="rounded bg-[#0B0B0C] border-[rgba(255,255,255,0.08)] text-[#D6C3A5] focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span>Department Workload Grid</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showForecast}
                  onChange={() => setShowForecast(!showForecast)}
                  className="rounded bg-[#0B0B0C] border-[rgba(255,255,255,0.08)] text-[#D6C3A5] focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span>AI Predictive Hotspots</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showEmergencies}
                  onChange={() => setShowEmergencies(!showEmergencies)}
                  className="rounded bg-[#0B0B0C] border-[rgba(255,255,255,0.08)] text-[#D6C3A5] focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span className="text-[#A86666] font-semibold">Emergency Alert Layer</span>
              </label>
            </div>

            {/* Quick Category Filters */}
            <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.04)] space-y-2">
              <span className="text-[9px] text-[#8B8175] uppercase font-mono block">Scope Filter</span>
              <div className="flex flex-wrap gap-1.5">
                {['All', 'Infrastructure', 'Sanitation', 'Utilities', 'Safety'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2 py-0.5 text-[9px] font-mono uppercase rounded transition-all cursor-pointer ${
                      activeCategory === cat 
                        ? 'bg-[#D6C3A5] text-[#0B0B0C] font-semibold' 
                        : 'bg-[rgba(255,255,255,0.02)] text-[#A1A1AA] border border-[rgba(255,255,255,0.06)]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Department Workloads */}
          <div className="p-5 bg-[rgba(20,20,22,0.65)] border border-[rgba(255,255,255,0.05)] rounded-xl">
            <h3 className="text-xs font-semibold text-[#F5F5F7] mb-3 flex items-center gap-1.5 uppercase tracking-wider">
              <Activity className="h-4 w-4 text-[#8B8175]" /> Department Load Factor
            </h3>
            <div className="space-y-3 font-mono text-xs">
              {Object.keys(deptCounts).length === 0 ? (
                <p className="text-[10px] text-[#8B8175] italic">No active queues recorded.</p>
              ) : (
                Object.entries(deptCounts).map(([dept, count]) => {
                  const maxCount = Math.max(...Object.values(deptCounts), 1);
                  const percent = Math.round((count / maxCount) * 100);
                  return (
                    <div key={dept} className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="truncate max-w-[190px] text-[#A1A1AA]">{dept}</span>
                        <span className="text-[#D6C3A5] font-semibold">{count} active</span>
                      </div>
                      <div className="w-full bg-[#0B0B0C] h-1 rounded-full overflow-hidden">
                        <div className="bg-[#8B8175] h-full rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Live Digital Twin Map Area */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-4 bg-[rgba(20,20,22,0.65)] border border-[rgba(255,255,255,0.05)] rounded-xl h-[400px]">
            <GoogleMapContainer
              issues={
                activeCategory === 'All'
                  ? issues
                  : issues.filter(i => i.category.toLowerCase().includes(activeCategory.toLowerCase().substring(0, 4)) || i.severity.toLowerCase() === activeCategory.toLowerCase())
              }
              center={{ lat: 37.7749, lng: -122.4194 }}
              zoom={13}
              showHeatmap={showHeatmap}
              theme={mapTheme}
            />
          </div>

          {/* AI Decision Intelligence Panel (PolicyAgent Output) */}
          <div className="p-6 bg-[rgba(20,20,22,0.65)] border border-[rgba(255,255,255,0.05)] rounded-xl">
            <h3 className="text-xs font-semibold text-[#D6C3A5] flex items-center gap-1.5 mb-4 border-b border-[rgba(255,255,255,0.04)] pb-2 uppercase tracking-wider">
              <Brain className="h-4.5 w-4.5 text-[#D6C3A5] stroke-[2]" /> AI Decision Intelligence Agent
            </h3>
            
            {policyLoading ? (
              <div className="flex items-center justify-center py-6 gap-2">
                <Loader2 className="h-4.5 w-4.5 text-[#D6C3A5] animate-spin" />
                <span className="font-mono text-[9.5px] text-[#8B8175] uppercase">PolicyAgent formulating recommendations...</span>
              </div>
            ) : policyData ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                <div className="border border-[rgba(255,255,255,0.04)] p-4 bg-[rgba(255,255,255,0.01)] rounded-lg">
                  <span className="text-[9px] text-[#8B8175] block uppercase tracking-wider mb-1">Pattern Insight</span>
                  <span className="text-[#F5F5F7] font-semibold">{policyData.insights}</span>
                </div>
                <div className="border border-[#D6C3A5]/25 p-4 bg-[rgba(214,195,165,0.02)] rounded-lg">
                  <span className="text-[9px] text-[#D6C3A5] block uppercase tracking-wider mb-1">AI Recommendation</span>
                  <span className="text-[#F5F5F7] font-semibold">{policyData.recommendation}</span>
                </div>
                <div className="border border-[rgba(255,255,255,0.04)] p-4 bg-[rgba(255,255,255,0.01)] rounded-lg">
                  <span className="text-[9px] text-[#8B8175] block uppercase tracking-wider mb-1">Expected Impact</span>
                  <span className="text-[#7C9A7A] font-semibold">{policyData.expectedImpact}</span>
                </div>
              </div>
            ) : (
              <div className="text-center font-mono text-xs text-[#8B8175] py-4 italic">
                PolicyAgent telemetry offline.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Predictive Neighborhood Forecast Section */}
      {showForecast && (
        <div className="p-6 bg-[rgba(20,20,22,0.65)] border border-[rgba(255,255,255,0.05)] rounded-xl">
          <h3 className="text-xs font-semibold text-[#F5F5F7] mb-4 flex items-center gap-2 uppercase tracking-wider">
            <Sparkles className="h-4.5 w-4.5 text-[#D6C3A5] animate-pulse" /> Gemini Predictive Hotspot Modeling
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
            {sfNeighborhoods.map((n, i) => (
              <div key={i} className="border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.01)] p-4 rounded-xl space-y-2.5">
                <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.03)] pb-1.5">
                  <span className="font-semibold text-[#F5F5F7] uppercase text-[10px]">{n.name}</span>
                  <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded ${
                    n.status === 'Stable' 
                      ? 'bg-[rgba(124,154,122,0.04)] text-[#7C9A7A] border border-[#7C9A7A]/30' 
                      : 'bg-[rgba(168,102,102,0.04)] text-[#A86666] border border-[#A86666]/30 animate-pulse'
                  }`}>{n.status}</span>
                </div>
                <div className="space-y-1 text-[11px] text-[#A1A1AA]">
                  <div>Risk Factor: <strong className="text-[#F5F5F7]">{n.load}</strong></div>
                  <div className="text-[#8B8175] text-[10px]">Confidence index: 87%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Infrastructure and Sentiment Analytics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
        {/* 1. Predictive Infrastructure Monitoring */}
        <div className="p-5 bg-[rgba(20,20,22,0.65)] border border-[rgba(255,255,255,0.05)] rounded-xl space-y-3.5">
          <h4 className="font-semibold text-[#F5F5F7] uppercase tracking-wide flex items-center gap-1.5 border-b border-[rgba(255,255,255,0.03)] pb-2 text-[10px]">
            🔮 Infrastructure Health
          </h4>
          <div className="space-y-2.5">
            <div>
              <div className="flex justify-between text-[10px] text-[#A1A1AA]">
                <span>8th & Market Signal</span>
                <span className="text-[#7C9A7A]">91% OK</span>
              </div>
              <div className="w-full bg-[#0B0B0C] h-1 rounded-full mt-1">
                <div className="bg-[#7C9A7A] h-full rounded-full" style={{ width: '91%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-[#A1A1AA]">
                <span>16th St Sewer Grid</span>
                <span className="text-[#B78C52]">68% Structural</span>
              </div>
              <div className="w-full bg-[#0B0B0C] h-1 rounded-full mt-1">
                <div className="bg-[#B78C52] h-full rounded-full" style={{ width: '68%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Resource Allocation Suggestions */}
        <div className="p-5 bg-[rgba(20,20,22,0.65)] border border-[rgba(255,255,255,0.05)] rounded-xl space-y-3.5">
          <h4 className="font-semibold text-[#F5F5F7] uppercase tracking-wide flex items-center gap-1.5 border-b border-[rgba(255,255,255,0.03)] pb-2 text-[10px]">
            ⚙️ Resource Allocation
          </h4>
          <div className="space-y-2 text-[10px] text-[#A1A1AA]">
            <div className="p-2 bg-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.03)] rounded">
              <span className="text-[#D6C3A5] font-bold block mb-0.5">DEPLOY CREW #3</span>
              <span>Reassign road crew to 16th St pothole (Estimated: 2hr resolution).</span>
            </div>
            <div className="p-2 bg-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.03)] rounded">
              <span className="text-[#7C9A7A] font-bold block mb-0.5">SANITATION DISPATCH</span>
              <span>Route inspect vehicle to Mission sanitation complaints heap.</span>
            </div>
          </div>
        </div>

        {/* 3. Community Sentiment Analysis */}
        <div className="p-5 bg-[rgba(20,20,22,0.65)] border border-[rgba(255,255,255,0.05)] rounded-xl space-y-3.5">
          <h4 className="font-semibold text-[#F5F5F7] uppercase tracking-wide flex items-center gap-1.5 border-b border-[rgba(255,255,255,0.03)] pb-2 text-[10px]">
            👥 Public Sentiment Index
          </h4>
          <div className="space-y-2 text-[#A1A1AA] text-[10px]">
            <div className="flex justify-between">
              <span>Overall Sentiment</span>
              <strong className="text-[#7C9A7A]">78% POSITIVE</strong>
            </div>
            <div className="flex justify-between">
              <span>Utility Responsiveness</span>
              <strong className="text-[#7C9A7A]">EXCELLENT</strong>
            </div>
            <div className="flex justify-between">
              <span>Sanitation Sentiment</span>
              <strong className="text-[#B78C52]">NEUTRAL</strong>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

const Loader2: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);
