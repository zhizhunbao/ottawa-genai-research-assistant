# 开发环境设置指南

**最后更新:** 2026-01-24

## 系统要求

### 必需软件

- **Node.js** >= 16.0.0 ([下载地址](https://nodejs.org/))
- **Git** ([下载地址](https://git-scm.com/))


### 推荐工具

- **VS Code** - 推荐的代码编辑器
- **Docker** - 容器化开发 (可选)
- **Postman** - API 测试工具 (可选)

## 安装步骤

### 1. 克隆项目

```bash
git clone <repository-url>
cd Unknown Project
```

### 2. 安装依赖

```bash
npm install
```

### 3. 环境配置

暂无环境变量需要配置

### 4. 启动开发服务器

```bash
npm start
```



## 开发工作流

### 日常开发

1. **启动开发服务器**
   ```bash
   npm start
   ```

2. **运行测试**
   ```bash
   # 测试脚本待配置
   ```

3. **代码检查**
   ```bash
   # 代码检查脚本待配置
   ```

4. **代码格式化**
   ```bash
   # 格式化脚本待配置
   ```

### 构建和部署

1. **构建生产版本**
   ```bash
   # 构建脚本待配置
   ```

2. **预览生产版本**
   ```bash
   # 预览脚本待配置
   ```

## 故障排除

### 常见问题

#### 依赖安装失败

```bash
# 清理缓存
npm cache clean

# 删除 node_modules 重新安装
rm -rf node_modules
npm install
```

#### 端口被占用

```bash
# 查找占用端口的进程
lsof -i :3000

# 杀死进程
kill -9 <PID>
```

#### 环境变量问题

1. 确认 `.env.local` 文件存在
2. 检查变量名拼写是否正确
3. 重启开发服务器

### 获取帮助

- 查看 [项目文档](../codemaps/index.md)
- 提交 [Issue](https://github.com/zhizhunbao/ottawa-genai-research-assistant/issues)
- 联系项目维护者

## VS Code 配置

推荐的 VS Code 扩展：

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json"
  ]
}
```

推荐的工作区设置：

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

---

*由 update-docs.js 自动生成 - 2026-01-24T21:48:20.793Z*
