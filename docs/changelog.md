# 变更日志

本文件记录项目的所有重要变更，格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)。

本项目使用 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [未发布]

### 新增

- 文档结构重构，采用小写目录命名
- 添加变更日志 (CHANGELOG.md)
- 更新代码地图内容

### 变更

- 文档索引 (INDEX.md) 优化

---

## [0.1.0] - 2026-01-23

### 新增

- 项目初始化
- RAG 后端基础架构 (FastAPI + Python)
- 前端 React 应用脚手架
- Azure 服务集成配置
  - Azure OpenAI (GPT-4o, ADA-002)
  - Azure AI Search
  - Azure Blob Storage
- PDF 文档处理流水线
- 产品需求文档 (PRD v3.0)
- 系统架构文档
- 开发环境配置指南

### 技术栈

- 后端: FastAPI 0.104+ / Python 3.11+
- 前端: React 18 / TypeScript 4.9+
- AI: Azure OpenAI / Semantic Kernel
- 存储: Azure Blob Storage / AI Search

---

## 版本说明

### 版本格式

- **主版本号 (MAJOR)**: 不兼容的 API 变更
- **次版本号 (MINOR)**: 向后兼容的功能新增
- **修订号 (PATCH)**: 向后兼容的问题修复

### 变更类型

- **新增 (Added)**: 新功能
- **变更 (Changed)**: 现有功能的变更
- **废弃 (Deprecated)**: 即将移除的功能
- **移除 (Removed)**: 已移除的功能
- **修复 (Fixed)**: Bug 修复
- **安全 (Security)**: 安全相关修复

---

[未发布]: https://github.com/ottawa-genai/research-assistant/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/ottawa-genai/research-assistant/releases/tag/v0.1.0
