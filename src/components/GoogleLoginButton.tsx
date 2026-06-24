import React, { useState } from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { isGoogleClientConfigured } from '../config/authConfig';

const GoogleLogo: React.FC<{ className?: string }> = ({ className = 'h-4.5 w-4.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

export const GoogleLoginButton: React.FC = () => {
  const { loginWithCredential, loginAsDemoUser, error, clearError } = useAuth();
  const [btnLoading, setBtnLoading] = useState(false);
  const isConfigured = isGoogleClientConfigured();

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    setBtnLoading(true);
    clearError();
    try {
      if (response.credential) {
        await loginWithCredential(response.credential);
      } else {
        throw new Error('No ID Token returned from Google');
      }
    } catch (err: any) {
      console.error('[GoogleLoginButton] Login callback error:', err);
    } finally {
      setBtnLoading(false);
    }
  };

  const handleGoogleError = () => {
    setBtnLoading(false);
    console.error('[GoogleLoginButton] Google credential pop-up closed or failed');
  };

  const handleDemoModeClick = async () => {
    setBtnLoading(true);
    clearError();
    try {
      // Fast citizen login as default on demo click
      await loginAsDemoUser('citizen');
    } catch (err) {
      console.error('[GoogleLoginButton] Demo login failed:', err);
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-3">
      {isConfigured ? (
        <div className="relative w-full flex justify-center py-1">
          {btnLoading && (
            <div className="absolute inset-0 bg-[#141416]/80 flex items-center justify-center z-10 rounded-lg">
              <div className="w-5 h-5 border-2 border-t-transparent border-[#D6C3A5] rounded-full animate-spin"></div>
            </div>
          )}
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
            theme="filled_black"
            shape="rectangular"
            text="continue_with"
            width="360"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={handleDemoModeClick}
          disabled={btnLoading}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 bg-[#1A1A1D] border border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)] text-xs text-[#FAFAFA] font-medium rounded-lg transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {btnLoading ? (
            <div className="w-4 h-4 border-2 border-t-transparent border-[#FAFAFA] rounded-full animate-spin"></div>
          ) : (
            <GoogleLogo />
          )}
          <span>{btnLoading ? 'Connecting to Demo...' : 'Continue with Google (Demo)'}</span>
        </button>
      )}

      {error && (
        <div className="w-full p-3 bg-red-950/20 border border-red-500/20 text-[#A86666] text-[10px] rounded-lg text-center font-mono uppercase tracking-wide">
          {error}
        </div>
      )}
    </div>
  );
};
