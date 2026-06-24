import React from 'react';
import { Trophy, Star, Award, Milestone, Info, ShieldCheck } from 'lucide-react';
import { LeaderboardUser } from '../mockData';

interface LeaderboardProps {
  leaderboard: LeaderboardUser[];
  userPoints: number;
  currentUser?: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ leaderboard, userPoints, currentUser = "Nishant" }) => {
  // Compute user level based on points
  // Level = Math.floor(points / 500) + 1
  const level = Math.floor(userPoints / 500) + 1;
  const pointsInCurrentLevel = userPoints % 500;
  const progressPercent = Math.min(100, Math.round((pointsInCurrentLevel / 500) * 100));

  // Find user entry in leaderboard or use active defaults
  const userEntry = leaderboard.find((u) => u.username === currentUser);
  const reportsCount = userEntry ? userEntry.reportsCount : 12;
  const resolutionsVerified = userEntry ? userEntry.resolutionsVerified : 11;
  
  // Trust Score (%) based on reports vs verification with 90%+ base target
  const trustScore = Math.min(100, 90 + Math.min(10, Math.floor((resolutionsVerified + reportsCount) / 3)));
  const isCommunityGuardian = trustScore >= 90;

  // Predefined badges explanation
  const BADGES_LIST = [
    { name: "Pothole Patrol", emoji: "🚧", desc: "Reported 3+ infrastructure issues", color: "bg-[rgba(147,197,253,0.05)] text-[#93c5fd] border-[rgba(147,197,253,0.15)]" },
    { name: "Green Guardian", emoji: "🌱", desc: "Reported 3+ environmental issues", color: "bg-[rgba(134,239,172,0.05)] text-[#86efac] border-[rgba(134,239,172,0.15)]" },
    { name: "First Responder", emoji: "🛡️", desc: "First to report a critical hazard", color: "bg-[rgba(252,165,165,0.05)] text-[#fca5a5] border-[rgba(252,165,165,0.15)]" },
    { name: "Clean Street Crusader", emoji: "🗑️", desc: "Resolved or reported sanitation anomalies", color: "bg-[rgba(216,180,254,0.05)] text-[#d8b4fe] border-[rgba(216,180,254,0.15)]" },
    { name: "Night Watch", emoji: "💡", desc: "Reported flickering commercial lights", color: "bg-[rgba(253,224,71,0.05)] text-[#fde047] border-[rgba(253,224,71,0.15)]" },
    { name: "Local Hero", emoji: "🌟", desc: "Accumulated 1000+ total civic points", color: "bg-[rgba(214,195,165,0.05)] text-[#D6C3A5] border-[#D6C3A5]/30" },
    { name: "Community Guardian", emoji: "🛡️", desc: "Achieved a Trust Score > 90%", color: "bg-[rgba(124,154,122,0.05)] text-[#7C9A7A] border-[#7C9A7A]/30" }
  ];

  return (
    <div className="space-y-6 page-entrance font-inter">
      {/* Header */}
      <div className="border-b border-[rgba(255,255,255,0.04)] pb-4 flex justify-between items-baseline">
        <div>
          <span className="text-[10px] font-mono text-[#8B8175] uppercase tracking-wider">CITIZEN PROFILE</span>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-[#F5F5F7]">Reputation &amp; Stats</h1>
        </div>
        <p className="text-[10px] font-mono text-[#8B8175] uppercase">
          Reputation Engine
        </p>
      </div>

      {/* Top section: User Civic Identity Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1 p-5 bg-[rgba(20,20,22,0.65)] border border-[rgba(255,255,255,0.05)] rounded-xl flex flex-col justify-between shadow-premium">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${currentUser}`}
                alt="Your Avatar"
                className="w-12 h-12 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#141416] p-0.5 object-cover"
              />
              <div>
                <h3 className="text-sm font-semibold text-[#F5F5F7] uppercase tracking-tight">You ({currentUser})</h3>
                <span className="text-[9px] font-mono text-[#D6C3A5] bg-[rgba(214,195,165,0.05)] border border-[#D6C3A5]/30 px-2 py-0.5 rounded">LEVEL {level} ENGAGER</span>
              </div>
            </div>

            {/* Level progression bar */}
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between text-[10px]">
                <span className="text-[#8B8175] uppercase">Level Progress</span>
                <span className="text-[#F5F5F7] font-semibold">{pointsInCurrentLevel} / 500 XP</span>
              </div>
              <div className="w-full bg-[#0B0B0C] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#D6C3A5] h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Stats Block: Trust Score & Reports */}
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-[rgba(255,255,255,0.01)] p-3 border border-[rgba(255,255,255,0.04)] rounded-lg font-mono text-xs">
                <span className="text-[#8B8175] uppercase flex items-center gap-1.5 text-[10px]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#7C9A7A]" />
                  Trust Score
                </span>
                <span className="font-semibold text-[#7C9A7A]">{trustScore}%</span>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono text-xs text-center">
                <div className="bg-[rgba(255,255,255,0.01)] p-2.5 border border-[rgba(255,255,255,0.04)] rounded-lg flex flex-col items-center">
                  <span className="text-[9px] text-[#8B8175] uppercase">Reports Filed</span>
                  <span className="font-semibold text-[#F5F5F7] mt-0.5 text-xs">{reportsCount}</span>
                </div>
                <div className="bg-[rgba(255,255,255,0.01)] p-2.5 border border-[rgba(255,255,255,0.04)] rounded-lg flex flex-col items-center">
                  <span className="text-[9px] text-[#8B8175] uppercase">Verified Check</span>
                  <span className="font-semibold text-[#D6C3A5] mt-0.5 text-xs">{resolutionsVerified}</span>
                </div>
              </div>

              {/* Total Points */}
              <div className="flex justify-between items-center bg-[rgba(255,255,255,0.01)] p-3 border border-[rgba(255,255,255,0.04)] rounded-lg font-mono text-xs">
                <span className="text-[#8B8175] uppercase">Total Balance</span>
                <span className="font-bold text-[#D6C3A5]">{userPoints} XP</span>
              </div>
            </div>

            {/* Community Guardian Highlight Badge */}
            {isCommunityGuardian && (
              <div className="bg-[rgba(124,154,122,0.04)] border border-[#7C9A7A]/30 p-2.5 rounded-lg flex items-center gap-2">
                <span className="text-lg">🛡️</span>
                <div>
                  <h4 className="font-mono font-bold uppercase text-[9px] text-[#7C9A7A]">
                    Community Guardian
                  </h4>
                  <p className="text-[9px] text-[#8B8175] leading-tight mt-0.5">High-reputation status active</p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-[rgba(255,255,255,0.04)] pt-3 mt-4 flex items-center gap-2 text-[9px] font-mono text-[#8B8175] uppercase">
            <Milestone className="h-3.5 w-3.5 text-[#D6C3A5] animate-pulse" />
            <span>Next milestone: "City Auditor" title</span>
          </div>
        </div>

        {/* Badges explanation drawer */}
        <div className="md:col-span-2 p-5 bg-[rgba(20,20,22,0.65)] border border-[rgba(255,255,255,0.05)] rounded-xl flex flex-col justify-between shadow-premium">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F5F5F7] flex items-center gap-1.5 border-b border-[rgba(255,255,255,0.04)] pb-2.5 mb-4">
              <Award className="h-4.5 w-4.5 text-[#8B8175]" /> Unlocked &amp; Potential Badges
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BADGES_LIST.map((badge, idx) => {
                const userHasBadge = 
                  (badge.name === "Local Hero" && userPoints >= 1000) ||
                  (badge.name === "Pothole Patrol" && userPoints >= 100) ||
                  (badge.name === "Clean Street Crusader" && userPoints >= 150) ||
                  (badge.name === "Night Watch" && userPoints >= 50) ||
                  (badge.name === "Community Guardian" && isCommunityGuardian) ||
                  badge.name === "First Responder"; // Default unlocked for fun

                return (
                  <div
                    key={idx}
                    className={`p-3 border rounded-lg flex gap-3 transition-all ${
                      userHasBadge 
                        ? 'bg-[rgba(255,255,255,0.01)] border-[rgba(255,255,255,0.06)] opacity-100'
                        : 'bg-transparent border-[rgba(255,255,255,0.03)] opacity-40'
                    }`}
                  >
                    <span className="text-xl flex items-center justify-center">{badge.emoji}</span>
                    <div>
                      <h4 className="text-[10px] font-mono font-bold uppercase text-[#F5F5F7] flex items-center gap-1">
                        {badge.name}
                        {userHasBadge && <Star className="h-2.5 w-2.5 fill-[#D6C3A5] text-[#D6C3A5]" />}
                      </h4>
                      <p className="text-[9px] text-[#8B8175] leading-snug mt-0.5">{badge.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-1.5 text-[9px] font-mono text-[#8B8175] uppercase pt-3 border-t border-[rgba(255,255,255,0.04)]">
            <Info className="h-3.5 w-3.5" />
            <span>Badges are updated dynamically based on community reports and resolution upvotes.</span>
          </div>
        </div>
      </div>

      {/* Bottom section: The Board Grid */}
      <div className="p-6 bg-[rgba(20,20,22,0.65)] border border-[rgba(255,255,255,0.05)] rounded-xl shadow-premium">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F5F5F7] flex items-center gap-2 mb-4">
          <Trophy className="h-4.5 w-4.5 text-[#D6C3A5]" /> Active Citizen Leaderboard
        </h3>

        <div className="overflow-x-auto text-[10px] font-mono">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.04)] font-mono text-[#8B8175] uppercase text-[9px]">
                <th className="py-2.5 px-2 text-center w-12">Rank</th>
                <th className="py-2.5 px-4">Citizen</th>
                <th className="py-2.5 px-4 text-center">Reports</th>
                <th className="py-2.5 px-4 text-center">Checks</th>
                <th className="py-2.5 px-4">Badges</th>
                <th className="py-2.5 px-4 text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((user) => (
                <tr
                  key={user.rank}
                  className="border-b border-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.01)] transition-colors"
                >
                  <td className="py-3 px-2 text-center font-bold">
                    {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : user.rank}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold uppercase flex items-center gap-2">
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-6 h-6 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#141416] p-0.5 object-cover"
                    />
                    <span>{user.username}</span>
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-[#F5F5F7]">{user.reportsCount}</td>
                  <td className="py-3 px-4 text-center font-semibold text-[#8B8175]">{user.resolutionsVerified}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1 text-[8px]">
                      {user.badges.map((badge, bIdx) => (
                        <span
                          key={bIdx}
                          className="px-1.5 py-0.5 bg-[rgba(255,255,255,0.02)] text-[#A1A1AA] border border-[rgba(255,255,255,0.05)] rounded font-mono font-semibold uppercase"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-[#D6C3A5]">{user.points} XP</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
