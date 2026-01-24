# 部署指南

本文档介绍如何将 Ottawa GenAI Research Assistant 部署到生产环境。

## 环境准备

### 基础设施需求

- **Azure 订阅**: 需要有权访问 Azure OpenAI, AI Search, Blob Storage。
- **Docker**: 用于容器化部署。
- **GitHub Actions**: 用于自动集成和部署 (CI/CD)。

## 部署步骤

### 1. 配置环境变量

在部署环境（如 Azure App Service 或 GitHub Environments）中设置以下变量：

- `AZURE_OPENAI_KEY`
- `AZURE_OPENAI_ENDPOINT`
- `AZURE_SEARCH_KEY`
- `AZURE_SEARCH_ENDPOINT`
- `AZURE_STORAGE_CONNECTION_STRING`

### 2. 构建镜像

```bash
docker build -t ottawa-research-backend ./backend
docker build -t ottawa-research-frontend ./frontend
```

### 3. CI/CD 流程

项目使用 GitHub Actions 进行自动化部署。配置文件位于 `.github/workflows/` (待配置)。

## 监控与维护

- 使用 Azure Monitor 监控服务状态。
- 定期检查日志。
