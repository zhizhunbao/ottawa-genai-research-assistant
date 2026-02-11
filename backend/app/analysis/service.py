"""
分析服务层

包含图表生成、发言稿总结等核心业务逻辑。
遵循 dev-backend_patterns skill 规范。
"""

from app.analysis.schemas import AnalysisRequest, ChartData, SpeakingNotes
from app.core.document_store import DocumentStore
from app.core.enums import DocumentType


class AnalysisService:
    """分析服务类"""

    def __init__(self, document_store: DocumentStore):
        self.doc_store = document_store

    async def generate_chart(self, request: AnalysisRequest, user_id: str | None = None) -> ChartData:
        """生成图表数据内容并保存"""
        # TODO: 集成 LLM 提取数值并格式化为图表数据
        chart_data = ChartData(
            labels=["Q1", "Q2", "Q3", "Q4"],
            datasets=[{"label": "Employment", "data": [100, 120, 115, 130]}],
            title=f"Analysis for: {request.query}"
        )

        # 科学地通过 DocumentStore 保存结果
        await self.doc_store.create(
            doc_type=DocumentType.CHART_RESULT,
            data=chart_data.model_dump(),
            owner_id=user_id,
            tags=["automated-analysis", "chart"]
        )

        return chart_data

    async def generate_speaking_notes(self, request: AnalysisRequest, user_id: str | None = None) -> SpeakingNotes:
        """生成发言稿并保存"""
        # TODO: 集成 LLM 总结文档内容
        notes = SpeakingNotes(
            title="Ottawa Economic Update Notes",
            key_points=["Growth in tech sector", "Infrastructure investment up 15%"],
            statistics=["Unemployment at 4.2%", "GDP growth prediction: 2.1%"],
            conclusion="Positive outlook for the upcoming year."
        )

        # 科学地通过 DocumentStore 保存结果
        await self.doc_store.create(
            doc_type=DocumentType.SPEAKING_NOTE,
            data=notes.model_dump(),
            owner_id=user_id,
            tags=["automated-analysis", "notes"]
        )

        return notes
