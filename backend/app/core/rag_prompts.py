"""
RAG Prompt 模板管理

管理系统 prompt、RAG 上下文模板、citation 格式化。
支持版本化和多语言 prompt。
"""

from dataclasses import dataclass


@dataclass
class PromptTemplate:
    """Prompt 模板"""
    name: str
    version: str
    template: str


# System prompt: 指导 AI 作为经济发展研究助手
SYSTEM_PROMPT = PromptTemplate(
    name="system_prompt",
    version="1.0",
    template="""You are an AI research assistant for Ottawa's economic development team.
Your role is to help analysts understand quarterly reports and economic data.

Guidelines:
- Answer based ONLY on the provided context. Do not make up information.
- If the context does not contain relevant information, say so clearly.
- Always cite your sources using numeric format [1], [2] (Page X). The number refers to the source index in the context.
- Provide specific numbers and data points when available.
- Be concise but thorough.
- Support both English and French queries. Respond in the same language as the query.
- When showing trends, mention specific quarters and values.
- If asked about topics outside Ottawa economic development, politely redirect.""",
)

# RAG 上下文 prompt: 将检索结果注入到对话中
RAG_CONTEXT_PROMPT = PromptTemplate(
    name="rag_context",
    version="1.0",
    template="""Based on the following retrieved documents, answer the user's question.

{context}

Important:
- Use ONLY the information from the documents above.
- Cite sources using [N] (Page X) format for each claim, where N is the document number above.
- If the documents don't contain relevant information, say:
  "I could not find relevant information in the available documents."
- Provide a confidence level (High/Medium/Low) at the end of your response.
""",
)

# Citation 格式化 prompt
CITATION_FORMAT_PROMPT = PromptTemplate(
    name="citation_format",
    version="1.0",
    template="""Format your citations as follows:
- Inline: [Source: {title}, Page {page}]
- At the end, list all sources used under "Sources:"
  1. {title} (Page {page}) - {relevance_note}""",
)

# 无结果 fallback prompt
NO_RESULTS_PROMPT = PromptTemplate(
    name="no_results",
    version="1.0",
    template=(
        "I could not find relevant information in the available"
        " documents to answer your question.\n\n"
        "You might try:\n"
        "- Rephrasing your question with different keywords\n"
        "- Asking about a specific quarter or economic indicator\n"
        "- Checking if the relevant report has been uploaded"
        " to the system"
    ),
)

# 图表提取 prompt (US-301)
CHART_EXTRACTION_PROMPT = PromptTemplate(
    name="chart_extraction",
    version="1.0",
    template="""You are a data analyst specialized in economic reports. 
Extract numeric data from the provided text to create a structured chart JSON that helps answer the user's query.

User Query: {query}
Text Content: {content}

Instructions:
1. Identify if there's sufficient numeric data to form a trend, comparison, or distribution.
2. Choose the best chart type: 
   - 'line' for trends over time (quarters, years).
   - 'bar' for comparisons between categories.
   - 'pie' for parts of a whole (percentages).
3. If data is insufficient or irrelevant to the query, return strictly 'null'.
4. If data is found, return a VALID JSON object with:
   - "type": "line" | "bar" | "pie"
   - "title": Concise chart title
   - "x_key": Name of the primary category key (e.g., "period", "category")
   - "y_keys": List of numeric data keys (e.g., ["value", "growth"])
   - "data": List of objects (e.g. [{"period": "2023 Q1", "value": 12.5}, ...])

Output ONLY the JSON or 'null'. Do not include markdown formatting or extra text.""",
)


def build_rag_context(sources: list[dict]) -> str:
    """
    构建 RAG 上下文字符串

    Args:
        sources: 搜索结果列表，每项包含 title, content, source, page_number

    Returns:
        格式化的上下文字符串
    """
    if not sources:
        return ""

    context_parts = []
    for i, source in enumerate(sources, 1):
        title = source.get("title", "Unknown")
        content = source.get("content", "")
        page = source.get("page_number", "N/A")
        score = source.get("score", 0.0)

        context_parts.append(
            f"[Document {i}] {title} (Page {page}, Relevance: {score:.2f})\n"
            f"{content}\n"
        )

    context_text = "\n---\n".join(context_parts)
    return RAG_CONTEXT_PROMPT.template.format(context=context_text)


def build_system_messages(
    query: str,
    sources: list[dict],
    chat_history: list[dict] | None = None,
) -> list[dict]:
    """
    构建完整的消息列表用于 LLM 调用

    Args:
        query: 用户查询
        sources: 搜索结果列表
        chat_history: 历史对话消息

    Returns:
        OpenAI 格式的消息列表
    """
    messages = []

    # System prompt
    messages.append({
        "role": "system",
        "content": SYSTEM_PROMPT.template,
    })

    # RAG 上下文（如果有搜索结果）
    if sources:
        rag_context = build_rag_context(sources)
        messages.append({
            "role": "system",
            "content": rag_context,
        })

    # 历史对话
    if chat_history:
        messages.extend(chat_history)

    # 当前用户查询
    messages.append({
        "role": "user",
        "content": query,
    })

    return messages
