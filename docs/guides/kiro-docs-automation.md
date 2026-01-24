# Kiro 文档自动化系统使用指南

**最后更新:** 2025-01-23

## 概览

Kiro 文档自动化系统基于 Everything Claude Code 的最佳实践，提供完整的文档生命周期管理，确保文档始终与代码保持同步。

## 核心特性

### 🤖 自动化生成
- 从源代码自动生成架构文档
- 从 package.json 提取项目信息
- 从 .env.example 生成环境变量文档
- 自动更新时间戳和版本信息

### 📊 质量保证
- 文档格式验证
- 链接有效性检查
- 代码示例验证
- 时间戳一致性检查

### 🔄 智能同步
- 代码变更时自动检查文档更新需求
- 变更超过 30% 时主动提醒
- 支持增量更新和全量重新生成

## 系统架构

```
.kiro/
├── agents/
│   └── doc-manager.md          # 文档管理专用 agent
├── scripts/
│   ├── generate-codemaps.js    # 代码地图生成
│   ├── update-docs.js          # 文档更新
│   ├── validate-docs.js        # 文档验证
│   └── serve-docs.js           # 文档服务器
├── steering/
│   └── docs-automation.md      # 文档管理规则
└── templates/
    └── mkdocs.yml              # MkDocs 配置模板

docs/
├── CODEMAPS/                   # 自动生成的代码地图
│   ├── INDEX.md               # 架构总览
│   ├── frontend.md            # 前端架构
│   ├── backend.md             # 后端架构
│   ├── database.md            # 数据库结构
│   └── integrations.md        # 外部集成
├── GUIDES/                    # 用户指南
│   ├── setup.md               # 设置指南
│   ├── api.md                 # API 参考
│   └── deployment.md          # 部署指南
└── REPORTS/                   # 生成报告
    ├── codemap-diff.txt       # 代码地图变更
    ├── doc-validation.txt     # 文档验证结果
    └── link-check.txt         # 链接检查结果
```

## 快速开始

### 1. 系统已集成

如果你看到这个文档，说明 Kiro 文档自动化系统已经集成到你的项目中。

### 2. 生成初始文档

```bash
# 生成代码地图
node .kiro/scripts/generate-codemaps.js

# 更新项目文档
node .kiro/scripts/update-docs.js

# 验证文档质量
node .kiro/scripts/validate-docs.js
```

### 3. 启动文档服务器

```bash
# 启动本地文档服务器
node .kiro/scripts/serve-docs.js

# 访问 http://localhost:8080
```

## 主要命令

### 代码地图生成

```bash
node .kiro/scripts/generate-codemaps.js
```

**功能:**
- 分析项目结构和依赖关系
- 生成前端、后端、数据库、集成等领域的架构文档
- 创建变更报告
- 更新时间戳

**输出:**
- `docs/CODEMAPS/INDEX.md` - 架构总览
- `docs/CODEMAPS/frontend.md` - 前端架构
- `docs/CODEMAPS/backend.md` - 后端架构
- `docs/CODEMAPS/database.md` - 数据库结构
- `docs/CODEMAPS/integrations.md` - 外部集成
- `docs/REPORTS/codemap-diff.txt` - 变更报告

### 文档更新

```bash
node .kiro/scripts/update-docs.js
```

**功能:**
- 从 package.json 更新项目信息
- 从 .env.example 生成环境变量文档
- 更新 README.md
- 生成设置指南和 API 文档
- 更新贡献指南

**输出:**
- `README.md` - 项目概览
- `docs/GUIDES/setup.md` - 设置指南
- `docs/GUIDES/api.md` - API 参考
- `CONTRIBUTING.md` - 贡献指南
- `docs/REPORTS/doc-update.txt` - 更新报告

### 文档验证

```bash
node .kiro/scripts/validate-docs.js
```

**功能:**
- 检查必需文件是否存在
- 验证 Markdown 格式
- 检查链接有效性
- 验证代码示例
- 检查时间戳一致性
- 验证文件引用

**输出:**
- `docs/REPORTS/doc-validation.txt` - 验证报告
- `docs/REPORTS/link-check.txt` - 链接检查报告
- 控制台输出验证结果和评分

### 文档服务器

```bash
node .kiro/scripts/serve-docs.js
```

**功能:**
- 启动本地文档服务器
- 支持 Markdown 渲染
- 提供目录浏览
- 自动检测 MkDocs 配置

**访问:**
- http://localhost:8080/ - 首页 (README)
- http://localhost:8080/docs/ - 文档目录
- http://localhost:8080/docs/CODEMAPS/ - 代码地图

## 自动化钩子

### 文档同步检查

**触发条件:** 编辑以下文件时
- `src/**/*.{ts,tsx,js,jsx,py}`
- `package.json`
- `.env.example`

**执行动作:**
- 检查是否需要更新文档
- 重要变更时自动运行相应脚本
- 变更超过 30% 时提醒用户

### 文档维护检查

**触发条件:** 用户手动触发

**执行动作:**
- 完整的文档质量检查
- 更新所有文档
- 生成维护报告

## 高级配置

### 使用 MkDocs

如果你想使用更专业的文档系统：

1. **安装 MkDocs**
   ```bash
   pip install mkdocs mkdocs-material
   ```

2. **复制配置模板**
   ```bash
   cp .kiro/templates/mkdocs.yml mkdocs.yml
   ```

3. **启动 MkDocs 服务器**
   ```bash
   mkdocs serve
   ```

4. **构建静态站点**
   ```bash
   mkdocs build
   ```

### 自定义配置

#### 修改端口
```bash
DOCS_PORT=3000 node .kiro/scripts/serve-docs.js
```

#### 自定义模板
编辑 `.kiro/scripts/` 下的脚本文件来自定义生成逻辑。

#### 添加新的文档类型
在脚本中添加新的生成函数，并更新相应的模板。

## 最佳实践

### 1. 定期维护
- 每周运行文档验证
- 每月全面更新代码地图
- 发布前进行完整检查

### 2. 质量标准
- 所有代码示例必须可执行
- 所有链接必须有效
- 文档必须包含时间戳
- 架构图必须反映实际代码

### 3. 团队协作
- 代码审查时同时审查文档
- 新功能开发时同步更新文档
- 建立文档更新的责任制

### 4. 自动化优先
- 优先从源代码生成文档
- 避免手动维护可能过时的内容
- 建立自动化验证流程

## 故障排除

### 常见问题

#### 脚本执行失败
```bash
# 检查 Node.js 版本
node --version

# 确保在项目根目录
pwd

# 检查文件权限
ls -la .kiro/scripts/
```

#### 文档生成不完整
```bash
# 检查项目结构
ls -la src/

# 验证 package.json
cat package.json | head -20

# 检查环境变量文件
ls -la .env.example
```

#### 服务器启动失败
```bash
# 检查端口是否被占用
lsof -i :8080

# 使用不同端口
DOCS_PORT=3000 node .kiro/scripts/serve-docs.js
```

### 获取帮助

1. **查看日志**: 脚本会输出详细的执行日志
2. **检查报告**: 查看 `docs/REPORTS/` 下的报告文件
3. **验证配置**: 运行验证脚本检查配置
4. **联系支持**: 提交 Issue 或联系维护者

## 更新日志

- **2025-01-23**: 初始版本发布
  - 集成 Everything Claude Code 最佳实践
  - 实现完整的文档自动化流程
  - 添加质量验证和报告功能

## 相关资源

- [Everything Claude Code](https://github.com/affaan-m/everything-claude-code)
- [MkDocs 官方文档](https://www.mkdocs.org/)
- [Markdown 语法指南](https://www.markdownguide.org/)

---

*此文档由 Kiro 自动生成 - 2025-01-23T00:00:00Z*