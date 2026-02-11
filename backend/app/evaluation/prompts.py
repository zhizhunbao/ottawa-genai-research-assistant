"""
LLM 评估 Prompt 模板

为 6 个评估维度定义标准化的 LLM-as-Judge prompt。
每个 prompt 要求返回 JSON 格式: {"score": <1-5>, "explanation": "<reason>"}
"""

from app.evaluation.schemas import EvaluationDimension

EVALUATION_SYSTEM_PROMPT = (
    "You are an expert evaluator for a RAG-based research assistant. "
    "You must evaluate the quality of AI-generated responses. "
    "Respond ONLY with valid JSON: {\"score\": <1-5>, \"explanation\": \"<brief reason>\"}"
)

EVALUATION_PROMPTS: dict[EvaluationDimension, str] = {
    EvaluationDimension.COHERENCE: """\
Evaluate the COHERENCE of the response — how logically structured and easy to follow it is.

Query: {query}
Response: {response}

Rating scale:
1 = Completely incoherent, disorganized
2 = Mostly incoherent, hard to follow
3 = Partially coherent, some logical flow
4 = Mostly coherent, well-structured
5 = Perfectly coherent, excellent logical flow

Return JSON: {{"score": <1-5>, "explanation": "<brief reason>"}}""",

    EvaluationDimension.RELEVANCY: """\
Evaluate the RELEVANCY of the response — how well it addresses the user's query.

Query: {query}
Response: {response}

Rating scale:
1 = Completely irrelevant
2 = Mostly irrelevant, answers a different question
3 = Partially relevant, addresses some aspects
4 = Mostly relevant, covers key points
5 = Perfectly relevant, directly and fully addresses the query

Return JSON: {{"score": <1-5>, "explanation": "<brief reason>"}}""",

    EvaluationDimension.COMPLETENESS: """\
Evaluate the COMPLETENESS of the response — whether it covers all key aspects of the query.

Query: {query}
Response: {response}
Context: {context}

Rating scale:
1 = Missing all key information
2 = Covers very little
3 = Covers some key points but misses important aspects
4 = Covers most key points
5 = Comprehensive, covers all important aspects from the context

Return JSON: {{"score": <1-5>, "explanation": "<brief reason>"}}""",

    EvaluationDimension.GROUNDING: """\
Evaluate the GROUNDING of the response — whether all claims are supported by the provided context.
Check for any hallucinated or fabricated information.

Context: {context}
Response: {response}

Rating scale:
1 = Completely fabricated, no grounding in context
2 = Mostly fabricated, few claims supported
3 = Partially grounded, some unsupported claims
4 = Mostly grounded, minor unsupported details
5 = Perfectly grounded, all claims traceable to context

Return JSON: {{"score": <1-5>, "explanation": "<brief reason>"}}""",

    EvaluationDimension.HELPFULNESS: """\
Evaluate the HELPFULNESS of the response — how useful and actionable it is for the user.

Query: {query}
Response: {response}

Rating scale:
1 = Not helpful at all
2 = Slightly helpful
3 = Moderately helpful
4 = Very helpful, provides clear insights
5 = Extremely helpful, provides actionable analysis with clear takeaways

Return JSON: {{"score": <1-5>, "explanation": "<brief reason>"}}""",

    EvaluationDimension.FAITHFULNESS: """\
Evaluate the FAITHFULNESS of the response — whether it accurately represents the cited sources
without distortion or misrepresentation.

Context: {context}
Response: {response}

Rating scale:
1 = Completely unfaithful, distorts sources
2 = Mostly unfaithful, significant misrepresentation
3 = Partially faithful, some inaccuracies
4 = Mostly faithful, minor discrepancies
5 = Perfectly faithful, accurate representation of all cited sources

Return JSON: {{"score": <1-5>, "explanation": "<brief reason>"}}""",
}
