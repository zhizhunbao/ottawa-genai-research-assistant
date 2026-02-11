---
description: Skills 管理和关键词映射 - 根据关键词自动加载对应 skill
---

# Skills Manager

Proactively load specialized skills when user queries match keywords below.

## Core Rules

1. **Automatic Detection**: Scan user queries for keywords and load matching skills
2. **File Location**: Skills are in `.skills/{skill-name}/SKILL.md`
3. **Matching Strategy**: Support exact matches, partial matches, and related terms
4. **Priority**: When multiple skills match, prefer the most specific one
5. **Silent Operation**: Don't announce skill loading; just apply it naturally

## Skill Mappings

### 🛠️ Development

| Keywords                                                    | Skill                    |
| ----------------------------------------------------------- | ------------------------ |
| fastapi, backend, python api, async, pydantic, 后端开发     | `dev-backend_patterns`   |
| react, frontend, typescript, components, hooks, 前端开发    | `dev-frontend_patterns`  |
| api design, rest, restful, openapi, swagger, API设计        | `dev-api-design`         |
| testing, unit test, pytest, vitest, 测试                    | `dev-tdd_workflow`       |
| tdd, test-driven development, 测试驱动开发                  | `dev-tdd_workflow`       |
| coding standards, best practices, code quality, 代码规范    | `dev-coding_standards`   |
| code structure, file naming, directory structure, 代码结构  | `dev-code_standards`     |
| code style, linter, formatter, ruff, prettier, 代码风格     | `dev-code_style`         |
| code quality check, function size, nesting depth, 质量检查  | `dev-code_quality_check` |
| verification, pre-commit, build check, 验证循环             | `dev-verification_loop`  |
| security review, authentication, input validation, 安全审查 | `dev-security_review`    |
| azure, azure openai, azure ai search, 云服务                | `cloud-azure`            |
| git, version control, commit, branch, 版本控制              | `dev-git`                |
| pdf, extract, convert, markdown, 提取, 转换                 | `dev-pdf_processing`     |
| translation, technical translation, 翻译                    | `dev-translation`        |
| document review, documentation quality, 文档审查            | `dev-document_review`    |
| project docs, documentation, 项目文档                       | `dev-project_docs`       |

### 🤖 AI Technology

| Keywords                           | Skill           |
| ---------------------------------- | --------------- |
| agent, AI agent, 智能体            | `ai-agents`     |
| prompt, prompt engineering, 提示词 | `ai-prompts`    |
| llm, language model, 大模型        | `ai-llm_models` |

### 🎓 AI Learning

| Keywords                                       | Skill             |
| ---------------------------------------------- | ----------------- |
| machine learning, ML, 机器学习                 | `ai_learning-ml`  |
| deep learning, DL, 深度学习                    | `ai_learning-dl`  |
| NLP, natural language processing, 自然语言处理 | `ai_learning-nlp` |
| RAG, retrieval augmented generation, 检索增强  | `ai_learning-rag` |
| reinforcement learning, RL, 强化学习           | `ai_learning-rl`  |

### 💼 Career Development

| Keywords         | Skill               |
| ---------------- | ------------------- |
| resume, CV, 简历 | `career-resume`     |
| interview, 面试  | `career-interview`  |
| job search, 求职 | `career-job_search` |

### 🛂 Immigration & Identity

| Keywords                    | Skill                        |
| --------------------------- | ---------------------------- |
| visa, 签证                  | `identity-visa`              |
| PR, immigration, 永居, 移民 | `immigration-pr_application` |
| work permit, 工签           | `immigration-work_permit`    |

### 💰 Finance

| Keywords            | Skill                 |
| ------------------- | --------------------- |
| banking, 银行       | `finance-banking`     |
| credit card, 信用卡 | `finance-credit_card` |
| tax, 报税           | `finance-tax`         |

### 🏠 Housing

| Keywords          | Skill                 |
| ----------------- | --------------------- |
| rental, 租房      | `housing-rental`      |
| home buying, 买房 | `housing-home_buying` |

### 🏥 Healthcare

| Keywords                   | Skill                         |
| -------------------------- | ----------------------------- |
| family doctor, 家庭医生    | `healthcare-family_doctor`    |
| clinic visit, 看病         | `healthcare-clinic_visit`     |
| health insurance, 医疗保险 | `healthcare-health_insurance` |

### 📚 Education

| Keywords                    | Skill                         |
| --------------------------- | ----------------------------- |
| school selection, 选校      | `education-school_selection`  |
| language learning, 语言学习 | `education-language_learning` |

### 📝 Learning & Study

| Keywords                                | Skill                          |
| --------------------------------------- | ------------------------------ |
| notes, note-taking, 笔记                | `learning-note_taking`         |
| code generation, 生成代码               | `learning-code_generation`     |
| assignment document, Lab.docx, 作业文档 | `learning-assignment_document` |
| brightspace scraper, 抓取课程           | `learning-brightspace_scraper` |

## Execution Workflow

When a user query is received:

1. **Scan for keywords** - Check query against all mappings
2. **Identify matches** - List all skills with matching keywords
3. **Select skill** - Choose the most specific match
4. **Load skill file** - Read `.skills/{skill-name}/SKILL.md`
5. **Apply guidance** - Follow the skill's instructions
6. **Silent operation** - Don't announce loading; just apply naturally
