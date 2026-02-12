# 🛠️ E. DevOps Templates

> **层级**: DevOps | **模板数**: 5

---

### E1. `.env.example.template` — 环境变量文档

标准化环境变量文件，包含所有必需的配置项及说明注释。

### E2. `docker-compose.yml.template` — Docker 编排

多服务编排模板，包括：
- Backend (FastAPI)
- Frontend (Vite/React)
- Database (PostgreSQL)
- Redis (缓存/消息队列)

### E3. `Dockerfile.backend.template` — 后端容器

多阶段构建 Python 后端容器：
- 基础阶段: 安装依赖
- 构建阶段: 复制代码
- 运行阶段: 最小化镜像 + 非 root 用户

### E4. `Dockerfile.frontend.template` — 前端容器

多阶段构建 React 前端容器：
- 构建阶段: npm ci + npm run build
- 运行阶段: nginx 静态文件服务

### E5. `github-ci.yml.template` — GitHub Actions CI/CD

标准化 CI/CD 流水线：
- Lint + Type Check
- Unit Tests + Coverage
- Build + Deploy
- Environment-specific 配置

---
