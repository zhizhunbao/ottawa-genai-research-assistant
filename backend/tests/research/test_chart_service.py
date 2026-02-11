"""
图表数据提取服务测试

对应 US-301: Chart Visualization
"""

import pytest

from app.research.chart_service import (
    ChartData,
    ChartDataExtractor,
    ChartType,
    chart_extractor,
)


class TestChartDataExtractor:
    """测试 ChartDataExtractor 类"""

    @pytest.fixture
    def extractor(self) -> ChartDataExtractor:
        return ChartDataExtractor()

    def test_has_numeric_data_with_numbers(self, extractor: ChartDataExtractor):
        """测试检测数值数据 - 有数字"""
        content = "GDP increased by 2.5% in Q1, 3.1% in Q2, and 2.8% in Q3."
        assert extractor._has_numeric_data(content) is True

    def test_has_numeric_data_without_numbers(self, extractor: ChartDataExtractor):
        """测试检测数值数据 - 无数字"""
        content = "The economy is growing steadily."
        assert extractor._has_numeric_data(content) is False

    def test_extract_time_series_quarterly(self, extractor: ChartDataExtractor):
        """测试提取季度时间序列"""
        content = """
        Q1 2025: 2.5%
        Q2 2025: 3.1%
        Q3 2025: 2.8%
        Q4 2025: 3.0%
        """
        result = extractor._extract_time_series(content)
        assert len(result) == 4
        assert result[0]["period"] == "Q1 2025"
        assert result[0]["value"] == 2.5

    def test_extract_category_data(self, extractor: ChartDataExtractor):
        """测试提取分类数据"""
        content = """
        Technology: 35%
        Healthcare: 25%
        Finance: 20%
        Manufacturing: 20%
        """
        result = extractor._extract_category_data(content)
        assert len(result) == 4
        assert result[0]["name"] == "Technology"
        assert result[0]["value"] == 35

    def test_determine_chart_type_trend(self, extractor: ChartDataExtractor):
        """测试确定图表类型 - 趋势查询"""
        assert extractor._determine_chart_type("GDP growth trend") == ChartType.LINE
        assert extractor._determine_chart_type("quarterly growth") == ChartType.LINE

    def test_determine_chart_type_comparison(self, extractor: ChartDataExtractor):
        """测试确定图表类型 - 比较查询"""
        assert extractor._determine_chart_type("compare sectors") == ChartType.BAR
        assert extractor._determine_chart_type("top industries") == ChartType.BAR

    def test_determine_chart_type_distribution(self, extractor: ChartDataExtractor):
        """测试确定图表类型 - 分布查询"""
        assert extractor._determine_chart_type("market share") == ChartType.PIE
        assert extractor._determine_chart_type("sector distribution") == ChartType.PIE

    def test_extract_chart_data_returns_none_for_no_data(
        self, extractor: ChartDataExtractor
    ):
        """测试无数据时返回 None"""
        result = extractor.extract_chart_data("No numbers here", "query")
        assert result is None

    def test_extract_chart_data_returns_none_for_empty_content(
        self, extractor: ChartDataExtractor
    ):
        """测试空内容返回 None"""
        result = extractor.extract_chart_data("", "query")
        assert result is None

    def test_extract_chart_data_time_series(self, extractor: ChartDataExtractor):
        """测试提取时间序列图表数据"""
        content = """
        Economic growth by quarter:
        Q1 2025: 2.5%
        Q2 2025: 3.1%
        Q3 2025: 2.8%
        """
        result = extractor.extract_chart_data(content, "growth trend over time")
        assert result is not None
        assert result.type == ChartType.LINE
        assert len(result.data) >= 3

    def test_extract_chart_data_pie_chart(self, extractor: ChartDataExtractor):
        """测试提取饼图数据"""
        content = """
        Industry breakdown:
        Technology: 35%
        Healthcare: 25%
        Finance: 20%
        Other: 20%
        """
        result = extractor.extract_chart_data(content, "market share distribution")
        assert result is not None
        assert result.type == ChartType.PIE


class TestChartDataModel:
    """测试 ChartData 模型"""

    def test_chart_data_line(self):
        """测试折线图数据模型"""
        data = ChartData(
            type=ChartType.LINE,
            title="GDP Growth",
            x_key="period",
            y_keys=["value"],
            data=[{"period": "Q1", "value": 2.5}, {"period": "Q2", "value": 3.1}],
        )
        assert data.type == ChartType.LINE
        assert data.stacked is False

    def test_chart_data_bar_stacked(self):
        """测试堆叠柱状图数据模型"""
        data = ChartData(
            type=ChartType.BAR,
            title="Sector Comparison",
            x_key="sector",
            y_keys=["value1", "value2"],
            data=[{"sector": "Tech", "value1": 100, "value2": 50}],
            stacked=True,
        )
        assert data.type == ChartType.BAR
        assert data.stacked is True

    def test_chart_data_pie(self):
        """测试饼图数据模型"""
        data = ChartData(
            type=ChartType.PIE,
            title="Market Share",
            data=[{"name": "A", "value": 60}, {"name": "B", "value": 40}],
        )
        assert data.type == ChartType.PIE
        assert len(data.data) == 2


class TestGlobalExtractor:
    """测试全局 chart_extractor 实例"""

    def test_global_instance_exists(self):
        """测试全局实例存在"""
        assert chart_extractor is not None
        assert isinstance(chart_extractor, ChartDataExtractor)
