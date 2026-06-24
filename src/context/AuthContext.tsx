import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { User, Role, Session, AuthContextType, LoginStage } from '../types/auth';
import { AUTH_CONFIG, isGoogleClientConfigured } from '../config/authConfig';

interface GoogleJwtPayload {
  iss: string;
  aud: string;
  sub: string;
  email: string;
  name?: string;
  picture?: string;
  exp: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loginStage, setLoginStage] = useState<LoginStage>('idle');
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // 1. Silent Session Restoration on Mount
  useEffect(() => {
    const restoreSession = () => {
      try {
        const rawSession = localStorage.getItem(AUTH_CONFIG.SESSION_STORAGE_KEY);
        if (!rawSession) {
          setLoading(false);
          return;
        }

        const session: Session = JSON.parse(rawSession);

        // Schema Version check
        if (session.version !== AUTH_CONFIG.SESSION_VERSION) {
          console.warn('[AuthContext] Session schema version mismatch. Clearing session.');
          localStorage.removeItem(AUTH_CONFIG.SESSION_STORAGE_KEY);
          setLoading(false);
          return;
        }

        // Expiration check
        if (Date.now() >= session.expiresAt) {
          console.warn('[AuthContext] User session expired.');
          localStorage.removeItem(AUTH_CONFIG.SESSION_STORAGE_KEY);
          setLoading(false);
          return;
        }

        // Successfully restore user session
        setUser(session.user);
      } catch (err) {
        console.error('[AuthContext] Failed to restore session:', err);
        localStorage.removeItem(AUTH_CONFIG.SESSION_STORAGE_KEY);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Map Google Email to Roles (Citizen, Authority, Admin)
  const mapEmailToRole = (email: string): Role => {
    const emailLower = email.toLowerCase();
    
    // Admin check
    if (AUTH_CONFIG.ROLE_MAPPINGS.ADMIN_EMAILS.some(adminEmail => adminEmail.toLowerCase() === emailLower)) {
      return 'admin';
    }

    // Authority check
    if (AUTH_CONFIG.ROLE_MAPPINGS.AUTHORITY_DOMAINS.some(domain => emailLower.endsWith(domain.toLowerCase()))) {
      return 'authority';
    }

    return AUTH_CONFIG.ROLE_MAPPINGS.DEFAULT_ROLE;
  };

  // Translate code errors to user-friendly messages
  const mapAuthError = (errKey: string): string => {
    switch (errKey) {
      case 'popup blocked':
        return 'Google Sign-In popup was blocked by your browser. Please allow popups for this website.';
      case 'popup closed':
        return 'Google Sign-In popup was closed before authentication could complete.';
      case 'network failure':
        return 'A network error occurred. Please check your internet connection and try again.';
      case 'credential expiration':
        return 'The Google authentication credential has expired. Please try signing in again.';
      case 'invalid audience':
        return 'Authentication failed: Invalid client ID / audience validation error.';
      case 'invalid issuer':
        return 'Authentication failed: Invalid identity provider issuer.';
      default:
        return errKey || 'An unexpected error occurred during Google authentication.';
    }
  };

  // Helper to run simulated high-end login verification stages
  const runVerificationStages = async () => {
    setLoginStage('auth');
    await new Promise(r => setTimeout(r, 450));
    setLoginStage('layer');
    await new Promise(r => setTimeout(r, 450));
    setLoginStage('sync');
    await new Promise(r => setTimeout(r, 450));
    setLoginStage('ai');
    await new Promise(r => setTimeout(r, 600));
    setLoginStage('done');
    // Reset back to idle for subsequent interactions
    setTimeout(() => setLoginStage('idle'), 100);
  };

  // 2. Google Token ID (credential JWT) Login
  const loginWithCredential = async (credential: string): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      if (!credential) {
        throw new Error('No credential provided');
      }

      // Decode the JWT ID Token
      const decoded = jwtDecode<GoogleJwtPayload>(credential);

      // Validate Audience
      if (decoded.aud !== AUTH_CONFIG.CLIENT_ID) {
        throw new Error('invalid audience');
      }

      // Validate Issuer
      if (decoded.iss !== 'accounts.google.com' && decoded.iss !== 'https://accounts.google.com') {
        throw new Error('invalid issuer');
      }

      // Validate Expiration
      if (decoded.exp * 1000 <= Date.now()) {
        throw new Error('credential expiration');
      }

      const role = mapEmailToRole(decoded.email);

      const authenticatedUser: User = {
        uid: decoded.sub,
        displayName: decoded.name || 'Google User',
        email: decoded.email,
        photoURL: decoded.picture || `https://api.dicebear.com/7.x/adventurer/svg?seed=${decoded.name || 'Google User'}`,
        role,
      };

      // Create session with version and metadata, omitting raw JWT
      const newSession: Session = {
        version: AUTH_CONFIG.SESSION_VERSION,
        user: authenticatedUser,
        expiresAt: decoded.exp * 1000,
        metadata: {
          loginProvider: 'google',
          lastLogin: new Date().toISOString(),
          role
        }
      };

      // Run verification stages before setting state
      await runVerificationStages();

      // Persist safe session metadata
      localStorage.setItem(AUTH_CONFIG.SESSION_STORAGE_KEY, JSON.stringify(newSession));
      setUser(authenticatedUser);
      return authenticatedUser;
    } catch (err: any) {
      console.error('[AuthContext] JWT Authentication failed:', err);
      const friendlyMsg = mapAuthError(err.message);
      setError(friendlyMsg);
      setLoginStage('idle');
      throw new Error(friendlyMsg);
    } finally {
      setLoading(false);
    }
  };

  // 3. Demo Login Mode for Hackathon Judges
  const loginAsDemoUser = async (role: Role): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      let demoUser: User;
      if (role === 'admin') {
        demoUser = {
          uid: 'demo-admin-id',
          displayName: 'System Admin',
          email: 'admin@civicpulse.org',
          photoURL: 'https://api.dicebear.com/7.x/identicon/svg?seed=admin',
          role: 'admin',
        };
      } else if (role === 'authority') {
        demoUser = {
          uid: 'demo-authority-id',
          displayName: 'Officer Jenkins',
          email: 'jenkins@civicpulse.gov',
          photoURL: 'https://api.dicebear.com/7.x/identicon/svg?seed=officer',
          role: 'authority',
        };
      } else {
        demoUser = {
          uid: 'demo-citizen-id',
          displayName: 'Nishant Kumar',
          email: 'nishant.kumar@civicpulse.org',
          photoURL: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Nishant',
          role: 'citizen',
        };
      }

      // Demo session lasts 24 hours
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

      const demoSession: Session = {
        version: AUTH_CONFIG.SESSION_VERSION,
        user: demoUser,
        expiresAt,
        metadata: {
          loginProvider: 'demo',
          lastLogin: new Date().toISOString(),
          role
        }
      };

      // Run verification stages before setting state
      await runVerificationStages();

      localStorage.setItem(AUTH_CONFIG.SESSION_STORAGE_KEY, JSON.stringify(demoSession));
      setUser(demoUser);
      return demoUser;
    } catch (err: any) {
      setError(err.message || 'Demo authentication failed.');
      setLoginStage('idle');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 4. Logout Action
  const logout = () => {
    localStorage.removeItem(AUTH_CONFIG.SESSION_STORAGE_KEY);
    setUser(null);
    setError(null);
    setLoginStage('idle');
  };

  const isDemoMode = !isGoogleClientConfigured();

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginStage,
        error,
        loginWithCredential,
        loginAsDemoUser,
        logout,
        isDemoMode,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
