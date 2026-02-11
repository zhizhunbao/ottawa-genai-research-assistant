# US-101: Frontend Framework Migration - Implementation Plan

## Overview

将前端从 Create React App (CRA) 迁移到 Vite，消除依赖漏洞并提升开发体验。

**User Story**: US-101
**Sprint**: 2
**Story Points**: 8
**Status**: ✅ Done

---

## 需求重述

- 使用 Vite 初始化新项目结构
- 迁移所有现有组件和路由
- 保持相同功能和 UI
- 构建产物大小 ≤ CRA 版本
- 开发服务器热重载正常工作
- 无高风险 npm audit 漏洞

---

## 实现阶段

### 阶段 1: Vite 项目初始化 (Hye Ran Yoo - 5h)

#### 1.1 创建 Vite 项目

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
```

#### 1.2 配置 Vite

**文件**: `frontend/vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
```

#### 1.3 更新 TypeScript 配置

**文件**: `frontend/tsconfig.json`

- 配置路径别名
- 配置 ES 模块
- 配置 JSX 支持

**验收**:
- [x] Vite 项目可以启动
- [x] 热重载正常工作
- [x] 路径别名正确解析

---

### 阶段 2: 核心组件迁移 (Hye Ran Yoo - 8h)

#### 2.1 迁移入口文件

**文件**: `frontend/src/main.tsx`

- 替换 ReactDOM.render 为 createRoot
- 配置 React 18 concurrent mode

#### 2.2 迁移路由配置

**文件**: `frontend/src/app/App.tsx`

- 使用 React Router v6
- 配置懒加载路由

#### 2.3 迁移共享组件

**目录**: `frontend/src/shared/components/`

- UI 组件 (Button, Card, Input, etc.)
- Layout 组件 (Header, MainLayout)

#### 2.4 迁移功能模块

**目录**: `frontend/src/features/`

- auth: 认证模块
- home: 首页模块
- research: 研究助手模块

**验收**:
- [x] 所有页面可正常访问
- [x] 组件渲染正确
- [x] 样式正常显示

---

### 阶段 3: API 集成层更新 (Hye Ran Yoo - 4h)

#### 3.1 更新环境变量

**文件**: `frontend/.env`

```env
# Vite 使用 VITE_ 前缀
VITE_API_BASE_URL=http://localhost:8000
VITE_AZURE_AD_CLIENT_ID=your-client-id
VITE_AZURE_AD_TENANT_ID=your-tenant-id
```

#### 3.2 更新 API Service

**文件**: `frontend/src/shared/services/apiService.ts`

- 更新环境变量访问方式 (import.meta.env)
- 配置 axios 拦截器

**验收**:
- [x] API 调用正常
- [x] 认证 token 正确传递

---

### 阶段 4: 安全审计与优化 (Hye Ran Yoo - 2h)

#### 4.1 运行安全审计

```bash
npm audit
npm audit fix
```

#### 4.2 验证构建产物

```bash
npm run build
# 检查 dist 目录大小
```

**验收**:
- [x] 无高风险漏洞
- [x] 构建产物大小合理

---

### 阶段 5: 验证与清理 (Travis Yi - 2h)

#### 5.1 性能验证

- 首次加载时间
- 热重载速度
- 构建时间对比

#### 5.2 清理 CRA 残留

- 删除 CRA 配置文件
- 删除不再需要的依赖

**验收**:
- [x] 性能符合预期
- [x] 无 CRA 残留代码

---

## 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|----------|------|
| 新建 | `frontend/vite.config.ts` | Vite 配置 |
| 修改 | `frontend/tsconfig.json` | TypeScript 配置 |
| 修改 | `frontend/package.json` | 依赖更新 |
| 修改 | `frontend/src/main.tsx` | 入口文件 |
| 修改 | `frontend/src/app/App.tsx` | 路由配置 |
| 删除 | `frontend/src/react-app-env.d.ts` | CRA 类型文件 |
| 修改 | `frontend/.env` | 环境变量 |

---

## 技术规格

| 参数 | 规格 |
|------|------|
| Vite | ^5.0.0 |
| React | 18.x |
| TypeScript | 5.x |
| React Router | v6 |

---

## 成功标准

- [x] 项目使用 Vite 构建
- [x] 所有组件和路由正常工作
- [x] 无高风险 npm 漏洞
- [x] 开发服务器热重载正常
- [x] 构建产物大小 ≤ CRA 版本

---

## 估算复杂度: MEDIUM

| 部分 | 时间估算 | 状态 |
|------|----------|------|
| Vite 初始化 | 5h | ✅ 完成 |
| 组件迁移 | 8h | ✅ 完成 |
| API 集成更新 | 4h | ✅ 完成 |
| 安全审计 | 2h | ✅ 完成 |
| 验证清理 | 2h | ✅ 完成 |
| **总计** | **21h** | **100%** |
