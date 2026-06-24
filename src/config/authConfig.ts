export const AUTH_CONFIG = {
  CLIENT_ID: (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim(),
  SESSION_STORAGE_KEY: 'civicpulse_session',
  SESSION_VERSION: 1, // Schema versioning for future changes
  ROLE_MAPPINGS: {
    AUTHORITY_DOMAINS: ['@civicpulse.gov', '@gov.in'],
    ADMIN_EMAILS: ['admin@civicpulse.org'],
    DEFAULT_ROLE: 'citizen' as const
  }
};

/**
 * Checks if the Google client ID environment variable is configured.
 */
export const isGoogleClientConfigured = (): boolean => {
  return (
    AUTH_CONFIG.CLIENT_ID.length > 0 && 
    AUTH_CONFIG.CLIENT_ID !== 'your_google_client_id_here'
  );
};

/**
 * Performs startup configuration validation.
 */
export const validateAuthConfig = (): void => {
  if (isGoogleClientConfigured()) {
    console.info('%c[Auth Config] Google OAuth 2.0 integration configured successfully.', 'color: #D6C3A5; font-weight: bold;');
  } else {
    console.warn(
      '[Auth Config] VITE_GOOGLE_CLIENT_ID is not set. Google Sign-In is disabled, and the platform has fallen back to Demo Mode.'
    );
  }
};
