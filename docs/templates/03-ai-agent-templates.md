# 🤖 C. AI Agent Templates (Intelligence Layer)

> **层级**: AI Agent (SDK/框架级抽象) | **模板数**: 4
> **主要参考**: [MetaGPT](../../.github/references/MetaGPT/)

基于 MetaGPT 的 **Role → Action → Memory** 架构。

> **注**: C 层是 SDK/框架级抽象 (MetaGPT)，[G 层 (Orchestration)](./05-orchestration-templates.md) 则是**产品级实现** (JDGenie)。两者互补。

---

### C1. `agent/role.py.template` — Agent 角色

> **来源**: [`MetaGPT/metagpt/base/base_role.py`](../../.github/references/MetaGPT/metagpt/base/base_role.py)

```python
# 核心模式:
class BaseRole(ABC):
    name: str

    @abstractmethod
    def think(self): """Consider what to do next."""
    @abstractmethod
    def act(self): """Perform the current action."""
    @abstractmethod
    async def react(self) -> Message: """React to observed messages."""
    @abstractmethod
    async def run(self, with_message=None) -> Message | None: """Observe → Think → Act."""
    @abstractmethod
    def get_memories(self, k=0) -> list[Message]: """Return recent memories."""
```

---

### C2. `agent/action.py.template` — 原子任务

> **来源**: [`MetaGPT/metagpt/actions/action.py`](../../.github/references/MetaGPT/metagpt/actions/action.py)

```python
# 核心模式:
class Action(BaseModel):
    name: str = ""
    desc: str = ""
    prefix: str = ""  # system_message
    llm_name_or_type: str | None = None

    async def _aask(self, prompt: str, system_msgs=None) -> str:
        return await self.llm.aask(prompt, system_msgs)

    async def run(self, *args, **kwargs):
        raise NotImplementedError("Subclass must implement run()")
```

---

### C3. `agent/memory.py.template` — 上下文管理

> **来源**: MetaGPT Memory 模式

```python
# 核心模式:
class Memory:
    """管理对话历史和上下文窗口。"""
    messages: list[Message] = []

    def add(self, role: str, content: str): ...
    def get_recent(self, k: int = 10) -> list[Message]: ...
    def clear(self): ...
    def to_prompt_messages(self) -> list[dict]: ...
```

---

### C4. `agent/prompt_registry.yaml.template` — Prompt 版本管理

> **来源**: MetaGPT Prompt 管理模式

```yaml
# 核心模式: 外部化 Prompt，支持版本管理
prompts:
  researcher:
    version: "1.0"
    system: |
      You are a research assistant...
    user_template: |
      Please analyze the following topic: {{topic}}
  summarizer:
    version: "1.0"
    system: |
      You are a summarization expert...
```

---
