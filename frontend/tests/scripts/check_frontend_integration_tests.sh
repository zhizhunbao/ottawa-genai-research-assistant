#!/bin/bash
# 检测前端集成测试违规 | Detect frontend integration test violations

echo "🔍 检查前端集成测试违规 | Checking frontend integration test violations"

# 设置颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 违规计数器
VIOLATIONS=0

# 检查是否使用了不存在的占位符
echo -e "\n${YELLOW}检查占位符匹配 | Checking placeholder matching...${NC}"
if grep -r "getByPlaceholderText.*type your message" frontend/tests/integration/ 2>/dev/null; then
    echo -e "${RED}❌ 发现假想占位符 'type your message'，应使用真实占位符 'Ask a question about economic development data...'${NC}"
    VIOLATIONS=$((VIOLATIONS + 1))
else
    echo -e "${GREEN}✅ 占位符检查通过${NC}"
fi

# 检查是否测试了不存在的表单
echo -e "\n${YELLOW}检查表单测试 | Checking form testing...${NC}"
if grep -r "getByLabelText.*report title" frontend/tests/integration/ 2>/dev/null; then
    echo -e "${RED}❌ 发现假想表单测试 'report title'，ReportPage 没有表单功能${NC}"
    VIOLATIONS=$((VIOLATIONS + 1))
else
    echo -e "${GREEN}✅ 表单测试检查通过${NC}"
fi

# 检查是否测试了不存在的API
echo -e "\n${YELLOW}检查API测试 | Checking API testing...${NC}"
if grep -r "fetch.*reports/generate" frontend/tests/integration/ 2>/dev/null; then
    echo -e "${RED}❌ 发现假想API测试 '/reports/generate'，应测试真实的API端点${NC}"
    VIOLATIONS=$((VIOLATIONS + 1))
else
    echo -e "${GREEN}✅ API测试检查通过${NC}"
fi

# 检查是否使用了假想的生成报告功能
echo -e "\n${YELLOW}检查报告生成功能测试 | Checking report generation functionality testing...${NC}"
if grep -r "generate.*report.*form\|report.*generation.*form" frontend/tests/integration/ 2>/dev/null; then
    echo -e "${RED}❌ 发现假想的报告生成表单测试，ReportPage 只显示已生成的报告${NC}"
    VIOLATIONS=$((VIOLATIONS + 1))
else
    echo -e "${GREEN}✅ 报告生成功能测试检查通过${NC}"
fi

# 检查是否使用了假想的文档上传表单
echo -e "\n${YELLOW}检查文档上传表单测试 | Checking document upload form testing...${NC}"
if grep -r "getByLabelText.*document.*title\|getByLabelText.*file.*name" frontend/tests/integration/ 2>/dev/null; then
    echo -e "${RED}❌ 发现假想的文档上传表单字段，DocumentUploadPage 使用拖拽上传而非表单${NC}"
    VIOLATIONS=$((VIOLATIONS + 1))
else
    echo -e "${GREEN}✅ 文档上传表单测试检查通过${NC}"
fi

# 验证测试是否使用真实组件
echo -e "\n${YELLOW}验证组件使用 | Verifying component usage...${NC}"
COMPONENT_VIOLATIONS=0

for test_file in frontend/tests/integration/*.test.tsx; do
  if [ -f "$test_file" ]; then
    # 提取组件名称（去掉.integration.test.tsx后缀）
    base_name=$(basename "$test_file" .integration.test.tsx)
    
    # 检查不同的组件名称格式
    component_files=(
      "frontend/src/pages/${base_name}Page.tsx"
      "frontend/src/pages/${base_name}.tsx"
      "frontend/src/components/${base_name}.tsx"
    )
    
    found=false
    for component_file in "${component_files[@]}"; do
      if [ -f "$component_file" ]; then
        echo -e "${GREEN}✅ 找到对应组件: $component_file${NC}"
        found=true
        break
      fi
    done
    
    if [ "$found" = false ]; then
      echo -e "${RED}❌ 未找到对应组件: $base_name${NC}"
      COMPONENT_VIOLATIONS=$((COMPONENT_VIOLATIONS + 1))
    fi
  fi
done

if [ $COMPONENT_VIOLATIONS -gt 0 ]; then
  VIOLATIONS=$((VIOLATIONS + COMPONENT_VIOLATIONS))
fi

# 检查特定的真实组件文本使用
echo -e "\n${YELLOW}检查真实组件文本使用 | Checking real component text usage...${NC}"

# ChatPage 真实文本检查
if [ -f "frontend/tests/integration/chat.integration.test.tsx" ]; then
  if grep -q "Ask a question about economic development data" frontend/tests/integration/chat.integration.test.tsx; then
    echo -e "${GREEN}✅ ChatPage 测试使用了真实占位符文本${NC}"
  else
    echo -e "${RED}❌ ChatPage 测试应使用真实占位符: 'Ask a question about economic development data...'${NC}"
    VIOLATIONS=$((VIOLATIONS + 1))
  fi
fi

# ReportPage 真实文本检查
if [ -f "frontend/tests/integration/reports.integration.test.tsx" ]; then
  if grep -q "Generated Reports\|Ottawa Business Growth Analysis" frontend/tests/integration/reports.integration.test.tsx; then
    echo -e "${GREEN}✅ ReportPage 测试使用了真实页面文本${NC}"
  else
    echo -e "${RED}❌ ReportPage 测试应使用真实页面文本如 'Generated Reports', 'Ottawa Business Growth Analysis' 等${NC}"
    VIOLATIONS=$((VIOLATIONS + 1))
  fi
fi

# DocumentUploadPage 真实文本检查
if [ -f "frontend/tests/integration/documents.integration.test.tsx" ]; then
  if grep -q "Drag and drop PDF files here\|Only PDF files are supported" frontend/tests/integration/documents.integration.test.tsx; then
    echo -e "${GREEN}✅ DocumentUploadPage 测试使用了真实页面文本${NC}"
  else
    echo -e "${RED}❌ DocumentUploadPage 测试应使用真实页面文本如 'Drag and drop PDF files here', 'Only PDF files are supported' 等${NC}"
    VIOLATIONS=$((VIOLATIONS + 1))
  fi
fi

# 检查是否测试了不存在的按钮文本
echo -e "\n${YELLOW}检查按钮文本匹配 | Checking button text matching...${NC}"
if grep -r "getByRole.*button.*name.*generate.*report" frontend/tests/integration/ 2>/dev/null; then
    echo -e "${RED}❌ 发现假想的 'generate report' 按钮测试，应使用真实存在的按钮文本${NC}"
    VIOLATIONS=$((VIOLATIONS + 1))
else
    echo -e "${GREEN}✅ 按钮文本匹配检查通过${NC}"
fi

# 检查是否使用了真实的mock数据而非假想的API响应
echo -e "\n${YELLOW}检查Mock数据使用 | Checking mock data usage...${NC}"
if grep -r "mockFetch.*reports.*generate" frontend/tests/integration/ 2>/dev/null; then
    echo -e "${RED}❌ 发现假想的API mock，应使用真实的组件mock数据${NC}"
    VIOLATIONS=$((VIOLATIONS + 1))
else
    echo -e "${GREEN}✅ Mock数据使用检查通过${NC}"
fi

# 总结结果
echo -e "\n${YELLOW}======================================${NC}"
echo -e "${YELLOW}🎯 前端集成测试约束检查完成 | Frontend integration test constraint check completed${NC}"
echo -e "${YELLOW}======================================${NC}"

if [ $VIOLATIONS -eq 0 ]; then
    echo -e "${GREEN}✅ 所有检查通过！前端集成测试严格按照真实页面组件进行。${NC}"
    echo -e "${GREEN}✅ All checks passed! Frontend integration tests strictly follow real page components.${NC}"
    exit 0
else
    echo -e "${RED}❌ 发现 $VIOLATIONS 个违规项。前端集成测试必须严格按照真实页面组件进行！${NC}"
    echo -e "${RED}❌ Found $VIOLATIONS violations. Frontend integration tests must strictly follow real page components!${NC}"
    echo ""
    echo -e "${YELLOW}修复建议 | Fix suggestions:${NC}"
    echo -e "1. 使用真实存在的占位符文本、标签和按钮文本"
    echo -e "2. 只测试组件中实际实现的功能"
    echo -e "3. 避免测试假想的表单、API或UI元素"
    echo -e "4. 参考真实组件源码确保测试准确性"
    echo ""
    echo -e "1. Use actually existing placeholder text, labels, and button text"
    echo -e "2. Only test functionality that is actually implemented in components"
    echo -e "3. Avoid testing imaginary forms, APIs, or UI elements"
    echo -e "4. Refer to real component source code to ensure test accuracy"
    exit 1
fi 