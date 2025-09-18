#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envExampleContent = `# Google OAuth配置
# 在Google Cloud Console (https://console.cloud.google.com/) 创建项目并获取Client ID
# 1. 创建新项目或选择现有项目
# 2. 启用Google+ API
# 3. 创建OAuth 2.0客户端ID
# 4. 将授权的JavaScript来源设置为: http://localhost:3000
# 5. 将授权的重定向URI设置为: http://localhost:3000
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here

# API配置
REACT_APP_API_BASE_URL=http://localhost:8000

# 其他配置
REACT_APP_ENV=development
`;

console.log('🔧 设置环境变量文件...');

if (fs.existsSync(envPath)) {
  console.log('✅ .env 文件已存在');
} else {
  try {
    fs.writeFileSync(envPath, envExampleContent);
    console.log('✅ 已创建 .env 文件');
    console.log('📝 请编辑 .env 文件并设置您的 Google Client ID');
    console.log('');
    console.log('📖 详细设置说明请查看: GOOGLE_OAUTH_SETUP.md');
  } catch (error) {
    console.error('❌ 创建 .env 文件失败:', error.message);
  }
}

console.log('');
console.log('🚀 现在可以运行应用了:');
console.log('   npm start');
console.log('');
console.log('💡 如果不想配置Google OAuth，可以使用以下测试账号:');
console.log('   邮箱: test@example.com');
console.log('   密码: password123'); 