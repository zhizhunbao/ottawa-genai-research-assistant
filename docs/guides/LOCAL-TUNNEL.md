# 本地部署公网访问指南

# Local Deployment with Public Internet Access

本项目支持多种方式将本地开发环境暴露到公网，方便团队协作和演示。

---

## 方案 1: Cloudflare Tunnel（推荐 — 免费 + 无限带宽）

[cloudflared](https://github.com/cloudflare/cloudflared) 是 Cloudflare 的开源隧道客户端。

### 安装

```powershell
# Windows (winget)
winget install cloudflare.cloudflared

# 或 scoop
scoop install cloudflared

# macOS
brew install cloudflared
```

### 快速使用（无需域名）

```powershell
# 启动后端 (先确保 backend 正在运行)
cloudflared tunnel --url http://localhost:8000

# 输出类似:
# https://random-slug-here.trycloudflare.com
```

```powershell
# 启动前端 (另一个终端)
cloudflared tunnel --url http://localhost:3000
```

### 持久化使用（需要自己的域名）

```powershell
# 1. 登录 Cloudflare
cloudflared tunnel login

# 2. 创建 tunnel
cloudflared tunnel create ottawa-genai

# 3. 配置 DNS 路由
cloudflared tunnel route dns ottawa-genai api.yourdomain.com
cloudflared tunnel route dns ottawa-genai app.yourdomain.com

# 4. 创建配置文件 ~/.cloudflared/config.yml
```

```yaml
# ~/.cloudflared/config.yml
tunnel: ottawa-genai
credentials-file: ~/.cloudflared/<tunnel-id>.json

ingress:
  - hostname: api.yourdomain.com
    service: http://localhost:8000
  - hostname: app.yourdomain.com
    service: http://localhost:3000
  - service: http_status:404
```

```powershell
# 5. 启动 tunnel
cloudflared tunnel run ottawa-genai
```

---

## 方案 2: ngrok（最简单 — 一行命令）

[ngrok](https://ngrok.com/) 是最流行的隧道工具。

### 安装

```powershell
# Windows (winget)
winget install ngrok.ngrok

# 或 scoop
scoop install ngrok

# macOS
brew install ngrok
```

### 使用

```powershell
# 注册获取 authtoken: https://dashboard.ngrok.com/signup
ngrok config add-authtoken <your-authtoken>

# 暴露后端
ngrok http 8000

# 暴露前端
ngrok http 3000
```

### 同时暴露前后端

```yaml
# ngrok.yml
version: "2"
authtoken: <your-authtoken>
tunnels:
  backend:
    addr: 8000
    proto: http
  frontend:
    addr: 3000
    proto: http
```

```powershell
ngrok start --all --config ngrok.yml
```

> ⚠️ ngrok 免费版限制：会话 2h 超时、随机 URL、有限带宽

---

## 方案 3: localtunnel（纯开源 — 无需注册）

[localtunnel](https://github.com/localtunnel/localtunnel) 完全开源。

### 安装

```powershell
npm install -g localtunnel
```

### 使用

```powershell
# 暴露后端
lt --port 8000

# 暴露前端（指定子域名）
lt --port 3000 --subdomain ottawa-genai
```

> ⚠️ 公共服务器不太稳定，适合临时演示

---

## 推荐决策

| 场景                       | 推荐方案                                           |
| :------------------------- | :------------------------------------------------- |
| **快速演示**（5 分钟搞定） | `cloudflared tunnel --url http://localhost:8000`   |
| **团队长期使用**           | Cloudflare Tunnel + 自定义域名                     |
| **Webhook 调试**           | ngrok（有 Request Inspector）                      |
| **临时分享**               | localtunnel                                        |
| **正式生产部署**           | Docker + Azure Container Apps（见 CI/CD pipeline） |

---

## 一键启动脚本

项目提供了一键启动脚本，启动本地服务并暴露到公网：

```bash
# 使用 Cloudflare Tunnel（默认）
python scripts/tunnel.py

# 使用 ngrok
python scripts/tunnel.py --provider ngrok

# 仅暴露后端
python scripts/tunnel.py --backend-only

# 自定义端口
python scripts/tunnel.py --backend-port 8000 --frontend-port 5173
```
