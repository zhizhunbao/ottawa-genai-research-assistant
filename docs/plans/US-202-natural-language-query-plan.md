# US-202: Natural Language Query - Implementation Plan

## Overview

实现自然语言查询功能，用户可以用自然语言提问并在 3 秒内获得相关季度报告数据。

**User Story**: US-202
**Sprint**: 4
**Story Points**: 5
**Status**: ✅ Done

---

## 需求重述

- 用户输入在 3 秒内返回结果
- 搜索延迟 < 500ms (Azure AI Search 查询时间)
- 检索使用 Top-5 混合搜索 (Cosine + BM25)
- 结果按相关性排序
- 支持英语和法语查询

---

## 实现阶段

### 阶段 1: 聊天输入组件 (Hye Ran Yoo - 3h)

#### 1.1 创建聊天输入组件

**文件**: `frontend/src/features/research/components/ChatInput.tsx`

```typescript
interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, isLoading, placeholder }: ChatInputProps) {
  const [input, setInput] = useState('');
  const { t } = useTranslation('chat');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder || t('inputPlaceholder')}
        disabled={isLoading}
      />
      <Button type="submit" disabled={isLoading || !input.trim()}>
        {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
      </Button>
    </form>
  );
}
```

**验收**:
- [x] 输入框可正常输入
- [x] 发送按钮正常工作
- [x] 加载状态显示正确

---

### 阶段 2: 查询 API 端点 (Peng Wang - 4h)

#### 2.1 创建聊天 API

**文件**: `backend/app/chat/routes.py`

```python
@router.post("/query")
async def query(
    request: ChatQueryRequest,
    service: ChatService = Depends(get_chat_service),
    current_user: dict = Depends(get_current_user)
) -> ChatQueryResponse:
    """处理自然语言查询"""
    return await service.process_query(
        query=request.query,
        session_id=request.session_id,
        user_id=current_user["oid"]
    )
```

#### 2.2 创建聊天 Schema

**文件**: `backend/app/chat/schemas.py`

```python
class ChatQueryRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=2000)
    session_id: Optional[str] = None
    language: str = "en"

class ChatQueryResponse(BaseModel):
    answer: str
    sources: List[SourceReference]
    confidence: ConfidenceLevel
    processing_time_ms: int
```

---

### 阶段 3: 响应时间优化 (Peng Wang - 3h)

#### 3.1 查询处理优化

**文件**: `backend/app/chat/service.py`

```python
async def process_query(self, query: str, session_id: str, user_id: str) -> ChatQueryResponse:
    start_time = time.time()

    # 1. 并行执行：生成查询嵌入 + 获取会话历史
    embedding_task = self.openai_service.generate_embedding(query)
    history_task = self.get_session_history(session_id)

    query_embedding, history = await asyncio.gather(embedding_task, history_task)

    # 2. 混合搜索 (目标 < 500ms)
    search_results = await self.search_service.hybrid_search(
        query_text=query,
        query_vector=query_embedding,
        top_k=5
    )

    # 3. 生成响应
    response = await self.generate_response(query, search_results, history)

    processing_time = int((time.time() - start_time) * 1000)

    return ChatQueryResponse(
        answer=response.answer,
        sources=response.sources,
        confidence=response.confidence,
        processing_time_ms=processing_time
    )
```

#### 3.2 性能监控

- 添加请求耗时日志
- 添加各阶段耗时统计
- 设置性能告警阈值

---

### 阶段 4: 相关性排序 (Peng Wang - 3h)

#### 4.1 混合搜索排序

**文件**: `backend/app/core/azure_search.py`

```python
async def hybrid_search(
    self,
    query_text: str,
    query_vector: List[float],
    top_k: int = 5
) -> List[SearchResult]:
    """执行混合搜索 (向量 + 关键词)"""
    results = await self.search_client.search(
        search_text=query_text,
        vector_queries=[
            VectorizedQuery(
                vector=query_vector,
                k_nearest_neighbors=top_k,
                fields="content_vector"
            )
        ],
        query_type=QueryType.SEMANTIC,
        semantic_configuration_name="default",
        top=top_k
    )

    return [
        SearchResult(
            document_id=r["document_id"],
            content=r["content"],
            score=r["@search.score"],
            page_number=r.get("page_number")
        )
        for r in results
    ]
```

---

### 阶段 5: 加载状态与错误处理 (Hye Ran Yoo - 2h)

#### 5.1 加载状态

**文件**: `frontend/src/features/research/hooks/useChat.ts`

```typescript
export function useChat() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (message: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatApi.query({ query: message });
      // 处理响应
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return { sendMessage, isLoading, error };
}
```

#### 5.2 错误处理 UI

- 网络错误提示
- 超时错误提示
- 重试按钮

---

## 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|----------|------|
| 修改 | `frontend/src/features/research/components/ChatInput.tsx` | 聊天输入组件 |
| 新建 | `backend/app/chat/routes.py` | 聊天 API |
| 新建 | `backend/app/chat/schemas.py` | 请求/响应 Schema |
| 新建 | `backend/app/chat/service.py` | 聊天服务 |
| 修改 | `backend/app/core/azure_search.py` | 混合搜索 |
| 修改 | `frontend/src/features/research/hooks/useChat.ts` | 聊天 Hook |

---

## 技术规格

| 参数 | 规格 |
|------|------|
| 最大响应时间 | 3 秒 |
| 搜索延迟目标 | < 500ms |
| Top-K | 5 |
| 搜索类型 | 混合搜索 (向量 + BM25) |
| 支持语言 | 英语、法语 |

---

## 成功标准

- [x] 用户可输入自然语言查询
- [x] 响应时间 < 3 秒
- [x] 搜索延迟 < 500ms
- [x] 结果按相关性排序
- [x] 加载状态正确显示
- [x] 错误处理正常工作

---

## 估算复杂度: MEDIUM

| 部分 | 时间估算 | 状态 |
|------|----------|------|
| 聊天输入组件 | 3h | ✅ 完成 |
| 查询 API | 4h | ✅ 完成 |
| 响应时间优化 | 3h | ✅ 完成 |
| 相关性排序 | 3h | ✅ 完成 |
| 加载与错误处理 | 2h | ✅ 完成 |
| **总计** | **15h** | **100%** |
