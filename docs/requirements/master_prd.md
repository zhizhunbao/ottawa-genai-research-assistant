# Ottawa GenAI Research Assistant - Master PRD

**项目**: 渥太华经济发展局 GenAI 研究助手  
**版本**: 5.0  
**日期**: 2026年1月  
**状态**: 总体规划 (Master Plan)  
**术语规范**: 参见 `dev-terminology`

---

## 1. 产品愿景 (Vision)

渥太华经济发展团队正与亚岗昆学院合作开发一款 **生成式 AI 研究助手**。该助手旨在回答自然语言问题，生成摘要，并根据 ottawa.ca 托管的经济发展更新 PDF（Q1 2022 – Q4 2025）生成可视化图表。

### 核心目标

- 为经济发展分析师 (Analyst) 构建基于 RAG 的智能助手
- 实现无需系统重新部署的自然语言问答
- 提供带有来源引用和置信度指标的可信输出
- 支持英语和法语双语交互 (i18n)
- **全栈 Azure** 云原生架构

---

## 2. 成功指标 (KPIs)

| 指标                          | 目标     | 测量方法        |
| :---------------------------- | :------- | :-------------- |
| 答案准确率 (Accuracy)         | ≥75%     | SME 评估        |
| 忠实度 (Faithfulness)         | ≥90%     | 引用验证        |
| 上下文召回率 (Context Recall) | ≥85%     | 覆盖率分析      |
| 响应时间 (P95)                | <3s      | API 监控        |
| 搜索延迟                      | <500ms   | Azure AI Search |
| 用户满意度                    | >4.0/5.0 | 试点调查        |
| 系统可用性                    | ≥99.5%   | Azure 监控      |
| LLM 评估分数                  | ≥4.0/5.0 | 6 维度评估      |

---

## 3. 技术规格 (Technical Stack)

| 层级             | 技术                                  |
| ---------------- | ------------------------------------- |
| **Frontend**     | React 18 + TypeScript (Vite)          |
| **Backend**      | FastAPI 0.104+ (Python 3.12)          |
| **Vector Store** | Azure AI Search（禁止本地向量存储）   |
| **Embedding**    | Azure OpenAI (text-embedding-ada-002) |
| **LLM**          | Azure AI Foundry (GPT-4o)             |
| **Storage**      | Azure Blob Storage / Microsoft Fabric |
| **Chat History** | Azure Cosmos DB（禁止本地 JSON）      |
| **认证**         | Azure Entra ID（禁止 Google OAuth）   |
| **密钥管理**     | Azure Key Vault                       |
| **监控**         | Azure Application Insights            |

### 关键约束（严格禁止）

| 禁止项             | 替代方案         |
| ------------------ | ---------------- |
| 本地向量存储       | Azure AI Search  |
| 本地 JSON 聊天历史 | Azure Cosmos DB  |
| OpenAI 直接端点    | Azure AI Foundry |
| Google OAuth       | Azure Entra ID   |
| Create React App   | Vite             |

---

## 4. 路线图 (Roadmap)

| Phase | 名称           | 时间 | 状态        | PRD 文档                       |
| ----- | -------------- | ---- | ----------- | ------------------------------ |
| **1** | 基础架构迁移   | 4周  | 🔄 当前     | [phase1_prd.md](phase1_prd.md) |
| **2** | 核心 RAG 功能  | 4周  | ⏳ 下一阶段 | [phase2_prd.md](phase2_prd.md) |
| **3** | 高级功能与生产 | 4周  | ⏳ 未来     | [phase3_prd.md](phase3_prd.md) |

---

## 5. 项目约束 (Constraints)

- **预算**: 控制在 $500-1000/月（Azure 服务）
- **架构**: 必须使用 Azure 云服务，禁止本地处理
- **数据**: 仅处理公开文档
- **合规**: 数据需存储在加拿大区域（如需要）
- **认证**: 仅支持 Azure Entra ID

---

## 6. 交付物 (Deliverables)

| 交付物         | 说明                        |
| -------------- | --------------------------- |
| 演示视频       | 完整功能演示（5-10 分钟）   |
| 用户文档       | 使用指南、FAQ               |
| 技术文档       | 架构图、API 文档、部署指南  |
| Azure 资源截图 | 已配置的 Azure 服务截图     |
| Live API 演示  | Azure 环境中的实际 API 调用 |

---

## 7. 相关文档

- [系统架构](../architecture/system-architecture.md)
- [Phase 1 PRD](phase1_prd.md) - 基础架构迁移
- [Phase 2 PRD](phase2_prd.md) - 核心 RAG 功能
- [Phase 3 PRD](phase3_prd.md) - 高级功能与生产

---


