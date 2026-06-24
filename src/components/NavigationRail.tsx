import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Database, PlusCircle, Brain, User as LucideUser, LogOut, Moon, Sun } from 'lucide-react';
import { User } from '../types/auth';

interface NavigationRailProps {
  user: User | null;
  onLogout: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  userPoints: number;
}

export const NavigationRail: React.FC<NavigationRailProps> = ({
  user,
  onLogout,
  theme,
  toggleTheme,
  userPoints
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { label: 'Situation', path: '/', icon: Compass },
    { label: 'Issues', path: '/issues', icon: Database },
    { label: 'Report', path: '/report', icon: PlusCircle },
    { label: 'Intelligence', path: '/command', icon: Brain },
    { label: 'Profile', path: '/leaderboard', icon: LucideUser }
  ];

  const activeIndex = navItems.findIndex(item => {
    if (item.path === '/') return currentPath === '/';
    return currentPath.startsWith(item.path);
  });

  return (
    <nav className="fixed top-6 left-6 bottom-6 w-20 md:w-24 bg-[rgba(20,20,22,0.65)] backdrop-blur-2xl border border-[rgba(255,255,255,0.05)] rounded-2xl flex flex-col justify-between py-8 items-center z-[1000] shadow-premium transition-all duration-300">
      {/* Header Logo */}
      <div className="flex flex-col items-center gap-1">
        <div className="w-10 h-10 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] flex items-center justify-center shadow-inner">
          <span className="text-lg">🛡️</span>
        </div>
        <span className="text-[8px] font-mono tracking-widest text-[#8B8175] font-bold uppercase mt-1">CP CORE</span>
      </div>

      {/* Center Navigation Links */}
      <div className="flex flex-col gap-6 w-full px-2">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = idx === activeIndex;

          return (
            <Link
              key={item.label}
              to={item.path}
              className="flex flex-col items-center group relative cursor-pointer"
            >
              <div
                className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'bg-[rgba(214,195,165,0.08)] border border-[rgba(214,195,165,0.2)] text-[#D6C3A5]'
                    : 'text-[#A1A1AA] hover:text-[#F5F5F7] hover:bg-[rgba(255,255,255,0.02)]'
                }`}
              >
                <Icon className="h-5 w-5 stroke-[1.8]" />
                <span className="text-[8px] font-medium tracking-tight mt-1 text-center scale-95 font-inter">
                  {item.label}
                </span>
              </div>

              {/* Arc-like active indicator dot */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-[#D6C3A5] rounded-r-md" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer Utilities */}
      <div className="flex flex-col items-center gap-5 w-full px-2 relative">
        {/* Points Display */}
        <div className="flex flex-col items-center">
          <span className="text-[8px] font-mono text-[#8B8175] uppercase">SCORE</span>
          <span className="text-xs font-semibold text-[#D6C3A5]">{userPoints}</span>
        </div>

        {/* Theme Toggler */}
        <button
          onClick={toggleTheme}
          title="Toggle Theme"
          className="w-10 h-10 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] flex items-center justify-center text-[#A1A1AA] hover:text-[#F5F5F7] hover:bg-[rgba(255,255,255,0.04)] transition-all cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
        </button>

        {/* User Info Avatar & Interactive Dropdown */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-9 h-9 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#141416] p-0.5 object-cover cursor-pointer hover:border-[#D6C3A5]/40 transition-all focus:outline-none flex items-center justify-center"
            >
              <img
                src={user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.displayName || 'Nishant'}`}
                alt="User"
                className="w-full h-full rounded-lg object-cover"
              />
            </button>

            {menuOpen && (
              <>
                {/* Click outside backdrop */}
                <div 
                  className="fixed inset-0 z-[1001]" 
                  onClick={() => setMenuOpen(false)}
                />
                
                {/* Modern User Profile Dropdown Card */}
                <div className="absolute bottom-0 left-14 md:left-16 w-56 bg-[#141416] border border-[rgba(255,255,255,0.05)] rounded-xl p-4 shadow-premium z-[1002] animate-fade-in-up font-inter text-left">
                  <div className="absolute left-[-5px] bottom-3 w-2.5 h-2.5 bg-[#141416] border-l border-b border-[rgba(255,255,255,0.05)] rotate-45" />
                  
                  <div className="flex items-center gap-3 border-b border-[rgba(255,255,255,0.04)] pb-3">
                    <img
                      src={user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.displayName || 'Nishant'}`}
                      alt="User Avatar"
                      className="w-10 h-10 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[#0B0B0C] object-cover"
                    />
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-semibold text-[#F5F5F7] truncate">{user.displayName}</h4>
                      <p className="text-[9px] text-[#8B8175] truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="py-3 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono text-[#8B8175] uppercase">ACCESS LEVEL</span>
                      <span className={`text-[8px] font-bold font-mono px-2 py-0.5 rounded border uppercase ${
                        user.role === 'admin' 
                          ? 'bg-red-950/20 border-red-500/20 text-[#dc2626]' 
                          : user.role === 'authority' 
                            ? 'bg-purple-950/20 border-purple-500/20 text-[#7b5cff]' 
                            : 'bg-emerald-950/20 border-emerald-500/20 text-[#34a853]'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-1.5 bg-[rgba(220,38,38,0.05)] border border-[rgba(220,38,38,0.1)] hover:bg-[rgba(220,38,38,0.15)] text-[#A86666] text-xs font-semibold rounded-lg transition-all cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Logout Session</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="w-9 h-9 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] flex items-center justify-center">
            <LucideUser className="h-4 w-4 text-[#8B8175]" />
          </div>
        )}
      </div>
    </nav>
  );
};
