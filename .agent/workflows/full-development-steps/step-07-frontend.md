# Step 7: 前端开发

## 阶段信息

- **阶段**: `frontend` - 前端开发
- **Skill**: `dev-senior_frontend`
- **输入**: Sprint Plan, US Plans, `docs/architecture/system-architecture.md`
- **产出物**: `frontend/src/`

---

## 执行步骤

### 1. 加载上下文

读取并分析：

- `docs/architecture/system-architecture.md` - 前端技术栈、目录结构
- `docs/sprints/Sprint_Plan_Ottawa_GenAI_Research_Assistant.md` - 前端相关 Story
- `docs/requirements/master_prd.md` - UI/UX 需求
- `docs/plans/US-xxx-plan.md` - 详细的 User Story 实施方案 (优先参考)

### 2. 加载 Skill

加载 `dev-senior_frontend` skill，获取前端开发专业知识。

### 3. 🎯 模板和脚本查找 (Template-First)

**在写任何代码之前，先执行以下步骤：**

#### 3.1 查找现有模板

检查 `.agent/templates/frontend/` 目录，可用模板：

| 模板文件                   | 用途                 | 变量                                  |
| -------------------------- | -------------------- | ------------------------------------- |
| `component.tsx.template`   | React 组件 (含 i18n) | `{{feature_name}}`, `{{FeatureName}}` |
| `hook.ts.template`         | 自定义 Hook          | `{{feature_name}}`, `{{FeatureName}}` |
| `service.ts.template`      | API 服务调用         | `{{feature_name}}`, `{{FeatureName}}` |
| `store.ts.template`        | Zustand 状态管理     | `{{feature_name}}`, `{{FeatureName}}` |
| `types.ts.template`        | TypeScript 类型定义  | `{{feature_name}}`, `{{FeatureName}}` |
| `Page.tsx.template`        | 页面组件             | `{{feature_name}}`, `{{FeatureName}}` |
| `Modal.tsx.template`       | 弹窗组件             | `{{FeatureName}}`                     |
| `List.tsx.template`        | 列表组件             | `{{FeatureName}}`                     |
| `SearchInput.tsx.template` | 搜索输入             | `{{FeatureName}}`                     |
| `Loading.tsx.template`     | 加载状态             | -                                     |
| `Empty.tsx.template`       | 空状态               | -                                     |
| `i18n-en.json.template`    | 英文翻译             | `{{feature_name}}`                    |
| `i18n-fr.json.template`    | 法文翻译             | `{{feature_name}}`                    |

#### 3.2 使用脚手架生成新模块

对于每个新的前端功能模块，优先使用脚手架：

```bash
# 自动生成组件、Hook、Service、Types、Index + 测试
python .agent/scripts/scaffold.py feature --name <feature_name> --type frontend
```

这将生成：

- `frontend/src/features/<feature_name>/components/<FeatureName>.tsx`
- `frontend/src/features/<feature_name>/hooks/use<FeatureName>.ts`
- `frontend/src/features/<feature_name>/services/<feature_name>Api.ts`
- `frontend/src/features/<feature_name>/types.ts`
- `frontend/src/features/<feature_name>/index.ts`
- `frontend/src/features/<feature_name>/components/<FeatureName>.test.tsx`

#### 3.3 i18n 翻译检查

使用 i18n 脚本检查翻译完整性：

```bash
python .agent/scripts/extract_i18n.py --check
```

#### 3.4 如果缺少模板

如果当前任务需要的模板类型不存在：

1. 在 `.agent/templates/frontend/` 中创建新模板文件
2. 使用 `{{feature_name}}` 和 `{{FeatureName}}` 变量
3. 基于新模板生成实际代码

### 4. 任务排序

从 `docs/stories.md` 获取前端相关 Story，按依赖关系排序：

```
1. [FE-001] 项目初始化和配置
2. [FE-002] 路由配置
3. [FE-003] 全局状态管理
4. [FE-004] API 服务层
5. [FE-005] 通用组件库
6. [FE-006] 页面组件
...
```

### 4. 目录结构

```
frontend/
├── public/              # 静态资源
├── src/
│   ├── app/             # App 组件、路由
│   ├── features/        # 功能模块
│   │   ├── home/        # 首页
│   │   ├── research/    # 研究助手
│   │   ├── documents/   # 文档管理
│   │   └── admin/       # 管理功能
│   ├── shared/          # 共享组件、工具
│   ├── stores/          # 状态管理
│   ├── locales/         # i18n 翻译文件
│   ├── i18n.ts
│   ├── index.css
│   └── main.tsx
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### 5. 开发循环

对于每个 Story：

```
┌─────────────────────────────────────────────┐
│  Story: {story_id} - {story_title}          │
├─────────────────────────────────────────────┤
│  1. 阅读 docs/plans/US-{id}-plan.md         │
│  2. 实现组件逻辑及样式                      │
│  3. 添加类型定义                            │
│  4. 运行检查脚本                            │
│  5. 更新 docs/plans/ 中的任务状态           │
│  6. 标记 Story 完成                        │
└─────────────────────────────────────────────┘
```

### 6. 组件规范

#### 6.1 组件结构

```tsx
// components/features/UserCard/UserCard.tsx
import { FC } from "react";
import styles from "./UserCard.module.css";
import { UserCardProps } from "./types";

/**
 * 用户卡片组件
 * 用于显示用户基本信息
 */
export const UserCard: FC<UserCardProps> = ({ user, onClick }) => {
  return (
    <div className={styles.card} onClick={() => onClick?.(user.id)}>
      <img src={user.avatar} alt={user.name} className={styles.avatar} />
      <div className={styles.info}>
        <h3 className={styles.name}>{user.name}</h3>
        <p className={styles.email}>{user.email}</p>
      </div>
    </div>
  );
};
```

#### 6.2 类型定义

```tsx
// components/features/UserCard/types.ts
import { User } from "@/types/user";

export interface UserCardProps {
  user: User;
  onClick?: (userId: number) => void;
}
```

#### 6.3 样式文件

```css
/* components/features/UserCard/UserCard.module.css */
.card {
  display: flex;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}
```

#### 6.4 导出索引

```tsx
// components/features/UserCard/index.ts
export { UserCard } from "./UserCard";
export type { UserCardProps } from "./types";
```

### 7. API 服务层

```tsx
// services/userService.ts
import { api } from "./api";
import { User, CreateUserDto, UpdateUserDto } from "@/types/user";

export const userService = {
  getAll: () => api.get<User[]>("/users"),
  getById: (id: number) => api.get<User>(`/users/${id}`),
  create: (data: CreateUserDto) => api.post<User>("/users", data),
  update: (id: number, data: UpdateUserDto) =>
    api.put<User>(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
};
```

### 8. 状态管理

```tsx
// store/userStore.ts (Zustand 示例)
import { create } from "zustand";
import { User } from "@/types/user";
import { userService } from "@/services/userService";

interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  loading: false,
  error: null,
  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const users = await userService.getAll();
      set({ users, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));
```

### 9. 质量检查

每完成一个模块，运行检查：

```bash
# TypeScript 类型检查
cd frontend && npx tsc --noEmit

# ESLint 检查
cd frontend && npm run lint
```

检查项：

- [ ] TypeScript 无错误
- [ ] ESLint 无警告
- [ ] 组件命名规范
- [ ] Props 类型定义

### 10. Story 完成确认

```
[✓] Story FE-001 完成
    - 创建文件: components/features/UserCard/
    - 检查结果: 通过
    - 用时: 30 分钟

继续下一个 Story? [Y/n]
```

---

## 完成检查

- [ ] 所有前端 Story 已完成
- [ ] TypeScript 编译通过
- [ ] ESLint 检查通过
- [ ] 页面可正常访问
- [ ] 与后端 API 集成成功

## 状态更新

```yaml
current_phase: testing

phases:
  frontend:
    status: completed
    completed_at: "{current_time}"
    output: "frontend/src/"
```

## 下一步

→ 进入 `step-08-testing.md`
