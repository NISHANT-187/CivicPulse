import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Filter, ShieldCheck, CheckCircle2, ChevronRight, Cpu } from 'lucide-react';
import { Issue } from '../mockData';

interface MunicipalPortalProps {
  issues: Issue[];
  updateIssueStatus: (id: string, newStatus: Issue['status'], officerName: string) => void;
}

export const MunicipalPortal: React.FC<MunicipalPortalProps> = ({ issues, updateIssueStatus }) => {
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [officerName, setOfficerName] = useState('Officer Martinez');

  const departments = [
    'All',
    'Public Works Department',
    'Sanitation & Recycling Division',
    'Public Utilities Commission',
    'Community Safety & Police Division',
    'Environmental Protection Department',
    'Municipal Transit Agency',
    'Recreation & Parks Department'
  ];

  // Apply filter
  const filteredIssues = issues.filter((issue) => {
    if (departmentFilter === 'All') return true;
    return issue.assignedDepartment === departmentFilter;
  });

  const handleStatusChange = (issueId: string, _currentStatus: Issue['status'], nextStatus: Issue['status']) => {
    updateIssueStatus(issueId, nextStatus, officerName);

    if (nextStatus === 'resolved') {
      // Trigger canvas-confetti fireworks for resolution!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C6FF00', '#7B5CFF', '#00F2FF']
      });
    }
  };

  const statusOrder: Issue['status'][] = ['reported', 'verified', 'assigned', 'in_progress', 'resolved'];

  const getSeverityBadge = (severity: Issue['severity']) => {
    switch (severity) {
      case 'Critical': return 'bg-danger/10 text-danger border-danger';
      case 'High': return 'bg-orange-500/10 text-orange-400 border-orange-500';
      case 'Medium': return 'bg-secondary/10 text-secondary border-secondary';
      case 'Low': return 'bg-surface text-textMuted border-brutalBorder';
    }
  };

  return (
    <div className="container mx-auto px-4 mt-6 max-w-5xl space-y-6">
      {/* Header */}
      <div className="border-b-2 border-brutalBorder pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-anton text-textPrimary tracking-tight uppercase leading-none">
            Municipal <span className="text-secondary text-glowPurple font-bold">Action Portal</span>
          </h1>
          <p className="text-textMuted text-xs font-mono uppercase mt-1">
            Internal console for routing validation & maintenance crew dispatch
          </p>
        </div>

        {/* Officer name config */}
        <div className="flex items-center gap-2 border border-brutalBorder bg-surface px-3 py-1 text-xs font-mono">
          <span className="text-textMuted font-bold uppercase text-[10px]">Active Officer:</span>
          <input
            type="text"
            value={officerName}
            onChange={(e) => setOfficerName(e.target.value)}
            className="bg-transparent border-0 outline-none text-primary font-bold w-32 focus:ring-0 text-xs p-0"
          />
        </div>
      </div>

      {/* Selector & Filters */}
      <div className="glass-card-brutal border-2 border-brutalBorder p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-space font-bold uppercase text-textMuted w-full sm:w-auto">
          <Filter className="h-4 w-4" />
          <span>Department Queue:</span>
        </div>
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="glass-input text-xs py-2 px-3 w-full sm:w-72"
        >
          {departments.map((dept) => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      {/* Main Queue List */}
      <div className="space-y-4">
        {filteredIssues.length === 0 ? (
          <div className="glass-card-brutal border-2 border-brutalBorder p-12 text-center flex flex-col items-center justify-center">
            <ShieldCheck className="h-12 w-12 text-primary mb-3" />
            <h3 className="font-space font-bold uppercase text-textPrimary text-sm">All cleared for department</h3>
            <p className="text-xs text-textMuted mt-1">No active unresolved tickets in this department queue.</p>
          </div>
        ) : (
          filteredIssues.map((issue) => {
            const currentStatusIdx = statusOrder.indexOf(issue.status);
            const nextStatus = currentStatusIdx < statusOrder.length - 1 ? statusOrder[currentStatusIdx + 1] : null;

            return (
              <div
                key={issue.id}
                className={`glass-card-brutal border-2 border-brutalBorder p-5 flex flex-col md:flex-row gap-5 items-start justify-between hover:border-secondary transition-all ${
                  issue.status === 'resolved' ? 'border-primary/20 bg-primary/2 shadow-none opacity-80' : ''
                }`}
              >
                {/* Details column */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[9px] font-mono text-textMuted uppercase font-bold">TICKET: {issue.id}</span>
                    <span className={`text-[9px] font-space font-bold uppercase px-2 py-0.5 border border-black ${getSeverityBadge(issue.severity)}`}>
                      {issue.severity}
                    </span>
                    <span className="text-[10px] font-mono text-tertiary bg-tertiary/10 border border-tertiary/20 px-2 py-0.5 font-bold uppercase">
                      {issue.assignedDepartment || 'UNROUTED'}
                    </span>
                  </div>

                  <h3 className="font-space font-bold uppercase text-base text-textPrimary leading-tight">
                    {issue.title}
                  </h3>

                  <p className="text-xs font-mono text-textMuted">📍 Address: {issue.address}</p>

                  <div className="bg-black/45 p-3 border border-brutalBorder text-[11px] font-inter text-textPrimary/80 leading-relaxed max-h-24 overflow-y-auto">
                    {issue.description}
                  </div>

                  {/* AI routing notes snippet */}
                  <div className="flex items-center gap-2 text-[10px] font-mono text-primary bg-primary/5 p-2 border border-primary/20">
                    <Cpu className="h-4 w-4 animate-pulse flex-shrink-0" />
                    <span><strong>AI Prediction Model:</strong> Routed to <strong>{issue.assignedDepartment}</strong>. Priority metrics derived from {issue.upvotes} upvotes.</span>
                  </div>
                </div>

                {/* Progress actions column */}
                <div className="md:w-64 w-full border-t md:border-t-0 md:border-l border-brutalBorder/60 pt-4 md:pt-0 md:pl-5 flex flex-col justify-between h-full space-y-4">
                  <div>
                    <span className="block font-space font-bold text-[10px] text-textMuted uppercase mb-1">Status Flow</span>
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <span className="text-textMuted uppercase">Current:</span>
                      <strong className={`uppercase ${
                        issue.status === 'resolved' ? 'text-primary' : 'text-textPrimary'
                      }`}>
                        {issue.status.replace('_', ' ')}
                      </strong>
                    </div>
                  </div>

                  {/* Flow Action Button */}
                  {nextStatus ? (
                    <button
                      onClick={() => handleStatusChange(issue.id, issue.status, nextStatus)}
                      className="w-full py-2.5 px-3 border-2 border-black bg-primary text-darkBg font-space font-bold uppercase text-xs shadow-brutalLime hover:bg-white transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer flex items-center justify-center gap-1"
                    >
                      Advance to {nextStatus.replace('_', ' ')} <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <div className="w-full py-2.5 px-3 border border-dashed border-primary/40 bg-primary/5 text-primary text-center font-mono text-xs uppercase font-bold flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" /> Fully Resolved
                    </div>
                  )}

                  <div className="text-[9px] font-mono text-textMuted leading-tight">
                    Each stage transition triggers immediate citizen email logs & platform updates.
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
