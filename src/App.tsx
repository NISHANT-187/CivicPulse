import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { INITIAL_ISSUES, INITIAL_LEADERBOARD, Issue, Comment, ActivityLog, LeaderboardUser } from './mockData';
import { NavigationRail } from './components/NavigationRail';
import { AIAssistant } from './components/AIAssistant';
import { Dashboard } from './pages/Dashboard';
import { Issues } from './pages/Issues';
import { ReportIssue } from './pages/ReportIssue';
import { IssueDetails } from './pages/IssueDetails';
import { Leaderboard } from './pages/Leaderboard';
import { CommandCenter } from './pages/CommandCenter';
import { LandingPage } from './pages/LandingPage';
import { listenToIssues } from './firebase';
import { useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { IssueService } from './services/issueService';

export const App: React.FC = () => {
  // Primary States
  const [issues, setIssues] = useState<Issue[]>(INITIAL_ISSUES);

  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>(() => {
    const saved = localStorage.getItem('civicpulse_leaderboard');
    return saved ? JSON.parse(saved) : INITIAL_LEADERBOARD;
  });

  const [userPoints, setUserPoints] = useState<number>(() => {
    const saved = localStorage.getItem('civicpulse_userpoints');
    return saved ? parseInt(saved, 10) : 480;
  });

  const [chatOpen, setChatOpen] = useState(false);

  const navigate = useNavigate();
  const { user, logout, loginStage } = useAuth();

  const activeUsername = user?.displayName || "Nishant";

  // Theme state: 'dark' | 'light'
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('civicpulse_theme');
    return (saved === 'light' ? 'light' : 'dark');
  });

  // Fetch issues on mount and subscribe to Firestore snapshot streams
  useEffect(() => {
    const loadIssues = async () => {
      const dbIssues = await IssueService.getIssues(INITIAL_ISSUES);
      setIssues(dbIssues);
    };

    // Firebase real-time subscription
    const unsubscribe = listenToIssues((realTimeIssues) => {
      setIssues(realTimeIssues.map(item => ({
        ...item,
        reportedAt: item.reportedAt || new Date().toISOString(),
        upvotedUsers: item.upvotedUsers || [],
        comments: item.comments || [],
        timeline: item.timeline || []
      })));
    }, INITIAL_ISSUES);

    loadIssues();
    return () => unsubscribe();
  }, []);

  // Theme effect
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('civicpulse_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  // Sync caches
  useEffect(() => {
    localStorage.setItem('civicpulse_leaderboard', JSON.stringify(leaderboard));
  }, [leaderboard]);

  useEffect(() => {
    localStorage.setItem('civicpulse_userpoints', userPoints.toString());
  }, [userPoints]);


  // Points incrementer
  const handleAddPoints = (points: number) => {
    setUserPoints((prev) => {
      const nextPoints = prev + points;
      setLeaderboard((prevBoard) => {
        const boardHasUser = prevBoard.some((u) => u.username === activeUsername);
        if (boardHasUser) {
          return prevBoard
            .map((u) => (u.username === activeUsername ? { ...u, points: nextPoints } : u))
            .sort((a, b) => b.points - a.points)
            .map((u, index) => ({ ...u, rank: index + 1 }));
        } else {
          const newEntry: LeaderboardUser = {
            rank: prevBoard.length + 1,
            username: activeUsername,
            points: nextPoints,
            reportsCount: 1,
            resolutionsVerified: 0,
            avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${activeUsername}`,
            badges: ["Active Voice"]
          };
          return [...prevBoard, newEntry]
            .sort((a, b) => b.points - a.points)
            .map((u, index) => ({ ...u, rank: index + 1 }));
        }
      });
      return nextPoints;
    });
  };

  // Upvote / Verify logic calling MySQL REST endpoints
  const handleUpvote = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    try {
      const updated = await IssueService.verifyIssue(id);

      setIssues((prevIssues) =>
        prevIssues.map((issue) => {
          if (issue.id !== id) return issue;

          const hasUpvotedAlready = issue.upvotedUsers.includes(activeUsername);
          let updatedUpvotedUsers = [...issue.upvotedUsers];
          let diff = 0;

          if (hasUpvotedAlready) {
            updatedUpvotedUsers = updatedUpvotedUsers.filter((u) => u !== activeUsername);
            diff = -1;
            setUserPoints((prev) => Math.max(0, prev - 10));
          } else {
            updatedUpvotedUsers.push(activeUsername);
            diff = 1;
            setUserPoints((prev) => prev + 10);
          }

          const newTimelineEvent: ActivityLog = {
            id: `t-up-${Date.now()}`,
            status: issue.status,
            message: `${activeUsername} verified this issue via community upvote. (Total: ${updated.verificationsCount} verifications)`,
            timestamp: new Date().toISOString(),
            actor: activeUsername
          };

          return {
            ...issue,
            upvotes: issue.upvotes + diff,
            upvotedUsers: updatedUpvotedUsers,
            timeline: [...issue.timeline, newTimelineEvent],
            verificationsCount: updated.verificationsCount,
            verificationConfidence: updated.verificationConfidence
          };
        })
      );
    } catch (error) {
      console.error("Upvote failed:", error);
    }
  };

  const hasUpvoted = (id: string) => {
    const target = issues.find((i) => i.id === id);
    return target ? target.upvotedUsers.includes(activeUsername) : false;
  };

  const handleUpvoteFromReport = (id: string) => {
    handleUpvote(id);
  };

  // Add Comment and trigger simulated official/AI responder replies
  const handleAddComment = (issueId: string, commentContent: string, author: string) => {
    const newComment: Comment = {
      id: `c-user-${Date.now()}`,
      author: author,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${author}`,
      content: commentContent,
      timestamp: new Date().toISOString(),
      role: 'citizen'
    };

    setIssues((prevIssues) =>
      prevIssues.map((issue) => {
        if (issue.id !== issueId) return issue;

        const newTimelineEvent: ActivityLog = {
          id: `t-comm-${Date.now()}`,
          status: issue.status,
          message: `${author} added a note in the public discussion forum.`,
          timestamp: new Date().toISOString(),
          actor: author
        };

        return {
          ...issue,
          comments: [...issue.comments, newComment],
          timeline: [...issue.timeline, newTimelineEvent]
        };
      })
    );
  };

  // Add new issue saved directly to MySQL database and synced to Firestore
  const handleAddNewIssue = async (issueData: Omit<Issue, 'id' | 'reportedAt' | 'upvotes' | 'upvotedUsers' | 'comments' | 'timeline' | 'impactScore' | 'status'>) => {
    const saved = await IssueService.createIssue({
      ...issueData,
      upvotes: 1,
      upvotedUsers: [activeUsername],
      comments: [],
      isEmergency: (issueData as any).isEmergency || false,
      priorityScore: (issueData as any).priorityScore || 50,
      priorityReasonsJson: (issueData as any).priorityReasonsJson || "[]",
      resolutionPlanJson: (issueData as any).resolutionPlanJson || "{}",
      verificationConfidence: (issueData as any).verificationConfidence || 80.0
    });

    setIssues((prev) => [saved, ...prev]);

    // Increment user reports count in Leaderboard
    setLeaderboard((prevBoard) =>
      prevBoard
        .map((u) => (u.username === activeUsername ? { ...u, reportsCount: u.reportsCount + 1 } : u))
        .sort((a, b) => b.points - a.points)
    );

    return saved.id;
  };



  // Premium verification overlay during sequenced logins
  if (loginStage !== 'idle' && loginStage !== 'done') {
    const stagesMap = {
      auth: { title: "Authenticating Access", progress: "25%" },
      layer: { title: "Loading Civic Intelligence Layer", progress: "50%" },
      sync: { title: "Synchronizing Municipal Database", progress: "75%" },
      ai: { title: "Formulating Live AI Insights", progress: "95%" }
    };
    const activeStage = stagesMap[loginStage as keyof typeof stagesMap] || { title: "Initializing", progress: "10%" };

    return (
      <div className="min-h-screen bg-[#0B0B0C] flex flex-col items-center justify-center text-[#F5F5F7] font-inter p-6">
        <div className="w-full max-w-sm space-y-6 text-center animate-pulse">
          <span className="text-4xl block">🛡️</span>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold tracking-wider text-[#D6C3A5] uppercase font-mono">{activeStage.title}...</h3>
            <p className="text-[10px] text-[#8B8175] font-mono uppercase tracking-tight">Accessing Remote Node // Live Stream</p>
          </div>
          
          <div className="w-full h-1 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#D6C3A5] transition-all duration-300"
              style={{ width: activeStage.progress }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#F5F5F7] selection:bg-[#D6C3A5] selection:text-[#0B0B0C] font-inter flex transition-all duration-300">
      
      {/* Floating Vertical Navigation Rail */}
      {user && (
        <NavigationRail
          user={user}
          onLogout={logout}
          theme={theme}
          toggleTheme={toggleTheme}
          userPoints={userPoints}
        />
      )}

      {/* Main View Area Offset by Sidebar Width when logged in */}
      <main className={`flex-grow pr-6 md:pr-10 py-8 min-h-screen flex flex-col justify-between overflow-x-hidden transition-all duration-300 ${user ? 'pl-28 md:pl-32' : 'pl-6'}`}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LandingPage onPublicReport={() => navigate('/public-report')} />} />
          <Route
            path="/public-report"
            element={
              <div className="min-h-screen bg-[#0B0B0C] text-[#F5F5F7] font-inter">
                <header className="max-w-4xl w-full mx-auto px-6 py-6 flex justify-between items-center border-b border-[rgba(255,255,255,0.03)]">
                  <div className="flex items-center gap-2">
                    <span className="text-[#D6C3A5]">🛡️</span>
                    <span className="font-semibold text-[#F5F5F7] tracking-tight">CivicPulse Public Intake</span>
                  </div>
                  <button 
                    onClick={() => navigate('/login')}
                    className="px-4 py-1.5 border border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.03)] text-xs rounded-md transition-all cursor-pointer font-medium"
                  >
                    Back to Sign In
                  </button>
                </header>
                <main className="max-w-4xl mx-auto px-6 py-8">
                  <ReportIssue 
                    issues={issues}
                    addNewIssue={handleAddNewIssue}
                    addPoints={() => {}} // No points for anonymous
                    triggerUpvote={handleUpvoteFromReport}
                  />
                </main>
              </div>
            }
          />

          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><Dashboard issues={issues} /></ProtectedRoute>} />
          <Route
            path="/issues"
            element={
              <ProtectedRoute>
                <Issues
                  issues={issues}
                  onUpvote={handleUpvote}
                  hasUpvoted={hasUpvoted}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/issues/:id"
            element={
              <ProtectedRoute>
                <IssueDetails
                  issues={issues}
                  onUpvote={handleUpvote}
                  hasUpvoted={hasUpvoted}
                  addComment={handleAddComment}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report"
            element={
              <ProtectedRoute>
                <ReportIssue
                  issues={issues}
                  addNewIssue={handleAddNewIssue}
                  addPoints={handleAddPoints}
                  triggerUpvote={handleUpvoteFromReport}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <Leaderboard leaderboard={leaderboard} userPoints={userPoints} currentUser={activeUsername} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/command"
            element={
              <ProtectedRoute allowedRoles={['authority', 'admin']}>
                <CommandCenter issues={issues} />
              </ProtectedRoute>
            }
          />
          
          {/* Fallback to Dashboard/Login */}
          <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
        </Routes>
        
        {/* Subtle footer */}
        <footer className="mt-12 text-left text-[9px] font-mono text-[#8B8175] uppercase border-t border-[rgba(255,255,255,0.04)] pt-4 flex justify-between">
          <span>Platform Node: Active Sync</span>
          <span>CivicPulse Enterprise &bull; Secured with Gemini AI</span>
        </footer>
      </main>

      {/* Floating Chat copilot */}
      {user && (
        <div className="fixed bottom-6 right-6 z-[1000]">
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="w-12 h-12 rounded-full bg-[#141416] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(214,195,165,0.25)] flex items-center justify-center text-[#D6C3A5] shadow-premium cursor-pointer transition-all active:scale-[0.96]"
          >
            <span>💬</span>
          </button>
          <AIAssistant isOpen={chatOpen} onClose={() => setChatOpen(false)} issues={issues} />
        </div>
      )}
    </div>
  );
};
