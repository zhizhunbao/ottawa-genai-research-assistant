import React, { useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';

interface GoogleLoginButtonProps {
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
}

// 声明全局的 google 对象
declare global {
  interface Window {
    google: any;
  }
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ 
  onSuccess, 
  onError 
}) => {
  const { googleLogin } = useAuth();
  const buttonRef = useRef<HTMLDivElement>(null);

  // Google OAuth Client ID - 你需要设置这个
  const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '348181960606-aqmbd10e22qd1lru9nc41ehn4ranrq8e.apps.googleusercontent.com';

  useEffect(() => {
    // 等待 Google Identity Services 库加载
    const initializeGoogleButton = () => {
      if (window.google && buttonRef.current) {
        // 初始化 Google Identity Services
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // 渲染登录按钮
        window.google.accounts.id.renderButton(
          buttonRef.current,
          {
            theme: "outline",
            size: "large",
            text: "signin_with",
            shape: "rectangular",
            logo_alignment: "left",
            width: 320
          }
        );
      }
    };

    // 检查 Google API 是否已加载
    if (window.google) {
      initializeGoogleButton();
    } else {
      // 如果还没加载，等待加载完成
      const script = document.querySelector('script[src*="gsi/client"]');
      if (script) {
        script.addEventListener('load', initializeGoogleButton);
      }
    }

    return () => {
      // 清理事件监听器
      const script = document.querySelector('script[src*="gsi/client"]');
      if (script) {
        script.removeEventListener('load', initializeGoogleButton);
      }
    };
  }, [GOOGLE_CLIENT_ID]);

  const handleCredentialResponse = async (response: any) => {
    try {
      console.log("Google credential response:", response);
      
      // 解码 JWT token 获取用户信息
      const userInfo = parseJwt(response.credential);
      console.log("Parsed user info:", userInfo);
      
      // 使用解析出的用户信息调用我们的 mock 登录
      await googleLogin(userInfo);
      
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (error) {
      console.error('Google login error:', error);
      if (onError) {
        onError(error);
      }
    }
  };

  // 解析 JWT token
  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing JWT token:', error);
      throw error;
    }
  };

  return (
    <div className="google-login-container">
      <div ref={buttonRef} className="google-login-button"></div>
    </div>
  );
};

export default GoogleLoginButton;
