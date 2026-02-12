# 🌐 B. Frontend Templates (React / TypeScript)

> **层级**: Frontend | **模板数**: 18
> **主要参考**: [bulletproof-react](../../.github/references/bulletproof-react/) + [shadcn-admin](../../.github/references/shadcn-admin/) + [JDGenie UI](../../.github/references/joyagent-jdgenie/ui/)

基于 bulletproof-react 的 **Feature-First** 结构。

---

## Lib Templates (全局共享库)

### B1. `lib/api-client.ts.template` — HTTP 客户端

> **来源**: [`bulletproof-react/apps/react-vite/src/lib/api-client.ts`](../../.github/references/bulletproof-react/apps/react-vite/src/lib/api-client.ts)

```typescript
// 核心模式:
export const api = Axios.create({ baseURL: env.API_URL });

// 请求拦截器: 注入 auth
api.interceptors.request.use(authRequestInterceptor);

// 响应拦截器: 提取 data + 错误 toast + 401 跳转
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    useNotifications.getState().addNotification({ type: 'error', message });
    if (error.response?.status === 401) { window.location.href = paths.auth.login.getHref(); }
    return Promise.reject(error);
  },
);
```

---

### B2. `lib/react-query.ts.template` — TanStack Query 配置

> **来源**: [`bulletproof-react/apps/react-vite/src/lib/react-query.ts`](../../.github/references/bulletproof-react/apps/react-vite/src/lib/react-query.ts)

```typescript
// 核心模式:
export const queryConfig = {
  queries: { refetchOnWindowFocus: false, retry: false, staleTime: 1000 * 60 },
} satisfies DefaultOptions;

// 类型工具
export type QueryConfig<T extends (...args: any[]) => any> = Omit<ReturnType<T>, 'queryKey' | 'queryFn'>;
export type MutationConfig<MutationFnType extends (...args: any) => Promise<any>> =
  UseMutationOptions<ApiFnReturnType<MutationFnType>, Error, Parameters<MutationFnType>[0]>;
```

---

### B3. `lib/authorization.tsx.template` — RBAC 权限

> **来源**: [`bulletproof-react/apps/react-vite/src/lib/authorization.tsx`](../../.github/references/bulletproof-react/apps/react-vite/src/lib/authorization.tsx)

```tsx
// 核心模式:
export enum ROLES { ADMIN = 'ADMIN', USER = 'USER' }

export const POLICIES = {
  'comment:delete': (user: User, comment: Comment) => user.role === 'ADMIN' || comment.author?.id === user.id,
};

export const useAuthorization = () => {
  const checkAccess = ({ allowedRoles }) => allowedRoles.includes(user.data.role);
  return { checkAccess, role: user.data.role };
};

// 声明式权限组件
export const Authorization = ({ allowedRoles, policyCheck, children, forbiddenFallback }) => ...;
```

---

### B6. `lib/handle-server-error.ts.template` — 错误处理

> **来源**: [`shadcn-admin/src/lib/handle-server-error.ts`](../../.github/references/shadcn-admin/src/lib/handle-server-error.ts)

```typescript
// 核心模式:
export function handleServerError(error: unknown) {
  let errMsg = 'Something went wrong!';
  if (error instanceof AxiosError) { errMsg = error.response?.data.title; }
  toast.error(errMsg);
}
```

---

## Feature Templates (Feature-First 标准文件集)

### B4. `feature/api/get-items.ts.template` — Query Hook

> **来源**: [`bulletproof-react/apps/react-vite/src/features/discussions/api/get-discussions.ts`](../../.github/references/bulletproof-react/apps/react-vite/src/features/discussions/api/get-discussions.ts)

```typescript
// 核心模式:
// 1. API 函数
export const get{{FeatureName}}s = (page = 1): Promise<{ data: {{FeatureName}}[]; meta: Meta }> =>
  api.get(`/{{feature_name}}s`, { params: { page } });

// 2. queryOptions 工厂
export const get{{FeatureName}}sQueryOptions = ({ page }: { page?: number } = {}) =>
  queryOptions({ queryKey: ['{{feature_name}}s', { page }], queryFn: () => get{{FeatureName}}s(page) });

// 3. Hook 封装
export const use{{FeatureName}}s = ({ queryConfig, page }: Use{{FeatureName}}sOptions) =>
  useQuery({ ...get{{FeatureName}}sQueryOptions({ page }), ...queryConfig });
```

---

### B5. `feature/api/create-item.ts.template` — Mutation Hook

> **来源**: [`bulletproof-react/apps/react-vite/src/features/discussions/api/create-discussion.ts`](../../.github/references/bulletproof-react/apps/react-vite/src/features/discussions/api/create-discussion.ts)

```typescript
// 核心模式:
// 1. Zod schema 验证
export const create{{FeatureName}}InputSchema = z.object({
  title: z.string().min(1, 'Required'),
  body: z.string().min(1, 'Required'),
});

// 2. Mutation 函数
export const create{{FeatureName}} = ({ data }): Promise<{{FeatureName}}> => api.post(`/{{feature_name}}s`, data);

// 3. Hook + 自动 invalidate
export const useCreate{{FeatureName}} = ({ mutationConfig } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: get{{FeatureName}}sQueryOptions().queryKey });
      onSuccess?.(...args);
    },
    mutationFn: create{{FeatureName}},
  });
};
```

---

## Layout Templates (布局层)

### B7. `layouts/dashboard-layout.tsx.template` — 响应式 Dashboard 布局

> **来源**: [`bulletproof-react/apps/react-vite/src/components/layouts/dashboard-layout.tsx`](../../.github/references/bulletproof-react/apps/react-vite/src/components/layouts/dashboard-layout.tsx)

```tsx
// 核心模式: 侧边栏 + 顶栏 + 移动端 Drawer + 导航进度条
type SideNavigationItem = {
  name: string;
  to: string;
  icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
};

// 导航进度条 — 路由切换时自动显示
const Progress = () => {
  const { state } = useNavigation();
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (state === 'loading') {
      const timer = setInterval(() => setProgress((p) => Math.min(p + 10, 100)), 300);
      return () => clearInterval(timer);
    }
  }, [state]);
  if (state !== 'loading') return null;
  return <div className="fixed left-0 top-0 h-1 bg-blue-500" style={{ width: `${progress}%` }} />;
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { checkAccess } = useAuthorization();
  // RBAC 过滤导航项: 仅 ADMIN 可见 Users 页
  const navigation = [
    { name: 'Dashboard', to: paths.app.dashboard.getHref(), icon: Home },
    checkAccess({ allowedRoles: [ROLES.ADMIN] }) && { name: 'Users', to: paths.app.users.getHref(), icon: Users },
  ].filter(Boolean) as SideNavigationItem[];

  return (
    <div className="flex min-h-screen">
      {/* Desktop 侧边栏 */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 sm:flex">
        <nav>{navigation.map(/* NavLink with isActive */)}></nav>
      </aside>
      {/* Mobile Drawer */}
      <Drawer>
        <DrawerTrigger><Button size="icon"><PanelLeft /></Button></DrawerTrigger>
        <DrawerContent side="left"><nav>{/* same navigation */}</nav></DrawerContent>
      </Drawer>
      {/* 用户下拉菜单 */}
      <DropdownMenu>{/* Profile + Sign Out */}</DropdownMenu>
      <main>{children}</main>
    </div>
  );
}
```

**关键特性**:

- 响应式: Desktop 固定侧边栏 / Mobile Drawer
- RBAC 导航过滤: `checkAccess()` 控制菜单可见性
- 导航进度条: `useNavigation().state` 检测路由切换
- `NavLink` + `isActive` 高亮当前页

---

### B8. `layouts/auth-layout.tsx.template` — 认证页布局

> **来源**: [`bulletproof-react/apps/react-vite/src/components/layouts/auth-layout.tsx`](../../.github/references/bulletproof-react/apps/react-vite/src/components/layouts/auth-layout.tsx)

```tsx
// 核心模式: 居中卡片布局 (登录 / 注册 / 重置密码)
export function AuthLayout({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <Logo />
          <h2 className="mt-6 text-3xl font-bold">{title}</h2>
        </div>
        {children}
      </div>
    </div>
  );
}
```

---

### B9. `components/layout/sidebar-nav.tsx.template` — 可折叠侧边栏导航

> **来源**: [`shadcn-admin/src/components/layout/`](../../.github/references/shadcn-admin/src/components/layout/)

```tsx
// 核心模式: app-sidebar + nav-group + nav-user + team-switcher
// 包含文件: app-sidebar.tsx, nav-group.tsx, nav-user.tsx, team-switcher.tsx, types.ts

// NavGroup — 支持折叠的导航分组
type NavGroup = {
  title: string;
  items: NavItem[];
};

type NavItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  badge?: string;
  isActive?: boolean;
  items?: NavItem[]; // 子菜单
};

// NavUser — 底部用户信息 + 下拉菜单
function NavUser({ user }: { user: { name: string; email: string; avatar: string; } }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar><AvatarImage src={user.avatar} /></Avatar>
        <span>{user.name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {/* Profile / Settings / Logout */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

**关键特性**:

- 多级嵌套导航 (支持 `items[]` 子菜单)
- `badge` 属性显示未读数
- 底部用户信息区 + 下拉菜单
- 团队切换器 (多 workspace)

---

## Data Table Templates (数据表格层)

### B10. `components/data-table/data-table.tsx.template` — DataTable 组件套件

> **来源**: [`shadcn-admin/src/components/data-table/`](../../.github/references/shadcn-admin/src/components/data-table/)

包含 **7 个子文件**:

| 文件 | 功能 |
|------|------|
| `column-header.tsx` | 排序指示器 (asc/desc/hide) |
| `pagination.tsx` | 分页控件 (首/末/上一页/下一页 + 每页条数选择) |
| `toolbar.tsx` | 工具栏 (搜索框 + faceted filters + view options + 重置) |
| `faceted-filter.tsx` | 分面筛选器 (Popover + Command 多选) |
| `bulk-actions.tsx` | 批量操作 (选中行后的上下文操作栏) |
| `view-options.tsx` | 列可见性切换 |
| `index.ts` | Barrel export |

```tsx
// 核心模式: TanStack Table 集成
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, getFacetedRowModel, getFacetedUniqueValues } from '@tanstack/react-table';

export function DataTable<TData, TValue>({
  columns, data, toolbar, floatingBar
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data, columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div>
      {toolbar?.(table)}
      <Table>
        <TableHeader>{/* column headers with sorting */}</TableHeader>
        <TableBody>{/* row rendering with selection */}</TableBody>
      </Table>
      <DataTablePagination table={table} />
      {floatingBar?.(table)}
    </div>
  );
}

// FacetedFilter — 分面筛选器
export function DataTableFacetedFilter<TData, TValue>({
  column, title, options
}: { column?: Column<TData, TValue>; title?: string; options: { label: string; value: string; icon?: React.ComponentType }[] }) {
  const selectedValues = new Set(column?.getFilterValue() as string[]);
  return (
    <Popover>
      <PopoverTrigger><Button variant="outline">{title} {selectedValues.size > 0 && <Badge>{selectedValues.size}</Badge>}</Button></PopoverTrigger>
      <PopoverContent>
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            {options.map((option) => (
              <CommandItem key={option.value} onSelect={() => { /* toggle selection */ }}>
                <CheckIcon /> {option.label} <span>{facets?.get(option.value)}</span>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
```

**关键特性**:

- TanStack Table v8 完整集成
- 排序 + 筛选 + 分页 + 选择 + 分面过滤
- `toolbar` 和 `floatingBar` 使用 render prop 模式，高度可定制
- FacetedFilter 使用 Command (cmdk) 组件，支持搜索过滤

---

### B11. `hooks/use-table-url-state.ts.template` — 表格状态 URL 同步

> **来源**: [`shadcn-admin/src/hooks/use-table-url-state.ts`](../../.github/references/shadcn-admin/src/hooks/use-table-url-state.ts)

```typescript
// 核心模式: 将 TanStack Table 的分页/筛选/搜索状态同步到 URL 参数
type UseTableUrlStateParams = {
  search: Record<string, unknown>;
  navigate: NavigateFn;
  pagination?: { pageKey?: string; pageSizeKey?: string; defaultPage?: number; defaultPageSize?: number };
  globalFilter?: { enabled?: boolean; key?: string; trim?: boolean };
  columnFilters?: Array<{ columnId: string; searchKey: string; type: 'string' | 'array'; serialize?: (v: unknown) => unknown; deserialize?: (v: unknown) => unknown }>;
};

type UseTableUrlStateReturn = {
  globalFilter?: string;
  onGlobalFilterChange?: OnChangeFn<string>;
  columnFilters: ColumnFiltersState;
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  ensurePageInRange: (pageCount: number, opts?: { resetTo?: 'first' | 'last' }) => void;
};

export function useTableUrlState(params: UseTableUrlStateParams): UseTableUrlStateReturn {
  // 从 URL 参数反序列化初始状态
  // onPaginationChange → navigate({ search: { page, pageSize } })
  // onColumnFiltersChange → navigate({ search: { ...filters } })
  // onGlobalFilterChange → navigate({ search: { filter } })
  // ensurePageInRange → 自动修正越界页码
}
```

**关键特性**:

- 分页/筛选/搜索状态持久化到 URL（刷新不丢失，可分享）
- 自定义序列化/反序列化 (支持复杂类型)
- `ensurePageInRange()` 防止页码越界
- 默认值自动省略 (URL 保持简洁)

---

## Context Provider Templates (全局上下文层)

### B12. `context/theme-provider.tsx.template` — 主题切换

> **来源**: [`shadcn-admin/src/context/theme-provider.tsx`](../../.github/references/shadcn-admin/src/context/theme-provider.tsx)

```tsx
// 核心模式: dark/light/system 三模式 + Cookie 持久化
type Theme = 'dark' | 'light' | 'system';
type ResolvedTheme = Exclude<Theme, 'system'>;

type ThemeProviderState = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  resetTheme: () => void;
};

export function ThemeProvider({ children, defaultTheme = 'system', storageKey = 'vite-ui-theme' }: ThemeProviderProps) {
  const [theme, _setTheme] = useState<Theme>(() => getCookie(storageKey) as Theme || defaultTheme);

  // resolvedTheme: system → 检测 prefers-color-scheme
  const resolvedTheme = useMemo((): ResolvedTheme => {
    if (theme === 'system') return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    return theme as ResolvedTheme;
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
    // 监听系统主题变化
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => { if (theme === 'system') { /* re-apply */ } };
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, [theme, resolvedTheme]);

  const setTheme = (t: Theme) => { setCookie(storageKey, t, 365 * 24 * 3600); _setTheme(t); };
  const resetTheme = () => { removeCookie(storageKey); _setTheme('system'); };
  return <ThemeContext value={{ theme, resolvedTheme, setTheme, resetTheme }}>{children}</ThemeContext>;
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
```

**关键特性**:

- 三模式：dark / light / system (跟随系统)
- Cookie 持久化（1 年有效期）
- `resolvedTheme` 总是返回实际生效的 dark/light
- 监听 `prefers-color-scheme` 媒体查询变化
- `resetTheme()` 恢复为 system 默认

---

### B13. `context/search-provider.tsx.template` — 全局搜索 (Cmd+K)

> **来源**: [`shadcn-admin/src/context/search-provider.tsx`](../../.github/references/shadcn-admin/src/context/search-provider.tsx)

```tsx
// 核心模式: Cmd+K 快捷键 + CommandMenu 集成
export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <SearchContext value={{ open, setOpen }}>
      {children}
      <CommandMenu />
    </SearchContext>
  );
}

export const useSearch = () => {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearch must be used within SearchProvider');
  return ctx;
};
```

**关键特性**:

- `Cmd+K` / `Ctrl+K` 全局快捷键
- 与 `<CommandMenu />` (cmdk) 集成
- Context + Hook 标准模式

---

## Error Page Templates (错误页层)

### B14. `features/errors/error-pages.tsx.template` — 错误页套件

> **来源**: [`shadcn-admin/src/features/errors/`](../../.github/references/shadcn-admin/src/features/errors/) + [`bulletproof-react/apps/react-vite/src/components/errors/`](../../.github/references/bulletproof-react/apps/react-vite/src/components/errors/)

包含 **5 个错误页**:

| 组件 | HTTP 状态 | 场景 |
|------|-----------|------|
| `GeneralError` | 500 | 服务器内部错误 |
| `NotFoundError` | 404 | 页面不存在 |
| `ForbiddenError` | 403 | 无权限访问 |
| `UnauthorizedError` | 401 | 未登录 |
| `MaintenanceError` | 503 | 系统维护中 |

```tsx
// 核心模式: minimal 模式支持嵌入其他页面
type GeneralErrorProps = React.HTMLAttributes<HTMLDivElement> & { minimal?: boolean };

export function GeneralError({ className, minimal = false }: GeneralErrorProps) {
  const navigate = useNavigate();
  const { history } = useRouter();
  return (
    <div className={cn('h-svh w-full', className)}>
      <div className="m-auto flex h-full flex-col items-center justify-center gap-2">
        {!minimal && <h1 className="text-[7rem] font-bold">500</h1>}
        <span className="font-medium">Oops! Something went wrong</span>
        <p className="text-muted-foreground">We apologize for the inconvenience.</p>
        {!minimal && (
          <div className="mt-6 flex gap-4">
            <Button variant="outline" onClick={() => history.go(-1)}>Go Back</Button>
            <Button onClick={() => navigate({ to: '/' })}>Back to Home</Button>
          </div>
        )}
      </div>
    </div>
  );
}

// NotFoundError, ForbiddenError, UnauthorizedError, MaintenanceError 同理
```

**关键特性**:

- `minimal` 模式：可嵌入到其他页面（如 ErrorBoundary fallback）
- "Go Back" + "Back to Home" 双按钮
- 统一视觉风格

---

## Store Templates (状态管理层)

### B15. `stores/auth-store.ts.template` — Zustand Auth Store

> **来源**: [`shadcn-admin/src/stores/auth-store.ts`](../../.github/references/shadcn-admin/src/stores/auth-store.ts)

```typescript
// 核心模式: Zustand + Cookie 持久化
import { create } from 'zustand';
import { getCookie, setCookie, removeCookie } from '@/lib/cookies';

interface AuthUser {
  accountNo: string;
  email: string;
  role: string[];
  exp: number;
}

interface AuthState {
  auth: {
    user: AuthUser | null;
    setUser: (user: AuthUser | null) => void;
    accessToken: string;
    setAccessToken: (accessToken: string) => void;
    resetAccessToken: () => void;
    reset: () => void;
  };
}

export const useAuthStore = create<AuthState>()((set) => {
  const cookieState = getCookie(ACCESS_TOKEN);
  const initToken = cookieState ? JSON.parse(cookieState) : '';
  return {
    auth: {
      user: null,
      setUser: (user) => set((state) => ({ ...state, auth: { ...state.auth, user } })),
      accessToken: initToken,
      setAccessToken: (accessToken) => set((state) => {
        setCookie(ACCESS_TOKEN, JSON.stringify(accessToken));
        return { ...state, auth: { ...state.auth, accessToken } };
      }),
      resetAccessToken: () => set((state) => {
        removeCookie(ACCESS_TOKEN);
        return { ...state, auth: { ...state.auth, accessToken: '' } };
      }),
      reset: () => set((state) => {
        removeCookie(ACCESS_TOKEN);
        return { ...state, auth: { ...state.auth, user: null, accessToken: '' } };
      }),
    },
  };
});
```

**关键特性**:

- Cookie 持久化 token（跨 tab 共享）
- `reset()` 一键清除登录态
- 与 B3 `authorization.tsx` 配合使用
- 嵌套 `auth` 对象将认证状态组织在一起

---

## Utility Hook Templates (工具 Hook 层)

### B16. `hooks/use-dialog-state.tsx.template` — Dialog 状态管理

> **来源**: [`shadcn-admin/src/hooks/use-dialog-state.tsx`](../../.github/references/shadcn-admin/src/hooks/use-dialog-state.tsx)

```typescript
// 核心模式: 类型安全的 Dialog toggle hook
// 用法: const [open, setOpen] = useDialogState<"approve" | "reject">()
export default function useDialogState<T extends string | boolean>(initialState: T | null = null) {
  const [open, _setOpen] = useState<T | null>(initialState);
  const setOpen = (str: T | null) => _setOpen((prev) => (prev === str ? null : str));
  return [open, setOpen] as const;
}
```

**关键特性**:

- 泛型约束：`"approve" | "reject"` 等枚举值
- Toggle 行为：相同值再次点击关闭
- `as const` 返回元组类型推导

---

### B17. `components/seo/head.tsx.template` — SEO Head 组件

> **来源**: [`bulletproof-react/apps/react-vite/src/components/seo/head.tsx`](../../.github/references/bulletproof-react/apps/react-vite/src/components/seo/head.tsx)

```tsx
// 核心模式: 统一管理 title + description + meta 标签
import { Helmet, HelmetData } from 'react-helmet-async';

type HeadProps = {
  title?: string;
  description?: string;
};

const helmetData = new HelmetData({});

export const Head = ({ title = '', description = '' }: HeadProps = {}) => {
  return (
    <Helmet
      helmetData={helmetData}
      title={title ? `${title} | App Name` : undefined}
      defaultTitle="App Name"
    >
      <meta name="description" content={description} />
    </Helmet>
  );
};
```

**关键特性**:

- Title 自动拼接: `页面标题 | App Name`
- 每页独立设置 SEO 信息
- `react-helmet-async` SSR 安全

---

## AI Chat UI Templates (AI 聊天 UI 层)

### B18. `hooks/use-typewriter.ts.template` — 打字机效果引擎

> **来源**: [`JDGenie UI/hooks/TypeWriterCore.ts`](../../.github/references/joyagent-jdgenie/ui/src/hooks/TypeWriterCore.ts) + [`useTypeWriter.ts`](../../.github/references/joyagent-jdgenie/ui/src/hooks/useTypeWriter.ts)

```typescript
// 核心模式: 字符队列 + 动态速度调节 + 流式输出渲染
interface TypeWriterCoreOptions {
  onConsume: (str: string) => void; // 每消费一个字符的回调
  maxStepSeconds?: number;          // 最大步进间隔 (ms)
}

export default class TypeWriterCore {
  queueList: string[] = [];       // 待消费字符队列
  maxStepSeconds: number = 50;    // 默认 50ms 步进
  maxQueueNum: number = 2000;     // 队列最大长度

  // 动态速度: 队列越长，消费越快
  dynamicSpeed(): number {
    const speed = this.maxQueueNum / this.queueList.length;
    return Math.min(speed, this.maxStepSeconds);
  }

  add(str: string): void {
    this.queueList = [...this.queueList, ...str.split('')]; // 拆为单字符
  }

  consume(): void {
    const char = this.queueList.shift();
    if (char) this.onConsume(char);
  }

  next(): void {
    this.timer = setTimeout(() => {
      if (this.queueList.length > 0) { this.consume(); this.next(); }
    }, this.dynamicSpeed());
  }

  start(): void { this.next(); }
  onRendered(): void { clearTimeout(this.timer); }
  onClearQueueList(): void { this.queueList = []; clearTimeout(this.timer); }
}

// React Hook 封装
export function useTypeWriter(options?: { maxStepSeconds?: number }) {
  const [displayText, setDisplayText] = useState('');
  const coreRef = useRef(new TypeWriterCore({
    onConsume: (char) => setDisplayText((prev) => prev + char),
    ...options,
  }));

  const addText = useCallback((text: string) => {
    coreRef.current.add(text);
    coreRef.current.start();
  }, []);

  useEffect(() => () => coreRef.current.onRendered(), []);

  return { displayText, addText, clear: () => coreRef.current.onClearQueueList() };
}
```

**关键特性**:

- **动态速度**: 队列积压越多 → 消费速度越快，确保跟上 SSE 流
- 字符级拆分 → 逐字渲染，模拟真实打字效果
- `useTypeWriter` Hook 封装：返回 `displayText` + `addText` + `clear`
- 配合 SSE/WebSocket 流式响应使用
- `onRendered()` / `onClearQueueList()` 防止内存泄漏

---

## 📊 总览表

| # | 模板 | 来源 | 类别 |
|---|------|------|------|
| B1 | `lib/api-client.ts` | bulletproof-react | Lib |
| B2 | `lib/react-query.ts` | bulletproof-react | Lib |
| B3 | `lib/authorization.tsx` | bulletproof-react | Lib |
| B4 | `feature/api/get-items.ts` | bulletproof-react | Feature |
| B5 | `feature/api/create-item.ts` | bulletproof-react | Feature |
| B6 | `lib/handle-server-error.ts` | shadcn-admin | Lib |
| B7 | `layouts/dashboard-layout.tsx` | bulletproof-react | Layout |
| B8 | `layouts/auth-layout.tsx` | bulletproof-react | Layout |
| B9 | `components/layout/sidebar-nav.tsx` | shadcn-admin | Layout |
| B10 | `components/data-table/` | shadcn-admin | DataTable |
| B11 | `hooks/use-table-url-state.ts` | shadcn-admin | Hook |
| B12 | `context/theme-provider.tsx` | shadcn-admin | Context |
| B13 | `context/search-provider.tsx` | shadcn-admin | Context |
| B14 | `features/errors/error-pages.tsx` | shadcn-admin + bulletproof-react | Error |
| B15 | `stores/auth-store.ts` | shadcn-admin | Store |
| B16 | `hooks/use-dialog-state.tsx` | shadcn-admin | Hook |
| B17 | `components/seo/head.tsx` | bulletproof-react | SEO |
| B18 | `hooks/use-typewriter.ts` | JDGenie UI | AI Chat |

---
