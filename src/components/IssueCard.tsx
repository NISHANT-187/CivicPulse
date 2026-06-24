import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ArrowUp, MapPin, CheckCircle, Clock, ShieldAlert } from 'lucide-react';
import { Issue } from '../mockData';

interface IssueCardProps {
  issue: Issue;
  onUpvote?: (id: string, e: React.MouseEvent) => void;
  hasUpvoted?: boolean;
}

export const IssueCard: React.FC<IssueCardProps> = ({ issue, onUpvote, hasUpvoted = false }) => {
  // Category styles using premium slate colors
  const getCategoryStyles = (category: Issue['category']) => {
    switch (category) {
      case 'Infrastructure': return 'bg-[#1e2430] text-[#a5b4fc] border-[rgba(165,180,252,0.15)]';
      case 'Sanitation': return 'bg-[#241c30] text-[#d8b4fe] border-[rgba(216,180,254,0.15)]';
      case 'Utilities': return 'bg-[#2a241b] text-[#fde047] border-[rgba(253,224,71,0.15)]';
      case 'Public Safety': return 'bg-[#2a1c1c] text-[#fca5a5] border-[rgba(252,165,165,0.15)]';
      case 'Environment': return 'bg-[#1b2a22] text-[#86efac] border-[rgba(134,239,172,0.15)]';
      case 'Mobility': return 'bg-[#1c2a30] text-[#93c5fd] border-[rgba(147,197,253,0.15)]';
    }
  };

  // Severity styles mapping
  const getSeverityStyles = (severity: Issue['severity']) => {
    switch (severity) {
      case 'Critical': return 'border-[#A86666]/35 bg-[rgba(168,102,102,0.02)]';
      case 'High': return 'border-[#B78C52]/35 bg-[rgba(183,140,82,0.02)]';
      case 'Medium': return 'border-[rgba(255,255,255,0.05)]';
      case 'Low': return 'border-[rgba(255,255,255,0.05)]';
    }
  };

  // Status badge helper
  const getStatusBadge = (status: Issue['status']) => {
    const baseClass = "inline-flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border";
    switch (status) {
      case 'reported':
        return (
          <span className={`${baseClass} text-[#A1A1AA] bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)]`}>
            <Clock className="h-2.5 w-2.5" /> Reported
          </span>
        );
      case 'verified':
        return (
          <span className={`${baseClass} text-[#D6C3A5] bg-[rgba(214,195,165,0.05)] border-[rgba(214,195,165,0.15)] animate-pulse`}>
            <CheckCircle className="h-2.5 w-2.5" /> AI Verified
          </span>
        );
      case 'assigned':
        return (
          <span className={`${baseClass} text-[#8B8175] bg-[rgba(139,129,117,0.05)] border-[rgba(139,129,117,0.15)]`}>
            <ShieldAlert className="h-2.5 w-2.5" /> Assigned
          </span>
        );
      case 'in_progress':
        return (
          <span className={`${baseClass} text-[#B78C52] bg-[rgba(183,140,82,0.05)] border-[rgba(183,140,82,0.15)]`}>
            <Clock className="h-2.5 w-2.5" /> In Progress
          </span>
        );
      case 'resolved':
        return (
          <span className={`${baseClass} text-[#7C9A7A] bg-[rgba(124,154,122,0.05)] border-[rgba(124,154,122,0.15)]`}>
            <CheckCircle className="h-2.5 w-2.5" /> Resolved
          </span>
        );
    }
  };

  return (
    <div className={`p-5 bg-[rgba(20,20,22,0.65)] border rounded-xl flex flex-col justify-between backdrop-blur-md shadow-premium hover:border-[rgba(214,195,165,0.15)] transition-all duration-200 ${getSeverityStyles(issue.severity)}`}>
      <div>
        {/* Header tags */}
        <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${getCategoryStyles(issue.category)}`}>
              {issue.category}
            </span>
            {getStatusBadge(issue.status)}
          </div>
          <span className="font-mono text-[9px] text-[#8B8175]">
            {new Date(issue.reportedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Title */}
        <Link to={`/issues/${issue.id}`} className="hover:text-[#D6C3A5] transition-colors">
          <h3 className="text-sm font-semibold leading-snug mb-1 text-[#F5F5F7] tracking-tight uppercase">
            {issue.title}
          </h3>
        </Link>

        {/* Location */}
        <div className="flex items-center gap-1 text-[10px] text-[#A1A1AA] mb-3">
          <MapPin className="h-3 w-3 flex-shrink-0 text-[#8B8175]" />
          <span className="truncate">{issue.address}</span>
        </div>

        {/* Description Snippet */}
        <p className="text-[11px] text-[#A1A1AA] font-light line-clamp-2 mb-4 leading-relaxed bg-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.03)] p-2 rounded-md">
          {issue.description}
        </p>
      </div>

      {/* Footer statistics & interaction */}
      <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.04)] pt-3 mt-auto">
        <button
          onClick={(e) => onUpvote && onUpvote(issue.id, e)}
          className={`flex items-center gap-1.5 px-2.5 py-1 border rounded text-[10px] font-mono font-medium transition-all duration-150 cursor-pointer ${
            hasUpvoted
              ? 'bg-[#D6C3A5] text-[#0B0B0C] border-[#D6C3A5]'
              : 'bg-transparent text-[#F5F5F7] border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.12)]'
          }`}
        >
          <ArrowUp className="h-3 w-3 stroke-[2]" />
          <span>{issue.upvotes} Upvotes</span>
        </button>

        <div className="flex items-center gap-3 text-[10px] font-mono text-[#8B8175]">
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            {issue.comments.length}
          </span>
          <Link
            to={`/issues/${issue.id}`}
            className="text-[9px] font-semibold uppercase tracking-wider text-[#D6C3A5] hover:text-white"
          >
            Details &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};
