# 📁 VS Code-like File Explorer - PRD & Architecture

## 📌 产品需求文档 (PRD)

### 1. 产品概述

**产品名称**: Research Knowledge Base Explorer
**目标用户**: Economic Development 研究团队
**核心价值**: 像 VS Code 一样管理研究文档，在 Chat 中直接引用

### 2. 用户场景

#### 场景 1: 文档组织
> 作为研究员，我想要按项目/主题创建文件夹，将相关报告分类存放，便于后续查找。

#### 场景 2: 批量上传
> 作为研究员，我想要直接拖拽多个 PDF 文件到指定文件夹，系统自动索引处理。

#### 场景 3: Chat 引用
> 作为研究员，在 Chat 时我想要从文件树中选择特定文档或文件夹，AI 仅基于选中内容回答。

### 3. 功能需求

#### P0 (Must Have)
| ID | 功能 | 描述 |
|----|------|------|
| F1 | 文件树显示 | 层级展示文件夹和文档，可展开/收起 |
| F2 | 创建文件夹 | 右键或按钮创建新文件夹 |
| F3 | 文件上传 | 点击上传或拖拽文件到指定位置 |
| F4 | 状态显示 | 显示文档处理状态 (pending/processing/indexed) |
| F5 | Chat 引用 | 在 Chat 输入框选择文件/文件夹作为上下文 |

#### P1 (Should Have)
| ID | 功能 | 描述 |
|----|------|------|
| F6 | 拖拽移动 | 拖拽文件/文件夹到其他文件夹 |
| F7 | 重命名 | 双击或右键重命名 |
| F8 | 删除 | 右键删除（文件夹需确认） |
| F9 | 多选 | Ctrl/Shift 多选批量操作 |
| F10 | 搜索 | 按名称搜索文件 |

#### P2 (Nice to Have)
| ID | 功能 | 描述 |
|----|------|------|
| F11 | 文件预览 | 右侧预览 PDF 内容 |
| F12 | 批量导出 | 导出选中文档的引用列表 |
| F13 | 标签系统 | 为文件添加标签便于分类 |

### 4. 用户交互

#### 4.1 文件树交互
```
[📁 2024 Reports]          ← 点击展开/收起
  [📁 Q1 Economic Data]
    📄 GDP Report.pdf      ← 点击选中，双击预览
    📄 Employment.pdf (processing) ← 显示状态
  [📁 Q2 Analysis]
[📁 Research Papers]
  📄 AI Impact Study.pdf

[+ New Folder] [↑ Upload]  ← 底部操作按钮
```

#### 4.2 Chat 集成交互
```
┌─────────────────────────────────────────┐
│ 📎 Selected: 2024 Reports/Q1 (3 files)  │  ← 显示选中的上下文
├─────────────────────────────────────────┤
│ Ask a question about your documents...  │
│                               [📁] [📤] │  ← 点击选择文件
└─────────────────────────────────────────┘
```

#### 4.3 拖拽上传
```
┌─────────────────────────────────────────┐
│                                         │
│     Drop files here to upload           │  ← 拖拽悬停时显示
│     or click to browse                  │
│                                         │
└─────────────────────────────────────────┘
```

### 5. 非功能需求

| 需求 | 指标 |
|------|------|
| 性能 | 1000+ 文件树渲染 < 100ms |
| 响应 | 展开文件夹 < 200ms |
| 上传 | 支持 100MB 单文件，批量 10 文件 |
| 兼容 | Chrome 90+, Edge 90+, Firefox 90+ |

---

## 🏗️ 架构设计

### 1. 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ FileExplorer│  │   Chat      │  │    Preview          │ │
│  │   Panel     │◄─┤  Interface  │  │    Panel            │ │
│  └──────┬──────┘  └──────┬──────┘  └─────────────────────┘ │
│         │                │                                   │
│  ┌──────▼────────────────▼──────────────────────────────┐  │
│  │              Zustand Stores                           │  │
│  │  ┌────────────────┐  ┌────────────────────────────┐  │  │
│  │  │ fileExplorer   │  │  chat (existing)           │  │  │
│  │  │ Store          │  │  Store                     │  │  │
│  │  └────────────────┘  └────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                              │                               │
│  ┌───────────────────────────▼───────────────────────────┐  │
│  │                    API Services                        │  │
│  │  document-api.ts  │  folder-api.ts  │  chat-api.ts    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────┘
                              │ REST API
┌─────────────────────────────▼───────────────────────────────┐
│                        Backend                               │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Documents  │  │   Folders   │  │    Research/Chat    │ │
│  │  Router     │  │   Router    │  │    Router           │ │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
│         │                │                     │             │
│  ┌──────▼────────────────▼─────────────────────▼──────────┐ │
│  │                  PostgreSQL                            │ │
│  │  documents (+ parent_id, path)  │  chat_sessions       │ │
│  └────────────────────────────────────────────────────────┘ │
│                              │                               │
│  ┌───────────────────────────▼───────────────────────────┐  │
│  │              Azure Blob Storage                        │  │
│  │  /documents/{user_id}/{path}/file.pdf                  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 2. 数据模型

#### 2.1 后端模型扩展

```python
# backend/app/documents/models.py

class DocumentType(str, Enum):
    FILE = "file"
    FOLDER = "folder"

class Document(Base):
    __tablename__ = "documents"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"))

    # 新增字段
    document_type: Mapped[DocumentType] = mapped_column(default=DocumentType.FILE)
    parent_id: Mapped[UUID | None] = mapped_column(ForeignKey("documents.id"), nullable=True)
    path: Mapped[str] = mapped_column(String(1024))  # /folder1/folder2/file.pdf

    # 现有字段
    title: Mapped[str]
    file_name: Mapped[str | None]
    status: Mapped[DocumentStatus]
    # ... 其他字段

    # 关系
    parent: Mapped["Document"] = relationship("Document", remote_side=[id], back_populates="children")
    children: Mapped[list["Document"]] = relationship("Document", back_populates="parent")
```

#### 2.2 前端类型定义

```typescript
// frontend/src/features/documents/types.ts

export type DocumentType = 'file' | 'folder'

export interface FileNode {
  id: string
  name: string
  type: DocumentType
  parentId: string | null
  path: string  // /folder1/folder2/file.pdf
  children?: FileNode[]  // 懒加载
  metadata: {
    status?: DocumentStatus
    size?: number
    uploadDate?: string
    mimeType?: string
    pageCount?: number
    chunkCount?: number
  }
}

export interface FileExplorerState {
  nodes: Map<string, FileNode>  // id -> node 快速查找
  rootNodeIds: string[]         // 根级节点 ID
  expandedIds: Set<string>      // 展开的文件夹
  selectedIds: Set<string>      // 选中的节点
  loadingIds: Set<string>       // 加载中的文件夹
  draggedId: string | null      // 正在拖拽的节点
}
```

### 3. API 设计

#### 3.1 新增 Folder API

```typescript
// 文件夹 CRUD
POST   /api/v1/folders              // 创建文件夹
GET    /api/v1/folders              // 获取根文件夹列表
GET    /api/v1/folders/{id}         // 获取文件夹详情 + 子项
DELETE /api/v1/folders/{id}         // 删除文件夹（级联）

// 文档操作扩展
PATCH  /api/v1/documents/{id}/move  // 移动文档/文件夹
PATCH  /api/v1/documents/{id}/rename // 重命名

// 批量操作
POST   /api/v1/documents/batch/move   // 批量移动
DELETE /api/v1/documents/batch        // 批量删除
```

#### 3.2 请求/响应示例

```typescript
// 创建文件夹
POST /api/v1/folders
{
  "name": "Q1 Reports",
  "parentId": "uuid-of-parent" | null
}
→ { "id": "new-uuid", "path": "/Q1 Reports" }

// 获取文件夹内容（懒加载）
GET /api/v1/folders/{id}
→ {
    "id": "...",
    "name": "Q1 Reports",
    "children": [
      { "id": "...", "name": "GDP.pdf", "type": "file", "status": "indexed" },
      { "id": "...", "name": "Subfolder", "type": "folder", "childCount": 5 }
    ]
  }

// 移动文档
PATCH /api/v1/documents/{id}/move
{ "targetParentId": "uuid-of-new-parent" }
→ { "newPath": "/NewFolder/document.pdf" }
```

### 4. 组件架构

```
src/features/documents/
├── components/
│   ├── file-explorer/
│   │   ├── file-explorer.tsx        # 主容器
│   │   ├── file-tree.tsx            # 树形组件
│   │   ├── file-tree-node.tsx       # 单个节点（可递归）
│   │   ├── file-tree-toolbar.tsx    # 工具栏（新建/上传/搜索）
│   │   ├── file-drop-zone.tsx       # 拖放区域
│   │   ├── file-context-menu.tsx    # 右键菜单
│   │   └── file-breadcrumb.tsx      # 面包屑导航
│   ├── file-upload/
│   │   ├── upload-dialog.tsx        # 上传弹窗
│   │   ├── upload-progress.tsx      # 上传进度
│   │   └── drop-overlay.tsx         # 拖拽悬浮层
│   └── file-preview/
│       ├── preview-panel.tsx        # 预览面板
│       └── pdf-viewer.tsx           # PDF 预览
├── hooks/
│   ├── use-file-explorer.ts         # 主 hook
│   ├── use-file-drag-drop.ts        # 拖拽逻辑
│   └── use-file-upload.ts           # 上传逻辑
├── stores/
│   └── file-explorer-store.ts       # Zustand store
├── services/
│   ├── document-api.ts              # 现有 + 扩展
│   └── folder-api.ts                # 新增
└── types.ts
```

### 5. 状态管理

```typescript
// stores/file-explorer-store.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface FileExplorerStore {
  // State
  nodes: Map<string, FileNode>
  rootNodeIds: string[]
  expandedIds: Set<string>
  selectedIds: Set<string>
  loadingIds: Set<string>

  // Actions
  loadRootNodes: () => Promise<void>
  loadFolderChildren: (folderId: string) => Promise<void>
  toggleExpand: (nodeId: string) => void
  selectNode: (nodeId: string, multi?: boolean) => void
  clearSelection: () => void

  // Mutations
  createFolder: (name: string, parentId: string | null) => Promise<FileNode>
  moveNodes: (nodeIds: string[], targetParentId: string) => Promise<void>
  renameNode: (nodeId: string, newName: string) => Promise<void>
  deleteNodes: (nodeIds: string[]) => Promise<void>

  // Upload
  uploadFiles: (files: File[], parentId: string | null, onProgress: (p: number) => void) => Promise<void>
}

export const useFileExplorerStore = create<FileExplorerStore>()(
  persist(
    (set, get) => ({
      // ... implementation
    }),
    {
      name: 'file-explorer-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        expandedIds: Array.from(state.expandedIds),
      }),
    }
  )
)
```

### 6. Chat 集成设计

```typescript
// Chat 输入时选择文件上下文
interface ChatContext {
  documentIds: string[]      // 选中的文档 ID
  folderIds: string[]        // 选中的文件夹 ID（自动包含子文档）
  useAllDocuments: boolean   // 是否使用全部文档
}

// 扩展 Chat API
POST /api/v1/research/query
{
  "query": "What are the GDP trends?",
  "context": {
    "documentIds": ["doc-1", "doc-2"],
    "folderIds": ["folder-1"]  // 后端展开为所有子文档
  },
  "useRag": true
}
```

---

## 📋 实施计划

### Phase 0: 准备工作 (30 min)

1. **安装依赖**
   ```bash
   cd frontend
   npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
   ```

2. **创建目录结构**
   ```bash
   mkdir -p src/features/documents/components/file-explorer
   mkdir -p src/features/documents/stores
   ```

3. **创建 Git 分支**
   ```bash
   git checkout -b feature/file-explorer
   ```

### Phase 1: 后端 - 文件夹支持 (2h)

| Step | 任务 | 文件 |
|------|------|------|
| 1.1 | 扩展 Document 模型 | `backend/app/documents/models.py` |
| 1.2 | 创建数据库迁移 | `alembic revision` |
| 1.3 | 新增 Folder Router | `backend/app/documents/folders_router.py` |
| 1.4 | 扩展 Document Router | `backend/app/documents/router.py` |
| 1.5 | 更新 Service 层 | `backend/app/documents/service.py` |

### Phase 2: 前端 - 基础文件树 (2h)

| Step | 任务 | 文件 |
|------|------|------|
| 2.1 | 创建 FileExplorerStore | `stores/file-explorer-store.ts` |
| 2.2 | 创建 folder-api.ts | `services/folder-api.ts` |
| 2.3 | 实现 FileTree 组件 | `components/file-explorer/file-tree.tsx` |
| 2.4 | 实现 TreeNode 组件 | `components/file-explorer/file-tree-node.tsx` |
| 2.5 | 实现工具栏 | `components/file-explorer/file-tree-toolbar.tsx` |
| 2.6 | 集成到页面 | `views/documents-view.tsx` |

### Phase 3: 拖拽功能 (1.5h)

| Step | 任务 | 文件 |
|------|------|------|
| 3.1 | 添加 DndContext | `file-explorer.tsx` |
| 3.2 | 实现 useSortable 节点 | `file-tree-node.tsx` |
| 3.3 | 实现拖拽移动逻辑 | `use-file-drag-drop.ts` |
| 3.4 | 文件上传拖拽 | `file-drop-zone.tsx` |

### Phase 4: 右键菜单 & 操作 (1h)

| Step | 任务 | 文件 |
|------|------|------|
| 4.1 | 创建 ContextMenu | `file-context-menu.tsx` |
| 4.2 | 新建文件夹弹窗 | `create-folder-dialog.tsx` |
| 4.3 | 重命名功能 | inline editing |
| 4.4 | 删除确认 | AlertDialog |

### Phase 5: Chat 集成 (1.5h)

| Step | 任务 | 文件 |
|------|------|------|
| 5.1 | 创建 FileSelector 组件 | `components/file-selector.tsx` |
| 5.2 | 集成到 ChatInput | `chat-input.tsx` |
| 5.3 | 显示选中文件标签 | `selected-files-bar.tsx` |
| 5.4 | 更新 Chat API 调用 | `use-chat.ts` |

### Phase 6: 优化 & 测试 (1h)

| Step | 任务 |
|------|------|
| 6.1 | 虚拟化大文件夹 (1000+ items) |
| 6.2 | 键盘导航 (Arrow keys) |
| 6.3 | 加载状态 & 骨架屏 |
| 6.4 | E2E 测试 |

---

## ⏱️ 时间估算

| Phase | 时间 |
|-------|------|
| Phase 0: 准备 | 30 min |
| Phase 1: 后端 | ~2h |
| Phase 2: 基础文件树 | ~2h |
| Phase 3: 拖拽功能 | ~1.5h |
| Phase 4: 右键菜单 | ~1h |
| Phase 5: Chat 集成 | ~1.5h |
| Phase 6: 优化测试 | ~1h |
| **合计** | **~9.5h** |

---

## 📎 参考资源

**模板 & 组件**
- shadcn/ui Collapsible File Tree
- RAGFlow TreeView
- LobeChat Resource Manager

**依赖**
- `@dnd-kit/core` - 拖拽核心
- `@dnd-kit/sortable` - 排序
- `@radix-ui/react-context-menu` - 右键菜单
- `@radix-ui/react-collapsible` - 展开收起

**现有代码**
- `frontend/src/features/documents/` - 当前文档模块
- `backend/app/documents/` - 后端文档 API
