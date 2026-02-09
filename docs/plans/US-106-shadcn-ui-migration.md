# US-106: shadcn/ui 迁移计划

## 📋 PRD 概述

### 目标

将前端组件库从自定义组件迁移到 **shadcn/ui**，以获得：

- ✅ **无障碍支持** - 基于 Radix UI，符合 WCAG 标准
- ✅ **经过测试** - 社区验证，边缘情况已处理
- ✅ **可定制** - 代码复制到项目，完全可控
- ✅ **一致性** - 统一的设计语言和交互模式
- ✅ **开发效率** - 丰富的组件库，减少造轮子

### 非目标

- ❌ 不改变现有的业务逻辑
- ❌ 不改变路由结构
- ❌ 不改变 API 接口

---

## 🏗️ 现状分析

### 当前组件清单

#### shared/components/ui (8个组件)

| 组件          | 文件              | 大小  | 对应 shadcn/ui        |
| ------------- | ----------------- | ----- | --------------------- |
| Button        | Button.tsx        | 2.0KB | ✅ button             |
| Card          | Card.tsx          | 2.1KB | ✅ card               |
| Input         | Input.tsx         | 1.0KB | ✅ input              |
| Label         | Label.tsx         | 0.7KB | ✅ label              |
| Alert         | Alert.tsx         | 1.8KB | ✅ alert              |
| StatsCard     | StatsCard.tsx     | 1.6KB | 🔧 自定义 (基于 card) |
| ActivityList  | ActivityList.tsx  | 2.1KB | 🔧 自定义             |
| ErrorBoundary | ErrorBoundary.tsx | 1.9KB | 🔧 自定义             |

#### shared/components/layout (6个组件)

| 组件            | 文件                | 说明             |
| --------------- | ------------------- | ---------------- |
| Header          | Header.tsx          | 7.3KB - 导航头部 |
| Footer          | Footer.tsx          | 5.3KB - 页脚     |
| MainLayout      | MainLayout.tsx      | 布局容器         |
| DashboardLayout | DashboardLayout.tsx | 仪表盘布局       |
| AuthLayout      | AuthLayout.tsx      | 认证页面布局     |
| PageContainer   | PageContainer.tsx   | 页面容器         |

### 当前样式架构

```
tailwind.config.js    # Ottawa 品牌色定义
src/index.css         # 基础样式 + glass/gradient 工具类
shared/styles/theme.ts # TypeScript 样式常量
```

### 品牌色（需保留）

```javascript
// tailwind.config.js
colors: {
  brand: {
    primary: '#004890',      // Ottawa 政府蓝
    'primary-light': '#0066cc',
    'primary-dark': '#003366',
    secondary: '#667eea',
    'secondary-light': '#764ba2',
  },
  gold: {
    DEFAULT: '#ffd700',
    light: '#ffe44d',
    dark: '#ffb000',
  },
}
```

---

## 📦 需要添加的 shadcn/ui 组件

### 必须 (现有功能替换)

1. **button** - 替换 Button.tsx
2. **card** - 替换 Card.tsx
3. **input** - 替换 Input.tsx
4. **label** - 替换 Label.tsx
5. **alert** - 替换 Alert.tsx
6. **textarea** - 聊天输入

### 推荐 (增强用户体验)

7. **dialog** - 模态框
8. **dropdown-menu** - 用户菜单
9. **avatar** - 用户头像
10. **badge** - 状态标签
11. **separator** - 分隔线
12. **skeleton** - 加载状态
13. **toast/sonner** - 通知提示
14. **tabs** - 设置页面
15. **scroll-area** - 聊天消息列表
16. **tooltip** - 工具提示

### 可选 (未来功能)

17. **form** - 表单验证 (配合 react-hook-form + zod)
18. **select** - 下拉选择
19. **checkbox** - 复选框
20. **sheet** - 移动端侧边栏
21. **command** - 命令面板/搜索

---

## 🗓️ Sprint 计划

### Sprint 1: 基础设施 (Day 1-2)

**目标**: 初始化 shadcn/ui，配置 Ottawa 品牌主题

#### 任务清单

- [ ] **1.1 安装依赖**

  ```bash
  cd frontend
  npx shadcn@latest init
  ```

  配置选项：
  - Style: New York
  - Base color: Slate
  - CSS variables: Yes
  - React Server Components: No
  - Path aliases: @/\*

- [ ] **1.2 配置 Ottawa 品牌主题**
      修改 `src/index.css` 添加 CSS 变量：

  ```css
  :root {
    --primary: 212 100% 28%; /* #004890 Ottawa Blue */
    --primary-foreground: 0 0% 100%;
    --accent: 48 100% 50%; /* #ffd700 Ottawa Gold */
    --accent-foreground: 212 100% 28%;
  }
  ```

- [ ] **1.3 配置 tailwind.config.js**
      确保 shadcn 配置与现有配置兼容

- [ ] **1.4 安装基础组件**

  ```bash
  npx shadcn@latest add button card input label alert textarea
  ```

- [ ] **1.5 验证安装**
      创建测试页面验证组件渲染正确

#### 验收标准

- ✅ shadcn/ui 初始化成功
- ✅ 品牌色正确应用
- ✅ 所有基础组件可用
- ✅ 现有功能不受影响

---

### Sprint 2: 核心组件迁移 (Day 3-5)

**目标**: 用 shadcn/ui 替换现有 UI 组件

#### 任务清单

- [ ] **2.1 创建 Button 适配层**
      保持原有 API 兼容，底层使用 shadcn Button

  ```typescript
  // src/shared/components/ui/Button.tsx
  // 扩展 shadcn Button，添加 Ottawa 特有变体
  export interface ButtonProps extends ShadcnButtonProps {
    variant?: 'default' | 'gold' | 'outline' | ... // 保持原有变体
    loading?: boolean  // 保留 loading 状态
  }
  ```

- [ ] **2.2 迁移 Card 组件**
      替换为 shadcn Card，调整圆角和阴影匹配设计

- [ ] **2.3 迁移 Input 组件**
      替换为 shadcn Input，确保表单样式一致

- [ ] **2.4 迁移 Label 组件**
      直接使用 shadcn Label

- [ ] **2.5 迁移 Alert 组件**
      替换为 shadcn Alert

- [ ] **2.6 更新组件导出**

  ```typescript
  // src/shared/components/ui/index.ts
  export { Button } from './button'  // shadcn
  export { Card, CardHeader, ... } from './card'  // shadcn
  ```

- [ ] **2.7 更新所有导入**
      全局替换组件导入路径

#### 验收标准

- ✅ 所有页面渲染正常
- ✅ 组件样式与设计稿一致
- ✅ 无 TypeScript 错误
- ✅ 单元测试通过

---

### Sprint 3: 增强组件添加 (Day 6-8)

**目标**: 添加 UX 增强组件

#### 任务清单

- [ ] **3.1 安装增强组件**

  ```bash
  npx shadcn@latest add dialog dropdown-menu avatar badge
  npx shadcn@latest add separator skeleton sonner tabs
  npx shadcn@latest add scroll-area tooltip
  ```

- [ ] **3.2 重构 Header 组件**
  - 使用 DropdownMenu 替换自定义用户菜单
  - 添加 Avatar 组件显示用户头像
  - 添加 Tooltip 增强导航体验

- [ ] **3.3 重构 ChatPage 组件**
  - 使用 ScrollArea 优化消息列表
  - 添加 Skeleton 加载状态
  - 使用 Sonner 显示操作反馈

- [ ] **3.4 重构 SettingsPage 组件**
  - 使用 Tabs 组织设置分类
  - 添加 Dialog 确认操作

- [ ] **3.5 添加全局 Toast 提供者**

  ```typescript
  // main.tsx
  import { Toaster } from "@/shared/components/ui/sonner"

  <App />
  <Toaster />
  ```

#### 验收标准

- ✅ 用户菜单交互流畅
- ✅ 聊天页面滚动平滑
- ✅ Toast 通知正常显示
- ✅ 设置页面分类清晰

---

### Sprint 4: 页面优化 & 清理 (Day 9-10)

**目标**: 清理旧代码，优化整体体验

#### 任务清单

- [ ] **4.1 清理旧样式文件**
  - 移除 `shared/styles/theme.ts` 中不再需要的常量
  - 更新 `shared/styles/index.ts` 导出

- [ ] **4.2 优化 Home 页面**
  - 使用 shadcn 组件增强 Hero
  - 优化 Feature Cards
  - 添加微动画

- [ ] **4.3 优化 Documents 页面**
  - 使用 Badge 显示文档状态
  - 使用 Skeleton 改善加载体验
  - 添加 Dialog 预览文档

- [ ] **4.4 优化 Auth 页面**
  - 统一表单样式
  - 添加表单验证反馈

- [ ] **4.5 删除废弃组件**
      备份后删除不再使用的旧组件

- [ ] **4.6 更新文档**
  - 更新 README 说明组件使用
  - 添加 Storybook (可选)

#### 验收标准

- ✅ 无废弃代码
- ✅ 构建无警告
- ✅ 所有页面视觉一致
- ✅ 性能无退化

---

### Sprint 5: 表单增强 (可选, Day 11-12)

**目标**: 添加高级表单功能

#### 任务清单

- [ ] **5.1 安装表单组件**

  ```bash
  npx shadcn@latest add form select checkbox radio-group switch
  npm install @hookform/resolvers react-hook-form
  ```

- [ ] **5.2 创建表单模式**
      配合现有 Zod schema 使用

- [ ] **5.3 重构 DocumentUploadForm**
      使用 Form 组件改进验证体验

- [ ] **5.4 重构 RegisterPage**
      添加实时验证反馈

---

## 📁 迁移后目录结构

```
frontend/src/
├── components/
│   └── ui/              # shadcn/ui 组件 (自动生成)
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── ...
│       └── index.ts     # 统一导出
├── shared/
│   ├── components/
│   │   ├── layout/      # 保留 - 布局组件
│   │   └── ui/          # 可能废弃或仅保留自定义组件
│   │       ├── StatsCard.tsx   # 保留 - 业务组件
│   │       ├── ActivityList.tsx
│   │       └── ErrorBoundary.tsx
│   └── styles/          # 简化
│       └── index.ts     # 仅保留品牌常量
├── lib/
│   └── utils.ts         # shadcn cn() 函数
└── index.css            # CSS 变量 + 基础样式
```

---

## ⚠️ 风险 & 缓解措施

| 风险       | 影响 | 缓解措施                       |
| ---------- | ---- | ------------------------------ |
| 样式冲突   | 中   | 逐组件迁移，每次迁移后全面测试 |
| 破坏性变更 | 高   | 创建适配层保持 API 兼容        |
| 性能退化   | 低   | 监控 bundle 大小，按需导入     |
| 学习成本   | 低   | shadcn 使用标准 React 模式     |

---

## 📊 成功指标

| 指标        | 当前     | 目标           |
| ----------- | -------- | -------------- |
| 组件数量    | 8 自定义 | 16+ shadcn/ui  |
| 无障碍评分  | 未测试   | Lighthouse 90+ |
| Bundle 大小 | 基准     | ≤ 110% 基准    |
| 开发速度    | 基准     | +30%           |

---

## ✅ 检查清单

### 开始前

- [ ] 创建 Git 分支: `feature/shadcn-ui-migration`
- [ ] 备份现有组件
- [ ] 确认 Node.js ≥ 18

### 每个 Sprint 后

- [ ] 运行 `npm run build` 无错误
- [ ] 运行 `npm run lint` 无警告
- [ ] 手动测试关键路径
- [ ] 提交代码

### 完成后

- [ ] 合并到 main
- [ ] 更新项目文档
- [ ] 团队知识分享

---

## 📚 参考资源

- [shadcn/ui 官方文档](https://ui.shadcn.com/)
- [Radix UI 无障碍指南](https://www.radix-ui.com/primitives/docs/overview/accessibility)
- [Tailwind CSS v4 迁移指南](https://tailwindcss.com/docs/upgrade-guide)
