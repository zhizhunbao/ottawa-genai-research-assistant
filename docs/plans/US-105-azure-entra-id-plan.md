# US-105: Azure Entra ID Authentication - Implementation Plan

## Overview

实现 Azure Entra ID (Azure AD) 单点登录认证，替换本地用户名密码认证。

## Todos

- [x] 阶段1: 前端 MSAL.js 集成 ✅
- [x] 阶段2: 后端 JWT 验证 ✅
- [x] 阶段3: 创建 Azure AD App Registration ✅
- [x] 阶段4: 端到端测试 ✅

## 实现阶段

### 阶段 1: 前端 MSAL.js 集成 ✅

#### 1.1 安装 MSAL 包

```bash
npm install @azure/msal-browser@^3.0.0 @azure/msal-react@^2.0.0
```

#### 1.2 创建 MSAL 配置

**文件**: `frontend/src/features/auth/config/msalConfig.ts`

- 配置 Azure AD Client ID 和 Tenant ID
- 配置 Redirect URI
- 配置登录 Scopes

#### 1.3 创建 MsalAuthProvider

**文件**: `frontend/src/features/auth/components/MsalAuthProvider.tsx`

- 封装 MSAL Provider
- 实现认证状态同步到 Zustand Store
- 提供 useAzureLogin / useAzureLogout hooks
- 提供 useAccessToken hook 获取 API 调用 token

#### 1.4 更新入口文件

**文件**: `frontend/src/main.tsx`

- 用 MsalAuthProvider 包裹 App

#### 1.5 更新登录 Hook

**文件**: `frontend/src/features/auth/hooks/useLogin.ts`

- 实现 handleAzureAdLogin 方法
- 调用 MSAL popup 登录

---

### 阶段 2: 后端 JWT 验证 ✅

#### 2.1 创建 Azure AD 认证模块

**文件**: `backend/app/core/azure_auth.py`

- AzureADTokenValidator 类
- 从 Azure AD JWKS endpoint 获取公钥
- 验证 JWT 签名、audience、issuer
- 提取用户信息 (oid, email, name)

#### 2.2 更新配置

**文件**: `backend/app/core/config.py`

```python
# Azure AD / Entra ID Authentication
azure_ad_tenant_id: str = ""
azure_ad_client_id: str = ""
```

#### 2.3 添加依赖注入

**文件**: `backend/app/core/dependencies.py`

```python
CurrentUserAzureAD = Annotated[dict, Depends(get_current_user_azure_ad)]
CurrentUserIdAzureAD = Annotated[str, Depends(get_current_user_id_azure_ad)]
OptionalCurrentUser = Annotated[Optional[dict], Depends(get_current_user_optional)]
```

---

### 阶段 3: Azure Portal 配置 ✅

#### 3.1 创建 App Registration

1. 登录 Azure Portal → Azure Active Directory → App registrations
2. 点击 "New registration"
3. 配置:
   - Name: `Ottawa GenAI Research Assistant`
   - Supported account types: `Single tenant`
   - Redirect URI: `http://localhost:3000` (SPA)

#### 3.2 记录配置值

- **Application (client) ID**: 复制到 `VITE_AZURE_AD_CLIENT_ID`
- **Directory (tenant) ID**: 复制到 `VITE_AZURE_AD_TENANT_ID`

#### 3.3 配置 API Permissions

- Microsoft Graph → User.Read (delegated)

---

### 阶段 4: 端到端测试 ✅

- [x] 测试 Azure AD 登录流程
- [x] 测试 token 刷新
- [x] 测试登出流程
- [x] 测试受保护路由

---

## 环境变量配置

### Frontend (.env)

```env
VITE_AZURE_AD_CLIENT_ID=your-client-id
VITE_AZURE_AD_TENANT_ID=your-tenant-id
VITE_AZURE_AD_REDIRECT_URI=http://localhost:3000
```

### Backend (.env)

```env
AZURE_AD_TENANT_ID=your-tenant-id
AZURE_AD_CLIENT_ID=your-client-id
```

---

## 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|----------|------|
| 新建 | `frontend/src/features/auth/config/msalConfig.ts` | MSAL 配置 |
| 新建 | `frontend/src/features/auth/components/MsalAuthProvider.tsx` | MSAL Provider |
| 修改 | `frontend/src/main.tsx` | 添加 MsalAuthProvider |
| 修改 | `frontend/src/features/auth/hooks/useLogin.ts` | Azure AD 登录 |
| 修改 | `frontend/src/features/auth/hooks/useAuth.ts` | 导出 setError/setLoading |
| 新建 | `frontend/.env.example` | 环境变量示例 |
| 新建 | `backend/app/core/azure_auth.py` | Azure AD JWT 验证 |
| 修改 | `backend/app/core/config.py` | Azure AD 配置 |
| 修改 | `backend/app/core/dependencies.py` | Azure AD 依赖 |
| 修改 | `backend/.env.example` | 环境变量示例 |

---

## 技术规格

| 参数 | 规格 |
|------|------|
| MSAL Browser | ^3.30.0 |
| MSAL React | ^2.2.0 |
| JWT 算法 | RS256 |
| Token 验证 | JWKS (Azure AD public keys) |
| Scopes | User.Read, openid, profile, email |

---

## 成功标准

- [x] 前端集成 MSAL.js
- [x] 后端可验证 Azure AD JWT
- [x] Azure AD App Registration 已创建
- [x] 用户可通过 Azure AD 登录
- [x] 受保护路由正常工作
- [x] 所有测试通过

---

## 估算复杂度: MEDIUM

| 部分 | 时间估算 | 状态 |
|------|----------|------|
| 前端 MSAL 集成 | 6h | ✅ 完成 |
| 后端 JWT 验证 | 5h | ✅ 完成 |
| Azure Portal 配置 | 2h | ✅ 完成 |
| 端到端测试 | 3h | ✅ 完成 |
| **总计** | **16h** | **100%** |
