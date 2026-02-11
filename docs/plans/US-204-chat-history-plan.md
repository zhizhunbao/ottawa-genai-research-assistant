# US-204: Chat History Persistence - Implementation Plan

## Overview

实现聊天历史持久化功能，用户可以查看、继续和删除历史对话。

**User Story**: US-204
**Sprint**: 4
**Story Points**: 5
**Status**: ✅ Done

---

## 需求重述

- 聊天历史按用户存储在 Cosmos DB
- 支持查看历史对话列表
- 支持删除历史记录
- 支持继续历史对话

---

## 实现阶段

### 阶段 1: Azure Cosmos DB 设置 (Travis Yi - 2h)

#### 1.1 创建 Cosmos DB 资源

```bash
# Azure CLI 命令
az cosmosdb create \
  --name ottawa-genai-cosmos \
  --resource-group ottawa-genai-rg \
  --location canadacentral \
  --kind GlobalDocumentDB

# 创建数据库
az cosmosdb sql database create \
  --account-name ottawa-genai-cosmos \
  --resource-group ottawa-genai-rg \
  --name genai-db

# 创建容器
az cosmosdb sql container create \
  --account-name ottawa-genai-cosmos \
  --resource-group ottawa-genai-rg \
  --database-name genai-db \
  --name chat-sessions \
  --partition-key-path "/user_id"
```

**验收**:
- [x] Cosmos DB 账户创建成功
- [x] 数据库和容器已创建
- [x] 分区键设置为 user_id

---

### 阶段 2: 聊天历史数据模型 (Peng Wang - 2h)

#### 2.1 设计数据模型

**文件**: `backend/app/chat/models.py`

```python
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class ChatMessage(BaseModel):
    """单条聊天消息"""
    id: str
    role: str  # "user" | "assistant"
    content: str
    sources: Optional[List[SourceReference]] = None
    confidence: Optional[str] = None
    created_at: datetime

class ChatSession(BaseModel):
    """聊天会话"""
    id: str
    user_id: str
    title: str
    messages: List[ChatMessage]
    created_at: datetime
    updated_at: datetime

    class Config:
        # Cosmos DB 文档结构
        json_schema_extra = {
            "example": {
                "id": "session-uuid",
                "user_id": "user-oid",
                "title": "经济发展趋势查询",
                "messages": [],
                "created_at": "2026-02-10T10:00:00Z",
                "updated_at": "2026-02-10T10:30:00Z"
            }
        }
```

---

### 阶段 3: 聊天历史 API (Peng Wang - 5h)

#### 3.1 创建 Cosmos DB 服务

**文件**: `backend/app/core/cosmos_db.py`

```python
"""Azure Cosmos DB 服务"""

from azure.cosmos import CosmosClient, PartitionKey
from typing import List, Optional

class CosmosDBService:
    """Cosmos DB 操作封装"""

    def __init__(self, connection_string: str, database_name: str):
        self.client = CosmosClient.from_connection_string(connection_string)
        self.database = self.client.get_database_client(database_name)

    def get_container(self, container_name: str):
        return self.database.get_container_client(container_name)

    async def create_item(self, container_name: str, item: dict) -> dict:
        container = self.get_container(container_name)
        return container.create_item(body=item)

    async def query_items(
        self,
        container_name: str,
        query: str,
        parameters: List[dict]
    ) -> List[dict]:
        container = self.get_container(container_name)
        return list(container.query_items(
            query=query,
            parameters=parameters,
            enable_cross_partition_query=True
        ))

    async def delete_item(
        self,
        container_name: str,
        item_id: str,
        partition_key: str
    ) -> bool:
        container = self.get_container(container_name)
        container.delete_item(item=item_id, partition_key=partition_key)
        return True
```

#### 3.2 聊天历史 API 端点

**文件**: `backend/app/chat/routes.py`

```python
@router.get("/sessions")
async def list_sessions(
    current_user: dict = Depends(get_current_user),
    service: ChatService = Depends(get_chat_service)
) -> List[ChatSessionSummary]:
    """获取用户的聊天会话列表"""
    return await service.list_sessions(current_user["oid"])

@router.get("/sessions/{session_id}")
async def get_session(
    session_id: str,
    current_user: dict = Depends(get_current_user),
    service: ChatService = Depends(get_chat_service)
) -> ChatSession:
    """获取单个会话详情"""
    return await service.get_session(session_id, current_user["oid"])

@router.delete("/sessions/{session_id}")
async def delete_session(
    session_id: str,
    current_user: dict = Depends(get_current_user),
    service: ChatService = Depends(get_chat_service)
) -> dict:
    """删除会话"""
    await service.delete_session(session_id, current_user["oid"])
    return {"message": "Session deleted"}

@router.post("/sessions/{session_id}/continue")
async def continue_session(
    session_id: str,
    request: ChatQueryRequest,
    current_user: dict = Depends(get_current_user),
    service: ChatService = Depends(get_chat_service)
) -> ChatQueryResponse:
    """在已有会话中继续对话"""
    return await service.continue_session(
        session_id=session_id,
        query=request.query,
        user_id=current_user["oid"]
    )
```

---

### 阶段 4: 聊天历史侧边栏 UI (Hye Ran Yoo - 4h)

#### 4.1 创建历史侧边栏

**文件**: `frontend/src/features/research/components/ChatSidebar.tsx`

```typescript
interface ChatSidebarProps {
  sessions: ChatSessionSummary[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onNewChat: () => void;
  isLoading: boolean;
}

export function ChatSidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onDeleteSession,
  onNewChat,
  isLoading
}: ChatSidebarProps) {
  const { t } = useTranslation('chat');

  return (
    <aside className="w-64 border-r h-full flex flex-col">
      <div className="p-4 border-b">
        <Button onClick={onNewChat} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          {t('newChat')}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={cn(
                "group flex items-center gap-2 p-2 rounded-md cursor-pointer",
                currentSessionId === session.id && "bg-accent"
              )}
              onClick={() => onSelectSession(session.id)}
            >
              <MessageSquare className="h-4 w-4 shrink-0" />
              <span className="truncate flex-1">{session.title}</span>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(session.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
```

---

### 阶段 5: 继续对话功能 (Hye Ran Yoo - 3h)

#### 5.1 更新聊天 Hook

**文件**: `frontend/src/features/research/hooks/useChat.ts`

```typescript
export function useChat() {
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);

  // 加载历史会话
  const loadSessions = async () => {
    const data = await chatApi.listSessions();
    setSessions(data);
  };

  // 选择会话
  const selectSession = async (sessionId: string) => {
    const session = await chatApi.getSession(sessionId);
    setCurrentSession(session);
  };

  // 继续对话
  const continueChat = async (message: string) => {
    if (!currentSession) return;

    const response = await chatApi.continueSession(currentSession.id, message);
    // 更新当前会话消息列表
    setCurrentSession((prev) => ({
      ...prev!,
      messages: [...prev!.messages,
        { role: 'user', content: message },
        { role: 'assistant', content: response.answer, sources: response.sources }
      ]
    }));
  };

  // 删除会话
  const deleteSession = async (sessionId: string) => {
    await chatApi.deleteSession(sessionId);
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (currentSession?.id === sessionId) {
      setCurrentSession(null);
    }
  };

  return {
    sessions,
    currentSession,
    loadSessions,
    selectSession,
    continueChat,
    deleteSession
  };
}
```

---

## 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|----------|------|
| 新建 | `backend/app/core/cosmos_db.py` | Cosmos DB 服务 |
| 新建 | `backend/app/chat/models.py` | 数据模型 |
| 修改 | `backend/app/chat/routes.py` | 历史 API |
| 修改 | `backend/app/chat/service.py` | 历史服务 |
| 修改 | `backend/app/core/config.py` | Cosmos DB 配置 |
| 新建 | `frontend/src/features/research/components/ChatSidebar.tsx` | 历史侧边栏 |
| 修改 | `frontend/src/features/research/hooks/useChat.ts` | 聊天 Hook |
| 修改 | `frontend/src/features/research/services/chatApi.ts` | API 调用 |

---

## 技术规格

| 参数 | 规格 |
|------|------|
| 数据库 | Azure Cosmos DB |
| 分区键 | user_id |
| 数据保留 | 90 天 |
| 最大消息数/会话 | 100 |

---

## 成功标准

- [x] 聊天历史存储到 Cosmos DB
- [x] 用户可查看历史会话列表
- [x] 用户可删除历史会话
- [x] 用户可继续历史对话
- [x] 所有测试通过

---

## 估算复杂度: MEDIUM

| 部分 | 时间估算 | 状态 |
|------|----------|------|
| Cosmos DB 设置 | 2h | ✅ 完成 |
| 数据模型 | 2h | ✅ 完成 |
| 历史 API | 5h | ✅ 完成 |
| 侧边栏 UI | 4h | ✅ 完成 |
| 继续对话功能 | 3h | ✅ 完成 |
| **总计** | **16h** | **100%** |
