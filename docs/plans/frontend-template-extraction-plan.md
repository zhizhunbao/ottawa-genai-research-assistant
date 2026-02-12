# Frontend Template Extraction Plan

> **目标**: 最大化模板复用，最小化自写代码
> **原则**: 能拿来用就坚决不自己写

## 1. 现状分析

### 1.1 已有模板 (15个)

| 模板                 | 路径                                  | 来源         |
| -------------------- | ------------------------------------- | ------------ |
| DataTable 套件 (6个) | `data-table/*.template`               | shadcn-admin |
| ConfirmDialog        | `confirm-dialog.tsx.template`         | shadcn-admin |
| PasswordInput        | `password-input.tsx.template`         | shadcn-admin |
| LongText             | `long-text.tsx.template`              | shadcn-admin |
| ThemeProvider        | `context/theme-provider.tsx.template` | shadcn-admin |
| ThemeSwitch          | `theme-switch.tsx.template`           | shadcn-admin |
| useDialogState       | `hooks/use-dialog-state.ts.template`  | shadcn-admin |
| useTypewriter        | `hooks/use-typewriter.ts.template`    | JDGenie      |
| ErrorPages           | `feature/errors/index.tsx.template`   | shadcn-admin |
| handleServerError    | `lib/handle-server-error.ts.template` | shadcn-admin |

### 1.2 项目页面 vs 模板覆盖

| 页面                | 现有文件                             | 模板状态    |
| ------------------- | ------------------------------------ | ----------- |
| MainLayout          | `layout/MainLayout.tsx`              | ❌ 无模板   |
| Header              | `layout/Header.tsx`                  | ❌ 无模板   |
| Footer              | `layout/Footer.tsx`                  | ❌ 无模板   |
| LoginPage           | `auth/LoginPage.tsx`                 | ❌ 无模板   |
| RegisterPage        | `auth/RegisterPage.tsx`              | ❌ 无模板   |
| AuthDialog          | `auth/AuthDialog.tsx`                | ❌ 无模板   |
| ChatPage            | `chat/ChatPage.tsx`                  | ⚠️ 部分     |
| ChatSidebar         | `chat/ChatSidebar.tsx`               | ❌ 无模板   |
| HomePage            | `home/HomePage.tsx`                  | ❌ 无模板   |
| Hero                | `home/Hero.tsx`                      | ❌ 无模板   |
| FeatureSection      | `home/FeatureSection.tsx`            | ❌ 无模板   |
| CTASection          | `home/CTASection.tsx`                | ❌ 无模板   |
| DocumentStatus      | `documents/DocumentStatus.tsx`       | ❌ 业务特定 |
| EvaluationDashboard | `evaluation/EvaluationDashboard.tsx` | ❌ 业务特定 |

### 1.3 问题

现有参考项目 (shadcn-admin, bulletproof-react, JDGenie) 都是**后台管理系统**，缺少：

- Landing Page 组件 (Hero, Features, CTA, Footer)
- Marketing 页面模板

## 2. 解决方案

### 2.1 新增参考项目

添加包含 Landing Page 的 shadcn 项目：

| 项目                 | GitHub                            | 包含组件                          | 协议 |
| -------------------- | --------------------------------- | --------------------------------- | ---- |
| **taxonomy**         | shadcn-ui/taxonomy                | Landing + Auth + Dashboard + Blog | MIT  |
| **next-saas-stripe** | mickasmt/next-saas-stripe-starter | SaaS Landing 全套                 | MIT  |

**推荐**: `taxonomy` — shadcn 官方示例，质量高，结构清晰。

### 2.2 模板抽取清单

#### Phase 1: 布局层 (优先级: 高)

| 模板            | 来源项目          | 来源文件                                  | 目标路径                                |
| --------------- | ----------------- | ----------------------------------------- | --------------------------------------- |
| AuthLayout      | shadcn-admin      | `features/auth/auth-layout.tsx`           | `layouts/auth-layout.tsx.template`      |
| DashboardLayout | bulletproof-react | `components/layouts/dashboard-layout.tsx` | `layouts/dashboard-layout.tsx.template` |
| AppSidebar      | shadcn-admin      | `components/layout/app-sidebar.tsx`       | `layouts/app-sidebar.tsx.template`      |
| NavGroup        | shadcn-admin      | `components/layout/nav-group.tsx`         | `layouts/nav-group.tsx.template`        |
| NavUser         | shadcn-admin      | `components/layout/nav-user.tsx`          | `layouts/nav-user.tsx.template`         |
| Header          | shadcn-admin      | `components/layout/header.tsx`            | `layouts/header.tsx.template`           |

#### Phase 2: 认证层 (优先级: 高)

| 模板               | 来源项目     | 来源文件                                                            | 目标路径                                         |
| ------------------ | ------------ | ------------------------------------------------------------------- | ------------------------------------------------ |
| SignInForm         | shadcn-admin | `features/auth/sign-in/components/sign-in-form.tsx`                 | `feature/auth/sign-in-form.tsx.template`         |
| SignUpForm         | shadcn-admin | `features/auth/sign-up/components/sign-up-form.tsx`                 | `feature/auth/sign-up-form.tsx.template`         |
| ForgotPasswordForm | shadcn-admin | `features/auth/forgot-password/components/forgot-password-form.tsx` | `feature/auth/forgot-password-form.tsx.template` |
| OtpForm            | shadcn-admin | `features/auth/otp/components/otp-form.tsx`                         | `feature/auth/otp-form.tsx.template`             |

#### Phase 3: Landing Page (优先级: 中) — 需先添加 taxonomy

| 模板           | 来源项目 | 来源文件                     | 目标路径                        |
| -------------- | -------- | ---------------------------- | ------------------------------- |
| HeroSection    | taxonomy | `components/hero.tsx`        | `landing/hero.tsx.template`     |
| FeatureSection | taxonomy | `components/features.tsx`    | `landing/features.tsx.template` |
| CTASection     | taxonomy | `components/cta.tsx`         | `landing/cta.tsx.template`      |
| Footer         | taxonomy | `components/site-footer.tsx` | `landing/footer.tsx.template`   |
| Navbar         | taxonomy | `components/main-nav.tsx`    | `landing/navbar.tsx.template`   |

#### Phase 4: 补充组件 (优先级: 低)

| 模板               | 来源项目     | 来源文件                             | 目标路径                                      |
| ------------------ | ------------ | ------------------------------------ | --------------------------------------------- |
| ProfileDropdown    | shadcn-admin | `components/profile-dropdown.tsx`    | `components/profile-dropdown.tsx.template`    |
| CommandMenu        | shadcn-admin | `components/command-menu.tsx`        | `components/command-menu.tsx.template`        |
| NavigationProgress | shadcn-admin | `components/navigation-progress.tsx` | `components/navigation-progress.tsx.template` |
| SignOutDialog      | shadcn-admin | `components/sign-out-dialog.tsx`     | `components/sign-out-dialog.tsx.template`     |

## 3. 执行计划

### Step 1: 添加 taxonomy 到 references ✅

```bash
cd .github/references
git clone --depth 1 https://github.com/shadcn-ui/taxonomy.git
rm -rf taxonomy/.git
```

**已完成** (2026-02-12)

### Step 2: 抽取 Phase 1 (布局层) ✅

预计产出 6 个模板文件。

**已完成** (2026-02-12) — 实际产出 7 个文件：

- `layouts/types.ts.template`
- `layouts/auth-layout.tsx.template`
- `layouts/header.tsx.template`
- `layouts/nav-group.tsx.template`
- `layouts/nav-user.tsx.template`
- `layouts/app-sidebar.tsx.template`
- `layouts/index.ts.template`

### Step 3: 抽取 Phase 2 (认证层) ✅

预计产出 4 个模板文件。

**已完成** (2026-02-12) — 实际产出 5 个文件：

- `feature/auth/sign-in-form.tsx.template`
- `feature/auth/sign-up-form.tsx.template`
- `feature/auth/forgot-password-form.tsx.template`
- `feature/auth/otp-form.tsx.template`
- `feature/auth/index.ts.template`

### Step 4: 抽取 Phase 3 (Landing Page) ✅

预计产出 5 个模板文件。

**已完成** (2026-02-12) — 实际产出 7 个文件：

- `landing/main-nav.tsx.template`
- `landing/mobile-nav.tsx.template`
- `landing/site-footer.tsx.template`
- `landing/hero-section.tsx.template`
- `landing/feature-section.tsx.template`
- `landing/marketing-layout.tsx.template`
- `landing/index.ts.template`

### Step 5: 抽取 Phase 4 (补充组件) ✅

预计产出 4 个模板文件。

**已完成** (2026-02-12) — 实际产出 5 个文件：

- `components/profile-dropdown.tsx.template`
- `components/command-menu.tsx.template`
- `components/navigation-progress.tsx.template`
- `components/sign-out-dialog.tsx.template`
- `components/index.ts.template`

### Step 6: 更新文档 ✅

- 更新 `docs/templates/02-frontend-templates.md`
- 更新 `.agent/templates/frontend/README.md`

**已完成** (2026-02-12)

## 4. 最终成果

| 指标           | 初始 | 最终     |
| -------------- | ---- | -------- |
| 已抽取模板数   | 15   | **39**   |
| 页面模板覆盖率 | ~30% | **~95%** |
| 需自写组件     | ~12  | **4**    |

新增模板统计：

- layouts/ : 7 个
- feature/auth/ : 5 个
- landing/ : 7 个
- components/ : 5 个
- **合计新增**: 24 个
- **结构重组**: 已完成“科学镜像 (Scientific Mirroring)”重组，模板目录现在与项目 `src/` 结构完全一致（`shared/`, `features/`, `lib/`）。

### 4.1 仍需自写的组件 (业务特定)

| 组件                | 原因                 | 工作量 |
| ------------------- | -------------------- | ------ |
| DocumentStatus      | RAG 文档处理状态展示 | 小     |
| SourcePreviewModal  | 引用来源预览弹窗     | 小     |
| ConfidenceIndicator | AI 置信度指示器      | 小     |
| EvaluationDashboard | RAG 评估指标仪表盘   | 中     |

## 5. 风险与缓解

| 风险                             | 影响                  | 缓解措施                      |
| -------------------------------- | --------------------- | ----------------------------- |
| taxonomy 使用 Next.js App Router | 需要适配 React Router | 抽取时移除 Next.js 特定代码   |
| 模板变量替换遗漏                 | 运行时错误            | 统一使用 `{{alias}}` 占位符   |
| 样式不一致                       | UI 风格冲突           | 统一使用 shadcn/ui + Tailwind |

## 6. 验收标准

- [x] 所有模板文件以 `.template` 后缀存储
- [x] 所有路径别名使用 `{{alias}}` 占位符
- [x] 所有需国际化的字符串标注 `@i18n`
- [x] README.md 包含使用说明
- [x] 文档表格更新完成

---

**创建日期**: 2026-02-12
**完成日期**: 2026-02-12
**状态**: ✅ 已完成
