# 前端架构

**最后更新:** 2026-01-23  
**状态:** ⏳ 待实现

---

## 规划结构

```
frontend/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── chat/
│   ├── components/          # React 组件
│   │   ├── ui/              # 基础 UI 组件
│   │   ├── chat/            # 聊天组件
│   │   └── document/        # 文档组件
│   ├── hooks/               # 自定义 Hooks
│   ├── lib/                 # 工具库
│   ├── types/               # TypeScript 类型
│   └── styles/              # 样式文件
├── public/                  # 静态资源
└── package.json
```

## 技术栈

| 技术             | 版本 | 用途        |
| ---------------- | ---- | ----------- |
| React            | 18.x | UI 框架     |
| TypeScript       | 4.9+ | 类型安全    |
| Vite             | 5.x  | 构建工具    |
| react-router-dom | 6.x  | 路由        |
| axios            | 1.x  | HTTP 客户端 |
| recharts         | 2.x  | 图表组件    |

## 核心页面（规划）

| 页面 | 路由         | 功能        |
| ---- | ------------ | ----------- |
| 首页 | `/`          | 应用入口    |
| 聊天 | `/chat`      | AI 问答界面 |
| 文档 | `/documents` | 文档管理    |
| 设置 | `/settings`  | 用户设置    |

## 组件结构（规划）

| 组件           | 职责               |
| -------------- | ------------------ |
| ChatInterface  | 聊天输入和消息显示 |
| DocumentViewer | PDF 预览和引用     |
| ChartRenderer  | 数据可视化         |
| SourceCitation | 来源引用展示       |

## 数据流

```
用户交互 → React State → API 调用 → 数据更新 → UI 重渲染
```

## 相关文档

- [后端架构](backend.md)
- [API 指南](../guides/api.md)

---

_代码生成后此文档将自动更新_
