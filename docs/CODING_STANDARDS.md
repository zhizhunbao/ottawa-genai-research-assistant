# 📋 Coding Standards | 编码规范

## 🚫 **严格禁止的代码模式 | Strictly Prohibited Code Patterns**

### ❌ **禁止 TODO/FIXME 标记 | NO TODO/FIXME Markers**

**规则**: 代码中**严格禁止**包含任何 TODO、FIXME、HACK、XXX 等未完成标记。

**Rule**: Code **MUST NOT** contain any TODO, FIXME, HACK, XXX or other incomplete markers.

```python
# ❌ 禁止 | FORBIDDEN
def get_document(doc_id: str):
    # TODO: Implement actual document retrieval
    pass

# ❌ 禁止 | FORBIDDEN  
async def process_data():
    # FIXME: This needs proper error handling
    return mock_data

# ✅ 正确 | CORRECT
def get_document(doc_id: str) -> DocumentInfo:
    """Get document information from repository."""
    doc_service = DocumentService()
    document = doc_service.get_by_id(doc_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return DocumentInfo.from_document(document)
```

### 🎯 **完整实现原则 | Complete Implementation Principle**

1. **每个函数必须有完整实现** | Every function must be fully implemented
2. **每个API端点必须连接真实服务** | Every API endpoint must connect to real services  
3. **每个模型必须有完整字段** | Every model must have complete fields
4. **每个异常必须有具体处理** | Every exception must have specific handling

### 📝 **代码质量要求 | Code Quality Requirements**

#### ✅ **必须包含 | Must Include**
- 完整的类型注解 | Complete type annotations
- 详细的文档字符串 | Detailed docstrings  
- 错误处理和验证 | Error handling and validation
- 单元测试覆盖 | Unit test coverage

#### ❌ **严禁包含 | Must Not Include**
- TODO/FIXME/HACK 标记 | TODO/FIXME/HACK markers
- 空的函数体 (除接口定义) | Empty function bodies (except interfaces)
- Mock 数据返回 (生产代码) | Mock data returns (in production code)
- 硬编码的临时值 | Hard-coded temporary values

## 🔍 **代码审查检查点 | Code Review Checklist**

### 🚨 **自动拒绝条件 | Automatic Rejection Criteria**
- [ ] 包含 TODO/FIXME 标记 | Contains TODO/FIXME markers
- [ ] 返回 Mock/假数据 | Returns Mock/fake data
- [ ] 空函数实现 | Empty function implementation  
- [ ] 缺少错误处理 | Missing error handling

### ✅ **通过条件 | Acceptance Criteria**
- [ ] 所有函数完整实现 | All functions fully implemented
- [ ] 所有API连接真实服务 | All APIs connect to real services
- [ ] 完整的类型注解 | Complete type annotations
- [ ] 适当的错误处理 | Proper error handling
- [ ] 单元测试覆盖 | Unit test coverage

## 🛠️ **实施工具 | Implementation Tools**

### 📋 **Pre-commit Hook 检查**
```bash
# 检查 TODO 标记
grep -r "TODO\|FIXME\|HACK\|XXX" --include="*.py" . && exit 1

# 检查空函数
grep -r "def.*:\s*pass" --include="*.py" . && exit 1
```

### 🔧 **IDE 配置建议**
- 设置 TODO 高亮为错误级别
- 配置代码模板避免生成 TODO
- 启用类型检查严格模式

## 📚 **相关文档 | Related Documentation**
- [API 设计指南](./API_DESIGN_GUIDE.md)
- [测试规范](./TESTING_STANDARDS.md)  
- [部署检查清单](./DEPLOYMENT.md)

---

**⚠️ 重要提醒 | Important Notice**: 违反这些规范的代码将被自动拒绝合并。请确保在提交前进行充分测试。

**Code violating these standards will be automatically rejected. Please ensure thorough testing before submission.** 