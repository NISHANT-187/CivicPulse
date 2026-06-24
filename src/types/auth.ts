export type Role = 'citizen' | 'authority' | 'admin';

export type LoginStage = 'idle' | 'auth' | 'layer' | 'sync' | 'ai' | 'done';

export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  role: Role;
}

export interface SessionMetadata {
  loginProvider: 'google' | 'demo';
  lastLogin: string; // ISO date string
  role: Role;
}

export interface Session {
  version: number; // For schema versioning
  user: User;
  expiresAt: number; // Expiration timestamp in milliseconds
  metadata: SessionMetadata;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginStage: LoginStage;
  error: string | null;
  loginWithCredential: (credential: string) => Promise<User>;
  loginAsDemoUser: (role: Role) => Promise<User>;
  logout: () => void;
  isDemoMode: boolean;
  clearError: () => void;
}
