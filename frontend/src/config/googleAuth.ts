// Google OAuth 配置
export const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

// Google OAuth 作用域
export const GOOGLE_SCOPES = [
  'openid',
  'profile',
  'email'
].join(' ');

// Google OAuth 配置选项
export const GOOGLE_LOGIN_CONFIG = {
  clientId: GOOGLE_CLIENT_ID,
  redirectUri: window.location.origin,
  scope: GOOGLE_SCOPES,
  responseType: 'code',
  accessType: 'offline',
  prompt: 'consent'
};
