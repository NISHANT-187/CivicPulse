import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, User, Calendar, ShieldAlert, ArrowUp, MessageSquare, Plus, ShieldCheck, Brain, Wrench } from 'lucide-react';
import { Issue } from '../mockData';

interface IssueDetailsProps {
  issues: Issue[];
  onUpvote: (id: string, e: React.MouseEvent) => void;
  hasUpvoted: (id: string) => boolean;
  addComment: (issueId: string, comment: string, author: string) => void;
}

export const IssueDetails: React.FC<IssueDetailsProps> = ({
  issues,
  onUpvote,
  hasUpvoted,
  addComment
}) => {
  const { id } = useParams<{ id: string }>();
  const issue = issues.find((i) => i.id === id);

  const [commentText, setCommentText] = useState('');
  const [commenterName, setCommenterName] = useState('');

  if (!issue) {
    return (
      <div className="p-8 text-center bg-[#141416] border border-[rgba(255,255,255,0.05)] rounded-2xl">
        <h3 className="text-sm font-semibold text-[#F5F5F7] uppercase">Issue not found</h3>
        <p className="text-xs text-[#A1A1AA] mt-1">The requested ticket is unavailable.</p>
        <Link to="/issues" className="mt-4 inline-block btn-primary">
          Return to Explorer
        </Link>
      </div>
    );
  }

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !commenterName.trim()) return;
    addComment(issue.id, commentText, commenterName);
    setCommentText('');
    setCommenterName('');
  };

  const getCategoryStyles = (category: Issue['category']) => {
    switch (category) {
      case 'Infrastructure': return 'bg-[#1e2430] text-[#a5b4fc] border-[rgba(165,180,252,0.15)]';
      case 'Sanitation': return 'bg-[#241c30] text-[#d8b4fe] border-[rgba(216,180,254,0.15)]';
      case 'Utilities': return 'bg-[#2a241b] text-[#fde047] border-[rgba(253,224,71,0.15)]';
      case 'Public Safety': return 'bg-[#2a1c1c] text-[#fca5a5] border-[rgba(252,165,165,0.15)]';
      case 'Environment': return 'bg-[#1b2a22] text-[#86efac] border-[rgba(134,239,172,0.15)]';
      case 'Mobility': return 'bg-[#1c2a30] text-[#93c5fd] border-[rgba(147,197,253,0.15)]';
      default: return 'bg-[rgba(255,255,255,0.02)] text-[#A1A1AA] border-[rgba(255,255,255,0.05)]';
    }
  };

  const getStatusStyles = (status: Issue['status']) => {
    switch (status) {
      case 'reported': return 'text-[#A1A1AA] border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)]';
      case 'verified': return 'text-[#D6C3A5] border-[rgba(214,195,165,0.15)] bg-[rgba(214,195,165,0.05)] animate-pulse';
      case 'assigned': return 'text-[#8B8175] border-[rgba(139,129,117,0.15)] bg-[rgba(139,129,117,0.05)]';
      case 'in_progress': return 'text-[#B78C52] border-[rgba(183,140,82,0.15)] bg-[rgba(183,140,82,0.05)]';
      case 'resolved': return 'text-[#7C9A7A] border-[rgba(124,154,122,0.15)] bg-[rgba(124,154,122,0.05)]';
      default: return 'text-[#A1A1AA] border-[rgba(255,255,255,0.05)] bg-transparent';
    }
  };

  // Safe parsing of custom V2 fields
  let priorityReasons: string[] = [];
  try {
    if (issue.priorityReasonsJson) {
      priorityReasons = JSON.parse(issue.priorityReasonsJson);
    }
  } catch (e) {
    // defaults
  }
  if (priorityReasons.length === 0) {
    priorityReasons = ["Proximity cluster detection alert", "Public density zone", "Citizen verified approval"];
  }

  let resolutionPlan: { complexity?: string; resolutionWindow?: string; requiredResources?: string[] } = {};
  try {
    if (issue.resolutionPlanJson) {
      resolutionPlan = JSON.parse(issue.resolutionPlanJson);
    }
  } catch (e) {
    // defaults
  }
  const complexity = resolutionPlan.complexity || "Medium";
  const resolutionWindow = resolutionPlan.resolutionWindow || "1-3 Days";
  const requiredResources = resolutionPlan.requiredResources || ["Road crew", "Asphalt patch kit", "Safety barricades"];

  const verificationsCount = issue.verificationsCount || 0;
  const isCommunityVerified = verificationsCount >= 5;

  return (
    <div className="space-y-6 page-entrance font-inter">
      {/* Back link */}
      <Link
        to="/issues"
        className="inline-flex items-center gap-1.5 text-xs font-mono uppercase text-[#8B8175] hover:text-[#D6C3A5] transition-colors mb-2"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Issue Explorer
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Detail Overview */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Card */}
          <div className="p-6 bg-[rgba(20,20,22,0.65)] border border-[rgba(255,255,255,0.05)] rounded-xl backdrop-blur-md shadow-premium">
            {/* Header badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${getCategoryStyles(issue.category)}`}>
                {issue.category}
              </span>
              <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] text-[#A1A1AA]`}>
                Severity: {issue.severity}
              </span>
              <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${getStatusStyles(issue.status)}`}>
                Status: {issue.status.toUpperCase().replace('_', ' ')}
              </span>
              <span className="ml-auto font-mono text-[9px] text-[#8B8175]">
                ID: {issue.id}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-xl md:text-2xl font-semibold text-[#F5F5F7] tracking-tight uppercase leading-tight mb-3">
              {issue.title}
            </h2>

            {/* Community verified status indicator */}
            {isCommunityVerified && (
              <div className="inline-flex items-center gap-1.5 bg-[rgba(214,195,165,0.04)] text-[#D6C3A5] border border-[rgba(214,195,165,0.15)] px-3 py-1 rounded-md text-xs font-medium tracking-wide mb-4 animate-pulse">
                <ShieldCheck className="h-4 w-4 text-[#D6C3A5]" />
                Verified Community Report ({verificationsCount} approvals)
              </div>
            )}

            {/* Sub details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-y border-[rgba(255,255,255,0.04)] py-4 mb-4 text-xs font-mono text-[#8B8175]">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-[#D6C3A5] flex-shrink-0" />
                <span className="truncate">{issue.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-[#8B8175] flex-shrink-0" />
                <span>Filed by: <strong className="text-[#F5F5F7]">{issue.reportedBy}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-[#7C9A7A] flex-shrink-0" />
                <span>Submitted: <strong className="text-[#F5F5F7]">{new Date(issue.reportedAt).toLocaleString()}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-3.5 w-3.5 text-[#B78C52] flex-shrink-0" />
                <span>Assigned: <strong className="text-[#F5F5F7]">{issue.assignedDepartment || 'Pending Dispatch'}</strong></span>
              </div>
            </div>

            {/* Main description details */}
            <div className="space-y-4">
              <div>
                <span className="block font-mono text-[9px] text-[#8B8175] uppercase tracking-widest mb-1.5">Detailed Description</span>
                <div className="bg-[rgba(255,255,255,0.01)] p-4 border border-[rgba(255,255,255,0.03)] rounded-lg text-xs leading-relaxed text-[#F5F5F7] whitespace-pre-line">
                  {issue.description}
                </div>
              </div>

              {issue.imageUrl && (
                <div>
                  <span className="block font-mono text-[9px] text-[#8B8175] uppercase tracking-widest mb-1.5">Attached Image</span>
                  <img src={issue.imageUrl} alt="Incident File" className="max-h-72 border border-[rgba(255,255,255,0.06)] rounded-lg object-cover" />
                </div>
              )}
            </div>

            {/* Upvote controls & metrics */}
            <div className="flex flex-wrap items-center justify-between gap-4 mt-6 border-t border-[rgba(255,255,255,0.04)] pt-4">
              <button
                onClick={(e) => onUpvote(issue.id, e)}
                className={`flex items-center gap-2 px-4 py-2 border rounded font-medium text-xs transition-all duration-150 cursor-pointer ${
                  hasUpvoted(issue.id)
                    ? 'bg-[#D6C3A5] text-[#0B0B0C] border-[#D6C3A5]'
                    : 'bg-transparent text-[#F5F5F7] border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.04)]'
                }`}
              >
                <ArrowUp className="h-3.5 w-3.5 stroke-[2]" />
                <span>{hasUpvoted(issue.id) ? 'Vouched & Upvoted' : 'Verify & Upvote ("Me Too")'}</span>
              </button>

              <div className="flex items-center gap-4 font-mono text-xs text-[#8B8175]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#D6C3A5]" />
                  <span>Vouched: </span>
                  <span className="font-bold text-[#F5F5F7]">{verificationsCount}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#7C9A7A]" />
                  <span>Impact Score: </span>
                  <span className="font-bold text-[#F5F5F7]">{issue.upvotes * 2 + (issue.severity === 'Critical' ? 50 : 20)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Discussion section */}
          <div className="p-6 bg-[rgba(20,20,22,0.65)] border border-[rgba(255,255,255,0.05)] rounded-xl backdrop-blur-md shadow-premium">
            <h3 className="font-semibold text-sm text-[#F5F5F7] flex items-center gap-2 mb-6 uppercase tracking-wider">
              <MessageSquare className="h-4 w-4 text-[#8B8175]" /> Citizen Forum ({issue.comments.length} Comments)
            </h3>

            {/* List of comments */}
            <div className="space-y-4 mb-6">
              {issue.comments.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-[rgba(255,255,255,0.04)] text-[#8B8175] font-mono text-xs rounded-lg">
                  No comments posted yet. Be the first to start discussion!
                </div>
              ) : (
                issue.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`flex items-start gap-3 p-4 border rounded-lg ${
                      comment.role === 'official'
                        ? 'bg-[rgba(214,195,165,0.02)] border-[#D6C3A5]/20'
                        : 'bg-[rgba(255,255,255,0.01)] border-[rgba(255,255,255,0.04)]'
                    }`}
                  >
                    <img src={comment.avatar} alt="Avatar" className="w-7 h-7 rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#141416] shrink-0" />
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs font-semibold text-[#F5F5F7] flex items-center gap-1">
                          {comment.author}
                          {comment.role === 'official' && (
                            <span className="text-[8px] bg-[rgba(214,195,165,0.06)] border border-[#D6C3A5]/30 text-[#D6C3A5] font-mono px-1.5 py-0.5 rounded uppercase">OFFICIAL</span>
                          )}
                        </span>
                        <span className="text-[9px] font-mono text-[#8B8175]">{new Date(comment.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <p className="text-xs text-[#A1A1AA] font-light leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment box */}
            <form onSubmit={handleCommentSubmit} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={commenterName}
                  onChange={(e) => setCommenterName(e.target.value)}
                  className="sm:w-1/4 glass-input py-2 text-xs"
                />
                <input
                  type="text"
                  required
                  placeholder="Share details, updates, or vouch for resolution..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 glass-input py-2 text-xs"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D6C3A5] text-[#0B0B0C] hover:bg-[#E5D7BF] font-semibold text-xs rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Post
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: Explainable AI Priority & Action Plan */}
        <div className="lg:col-span-4 space-y-6">
          {/* Explainable AI Priority Score Card */}
          <div className="p-5 bg-[rgba(214,195,165,0.01)] border border-[#D6C3A5]/15 rounded-xl">
            <h3 className="text-xs font-semibold text-[#D6C3A5] flex items-center gap-1.5 mb-4 border-b border-[#D6C3A5]/15 pb-2 uppercase tracking-wider">
              <Brain className="h-4 w-4 stroke-[2]" /> Explainable AI Priority
            </h3>

            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <span className="text-3xl font-bold text-[#D6C3A5]">
                  {issue.priorityScore || 78}
                </span>
                <span className="text-xs text-[#8B8175] font-mono">/100</span>
              </div>
              <span className="text-[9px] bg-[rgba(214,195,165,0.06)] border border-[#D6C3A5]/30 text-[#D6C3A5] font-bold px-2 py-0.5 rounded uppercase">
                AI Dispatch Tier
              </span>
            </div>

            {/* Triage reasons bulleted list */}
            <div className="space-y-2">
              <span className="text-[8px] text-[#8B8175] uppercase font-mono block tracking-wider">Triage Decision Indicators</span>
              <ul className="space-y-1.5 text-[11px] font-mono text-[#A1A1AA]">
                {priorityReasons.map((reason, index) => (
                  <li key={index} className="flex items-start gap-1.5">
                    <span className="text-[#D6C3A5] mt-0.5">✔</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* AI Resolution action plan */}
          <div className="p-5 bg-[rgba(124,154,122,0.01)] border border-[#7C9A7A]/15 rounded-xl">
            <h3 className="text-xs font-semibold text-[#7C9A7A] flex items-center gap-1.5 mb-4 border-b border-[#7C9A7A]/15 pb-2 uppercase tracking-wider">
              <Wrench className="h-4 w-4 stroke-[2]" /> AI Resource Planner
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <span className="text-[8px] text-[#8B8175] block uppercase tracking-wider">Complexity Rating</span>
                <span className="font-bold text-[#F5F5F7] uppercase">{complexity}</span>
              </div>

              <div>
                <span className="text-[8px] text-[#8B8175] block uppercase tracking-wider">Estimated Window</span>
                <span className="font-bold text-[#7C9A7A]">{resolutionWindow}</span>
              </div>

              <div>
                <span className="text-[8px] text-[#8B8175] block uppercase tracking-wider mb-1.5">Required Equip &amp; Crews</span>
                <div className="flex flex-wrap gap-1">
                  {requiredResources.map((res, index) => (
                    <span key={index} className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] px-2 py-0.5 text-[9px] uppercase font-bold text-[#F5F5F7] rounded">
                      {res}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Tracking */}
          <div className="p-5 bg-[rgba(20,20,22,0.65)] border border-[rgba(255,255,255,0.05)] rounded-xl">
            <h3 className="text-xs font-semibold text-[#F5F5F7] mb-4 border-b border-[rgba(255,255,255,0.04)] pb-2 uppercase tracking-wider">
              Incident Dispatch Logs
            </h3>
            <div className="relative border-l border-[rgba(255,255,255,0.05)] pl-4 ml-1 space-y-4">
              {issue.timeline.map((log) => (
                <div key={log.id} className="relative text-xs">
                  {/* Dot */}
                  <span className="absolute -left-[20.5px] top-1.5 w-1.5 h-1.5 rounded-full bg-[#D6C3A5]" />
                  <div className="flex justify-between items-baseline font-mono text-[8px] text-[#8B8175]">
                    <span className="uppercase font-semibold">{log.actor}</span>
                    <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-[#A1A1AA] font-light mt-0.5 leading-relaxed">{log.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
