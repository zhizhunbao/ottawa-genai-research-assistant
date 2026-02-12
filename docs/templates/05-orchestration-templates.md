# 🚀 G. Multi-Agent Orchestration Templates (Product Layer)

> **层级**: Multi-Agent Orchestration | **模板数**: 6
> **主要参考**: [joyagent-jdgenie](../../.github/references/joyagent-jdgenie/)

基于京东 `joyagent-jdgenie` 的 **Plan-and-Execute 双层调度** 架构 (产品级模式)。

> **注**: G 层是**产品级实现** (JDGenie)，[C 层 (AI Agent)](./03-ai-agent-templates.md) 则是 SDK/框架级抽象 (MetaGPT)。两者互补。

---

详细模板请参考原始文档 `template_system_design.md` 的第 983-1316 行，包含：

### G1. `orchestration/base_agent.py.template` — Agent 基类 + ReAct 循环
- 状态机 (IDLE → RUNNING → FINISHED → ERROR) 管理生命周期
- ReAct pattern: think → act → step
- 双层调度：PlanningAgent + ExecutorAgent

### G2. `orchestration/tool_collection.py.template` — 工具注册中心
- BaseTool + McpToolInfo 统一接口
- 本地工具和 MCP 远程工具共用 execute() 入口

### G3. `orchestration/agent_context.py.template` — 请求上下文
- request_id 贯穿日志链路
- printer 解耦输出通道 (SSE / Log / WebSocket)

### G4. `orchestration/printer.py.template` — SSE 推流抽象
- MessageType 枚举覆盖全生命周期
- SSEPrinter + LogPrinter 实现

### G5. `orchestration/llm_adapter.py.template` — 多模型适配器
- 三种 function calling 模式: function_call / struct_parse / claude
- 消息截断 + 多模态支持

### G6. `orchestration/deep_search.py.template` — DeepSearch 多轮推理
- 多轮循环: query_decompose → parallel_search → reasoning → answer
- 推理门控 + 流式输出三阶段

---

> 📖 **完整代码示例**: 请参阅 [template_system_design.md](./template_system_design.md) L983-L1316
