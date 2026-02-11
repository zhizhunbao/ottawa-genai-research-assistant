# US-304: Production Deployment - Implementation Plan

## Overview

将系统部署到 Azure 生产环境，配置监控和告警。

**User Story**: US-304
**Sprint**: 6
**Story Points**: 8
**Status**: ⬜ To Do

---

## 需求重述

- 前端部署到 Azure Static Web Apps
- 后端部署到 Azure Container Apps
- 配置 Application Insights 监控
- 配置告警规则
- 系统可用性 ≥ 99.5%

---

## 实现阶段

### 阶段 1: Azure Static Web Apps 配置 (Travis Yi - 3h)

#### 1.1 创建 Static Web Apps 资源

```bash
# Azure CLI
az staticwebapp create \
  --name ottawa-genai-frontend \
  --resource-group ottawa-genai-rg \
  --location canadacentral \
  --source https://github.com/org/ottawa-genai-research-assistant \
  --branch main \
  --app-location "/frontend" \
  --output-location "dist" \
  --login-with-github
```

#### 1.2 配置构建设置

**文件**: `frontend/staticwebapp.config.json`

```json
{
  "routes": [
    {
      "route": "/api/*",
      "allowedRoles": ["authenticated"]
    },
    {
      "route": "/*",
      "serve": "/index.html",
      "statusCode": 200
    }
  ],
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/images/*.{png,jpg,gif}", "/css/*"]
  },
  "responseOverrides": {
    "401": {
      "redirect": "/.auth/login/aad",
      "statusCode": 302
    }
  },
  "globalHeaders": {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Content-Security-Policy": "default-src 'self'"
  }
}
```

**验收**:
- [ ] Static Web Apps 资源创建成功
- [ ] 自定义域名配置 (如需要)
- [ ] HTTPS 证书自动配置

---

### 阶段 2: Azure Container Apps 配置 (Travis Yi - 4h)

#### 2.1 创建 Container Apps 环境

```bash
# 创建 Container Apps 环境
az containerapp env create \
  --name ottawa-genai-env \
  --resource-group ottawa-genai-rg \
  --location canadacentral

# 创建 Container Registry
az acr create \
  --name ottawagenairegistry \
  --resource-group ottawa-genai-rg \
  --sku Basic \
  --admin-enabled true
```

#### 2.2 Dockerfile

**文件**: `backend/Dockerfile`

```dockerfile
FROM python:3.12-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# 安装 Python 依赖
COPY pyproject.toml uv.lock ./
RUN pip install uv && uv sync --frozen

# 复制应用代码
COPY app ./app

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### 2.3 部署 Container App

```bash
# 构建并推送镜像
az acr build \
  --registry ottawagenairegistry \
  --image ottawa-genai-backend:latest \
  ./backend

# 创建 Container App
az containerapp create \
  --name ottawa-genai-backend \
  --resource-group ottawa-genai-rg \
  --environment ottawa-genai-env \
  --image ottawagenairegistry.azurecr.io/ottawa-genai-backend:latest \
  --target-port 8000 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 5 \
  --cpu 1.0 \
  --memory 2.0Gi \
  --env-vars \
    AZURE_STORAGE_CONNECTION_STRING=secretref:storage-connection \
    AZURE_OPENAI_ENDPOINT=secretref:openai-endpoint \
    AZURE_OPENAI_API_KEY=secretref:openai-key \
    AZURE_SEARCH_ENDPOINT=secretref:search-endpoint \
    AZURE_SEARCH_API_KEY=secretref:search-key
```

**验收**:
- [ ] 容器镜像构建成功
- [ ] Container App 运行正常
- [ ] 自动扩缩容配置正确

---

### 阶段 3: Application Insights 配置 (Travis Yi - 3h)

#### 3.1 创建 Application Insights

```bash
az monitor app-insights component create \
  --app ottawa-genai-insights \
  --location canadacentral \
  --resource-group ottawa-genai-rg \
  --application-type web
```

#### 3.2 后端集成

**文件**: `backend/app/core/telemetry.py`

```python
"""Application Insights 集成"""

from opencensus.ext.azure.log_exporter import AzureLogHandler
from opencensus.ext.azure.trace_exporter import AzureExporter
from opencensus.trace.samplers import ProbabilitySampler
from opencensus.trace.tracer import Tracer
import logging

def setup_telemetry(connection_string: str):
    """配置 Application Insights"""

    # 日志导出
    logger = logging.getLogger(__name__)
    logger.addHandler(AzureLogHandler(
        connection_string=connection_string
    ))

    # 分布式追踪
    tracer = Tracer(
        exporter=AzureExporter(connection_string=connection_string),
        sampler=ProbabilitySampler(1.0)
    )

    return tracer
```

#### 3.3 前端集成

**文件**: `frontend/src/shared/telemetry/appInsights.ts`

```typescript
import { ApplicationInsights } from '@microsoft/applicationinsights-web';

export const appInsights = new ApplicationInsights({
  config: {
    connectionString: import.meta.env.VITE_APP_INSIGHTS_CONNECTION_STRING,
    enableAutoRouteTracking: true,
    enableCorsCorrelation: true,
    enableRequestHeaderTracking: true,
    enableResponseHeaderTracking: true
  }
});

appInsights.loadAppInsights();
appInsights.trackPageView();

export function trackEvent(name: string, properties?: Record<string, string>) {
  appInsights.trackEvent({ name, properties });
}

export function trackException(error: Error) {
  appInsights.trackException({ exception: error });
}
```

---

### 阶段 4: CI/CD 管道配置 (Travis Yi - 5h)

#### 4.1 GitHub Actions - 后端

**文件**: `.github/workflows/backend-deploy.yml`

```yaml
name: Backend Deploy

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'
      - '.github/workflows/backend-deploy.yml'

env:
  REGISTRY: ottawagenairegistry.azurecr.io
  IMAGE_NAME: ottawa-genai-backend

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Login to Azure
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: Login to Container Registry
        uses: azure/docker-login@v1
        with:
          login-server: ${{ env.REGISTRY }}
          username: ${{ secrets.ACR_USERNAME }}
          password: ${{ secrets.ACR_PASSWORD }}

      - name: Build and push image
        run: |
          docker build -t ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }} ./backend
          docker push ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}

      - name: Deploy to Container Apps
        uses: azure/container-apps-deploy-action@v1
        with:
          containerAppName: ottawa-genai-backend
          resourceGroup: ottawa-genai-rg
          imageToDeploy: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
```

#### 4.2 GitHub Actions - 前端

**文件**: `.github/workflows/frontend-deploy.yml`

```yaml
name: Frontend Deploy

on:
  push:
    branches: [main]
    paths:
      - 'frontend/**'
      - '.github/workflows/frontend-deploy.yml'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: npm ci
        working-directory: frontend

      - name: Build
        run: npm run build
        working-directory: frontend
        env:
          VITE_API_BASE_URL: ${{ secrets.API_BASE_URL }}
          VITE_AZURE_AD_CLIENT_ID: ${{ secrets.AZURE_AD_CLIENT_ID }}
          VITE_AZURE_AD_TENANT_ID: ${{ secrets.AZURE_AD_TENANT_ID }}

      - name: Deploy to Static Web Apps
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          action: "upload"
          app_location: "frontend"
          output_location: "dist"
```

---

### 阶段 5: 监控告警配置 (Travis Yi - 2h)

#### 5.1 告警规则

```bash
# 响应时间告警
az monitor metrics alert create \
  --name "High Response Time" \
  --resource-group ottawa-genai-rg \
  --scopes /subscriptions/.../ottawa-genai-backend \
  --condition "avg requests/duration > 3000" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --action /subscriptions/.../actionGroups/ops-team

# 错误率告警
az monitor metrics alert create \
  --name "High Error Rate" \
  --resource-group ottawa-genai-rg \
  --scopes /subscriptions/.../ottawa-genai-backend \
  --condition "count requests/failed > 10" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --action /subscriptions/.../actionGroups/ops-team

# 可用性告警
az monitor metrics alert create \
  --name "Availability Drop" \
  --resource-group ottawa-genai-rg \
  --scopes /subscriptions/.../ottawa-genai-insights \
  --condition "avg availabilityResults/availabilityPercentage < 99.5" \
  --window-size 15m \
  --evaluation-frequency 5m \
  --action /subscriptions/.../actionGroups/ops-team
```

---

### 阶段 6: 负载测试与验收 (Hye Ran Yoo - 7h)

#### 6.1 负载测试

使用 Azure Load Testing 或 k6:

```javascript
// k6 负载测试脚本
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 50 },  // 预热
    { duration: '5m', target: 100 }, // 正常负载
    { duration: '2m', target: 200 }, // 峰值负载
    { duration: '2m', target: 0 },   // 冷却
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'], // 95% 请求 < 3s
    http_req_failed: ['rate<0.01'],    // 错误率 < 1%
  },
};

export default function () {
  const res = http.post(
    'https://api.ottawa-genai.ca/api/chat/query',
    JSON.stringify({ query: 'What is the GDP growth rate?' }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 3s': (r) => r.timings.duration < 3000,
  });

  sleep(1);
}
```

#### 6.2 生产验收测试

- [ ] 用户可通过 Azure AD 登录
- [ ] 自然语言查询正常返回
- [ ] 引用显示正确
- [ ] 聊天历史持久化
- [ ] 语言切换正常
- [ ] 响应时间 < 3 秒
- [ ] 系统可用性 ≥ 99.5%

---

## 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|----------|------|
| 新建 | `backend/Dockerfile` | 后端容器镜像 |
| 新建 | `frontend/staticwebapp.config.json` | 静态网站配置 |
| 新建 | `backend/app/core/telemetry.py` | 遥测配置 |
| 新建 | `frontend/src/shared/telemetry/appInsights.ts` | 前端遥测 |
| 新建 | `.github/workflows/backend-deploy.yml` | 后端 CI/CD |
| 新建 | `.github/workflows/frontend-deploy.yml` | 前端 CI/CD |
| 新建 | `infra/` | 基础设施代码 (可选) |

---

## Azure 资源清单

| 资源 | 服务 | SKU |
|------|------|-----|
| 前端 | Static Web Apps | Free/Standard |
| 后端 | Container Apps | Consumption |
| 容器注册表 | Container Registry | Basic |
| 监控 | Application Insights | - |
| 日志 | Log Analytics | - |

---

## 成功标准

- [ ] 前端部署到 Azure Static Web Apps
- [ ] 后端部署到 Azure Container Apps
- [ ] Application Insights 监控正常
- [ ] 告警规则配置完成
- [ ] CI/CD 管道正常运行
- [ ] 系统可用性 ≥ 99.5%
- [ ] 响应时间 P95 < 3 秒

---

## 估算复杂度: HIGH

| 部分 | 时间估算 | 状态 |
|------|----------|------|
| Static Web Apps | 3h | ⬜ 待开始 |
| Container Apps | 4h | ⬜ 待开始 |
| Application Insights | 3h | ⬜ 待开始 |
| CI/CD 管道 | 5h | ⬜ 待开始 |
| 监控告警 | 2h | ⬜ 待开始 |
| 负载测试与验收 | 7h | ⬜ 待开始 |
| **总计** | **24h** | **0%** |
