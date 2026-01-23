---
name: dev-frontend-react
description: React + TypeScript 前端开发专家。Use when (1) 构建 React 应用, (2) 设计组件架构, (3) 状态管理, (4) API 集成, (5) 性能优化, (6) TypeScript 类型定义
---

# React Frontend Development Expert

## Objectives

- 构建可维护、高性能的 React 应用
- 实现清晰的组件架构
- 掌握现代 React 特性（Hooks, Suspense）
- 实现高效的状态管理
- 优化性能和用户体验

## Project Structure

```
frontend/
├── src/
│   ├── main.tsx                # 应用入口
│   ├── App.tsx                 # 根组件
│   ├── components/             # 可复用组件
│   │   ├── ui/                # UI 基础组件
│   │   ├── layout/            # 布局组件
│   │   └── common/            # 通用组件
│   ├── features/              # 功能模块（按功能组织）
│   │   ├── documents/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── api/
│   │   │   └── types.ts
│   │   └── chat/
│   ├── pages/                 # 页面组件
│   ├── hooks/                 # 全局 Hooks
│   ├── services/              # API 服务
│   ├── store/                 # 状态管理
│   ├── types/                 # TypeScript 类型
│   ├── utils/                 # 工具函数
│   └── config/                # 配置
├── public/                    # 静态资源
└── package.json
```

## Core Patterns

### 1. Component Design

```typescript
import { FC, ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
}

export const Button: FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
}) => {
  const baseStyles = 'rounded font-medium transition-colors';
  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };
  const sizeStyles = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

### 2. Custom Hooks

**useApi Hook**:
```typescript
import { useState, useCallback } from 'react';

export function useApi<T, P>(apiFunc: (params: P) => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (params: P) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFunc(params);
      setData(result);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunc]);

  return { data, loading, error, execute };
}
```

**useDebounce Hook**:
```typescript
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
```

**For more custom hooks:** See `references/custom-hooks.md`

### 3. State Management (Zustand)

**store/authStore.ts**:
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (email, password) => {
        const response = await authApi.login({ email, password });
        set({ user: response.user, token: response.token, isAuthenticated: true });
      },
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' }
  )
);
```

### 4. API Integration (React Query)

**services/api.ts**:
```typescript
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**features/documents/api/documentsApi.ts**:
```typescript
import { apiClient } from '@/services/api';
import { Document, DocumentCreate } from '../types';

export const documentsApi = {
  list: async (params?: { skip?: number; limit?: number }) => {
    const { data } = await apiClient.get<{ items: Document[]; total: number }>('/documents', { params });
    return data;
  },
  
  get: async (id: string) => {
    const { data } = await apiClient.get<Document>(`/documents/${id}`);
    return data;
  },
  
  create: async (document: DocumentCreate) => {
    const { data } = await apiClient.post<Document>('/documents', document);
    return data;
  },
  
  update: async (id: string, document: Partial<DocumentCreate>) => {
    const { data } = await apiClient.put<Document>(`/documents/${id}`, document);
    return data;
  },
  
  delete: async (id: string) => {
    await apiClient.delete(`/documents/${id}`);
  },
};
```

**features/documents/hooks/useDocuments.ts**:
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '../api/documentsApi';

export function useDocuments(params?: { skip?: number; limit?: number }) {
  return useQuery({
    queryKey: ['documents', params],
    queryFn: () => documentsApi.list(params),
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: documentsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: documentsApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
  });
}
```

**For complete API integration patterns:** See `references/api-integration.md`

### 5. Form Handling (React Hook Form)

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const documentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required'),
});

type DocumentFormData = z.infer<typeof documentSchema>;

export function DocumentForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
  });
  
  const createDocument = useCreateDocument();

  const onSubmit = async (data: DocumentFormData) => {
    await createDocument.mutateAsync(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="title">Title</label>
        <input id="title" {...register('title')} className="w-full px-3 py-2 border rounded" />
        {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
      </div>
      
      <div>
        <label htmlFor="content">Content</label>
        <textarea id="content" {...register('content')} rows={10} className="w-full px-3 py-2 border rounded" />
        {errors.content && <p className="text-red-500 text-sm">{errors.content.message}</p>}
      </div>
      
      <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded">
        {isSubmitting ? 'Creating...' : 'Create Document'}
      </button>
    </form>
  );
}
```

### 6. Error Boundary

```typescript
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <h2 className="text-red-800 font-bold">Something went wrong</h2>
          <p className="text-red-600">{this.state.error?.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
```

### 7. Routing (React Router)

```typescript
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'documents', element: <ProtectedRoute><DocumentsPage /></ProtectedRoute> },
      { path: 'documents/:id', element: <ProtectedRoute><DocumentDetailPage /></ProtectedRoute> },
      { path: 'chat', element: <ProtectedRoute><ChatPage /></ProtectedRoute> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
```

## Best Practices

### 1. Component Composition
```typescript
// Good: Composed components
function DocumentPage() {
  return (
    <div>
      <DocumentHeader />
      <DocumentContent />
      <DocumentActions />
    </div>
  );
}
```

### 2. Performance Optimization
```typescript
import { memo, useMemo, useCallback } from 'react';

// Memoize expensive computations
const expensiveValue = useMemo(() => computeExpensiveValue(data), [data]);

// Memoize callbacks
const handleClick = useCallback(() => doSomething(id), [id]);

// Memoize components
export const DocumentCard = memo(({ document }: Props) => {
  return <div>{document.title}</div>;
});
```

### 3. Type Safety
```typescript
// Define clear interfaces
interface DocumentCardProps {
  document: Document;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

// Use discriminated unions for variants
type ButtonVariant = 'primary' | 'secondary' | 'danger';
```

## Dependencies

```bash
# Core
npm install react react-dom
npm install -D @types/react @types/react-dom

# Routing
npm install react-router-dom

# State Management
npm install zustand

# API & Data Fetching
npm install @tanstack/react-query axios

# Forms
npm install react-hook-form @hookform/resolvers zod

# UI
npm install tailwindcss postcss autoprefixer

# Dev Tools
npm install -D vite @vitejs/plugin-react typescript
```

## Quick Start Checklist

- [ ] 初始化项目（Vite + React + TypeScript）
- [ ] 配置 Tailwind CSS
- [ ] 设置路由（React Router）
- [ ] 配置 API 客户端（Axios）
- [ ] 设置状态管理（Zustand）
- [ ] 配置 React Query
- [ ] 创建基础组件库
- [ ] 实现认证流程
- [ ] 添加错误处理

## References

**For detailed examples and patterns:**
- `references/custom-hooks.md` - Advanced custom hooks collection
- `references/api-integration.md` - Complete API integration patterns
- `references/performance.md` - Performance optimization techniques
- `references/testing.md` - Component testing strategies

## Resources

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
