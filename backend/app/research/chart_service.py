import json
import logging
import re
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field

from app.core.rag_prompts import CHART_EXTRACTION_PROMPT

logger = logging.getLogger(__name__)


class ChartType(str, Enum):
    """图表类型"""

    LINE = "line"
    BAR = "bar"
    PIE = "pie"


class ChartData(BaseModel):
    """图表数据结构"""

    type: ChartType = Field(..., description="图表类型")
    title: str | None = Field(None, description="图表标题")
    x_key: str | None = Field(None, description="X 轴数据键名")
    y_keys: list[str] | None = Field(None, description="Y 轴数据键名列表")
    data: list[dict[str, Any]] = Field(default_factory=list, description="图表数据")
    stacked: bool = Field(False, description="是否堆叠显示（仅柱状图）")


# 数值模式匹配
NUMERIC_PATTERN = re.compile(r"(\d+(?:,\d{3})*(?:\.\d+)?)\s*%?")
# 年份/季度模式
TIME_PATTERN = re.compile(r"((?:Q[1-4]\s+)?20\d{2}|20\d{2}\s+Q[1-4])", re.IGNORECASE)
# 表格行模式 (用于解析简单表格)
TABLE_ROW_PATTERN = re.compile(r"([^\|]+)\s*\|\s*([^\|]+)")

# 图表类型关键词映射
CHART_TYPE_KEYWORDS = {
    ChartType.LINE: [
        "trend",
        "growth",
        "over time",
        "quarterly",
        "monthly",
        "yearly",
        "趋势",
        "增长",
        "变化",
        "走势",
    ],
    ChartType.BAR: [
        "compare",
        "comparison",
        "vs",
        "versus",
        "rank",
        "top",
        "比较",
        "对比",
        "排名",
    ],
    ChartType.PIE: [
        "share",
        "proportion",
        "distribution",
        "breakdown",
        "composition",
        "占比",
        "分布",
        "构成",
        "比例",
    ],
}


class ChartDataExtractor:
    """从文档内容中提取图表数据"""

    def __init__(self, openai_service: Any = None):
        """
        初始化提取器

        Args:
            openai_service: AzureOpenAIService 实例 (可选)
        """
        self._openai_service = openai_service

    async def extract_chart_data_llm(
        self,
        content: str,
        query: str,
    ) -> ChartData | None:
        """
        使用 LLM 从内容中提取结构化图表数据 (US-301)

        Args:
            content: 文档内容
            query: 用户查询

        Returns:
            图表数据，如果无法提取则返回 None
        """
        if not self._openai_service:
            logger.warning("Azure OpenAI not provided for Chart extraction, falling back to regex")
            return self.extract_chart_data(content, query)

        try:
            prompt = CHART_EXTRACTION_PROMPT.template.format(
                query=query, content=content[:6000]  # 限制上下文长度
            )

            response_text = await self._openai_service.chat_completion(
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,  # 使用低温度以获得稳定的 JSON
                system_prompt="You are a data extraction assistant. Respond ONLY with valid JSON or 'null'."
            )

            # 清理回复中的 markdown 代码块标记
            cleaned_response = response_text.strip()
            if cleaned_response.startswith("```json"):
                cleaned_response = cleaned_response.replace("```json", "", 1)
            if cleaned_response.endswith("```"):
                cleaned_response = cleaned_response.rsplit("```", 1)[0]
            cleaned_response = cleaned_response.strip()

            if not cleaned_response or cleaned_response.lower() == "null":
                return None

            data = json.loads(cleaned_response)
            return ChartData(**data)

        except Exception as e:
            logger.error(f"LLM chart extraction failed: {e}")
            # Fallback to regex if LLM fails
            return self.extract_chart_data(content, query)

    def extract_chart_data(
        self,
        content: str,
        query: str,
    ) -> ChartData | None:
        """
        尝试使用正则表达式从内容中提取图表数据 (向后兼容)

        Args:
            content: 文档内容
            query: 用户查询

        Returns:
            图表数据，如果无法提取则返回 None
        """
        if not content or not self._has_numeric_data(content):
            return None

        # 尝试提取表格数据
        table_data = self._extract_table_data(content)
        if table_data and len(table_data) >= 2:
            chart_type = self._determine_chart_type(query)
            return self._create_chart_data(table_data, chart_type, query)

        # 尝试提取时间序列数据
        time_series = self._extract_time_series(content)
        if time_series and len(time_series) >= 2:
            return ChartData(
                type=ChartType.LINE,
                title=self._generate_title(query),
                x_key="period",
                y_keys=["value"],
                data=time_series,
            )

        # 尝试提取分类数据 (用于饼图)
        category_data = self._extract_category_data(content)
        if category_data and len(category_data) >= 2:
            return ChartData(
                type=ChartType.PIE,
                title=self._generate_title(query),
                data=category_data,
            )

        return None

    def _has_numeric_data(self, content: str) -> bool:
        """检查内容是否包含足够的数值数据"""
        matches = NUMERIC_PATTERN.findall(content)
        return len(matches) >= 3

    def _extract_table_data(self, content: str) -> list[dict[str, Any]]:
        """从内容中提取表格数据"""
        data = []
        lines = content.split("\n")

        for line in lines:
            # 尝试匹配表格行 (label | value 格式)
            match = TABLE_ROW_PATTERN.match(line.strip())
            if match:
                label = match.group(1).strip()
                value_str = match.group(2).strip()

                # 提取数值
                num_match = NUMERIC_PATTERN.search(value_str)
                if num_match:
                    value = float(num_match.group(1).replace(",", ""))
                    data.append({"name": label, "value": value})

        return data

    def _extract_time_series(self, content: str) -> list[dict[str, Any]]:
        """从内容中提取时间序列数据"""
        data = []
        lines = content.split("\n")

        for line in lines:
            # 查找时间标识
            time_match = TIME_PATTERN.search(line)
            if time_match:
                period = time_match.group(1)
                # 获取时间标识之后的部分，避免匹配 Q1 中的 1
                after_time = line[time_match.end() :]

                # 查找对应的数值（在时间标识之后）
                num_matches = NUMERIC_PATTERN.findall(after_time)
                if num_matches:
                    # 取第一个有效数值
                    value = float(num_matches[0].replace(",", ""))
                    data.append({"period": period, "value": value})

        # 按时间排序
        data.sort(key=lambda x: x["period"])
        return data

    def _extract_category_data(self, content: str) -> list[dict[str, Any]]:
        """从内容中提取分类数据（用于饼图）"""
        data = []

        # 查找 "category: value%" 或 "category - value%" 格式
        pattern = re.compile(
            r"([A-Za-z\u4e00-\u9fff\s]+)[\:\-]\s*(\d+(?:\.\d+)?)\s*%",
            re.IGNORECASE,
        )

        for match in pattern.finditer(content):
            name = match.group(1).strip()
            value = float(match.group(2))
            if name and value > 0:
                data.append({"name": name, "value": value})

        return data

    def _determine_chart_type(self, query: str) -> ChartType:
        """根据查询内容确定图表类型"""
        query_lower = query.lower()

        for chart_type, keywords in CHART_TYPE_KEYWORDS.items():
            if any(keyword in query_lower for keyword in keywords):
                return chart_type

        # 默认使用柱状图
        return ChartType.BAR

    def _create_chart_data(
        self,
        data: list[dict[str, Any]],
        chart_type: ChartType,
        query: str,
    ) -> ChartData:
        """创建图表数据结构"""
        title = self._generate_title(query)

        if chart_type == ChartType.PIE:
            return ChartData(
                type=ChartType.PIE,
                title=title,
                data=data,
            )
        else:
            return ChartData(
                type=chart_type,
                title=title,
                x_key="name",
                y_keys=["value"],
                data=data,
            )

    def _generate_title(self, query: str) -> str:
        """根据查询生成图表标题"""
        # 简单处理：截取查询的前 50 个字符作为标题
        if len(query) > 50:
            return query[:47] + "..."
        return query


# 全局默认实例（向后兼容）
chart_extractor = ChartDataExtractor()
