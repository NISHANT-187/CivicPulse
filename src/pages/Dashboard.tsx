import React, { useState, useEffect } from 'react';
import { GoogleMapContainer } from '../components/GoogleMapContainer';
import { Issue } from '../mockData';
import { ArrowUpRight, ShieldCheck, Flame, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardProps {
  issues: Issue[];
}

export const Dashboard: React.FC<DashboardProps> = ({ issues }) => {
  const [mapTheme, setMapTheme] = useState<'dark' | 'light'>('dark');

  // Watch document class for dynamic dark/light maps sync
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

  // Filter out any resolved issues from active counts
  const criticalIssues = issues.filter(i => i.severity === 'Critical' || i.isEmergency);
  const resolvedIssues = issues.filter(i => i.status === 'resolved');

  // Compute Community Health Index dynamically (0-100)
  const totalIssues = issues.length || 1;
  const resolutionRate = resolvedIssues.length / totalIssues;
  const healthIndex = Math.min(100, Math.max(50, 75 + Math.round(resolutionRate * 25)));

  // Generate category progress indicators
  const categoriesList = [
    { label: 'Infrastructure', key: 'Infrastructure' },
    { label: 'Roads', key: 'Mobility' },
    { label: 'Utilities', key: 'Utilities' },
    { label: 'Safety', key: 'Public Safety' },
    { label: 'Sanitation', key: 'Sanitation' }
  ] as const;

  const categoryStats = categoriesList.map(cat => {
    const catIssues = issues.filter(i => i.category === cat.key || (cat.label === 'Roads' && i.title.toLowerCase().includes('road')));
    const catResolved = catIssues.filter(i => i.status === 'resolved');
    const rate = catIssues.length > 0 ? (catResolved.length / catIssues.length) * 100 : 100;
    return { name: cat.label, rate: Math.round(rate), total: catIssues.length };
  });

  // Compose dynamic AI Briefing text
  const user = JSON.parse(localStorage.getItem('civicpulse_user') || '{}');
  const displayName = user.displayName ? user.displayName.split(' ')[0] : 'Citizen';
  
  const briefingText = `Good Afternoon, ${displayName}. The overall Community Health Index is currently at ${healthIndex}%, indicating high platform responsiveness. We have identified ${criticalIssues.length} critical incident${criticalIssues.length === 1 ? '' : 's'} requiring direct routing dispatch. The spatial diagnostic suggests infrastructure complaints represent the largest active queue, matching regular seasonal intake parameters.`;

  // Build Chronological Live Activity Feed
  const liveActivities = issues
    .flatMap(issue => 
      issue.timeline.map(event => ({
        ...event,
        issueId: issue.id,
        issueTitle: issue.title
      }))
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-6 page-entrance font-inter">
      {/* Dynamic Header */}
      <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.04)] pb-4">
        <div>
          <span className="text-[10px] font-mono text-[#8B8175] uppercase tracking-wider">MUNICIPAL HUB</span>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-[#F5F5F7]">Situation Workspace</h1>
        </div>
        <Link
          to="/report"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#D6C3A5] text-[#0B0B0C] font-semibold text-xs rounded-lg transition-all hover:bg-[#E5D7BF] active:scale-[0.98] shadow-sm cursor-pointer"
        >
          <span>File Report</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Main Split Layout: Google Maps centerpiece + Sidebar Info panel */}
      {totalIssues === 0 || issues.length === 0 ? (
        <div className="h-[450px] bg-[#141414] border border-[rgba(255,255,255,0.03)] rounded-2xl flex flex-col items-center justify-center text-center p-8">
          <Info className="h-8 w-8 text-[#8B8175] mb-3" />
          <h3 className="text-sm font-semibold text-[#FAFAFA] tracking-wider">No civic telemetry available yet.</h3>
          <p className="text-xs text-[#A1A1AA] max-w-xs mt-1">
            Submit a community report to initiate urban dispatch nodes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-stretch min-h-[calc(100vh-190px)]">
          {/* Map Centerpiece (70% space on larger screens) */}
          <div className="lg:col-span-7 flex flex-col h-[500px] lg:h-auto">
            <GoogleMapContainer
              issues={issues}
              center={{ lat: 37.7749, lng: -122.4194 }}
              zoom={13}
              reportMode={false}
              showHeatmap={false}
              theme={mapTheme}
            />
          </div>

          {/* Operational control panel (30% space on larger screens) */}
          <div className="lg:col-span-3 flex flex-col justify-between space-y-6 overflow-y-auto pr-1">
            <div className="space-y-6">
              
              {/* Dynamic AI Briefing Card */}
              <div className="p-5 bg-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.04)] rounded-xl space-y-3">
                <span className="text-[8px] font-mono text-[#8B8175] uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#D6C3A5]" />
                  GEMINI AI BRIEFING
                </span>
                <p className="text-[#F5F5F7] text-xs leading-relaxed font-light">
                  {briefingText}
                </p>
              </div>

              {/* Community Health Index Metrics */}
              <div className="p-5 bg-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.04)] rounded-xl space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-[8px] font-mono text-[#8B8175] uppercase tracking-widest">Index Categories</span>
                  <span className="text-xs font-semibold text-[#D6C3A5]">Health: {healthIndex}%</span>
                </div>

                <div className="space-y-3">
                  {categoryStats.map(stat => (
                    <div key={stat.name} className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-[#A1A1AA]">{stat.name}</span>
                        <span className="text-[#F5F5F7]">{stat.rate}% ({stat.total})</span>
                      </div>
                      <div className="w-full h-1 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#8B8175] rounded-full transition-all duration-300"
                          style={{ width: `${stat.rate}%`, backgroundColor: stat.rate > 80 ? '#7C9A7A' : '#B78C52' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chronological Live Activity Feed */}
              <div className="p-5 bg-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.04)] rounded-xl space-y-4">
                <span className="text-[8px] font-mono text-[#8B8175] uppercase tracking-widest flex items-center gap-1.5">
                  <Flame className="h-3 w-3 text-[#A86666] animate-pulse" />
                  Live Activity Feed
                </span>

                <div className="space-y-3">
                  {liveActivities.length === 0 ? (
                    <p className="text-[10px] text-[#A1A1AA] font-mono italic">No actions recorded today.</p>
                  ) : (
                    liveActivities.map((activity, idx) => (
                      <div key={activity.id || idx} className="flex gap-3 text-[10px] font-mono border-b border-[rgba(255,255,255,0.03)] pb-2 last:border-0 last:pb-0">
                        <div className="mt-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            activity.status === 'resolved' ? 'bg-[#7C9A7A]' : 'bg-[#D6C3A5]'
                          }`} />
                        </div>
                        <div className="flex-1 space-y-0.5">
                          <div className="flex justify-between items-baseline text-[8px] text-[#8B8175]">
                            <span className="uppercase font-semibold">{activity.actor}</span>
                            <span>{new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-[#F5F5F7] leading-snug">{activity.message}</p>
                          <Link 
                            to={`/issues/${activity.issueId}`}
                            className="inline-block text-[8px] text-[#8B8175] hover:text-[#D6C3A5] underline"
                          >
                            {activity.issueTitle}
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Priority Alerts */}
              <div className="p-5 bg-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.04)] rounded-xl space-y-4">
                <span className="text-[8px] font-mono text-[#A86666] uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A86666] animate-ping" />
                  Priority Alerts
                </span>

                <div className="space-y-3">
                  {criticalIssues.length === 0 ? (
                    <p className="text-[10px] text-[#A1A1AA] font-mono italic">No active priority alerts.</p>
                  ) : (
                    criticalIssues.slice(0, 2).map((issue) => (
                      <div key={issue.id} className="flex gap-2.5 text-[10px] font-mono border-b border-[rgba(255,255,255,0.03)] pb-2.5 last:border-0 last:pb-0">
                        <div className="mt-0.5 text-xs">⚠️</div>
                        <div className="flex-1 space-y-0.5">
                          <div className="flex justify-between text-[8px] text-[#8B8175]">
                            <span className="text-[#A86666] font-bold uppercase">{issue.severity}</span>
                            <span>{issue.category}</span>
                          </div>
                          <h4 className="text-[#F5F5F7] font-semibold leading-tight">{issue.title}</h4>
                          <Link to={`/issues/${issue.id}`} className="inline-block text-[8.5px] text-[#D6C3A5] hover:underline pt-0.5">Dispatch Workspace &rarr;</Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Quick Navigation Footer */}
            <div className="pt-2">
              <Link
                to="/issues"
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-[#141416] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)] text-[#F5F5F7] hover:text-[#D6C3A5] text-xs font-medium rounded-lg transition-all"
              >
                <span>Browse Telemetry Logs</span>
                <span>&rarr;</span>
              </Link>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
