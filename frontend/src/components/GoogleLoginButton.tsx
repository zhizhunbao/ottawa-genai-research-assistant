// This component is deprecated - Google OAuth is now handled by @react-oauth/google in LoginPage
// This file can be removed once all references are updated

import React from 'react';

interface GoogleLoginButtonProps {
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ onSuccess, onError }) => {
  return (
    <div className="google-login-container">
      <p>Please use the Google login in the LoginPage instead.</p>
    </div>
  );
};

export default GoogleLoginButton;
