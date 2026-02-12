# Frontend Refactor to Template Plan

> **目标**: 将现有前端代码逐步重构为模板标准实现，提升代码一致性与可维护性
> **原则**: 保留业务逻辑，替换组件结构；能用模板就用模板，业务特定组件仅做模式对齐
> **创建日期**: 2026-02-12
> **状态**: 📋 待执行

---

## 1. 现状总览

### 1.1 代码 vs 模板覆盖矩阵

| 层级                                                | 现有文件                                                                                               | 对应模板                                            | 差距评估 |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------- | -------- |
| **布局层**                                          |                                                                                                        |                                                     |          |
| `shared/components/layout/Header.tsx`               | `shared/components/layout/header.tsx.template`                                                         | ⚠️ 中 — 现有是简单顶栏，模板是 sidebar-trigger 风格 |
| `shared/components/layout/Footer.tsx`               | `features/landing/site-footer.tsx.template`                                                            | ⚠️ 中 — 结构不同，需业务适配                        |
| `shared/components/layout/MainLayout.tsx`           | `features/landing/marketing-layout.tsx.template` + `shared/components/layout/app-sidebar.tsx.template` | 🔴 高 — 需拆分为 Landing 布局 + Dashboard 布局      |
| `shared/components/layout/PageContainer.tsx`        | ❌ 无模板                                                                                              | ✅ 保留 — 通用容器，无需模板                        |
| **认证层**                                          |                                                                                                        |                                                     |          |
| `features/auth/components/AuthDialog.tsx` (307行)   | `features/auth/sign-in-form.tsx.template` + `sign-up-form.tsx.template`                                | 🔴 高 — 当前是单体 Dialog，需拆分                   |
| `features/auth/components/MsalAuthProvider.tsx`     | ❌ 无模板 (业务特定: Azure AD)                                                                         | ✅ 保留 — MSAL 业务特定                             |
| `features/auth/components/AuthDialogProvider.tsx`   | ❌ 无模板                                                                                              | ✅ 保留 — Context Provider 适配                     |
| `features/auth/hooks/useAuth.ts`                    | ❌ 无模板                                                                                              | ✅ 保留 — MSAL 业务逻辑                             |
| `features/auth/hooks/useLogin.ts`                   | 模式参考 `sign-in-form.tsx.template`                                                                   | ⚠️ 中 — 可对齐模板模式                              |
| `features/auth/hooks/useRegister.ts`                | 模式参考 `sign-up-form.tsx.template`                                                                   | ⚠️ 中 — 可对齐模板模式                              |
| `features/auth/hooks/useAuthDialog.ts`              | ❌ 无模板                                                                                              | ✅ 保留 — UI 交互逻辑                               |
| `features/auth/types.ts`                            | `lib/validations/auth.ts.template`                                                                     | ⚠️ 低 — 可补充 Zod schema                           |
| **Landing 层**                                      |                                                                                                        |                                                     |          |
| `features/landing/components/HomePage.tsx`          | `features/landing/marketing-layout.tsx.template`                                                       | ⚠️ 中 — 组合层，结构可对齐                          |
| `features/landing/components/Hero.tsx`              | `features/landing/hero-section.tsx.template`                                                           | ⚠️ 中 — 已有 templateRef 注释                       |
| `features/landing/components/FeatureSection.tsx`    | `features/landing/feature-section.tsx.template`                                                        | ⚠️ 中 — 已有 templateRef 注释                       |
| `features/landing/components/HowItWorksSection.tsx` | ❌ 无模板 (业务特定)                                                                                   | ✅ 保留 — 业务展示                                  |
| `features/landing/components/CTASection.tsx`        | ❌ 无模板                                                                                              | ✅ 保留 — 业务 CTA                                  |
| **Chat 层**                                         |                                                                                                        |                                                     |          |
| `features/chat/components/chat-interface.tsx`       | `features/chat/chat-interface.tsx.template`                                                            | ⚠️ 中 — 结构相近，细节对齐                          |
| `features/chat/components/chat-input.tsx`           | `features/chat/chat-input.tsx.template`                                                                | ⚠️ 低 — 已基于模板                                  |
| `features/chat/components/message-item.tsx`         | `features/chat/message-item.tsx.template`                                                              | ⚠️ 低 — 已基于模板                                  |
| `features/chat/components/ChatSidebar.tsx`          | ❌ 无模板                                                                                              | ✅ 保留 — 业务特定                                  |
| `features/chat/components/ConfidenceIndicator.tsx`  | ❌ 无模板                                                                                              | ✅ 保留 — 业务特定                                  |
| `features/chat/components/SourcePreviewModal.tsx`   | ❌ 无模板                                                                                              | ✅ 保留 — 业务特定                                  |
| `features/chat/hooks/use-chat-stream.ts`            | `features/chat/use-chat-stream.ts.template`                                                            | ⚠️ 低 — 已基于模板                                  |
| `features/chat/hooks/useChat.ts`                    | ❌ 无模板                                                                                              | ✅ 保留 — 业务逻辑                                  |
| **全局服务层**                                      |                                                                                                        |                                                     |          |
| `shared/services/apiService.ts` (266行)             | `lib/api-client.ts.template` (Axios)                                                                   | 🔴 高 — 当前 fetch，模板 Axios                      |
| `stores/authStore.ts`                               | `B15 stores/auth-store.ts` (文档参考)                                                                  | ⚠️ 中 — Cookie vs localStorage                      |
| `stores/chatStore.ts`                               | ❌ 无模板                                                                                              | ✅ 保留 — 业务特定                                  |
| `lib/utils.ts`                                      | ❌ 无模板                                                                                              | ✅ 保留 — 通用工具                                  |
| **Provider 层**                                     |                                                                                                        |                                                     |          |
| `main.tsx` (Provider 堆叠)                          | 模式参考多个 template                                                                                  | ⚠️ 中 — 缺少 ThemeProvider, SearchProvider          |
| **路由层**                                          |                                                                                                        |                                                     |          |
| `app/App.tsx`                                       | 无直接模板 (bulletproof-react 使用 TanStack Router)                                                    | ⚠️ 低 — 保持 React Router 风格                      |
| **缺失组件**                                        |                                                                                                        |                                                     |          |
| ❌ Error Pages                                      | `features/errors/index.tsx.template`                                                                   | 🔴 高 — 完全缺失                                    |
| ❌ ThemeProvider                                    | `context/theme-provider.tsx.template`                                                                  | 🔴 高 — 完全缺失                                    |
| ❌ ThemeSwitch                                      | `shared/components/ui/theme-switch.tsx.template`                                                       | 🔴 高 — 完全缺失                                    |
| ❌ ProfileDropdown                                  | `shared/components/navigation/profile-dropdown.tsx.template`                                           | ⚠️ 中 — Header 内联实现                             |
| ❌ SignOutDialog                                    | `shared/components/navigation/sign-out-dialog.tsx.template`                                            | ⚠️ 中 — 缺失确认流程                                |
| ❌ NavigationProgress                               | `shared/components/navigation/navigation-progress.tsx.template`                                        | ⚠️ 低 — 增强体验                                    |
| ❌ CommandMenu                                      | `shared/components/navigation/command-menu.tsx.template`                                               | ⚠️ 低 — Cmd+K 搜索                                  |
| ❌ PasswordInput                                    | `shared/components/ui/password-input.tsx.template`                                                     | ⚠️ 中 — Auth 需要                                   |
| ❌ ConfirmDialog                                    | `shared/components/ui/confirm-dialog.tsx.template`                                                     | ⚠️ 低 — 通用组件                                    |
| ❌ LongText                                         | `shared/components/ui/long-text.tsx.template`                                                          | ⚠️ 低 — 表格需要                                    |

### 1.2 文件命名现状

| 类型           | 当前风格                    | 模板标准   | 需重命名 |
| -------------- | --------------------------- | ---------- | -------- |
| shadcn/ui 组件 | ✅ kebab-case               | kebab-case | 否       |
| 业务组件       | ❌ PascalCase               | kebab-case | **是**   |
| Hooks          | ❌ 混合 (camelCase + kebab) | kebab-case | **部分** |
| Stores         | ❌ camelCase                | kebab-case | **是**   |
| Services       | ❌ camelCase                | kebab-case | **是**   |

### 1.3 关键发现

1. **文件命名不一致**: PascalCase / camelCase / kebab-case 混用，需统一为 kebab-case
2. **API 客户端**: 使用原生 `fetch` + 自定义封装（266行），模板方案是 Axios + 拦截器模式
3. **认证 UI**: 307 行单体 `AuthDialog` 把登录/注册都塞在一起，模板方案是独立 Form 组件
4. **布局架构**: 单一 `MainLayout` 处理所有页面，模板方案区分 Marketing + Dashboard 布局
5. **主题系统**: 完全缺失，无 dark mode 支持
6. **错误处理**: 仅有基础 `ErrorBoundary`，无 404/403/500 等标准错误页
7. **导航组件**: Header 中内联了用户菜单，模板方案抽取为独立 `ProfileDropdown`

---

## 2. 重构策略

### 2.1 核心原则

| 原则           | 说明                                                   |
| -------------- | ------------------------------------------------------ |
| **渐进式替换** | 每个 Phase 独立可交付，不阻塞其他 Phase                |
| **保持运行**   | 每步完成后项目可编译运行，无回退                       |
| **保留业务**   | 不改变任何业务逻辑（API 调用、数据流、i18n）           |
| **模板优先**   | 有模板的组件，基于模板重写；无模板的，仅做代码模式对齐 |
| **kebab-case** | 所有新建/重命名文件统一为 kebab-case 命名              |
| **Build 验证** | 每个 Task 完成后执行 `npm run build` 确认无编译错误    |

### 2.2 不在范围内

- 路由库迁移 (保持 react-router-dom)
- API 库迁移 (保持 fetch，不引入 Axios)
- 引入 TanStack Query (保持现有 Zustand 状态管理)
- 后端 API 变更

---

## 3. 执行计划

### Phase 0: 文件命名规范化 — kebab-case (优先级: 🔴 高)

> **目标**: 将所有非 kebab-case 的文件统一重命名，确保与模板约定一致
> **方法**: `git mv` 重命名 + 批量更新 import 路径
> **注意**: Windows 文件系统大小写不敏感，需使用 `git mv` 两步法 (先 mv 到临时名再 mv 到目标名)

#### Task 0.1: 重命名 Layout 组件

| 现有文件名                                   | 目标文件名           |
| -------------------------------------------- | -------------------- |
| `shared/components/layout/Header.tsx`        | `header.tsx`         |
| `shared/components/layout/Footer.tsx`        | `footer.tsx`         |
| `shared/components/layout/MainLayout.tsx`    | `main-layout.tsx`    |
| `shared/components/layout/PageContainer.tsx` | `page-container.tsx` |

- **受影响 imports**: `main-layout.tsx` 内部引用, `app/app.tsx`, `main.tsx`
- **预计工作量**: 小

#### Task 0.2: 重命名 Auth 模块

| 现有文件名                                        | 目标文件名                 |
| ------------------------------------------------- | -------------------------- |
| `features/auth/components/AuthDialog.tsx`         | `auth-dialog.tsx`          |
| `features/auth/components/AuthDialogProvider.tsx` | `auth-dialog-provider.tsx` |
| `features/auth/components/MsalAuthProvider.tsx`   | `msal-auth-provider.tsx`   |
| `features/auth/hooks/useAuth.ts`                  | `use-auth.ts`              |
| `features/auth/hooks/useAuthDialog.ts`            | `use-auth-dialog.ts`       |
| `features/auth/hooks/useLogin.ts`                 | `use-login.ts`             |
| `features/auth/hooks/useRegister.ts`              | `use-register.ts`          |
| `features/auth/services/authApi.ts`               | `auth-api.ts`              |
| `features/auth/config/msalConfig.ts`              | `msal-config.ts`           |

- **受影响 imports**: `main.tsx`, `header.tsx`, 各 auth hooks 内部引用
- **预计工作量**: 中

#### Task 0.3: 重命名 Chat 模块

| 现有文件名                                              | 目标文件名                      |
| ------------------------------------------------------- | ------------------------------- |
| `features/chat/components/ChatSidebar.tsx`              | `chat-sidebar.tsx`              |
| `features/chat/components/ConfidenceIndicator.tsx`      | `confidence-indicator.tsx`      |
| `features/chat/components/ConfidenceIndicator.test.tsx` | `confidence-indicator.test.tsx` |
| `features/chat/components/SourcePreviewModal.tsx`       | `source-preview-modal.tsx`      |
| `features/chat/hooks/useChat.ts`                        | `use-chat.ts`                   |
| `features/chat/services/chatApi.ts`                     | `chat-api.ts`                   |
| `features/chat/views/ChatView.tsx`                      | `chat-view.tsx`                 |

- **已标准**: `chat-input.tsx`, `chat-interface.tsx`, `message-item.tsx`, `use-chat-stream.ts` ✅
- **预计工作量**: 小

#### Task 0.4: 重命名 Landing 模块

| 现有文件名                                          | 目标文件名                 |
| --------------------------------------------------- | -------------------------- |
| `features/landing/components/HomePage.tsx`          | `home-page.tsx`            |
| `features/landing/components/Hero.tsx`              | `hero.tsx`                 |
| `features/landing/components/FeatureSection.tsx`    | `feature-section.tsx`      |
| `features/landing/components/HowItWorksSection.tsx` | `how-it-works-section.tsx` |
| `features/landing/components/CTASection.tsx`        | `cta-section.tsx`          |
| `features/landing/hooks/useHomeData.ts`             | `use-home-data.ts`         |
| `features/landing/views/HomeView.tsx`               | `home-view.tsx`            |

- **预计工作量**: 小

#### Task 0.5: 重命名其他模块

| 现有文件名                                               | 目标文件名                  |
| -------------------------------------------------------- | --------------------------- |
| **Evaluation**                                           |                             |
| `features/evaluation/components/EvaluationDashboard.tsx` | `evaluation-dashboard.tsx`  |
| `features/evaluation/views/EvaluationView.tsx`           | `evaluation-view.tsx`       |
| `features/evaluation/hooks/useEvaluationSummary.ts`      | `use-evaluation-summary.ts` |
| `features/evaluation/services/evaluationApi.ts`          | `evaluation-api.ts`         |
| **Documents**                                            |                             |
| `features/documents/components/DocumentStatus.tsx`       | `document-status.tsx`       |
| `features/documents/components/DocumentStatus.test.tsx`  | `document-status.test.tsx`  |
| **Research**                                             |                             |
| `features/research/hooks/useDocuments.ts`                | `use-documents.ts`          |
| `features/research/services/researchApi.ts`              | `research-api.ts`           |

- **预计工作量**: 小

#### Task 0.6: 重命名全局文件

| 现有文件名                      | 目标文件名                       |
| ------------------------------- | -------------------------------- |
| `app/App.tsx`                   | `app/app.tsx`                    |
| `shared/services/apiService.ts` | `shared/services/api-service.ts` |
| `shared/config/chartTheme.ts`   | `shared/config/chart-theme.ts`   |
| `shared/hooks/useMobile.tsx`    | `shared/hooks/use-mobile.tsx`    |
| `stores/authStore.ts`           | `stores/auth-store.ts`           |
| `stores/chatStore.ts`           | `stores/chat-store.ts`           |
| `stores/chatStore.test.ts`      | `stores/chat-store.test.ts`      |

- **预计工作量**: 小

#### Task 0.7: 重命名 Charts 组件

| 现有文件名                                                   | 目标文件名                 |
| ------------------------------------------------------------ | -------------------------- |
| `shared/components/charts/BarChart.tsx`                      | `bar-chart.tsx`            |
| `shared/components/charts/ChartContainer.tsx`                | `chart-container.tsx`      |
| `shared/components/charts/ChartExport.tsx`                   | `chart-export.tsx`         |
| `shared/components/charts/LineChart.tsx`                     | `line-chart.tsx`           |
| `shared/components/charts/PieChart.tsx`                      | `pie-chart.tsx`            |
| `shared/components/charts/__tests__/BarChart.test.tsx`       | `bar-chart.test.tsx`       |
| `shared/components/charts/__tests__/ChartContainer.test.tsx` | `chart-container.test.tsx` |
| `shared/components/charts/__tests__/LineChart.test.tsx`      | `line-chart.test.tsx`      |
| `shared/components/charts/__tests__/PieChart.test.tsx`       | `pie-chart.test.tsx`       |

- **预计工作量**: 小

#### Task 0.8: 更新所有 import 路径 + barrel exports

- **操作**:
  1. 批量搜索替换所有受影响的 import 路径
  2. 更新所有 `index.ts` barrel export 文件
  3. 更新 `main.tsx` 中的 Provider import
  4. 更新 `app/app.tsx` 中的 lazy import
- **验证**: `npm run build` 零报错
- **预计工作量**: 中

#### Phase 0 统计

| 指标                   | 数量         |
| ---------------------- | ------------ |
| 需重命名文件数         | **~50 个**   |
| 需更新 import 的文件数 | **~30 个**   |
| 预计总工作量           | **2-3 小时** |

---

### Phase 1: 新增缺失组件 (优先级: 🔴 高)

> **目标**: 补全模板中有、项目中缺失的通用组件

#### Task 1.1: 添加 ThemeProvider + ThemeSwitch

- **模板**: `context/theme-provider.tsx.template` + `shared/components/ui/theme-switch.tsx.template`
- **目标路径**:
  - `src/shared/context/theme-provider.tsx`
  - `src/shared/components/ui/theme-switch.tsx`
- **操作**:
  1. 复制模板，替换 `{{alias}}` → `@`
  2. 整合到 `main.tsx` Provider 链
  3. 在 `Header.tsx` 添加 `<ThemeSwitch />`
  4. 确保 `index.css` 支持 `dark` class 变量
- **依赖**: 无
- **预计工作量**: 小
- **验证**: 页面可切换 light/dark/system 主题

#### Task 1.2: 添加 Error Pages

- **模板**: `features/errors/index.tsx.template`
- **目标路径**: `src/features/errors/`
- **操作**:
  1. 复制模板，替换别名
  2. 在 `app/App.tsx` 路由添加 404 catch-all
  3. 可选: 替换 ErrorBoundary fallback 为 `<GeneralError minimal />`
- **依赖**: 无
- **预计工作量**: 小
- **验证**: 访问不存在路由显示 404 页面

#### Task 1.3: 添加 PasswordInput

- **模板**: `shared/components/ui/password-input.tsx.template`
- **目标路径**: `src/shared/components/ui/password-input.tsx`
- **操作**: 复制模板，更新 barrel export
- **依赖**: 无
- **预计工作量**: 最小
- **验证**: 组件可被其他地方引用

#### Task 1.4: 添加 ConfirmDialog

- **模板**: `shared/components/ui/confirm-dialog.tsx.template`
- **目标路径**: `src/shared/components/ui/confirm-dialog.tsx`
- **操作**: 复制模板，更新 barrel export
- **依赖**: 无
- **预计工作量**: 最小
- **验证**: 组件可被其他地方引用

#### Task 1.5: 添加 SignOutDialog

- **模板**: `shared/components/navigation/sign-out-dialog.tsx.template`
- **目标路径**: `src/shared/components/navigation/sign-out-dialog.tsx`
- **操作**:
  1. 复制模板
  2. 创建 `src/shared/components/navigation/` 目录
  3. 适配 MSAL 的 logout 方法
- **依赖**: Task 1.4 (ConfirmDialog)
- **预计工作量**: 小
- **验证**: 登出时显示确认弹窗

---

### Phase 2: 抽取 Header 内联组件 (优先级: 🔴 高)

> **目标**: 将 Header 内联的用户菜单抽取为独立组件

#### Task 2.1: 提取 ProfileDropdown

- **模板**: `shared/components/navigation/profile-dropdown.tsx.template`
- **现有代码**: `Header.tsx` 第 69-98 行 (DropdownMenu 部分)
- **操作**:
  1. 基于模板创建 `src/shared/components/navigation/profile-dropdown.tsx`
  2. 整合 MSAL `useAuth()` 获取用户信息
  3. 整合 SignOutDialog 替代直接 `logout()`
  4. 从 Header.tsx 移除内联 DropdownMenu，改为 `<ProfileDropdown />`
  5. 添加 i18n 支持
- **依赖**: Task 1.5
- **预计工作量**: 中
- **验证**: Header 用户菜单功能不变，代码更简洁

#### Task 2.2: 精简 Header.tsx

- **模板**: `shared/components/layout/header.tsx.template` (仅参考模式，不直接使用 SidebarTrigger)
- **操作**:
  1. Header 保留: Logo + 语言切换 + `<ThemeSwitch />` + `<ProfileDropdown />`
  2. 对齐模板的 scroll-shadow 效果
  3. 确保 `cn()` 工具函数使用一致
- **依赖**: Task 1.1, Task 2.1
- **预计工作量**: 中
- **验证**: Header 外观增强，功能不变

---

### Phase 3: 重构 Auth 模块 (优先级: 🔴 高)

> **目标**: 拆分 307 行单体 AuthDialog 为模板标准的独立表单组件

#### Task 3.1: 创建 SignInForm 组件

- **模板**: `features/auth/sign-in-form.tsx.template`
- **操作**:
  1. 基于模板创建 `src/features/auth/components/SignInForm.tsx`
  2. 替换 OAuth 按钮为 Microsoft (MSAL) 登录
  3. 整合现有 `useLogin.ts` hook
  4. 使用 react-hook-form + zod 验证（如果现有没有，则添加）
  5. 添加 i18n
- **依赖**: Task 1.3 (PasswordInput)
- **预计工作量**: 中
- **现有迁移内容**: 从 `AuthDialog.tsx` 提取登录表单逻辑 (~80 行)

#### Task 3.2: 创建 SignUpForm 组件

- **模板**: `features/auth/sign-up-form.tsx.template`
- **操作**:
  1. 基于模板创建 `src/features/auth/components/SignUpForm.tsx`
  2. 整合现有 `useRegister.ts` hook
  3. 添加密码强度等模板特性
  4. 添加 i18n
- **依赖**: Task 1.3 (PasswordInput)
- **预计工作量**: 中
- **现有迁移内容**: 从 `AuthDialog.tsx` 提取注册表单逻辑 (~80 行)

#### Task 3.3: 重构 AuthDialog 为组合组件

- **操作**:
  1. `AuthDialog.tsx` 缩减为 ~50 行的壳组件
  2. 内部使用 `<Tabs>` 切换 `<SignInForm />` + `<SignUpForm />`
  3. 删除内联的表单逻辑
  4. 保持外部 API 不变 (`open`, `onOpenChange`, `defaultTab`)
- **依赖**: Task 3.1, Task 3.2
- **预计工作量**: 中
- **验证**: 登录/注册功能完全不变，代码从 307 行减少到 ~50 行

#### Task 3.4: 添加 Zod Auth Schemas

- **模板**: `lib/validations/auth.ts.template`
- **操作**:
  1. 创建 `src/lib/validations/auth.ts`
  2. 定义 `signInSchema`, `signUpSchema`, `forgotPasswordSchema`
  3. SignInForm 和 SignUpForm 引用统一 schema
- **依赖**: 无
- **预计工作量**: 小
- **验证**: 表单验证逻辑集中管理

---

### Phase 4: Landing Page 对齐 (优先级: ⚠️ 中)

> **目标**: 对齐 Landing 组件与模板模式

#### Task 4.1: 对齐 Hero 组件

- **模板**: `features/landing/hero-section.tsx.template`
- **现有**: `Hero.tsx` (71 行，已有 `@templateRef` 注释)
- **操作**:
  1. 对比模板结构，补齐缺失属性（如 responsive breakpoints）
  2. 确保动画/过渡效果对齐模板标准
  3. 验证 dark mode 兼容性
- **依赖**: Task 1.1 (ThemeProvider)
- **预计工作量**: 小
- **验证**: Hero 外观一致，dark mode 正常

#### Task 4.2: 对齐 Footer 组件

- **模板**: `features/landing/site-footer.tsx.template`
- **现有**: `Footer.tsx` (103 行)
- **操作**:
  1. 对比模板结构，统一类名约定
  2. 替换硬编码颜色为 CSS 变量（dark mode 兼容）
  3. 确保响应式布局对齐
- **依赖**: Task 1.1
- **预计工作量**: 小
- **验证**: Footer dark mode 正确显示

#### Task 4.3: 对齐 FeatureSection 组件

- **模板**: `features/landing/feature-section.tsx.template`
- **操作**: 对比模板，补齐动画/交互效果
- **依赖**: 无
- **预计工作量**: 最小
- **验证**: 功能一致

---

### Phase 5: Chat 模块对齐 (优先级: ⚠️ 中)

> **目标**: 对齐 Chat 组件与模板模式

#### Task 5.1: 对齐 ChatInterface 组件

- **模板**: `features/chat/chat-interface.tsx.template`
- **现有**: `chat-interface.tsx` (108 行)
- **操作**:
  1. 对比模板的组件结构/Props 接口
  2. 统一命名约定 (如 `ChatInterface` vs `ChatPage`)
  3. 确保 empty state 组件对齐
  4. 国际化硬编码字符串（当前有中文硬编码 "欢迎使用研究助手"）
- **依赖**: 无
- **预计工作量**: 小
- **验证**: 功能不变，代码模式对齐

#### Task 5.2: i18n 硬编码清理

- **现有问题**: `chat-interface.tsx` 有中文硬编码字符串
- **操作**:
  1. 提取所有硬编码字符串到 `locales/en/chat.json` 和 `locales/fr/chat.json`
  2. 替换为 `t()` 调用
- **依赖**: 无
- **预计工作量**: 小
- **验证**: 切换语言后 Chat 界面正常显示

---

### Phase 6: 增强功能组件 (优先级: ⚠️ 低)

> **目标**: 添加模板中的增强体验组件

#### Task 6.1: 添加 NavigationProgress

- **模板**: `shared/components/navigation/navigation-progress.tsx.template`
- **操作**: 复制模板，集成到 MainLayout
- **依赖**: 无
- **预计工作量**: 最小
- **验证**: 路由切换时显示进度条

#### Task 6.2: 添加 CommandMenu (Cmd+K)

- **模板**: `shared/components/navigation/command-menu.tsx.template`
- **操作**:
  1. 复制模板
  2. 配置搜索目标（页面导航 + 主题切换）
  3. 集成到 Provider 链
- **依赖**: Task 1.1
- **预计工作量**: 中
- **验证**: Cmd+K 打开搜索面板

#### Task 6.3: 添加 LongText 组件

- **模板**: `shared/components/ui/long-text.tsx.template`
- **操作**: 复制模板，更新 barrel export
- **依赖**: 无
- **预计工作量**: 最小
- **验证**: 组件可引用

---

### Phase 7: API 层模式对齐 (优先级: ⚠️ 低)

> **目标**: 对齐 API 服务层模式（不迁移到 Axios）

#### Task 7.1: 重构 apiService 添加拦截器模式

- **模板参考**: `lib/api-client.ts.template` (Axios 拦截器思路)
- **操作**:
  1. 保持 `fetch` 实现
  2. 添加请求拦截器概念：自动注入 auth token（当前已有）
  3. 添加响应拦截器概念：统一错误 toast + 401 重定向
  4. 提取 `handleServerError` 工具函数（来自 `lib/handle-server-error.ts.template`）
- **不做**: 迁移到 Axios
- **依赖**: 无
- **预计工作量**: 中
- **验证**: API 错误统一 toast 展示

#### Task 7.2: 添加 handleServerError 工具

- **模板**: `lib/handle-server-error.ts.template`
- **目标路径**: `src/lib/handle-server-error.ts`
- **操作**: 基于模板创建，适配 fetch 错误格式
- **依赖**: 无
- **预计工作量**: 小
- **验证**: toast.error 统一调用

---

## 4. 依赖关系图

```
Phase 0 (文件命名规范化 — kebab-case)
  ├── Task 0.1~0.7 重命名文件
  └── Task 0.8 更新 imports ── npm run build 验证
         │
         ▼
Phase 1 (缺失组件)
  ├── Task 1.1 ThemeProvider ──────────────────────┐
  ├── Task 1.2 Error Pages                         │
  ├── Task 1.3 PasswordInput ────────┐             │
  ├── Task 1.4 ConfirmDialog ──┐     │             │
  └── Task 1.5 SignOutDialog ──┘     │             │
                                     │             │
Phase 2 (Header 抽取)               │             │
  ├── Task 2.1 ProfileDropdown ◄─────┤             │
  └── Task 2.2 精简 Header ◄─────────┴─────────────┘
                                     │
Phase 3 (Auth 重构)                  │
  ├── Task 3.1 SignInForm ◄──────────┘
  ├── Task 3.2 SignUpForm ◄──────────┘
  ├── Task 3.3 AuthDialog 组合 ◄── 3.1 + 3.2
  └── Task 3.4 Zod Schemas (独立)

Phase 4 (Landing 对齐) ◄── Phase 1
Phase 5 (Chat 对齐) ─── 独立
Phase 6 (增强组件) ◄── Phase 1
Phase 7 (API 层) ─── 独立
```

---

## 5. 工作量估算

| Phase                 | 任务数 | 预计工作量      | 优先级 |
| --------------------- | ------ | --------------- | ------ |
| Phase 0: 命名规范化   | 8      | 2-3 小时        | 🔴 高  |
| Phase 1: 缺失组件     | 5      | 2-3 小时        | 🔴 高  |
| Phase 2: Header 抽取  | 2      | 1-2 小时        | 🔴 高  |
| Phase 3: Auth 重构    | 4      | 3-4 小时        | 🔴 高  |
| Phase 4: Landing 对齐 | 3      | 1-2 小时        | ⚠️ 中  |
| Phase 5: Chat 对齐    | 2      | 1 小时          | ⚠️ 中  |
| Phase 6: 增强组件     | 3      | 1-2 小时        | ⚠️ 低  |
| Phase 7: API 对齐     | 2      | 2-3 小时        | ⚠️ 低  |
| **合计**              | **29** | **~13-20 小时** |        |

---

## 6. 风险与缓解

| 风险                               | 影响  | 概率 | 缓解措施                                 |
| ---------------------------------- | ----- | ---- | ---------------------------------------- |
| MSAL 认证流程中断                  | 🔴 高 | 中   | Phase 3 每步后完整测试登录/注册/登出     |
| Dark mode CSS 变量缺失             | ⚠️ 中 | 高   | Phase 1.1 首先完善 `index.css` dark 变量 |
| Header 内硬编码颜色 (如 `#004890`) | ⚠️ 中 | 高   | Footer/Hero 需同时迁移到 CSS 变量        |
| 模板 `{{alias}}` 替换遗漏          | ⚠️ 低 | 低   | 每个 Task 后 `grep -r '{{alias}}'` 检查  |
| barrel export 缺失导致编译错误     | ⚠️ 低 | 中   | 每个新文件创建后立即更新 `index.ts`      |

---

## 7. 验收标准

### 每个 Task 的验收

- [ ] `npm run build` 零报错
- [ ] 功能回归: 核心流程（登录、聊天、导航）正常
- [ ] 无 `{{alias}}` 残留
- [ ] 新文件包含标准 JSDoc 头注释 (`@module`, `@templateRef`)
- [ ] dark mode 测试通过（Phase 1.1 后的所有 Task）

### 整体验收

- [ ] 模板覆盖率从 ~30% 提升到 ~80%
- [ ] `AuthDialog.tsx` 从 307 行减少到 ~50 行
- [ ] 所有硬编码 CSS 颜色替换为变量/Tailwind token
- [ ] Dark mode 全站可用
- [ ] Error pages (404/500) 正常工作
- [ ] 代码注释对齐 code-comment skill 标准

---

## 8. 推荐执行顺序

```
开始
  │
  ▼
Phase 0: 文件命名规范化 (kebab-case)
  Task 0.1~0.7 (按模块分批 git mv) → Task 0.8 (更新 imports) → npm run build
  │
  ▼
Phase 1.1 → 1.2 → 1.3 → 1.4 → 1.5  (并行: 1.2 可与 1.3/1.4 并行)
  │
  ▼
Phase 2.1 → 2.2
  │
  ▼
Phase 3.4 → 3.1 → 3.2 → 3.3
  │
  ▼
Phase 4.1 → 4.2 → 4.3  (可与 Phase 5 并行)
  │
  ▼
Phase 5.1 → 5.2
  │
  ▼
Phase 6.1 → 6.2 → 6.3  (可选)
  │
  ▼
Phase 7.1 → 7.2  (可选)
  │
  ▼
完成 ✅
```

---

**建议**: 先执行 Phase 0-3 (命名规范 + 核心重构)，这是最有价值的部分。Phase 4-7 可根据时间和需要逐步完成。
