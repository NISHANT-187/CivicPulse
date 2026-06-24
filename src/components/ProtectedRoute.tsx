import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Premium loading screen while verifying authentication state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex flex-col items-center justify-center text-[#F5F5F7] font-inter p-6">
        <div className="w-full max-w-sm space-y-6 text-center">
          <span className="text-4xl block animate-bounce">🛡️</span>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold tracking-wider text-[#D6C3A5] uppercase font-mono">Verifying Access...</h3>
            <p className="text-[10px] text-[#8B8175] font-mono uppercase tracking-tight">Checking Encrypted Session Tokens</p>
          </div>
          
          <div className="w-full h-1 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-full overflow-hidden relative">
            <div className="h-full bg-[#D6C3A5] w-2/3 absolute animate-[shimmer_1.5s_infinite_linear] rounded-full" 
                 style={{ 
                   backgroundImage: 'linear-gradient(90deg, rgba(214,195,165,0.4) 0%, rgba(214,195,165,1) 50%, rgba(214,195,165,0.4) 100%)',
                   width: '40%'
                 }} 
            />
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check roles authorization
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.warn(`[ProtectedRoute] Access denied to path "${location.pathname}" for role "${user.role}".`);
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
