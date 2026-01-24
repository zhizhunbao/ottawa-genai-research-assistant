# Frontend Application

Ottawa GenAI Research Assistant 前端应用。

## 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **状态管理**: Zustand
- **HTTP 客户端**: Axios
- **样式**: CSS Modules / Tailwind CSS

## 项目结构

```
frontend/
├── src/
│   ├── app/                    # 应用入口
│   │   └── App.tsx
│   ├── features/               # 功能模块（按领域组织）
│   │   ├── auth/              # 认证功能
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── services/
│   │   └── research/          # 研究功能
│   │       ├── components/
│   │       ├── hooks/
│   │       └── services/
│   ├── shared/                 # 共享代码
│   │   ├── components/        # 通用组件
│   │   ├── hooks/             # 通用 hooks
│   │   ├── utils/             # 工具函数
│   │   └── types/             # 类型定义
│   └── stores/                 # 状态管理
├── public/
├── package.json
└── vite.config.ts
```

## 快速开始

```bash
# 安装依赖
cd frontend
npm install

# 运行开发服务器
npm run dev

# 构建生产版本
npm run build

# 运行测试
npm test
```

## 开发服务器

启动后访问: http://localhost:3000
