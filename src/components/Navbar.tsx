import React from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, LayoutDashboard, Map, FileCode, Trophy, Building2, MessageSquare, Sun, Moon, LogIn, LogOut, Radio } from 'lucide-react';
import { User } from '../types/auth';

interface NavbarProps {
  userPoints: number;
  openChat: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userPoints,
  openChat,
  theme,
  toggleTheme,
  user,
  onLogin,
  onLogout
}) => {
  const isDark = theme === 'dark';
  const role = user?.role || 'citizen';

  return (
    <header className="glass-panel sticky top-0 z-50 w-full">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-primary text-darkBg border-2 border-black rounded-none shadow-[2px_2px_0px_rgba(0,0,0,1)] group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:shadow-none transition-all duration-150 animate-float">
            <Shield className="h-5 w-5 stroke-[2.5]" />
          </div>
          <span className="font-space font-bold uppercase tracking-wider text-xl flex items-center gap-1.5">
            Civic<span className="text-primary">Pulse</span>
            <span className="text-xs bg-secondary text-white font-mono px-1.5 py-0.5 border border-black shadow-[1px_1px_0px_rgba(0,0,0,1)] uppercase tracking-normal">AI V2.0</span>
          </span>
        </NavLink>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 font-space text-sm font-bold uppercase">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 border border-transparent hover:border-brutalBorder hover:bg-surface transition-all duration-150 ${
                isActive ? 'text-primary border-b-2 border-b-primary bg-surface/40' : 'text-textPrimary'
              }`
            }
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </NavLink>
          
          <NavLink
            to="/issues"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 border border-transparent hover:border-brutalBorder hover:bg-surface transition-all duration-150 ${
                isActive ? 'text-primary border-b-2 border-b-primary bg-surface/40' : 'text-textPrimary'
              }`
            }
          >
            <Map className="h-4 w-4" />
            Map &amp; List
          </NavLink>

          <NavLink
            to="/report"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 border border-transparent hover:border-brutalBorder hover:bg-surface transition-all duration-150 ${
                isActive ? 'text-primary border-b-2 border-b-primary bg-surface/40' : 'text-textPrimary'
              }`
            }
          >
            <FileCode className="h-4 w-4" />
            Report Issue
          </NavLink>

          <NavLink
            to="/leaderboard"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 border border-transparent hover:border-brutalBorder hover:bg-surface transition-all duration-150 ${
                isActive ? 'text-primary border-b-2 border-b-primary bg-surface/40' : 'text-textPrimary'
              }`
            }
          >
            <Trophy className="h-4 w-4" />
            Leaderboard
          </NavLink>

          {/* Digital Twin Command Center (Admins/Authorities Only) */}
          {(role === 'authority' || role === 'admin') && (
            <NavLink
              to="/command"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 border border-transparent text-tertiary hover:border-brutalBorder hover:bg-surface transition-all duration-150 ${
                  isActive ? 'border-b-2 border-b-tertiary bg-surface/40' : ''
                }`
              }
            >
              <Radio className="h-4 w-4 animate-pulse" />
              Digital Twin
            </NavLink>
          )}

          {/* City Portal Access (Authorities/Admins Only) */}
          {(role === 'authority' || role === 'admin') && (
            <NavLink
              to="/municipal"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 border-2 border-black font-space font-bold uppercase tracking-wider text-xs shadow-[3px_3px_0px_rgba(123,92,255,1)] hover:bg-secondary hover:text-white transition-all duration-150 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none mr-2 ${
                  isActive ? 'bg-secondary text-white border-white' : 'bg-surface text-textPrimary'
                }`
              }
            >
              <Building2 className="h-3.5 w-3.5" />
              City Portal
            </NavLink>
          )}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle button */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all duration-150 cursor-pointer"
            style={{
              background: isDark ? '#1A1A1F' : '#C6FF00',
            }}
          >
            <span
              className="block transition-transform duration-300"
              style={{ transform: isDark ? 'rotate(0deg)' : 'rotate(360deg)' }}
            >
              {isDark
                ? <Moon className="h-4 w-4 text-primary" />
                : <Sun className="h-4 w-4 text-darkBg" />
              }
            </span>
          </button>

          {/* Firebase Authentication state triggers */}
          {user ? (
            <div className="flex items-center gap-2">
              {/* User profile dropdown snippet */}
              <div className="hidden lg:flex flex-col text-right font-mono leading-none">
                <span className="text-[10px] font-bold text-textPrimary">{user.displayName || 'Citizen'}</span>
                <span className="text-[8px] text-primary uppercase font-bold mt-0.5">{user.role}</span>
              </div>
              <img
                src={user.photoURL || "https://api.dicebear.com/7.x/adventurer/svg?seed=Nishant"}
                alt="Avatar"
                className="w-8 h-8 border-2 border-black rounded-none shadow-[1px_1px_0px_rgba(0,0,0,1)]"
              />
              <button
                onClick={onLogout}
                title="Log Out"
                className="p-2 border-2 border-black bg-danger/10 text-danger hover:bg-danger hover:text-white transition-all duration-150 shadow-[1px_1px_0px_rgba(0,0,0,1)] active:translate-y-0.5 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-black bg-primary text-darkBg font-space font-bold uppercase text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
            >
              <LogIn className="h-4 w-4" /> Login
            </button>
          )}

          {/* Chat assistant quick launcher */}
          <button
            onClick={openChat}
            className="p-2 border-2 border-black bg-surface text-textPrimary hover:text-primary hover:border-primary shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all duration-150 cursor-pointer flex items-center justify-center"
            title="Ask CivicPulse AI"
          >
            <MessageSquare className="h-5 w-5" />
          </button>

          {/* Citizen Score Badge */}
          <div className="hidden sm:flex items-center gap-2 border-2 border-black bg-cardBg px-3 py-1.5 shadow-[2px_2px_0px_rgba(198,255,0,0.5)]">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse-glow" />
            <span className="font-mono text-xs uppercase text-textMuted font-bold">XP:</span>
            <span className="font-mono text-sm text-primary font-bold">{userPoints}</span>
          </div>
        </div>
      </div>

      {/* Mobile nav indicator bar */}
      <div className="md:hidden flex justify-around border-t border-brutalBorder py-2 bg-darkBg text-xs font-bold uppercase font-space">
        <NavLink to="/" className={({ isActive }) => isActive ? 'text-primary' : 'text-textPrimary'}>
          Dash
        </NavLink>
        <NavLink to="/issues" className={({ isActive }) => isActive ? 'text-primary' : 'text-textPrimary'}>
          Map
        </NavLink>
        <NavLink to="/report" className={({ isActive }) => isActive ? 'text-primary' : 'text-textPrimary'}>
          Report
        </NavLink>
        <NavLink to="/leaderboard" className={({ isActive }) => isActive ? 'text-primary' : 'text-textPrimary'}>
          Leaderboard
        </NavLink>
        {/* Toggle themes on mobile */}
        <button
          onClick={toggleTheme}
          className="cursor-pointer text-textMuted"
        >
          {isDark ? <Moon className="h-4 w-4 text-primary inline" /> : <Sun className="h-4 w-4 text-secondary inline" />}
        </button>
      </div>
    </header>
  );
};
