# US-203: Citation-Backed Response Generation - Implementation Plan

## Overview

实现带引用的响应生成功能，每个回答都包含具体的来源引用，以便用户验证答案可信度。

**User Story**: US-203
**Sprint**: 4
**Story Points**: 5
**Status**: ✅ Done

---

## 需求重述

- 每个响应包含至少一个来源引用
- 引用格式：[文档名称, 页码, 原文摘录]
- 显示置信度指示器 (高/中/低)
- 点击引用可打开原文预览
- 无相关内容时显示"未找到相关信息"

---

## 实现阶段

### 阶段 1: 引用提取逻辑 (Peng Wang - 5h)

#### 1.1 创建引用提取服务

**文件**: `backend/app/chat/citation_service.py`

```python
"""引用提取服务"""

from typing import List
from app.chat.schemas import SourceReference

class CitationService:
    """从搜索结果中提取引用"""

    def extract_citations(
        self,
        search_results: List[SearchResult],
        answer: str
    ) -> List[SourceReference]:
        """提取与答案相关的引用"""
        citations = []

        for result in search_results:
            # 提取最相关的文本片段
            excerpt = self._extract_relevant_excerpt(
                result.content,
                answer,
                max_length=200
            )

            citations.append(SourceReference(
                document_id=result.document_id,
                document_name=result.filename,
                page_number=result.page_number,
                excerpt=excerpt,
                relevance_score=result.score
            ))

        return citations

    def _extract_relevant_excerpt(
        self,
        content: str,
        answer: str,
        max_length: int = 200
    ) -> str:
        """提取与答案最相关的文本摘录"""
        # 使用文本相似度找到最相关的句子
        sentences = content.split('.')
        # ... 实现细节
        return best_excerpt[:max_length]
```

---

### 阶段 2: 引用格式化服务 (Peng Wang - 3h)

#### 2.1 创建引用 Schema

**文件**: `backend/app/chat/schemas.py`

```python
class SourceReference(BaseModel):
    """来源引用"""
    document_id: str
    document_name: str
    page_number: int
    excerpt: str
    relevance_score: float

class ConfidenceLevel(str, Enum):
    HIGH = "high"      # 高置信度 (score > 0.8)
    MEDIUM = "medium"  # 中置信度 (0.5 < score <= 0.8)
    LOW = "low"        # 低置信度 (score <= 0.5)

class ChatResponse(BaseModel):
    answer: str
    sources: List[SourceReference]
    confidence: ConfidenceLevel
    no_results: bool = False
```

#### 2.2 置信度计算

```python
def calculate_confidence(self, sources: List[SourceReference]) -> ConfidenceLevel:
    """根据来源相关性计算置信度"""
    if not sources:
        return ConfidenceLevel.LOW

    avg_score = sum(s.relevance_score for s in sources) / len(sources)

    if avg_score > 0.8:
        return ConfidenceLevel.HIGH
    elif avg_score > 0.5:
        return ConfidenceLevel.MEDIUM
    else:
        return ConfidenceLevel.LOW
```

---

### 阶段 3: 引用 UI 组件 (Hye Ran Yoo - 4h)

#### 3.1 创建引用列表组件

**文件**: `frontend/src/features/research/components/CitationList.tsx`

```typescript
interface CitationListProps {
  sources: SourceReference[];
  onCitationClick: (source: SourceReference) => void;
}

export function CitationList({ sources, onCitationClick }: CitationListProps) {
  const { t } = useTranslation('chat');

  if (sources.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 border-t pt-4">
      <h4 className="text-sm font-medium text-muted-foreground mb-2">
        {t('sources')}
      </h4>
      <ul className="space-y-2">
        {sources.map((source, index) => (
          <li key={index}>
            <button
              onClick={() => onCitationClick(source)}
              className="text-left text-sm hover:bg-accent p-2 rounded-md w-full"
            >
              <div className="font-medium">{source.document_name}</div>
              <div className="text-muted-foreground">
                {t('page')} {source.page_number}
              </div>
              <div className="text-xs italic mt-1 line-clamp-2">
                "{source.excerpt}"
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

### 阶段 4: 文档预览弹窗 (Hye Ran Yoo - 4h)

#### 4.1 创建预览弹窗

**文件**: `frontend/src/features/research/components/SourcePreviewModal.tsx`

```typescript
interface SourcePreviewModalProps {
  source: SourceReference | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SourcePreviewModal({ source, isOpen, onClose }: SourcePreviewModalProps) {
  const { t } = useTranslation('chat');

  if (!source) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{source.document_name}</DialogTitle>
          <DialogDescription>
            {t('page')} {source.page_number}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <p className="bg-yellow-100 dark:bg-yellow-900/20 p-4 rounded-md">
            {source.excerpt}
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('close')}
          </Button>
          <Button asChild>
            <a href={`/api/documents/${source.document_id}/download`} target="_blank">
              {t('downloadDocument')}
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

### 阶段 5: 置信度指示器 (Hye Ran Yoo - 2h)

#### 5.1 创建置信度组件

**文件**: `frontend/src/features/research/components/ConfidenceIndicator.tsx`

```typescript
interface ConfidenceIndicatorProps {
  level: 'high' | 'medium' | 'low';
}

export function ConfidenceIndicator({ level }: ConfidenceIndicatorProps) {
  const { t } = useTranslation('chat');

  const config = {
    high: {
      color: 'bg-green-500',
      label: t('confidence.high'),
      icon: CheckCircle
    },
    medium: {
      color: 'bg-yellow-500',
      label: t('confidence.medium'),
      icon: AlertCircle
    },
    low: {
      color: 'bg-red-500',
      label: t('confidence.low'),
      icon: XCircle
    }
  };

  const { color, label, icon: Icon } = config[level];

  return (
    <div className="flex items-center gap-1 text-sm">
      <Icon className={`w-4 h-4 ${color}`} />
      <span>{label}</span>
    </div>
  );
}
```

---

## 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|----------|------|
| 新建 | `backend/app/chat/citation_service.py` | 引用提取服务 |
| 修改 | `backend/app/chat/schemas.py` | 引用 Schema |
| 修改 | `backend/app/chat/service.py` | 集成引用服务 |
| 新建 | `frontend/src/features/research/components/CitationList.tsx` | 引用列表 |
| 新建 | `frontend/src/features/research/components/SourcePreviewModal.tsx` | 预览弹窗 |
| 新建 | `frontend/src/features/research/components/ConfidenceIndicator.tsx` | 置信度指示器 |
| 修改 | `frontend/src/locales/en/chat.json` | 英文翻译 |
| 修改 | `frontend/src/locales/fr/chat.json` | 法文翻译 |

---

## 技术规格

| 参数 | 规格 |
|------|------|
| 最大引用数 | 5 |
| 摘录最大长度 | 200 字符 |
| 高置信度阈值 | > 0.8 |
| 中置信度阈值 | 0.5 - 0.8 |
| 低置信度阈值 | < 0.5 |

---

## 成功标准

- [x] 每个响应包含来源引用
- [x] 引用格式正确 (文档名、页码、摘录)
- [x] 置信度指示器正确显示
- [x] 点击引用可打开预览
- [x] 无结果时显示提示信息

---

## 估算复杂度: MEDIUM

| 部分 | 时间估算 | 状态 |
|------|----------|------|
| 引用提取逻辑 | 5h | ✅ 完成 |
| 引用格式化 | 3h | ✅ 完成 |
| 引用 UI | 4h | ✅ 完成 |
| 预览弹窗 | 4h | ✅ 完成 |
| 置信度指示器 | 2h | ✅ 完成 |
| **总计** | **18h** | **100%** |
